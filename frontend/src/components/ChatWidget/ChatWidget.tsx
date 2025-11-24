import React, { useState, useRef, useEffect } from 'react';
import { llmAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../components/FormStyles.css';

/**
 * ChatWidget Component
 * 
 * Floating chat widget similar to WhatsApp/Intercom chat buttons
 * Appears as a button in the bottom-right corner
 * Opens a popup chat window when clicked
 */

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'mentor';
  timestamp: Date;
}

/**
 * ChatWidget - Floating Chat Component
 * 
 * Shows a floating button that opens a chat popup
 * Only visible when user is logged in
 */
const ChatWidget: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Olá! Sou seu mentor de carreira IA. Como posso ajudá-lo hoje?',
      sender: 'mentor',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null); // Store conversation ID
  const [lastReadMessageId, setLastReadMessageId] = useState(1); // Track last read mentor message
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when chat opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      // Mark all mentor messages as read when chat is open
      const lastMentorMessage = [...messages].reverse().find(m => m.sender === 'mentor');
      if (lastMentorMessage && lastMentorMessage.id > lastReadMessageId) {
        setLastReadMessageId(lastMentorMessage.id);
      }
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    // When opening chat, mark all mentor messages as read
    if (newIsOpen) {
      const lastMentorMessage = [...messages].reverse().find(m => m.sender === 'mentor');
      if (lastMentorMessage) {
        setLastReadMessageId(lastMentorMessage.id);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      // Call LLM API with conversation history
      const response = await llmAPI.chat(messageText, conversationId || undefined);
      
      // Update conversation ID if returned
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
      
      const mentorText = response.llm_available === false
        ? `${response.response || response.insights || 'Resposta recebida'} (mentor IA em modo offline)`
        : (response.response || response.insights || 'Resposta recebida');

      const mentorResponse: Message = {
        id: messages.length + 2,
        text: mentorText,
        sender: 'mentor',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, mentorResponse]);
      // If chat is closed, don't mark new mentor message as read
      if (!isOpen) {
        // Badge will show automatically
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      let errorText = 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique sua conexão e tente novamente.';
      
      if (error.message?.includes('Authentication required')) {
        errorText = 'Sua sessão expirou. Por favor, faça login novamente para continuar usando o chat.';
        // Don't redirect immediately - let user see the error first
        // User can manually go to login if needed
      } else if (error.message) {
        errorText = error.message;
      }
      
      const errorMessage: Message = {
        id: messages.length + 2,
        text: errorText,
        sender: 'mentor',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      // If chat is closed, don't mark new mentor message as read
      if (!isOpen) {
        // Badge will show automatically
      }
    } finally {
      setLoading(false);
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Close chat when clicking outside (optional - can be disabled)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.chat-widget-container') && !target.closest('.chat-widget-button')) {
        // Don't close on outside click - let user control it
        // setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Don't render if user is not logged in
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="chat-widget-button"
        onClick={toggleChat}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat com mentor IA'}
        title="Mentor de Carreira IA"
      >
        {isOpen ? (
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {/* Notification badge - only show unread mentor messages */}
            {(() => {
              const unreadMentorMessages = messages.filter(
                m => m.sender === 'mentor' && m.id > lastReadMessageId
              ).length;
              return unreadMentorMessages > 0 ? (
                <span className="chat-widget-badge">{unreadMentorMessages}</span>
              ) : null;
            })()}
          </>
        )}
      </button>

      {/* Chat Popup Window */}
      {isOpen && (
        <div className="chat-widget-container">
          {/* Chat Header */}
          <div className="chat-widget-header">
            <div className="chat-widget-header-content">
              <div className="chat-widget-avatar">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="chat-widget-status-indicator"></span>
              </div>
              <div className="chat-widget-header-info">
                <h3>Mentor de Carreira IA</h3>
                <p>Online • Pronto para ajudar</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-widget-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-widget-message ${message.sender === 'user' ? 'chat-widget-message-user' : 'chat-widget-message-mentor'}`}
              >
                <div className="chat-widget-message-content">
                  <p>{message.text}</p>
                  <span className="chat-widget-message-time">
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-widget-message chat-widget-message-mentor">
                <div className="chat-widget-message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="chat-widget-input-form">
            <div className="chat-widget-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  // Allow Enter to submit, Shift+Enter for new line
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
                placeholder="Digite sua mensagem..."
                className="chat-widget-input"
                disabled={loading}
                maxLength={500}
              />
            </div>
            <button
              type="submit"
              className="chat-widget-send-button"
              disabled={loading || !inputMessage.trim()}
              aria-label="Enviar mensagem"
            >
              {loading ? (
                <svg className="chat-widget-spinner" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.25"></circle>
                  <path fill="#ffffff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"></path>
                </svg>
              ) : (
                <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ stroke: '#ffffff', color: '#ffffff' }}>
                  <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" stroke="#ffffff" fill="none" style={{ stroke: '#ffffff' }} />
                </svg>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
