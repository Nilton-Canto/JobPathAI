import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const [llmQuery, setLlmQuery] = useState('');
  const [llmResponse, setLlmResponse] = useState('Olá! Como posso ajudar você com sua carreira hoje?');

  const handleLlmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder para integração com a API do LLM
    if (llmQuery.trim()) {
      setLlmResponse(`Entendido: "${llmQuery}". Simulando resposta do LLM... Planeje seus próximos 3 meses focando em aprender React, Python e SQL. Considere os cursos X, Y, Z.`);
      setLlmQuery(''); // Limpa o campo de query
    } else {
      setLlmResponse('Por favor, digite sua pergunta.');
    }
  };

  return (
    <div className="page-container dashboard-container">
      <h2>Bem-vindo ao seu Dashboard!</h2>
      <p>Aqui você poderá ver suas trilhas de carreira, progresso e recomendações personalizadas.</p>

      <div className="dashboard-summary">
        <h3>Seu Progresso Atual</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
          <div className="summary-card">
            <h4>Trilhas em Andamento</h4>
            <p><strong>2</strong></p>
          </div>
          <div className="summary-card">
            <h4>Etapas Concluídas</h4>
            <p><strong>15</strong></p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions" style={{ marginTop: '2rem' }}>
        <h3>Ações Rápidas</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/career-paths" className="btn-primary">Gerenciar Trilhas</Link>
          <Link to="/skills" className="btn-secondary">Explorar Habilidades</Link>
        </div>
      </div>

      <div className="dashboard-llm-chat" style={{ marginTop: '3rem', maxWidth: '600px', margin: '3rem auto 0 auto', padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'left' }}>
        <h3>Pergunte ao JobPathAI (LLM)</h3>
        <div className="llm-response" style={{ backgroundColor: 'var(--color-background-gray)', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
          <strong>JobPathAI:</strong> {llmResponse}
        </div>
        <form onSubmit={handleLlmSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={llmQuery}
            onChange={(e) => setLlmQuery(e.target.value)}
            placeholder="Faça uma pergunta sobre sua carreira..."
            style={{ flexGrow: 1, padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          />
          <button type="submit" className="btn-primary" style={{ marginTop: '0' }}>Enviar</button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
