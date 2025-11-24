import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { llmAPI } from '../services/api';
// Styles imported via main.tsx -> styles/index.css

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'mentor';
  timestamp: Date;
}

const ChatMentorPage: React.FC = () => {
  const navigate = useNavigate();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    } catch (error: any) {
      console.error('Error sending message:', error);
      let errorText = 'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique sua conexão e tente novamente.';
      
      if (error.message?.includes('Authentication required')) {
        errorText = 'Sua sessão expirou. Por favor, faça login novamente para continuar usando o chat.';
        // Don't redirect immediately - let user see the error first
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container chat-container">
      <div className="chat-header">
        <div className="mentor-avatar">
          <span>🤖</span>
          <span className="status-indicator"></span>
        </div>
        <div>
          <h2>Mentor de Carreira IA</h2>
          <p className="mentor-status">Online • Pronto para ajudar</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'message-user' : 'message-mentor'}`}
          >
            <div className="message-content">
              <p>{message.text}</p>
              <span className="message-time">
                {message.timestamp.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message message-mentor">
            <div className="message-content">
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

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Digite sua pergunta sobre carreira..."
          className="chat-input"
          disabled={loading}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={loading || !inputMessage.trim()}
        >
          {loading ? (
            <>
              <svg className="chat-widget-spinner" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Enviando...
            </>
          ) : (
            <>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Enviar
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatMentorPage;

