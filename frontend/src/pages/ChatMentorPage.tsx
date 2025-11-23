import React, { useState, useRef, useEffect } from 'react';
import { llmAPI } from '../services/api';
import '../components/FormStyles.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'mentor';
  timestamp: Date;
}

const ChatMentorPage: React.FC = () => {
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
    setInputMessage('');
    setLoading(true);

    try {
      // TODO: Implement LLM API integration when backend is ready
      // const response = await llmAPI.chat(inputMessage);
      
      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mentorResponse: Message = {
        id: messages.length + 2,
        text: 'Esta é uma resposta simulada. A integração com a API LLM será implementada em breve. Por favor, descreva sua pergunta sobre carreira e eu ajudarei você!',
        sender: 'mentor',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, mentorResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
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
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatMentorPage;

