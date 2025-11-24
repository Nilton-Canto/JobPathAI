import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { llmAPI } from '../services/api';
// Styles imported via main.tsx -> styles/index.css

const CreateCustomPlanPage: React.FC = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('Por favor, descreva seus objetivos e interesses.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call LLM API to generate personalized career plan
      const response = await llmAPI.generatePlan(description);
      
      if (response.success && response.career_path) {
        // Navigate to the generated plan page
        navigate(`/my-plan/${response.career_path.id}`);
      } else {
        setError('Erro ao gerar plano. Resposta inválida do servidor.');
      }
      
    } catch (err: any) {
      console.error('Error generating plan:', err);
      setError(
        err.message || 
        'Erro ao gerar plano. Verifique sua conexão e tente novamente. ' +
        'Certifique-se de que a chave da API Gemini está configurada no backend.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container create-plan-container">
      <div className="plan-header">
        <div className="plan-icon">
          <span>✨</span>
        </div>
        <h1>Plano de Carreira Inteligente</h1>
        <p>
          Descreva os seus interesses, competências atuais e onde quer chegar. 
          A nossa Inteligência Artificial criará um caminho passo-a-passo único para si.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="plan-form">
        <div className="form-group">
          <label htmlFor="user-description">
            Fale-nos sobre si e os seus objetivos
          </label>
          <p className="form-hint">
            Quanto mais detalhes fornecer, mais personalizado será o seu plano. 
            Mencione experiências passadas, o que gosta de fazer e áreas que lhe despertam curiosidade.
          </p>
          <textarea
            id="user-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
            placeholder="Exemplo: Sou estudante de Engenharia de Software, tenho experiência básica em Python e JavaScript. Gostaria de me tornar um desenvolvedor Full Stack especializado em aplicações web modernas. Tenho interesse em React, Node.js e bancos de dados..."
            required
          />
          <div className="char-count">
            {description.length} caracteres
          </div>
        </div>

        {error && (
          <div className="error-message-modern create-plan-error">
            <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>Erro ao gerar plano</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="form-actions-modern">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
            disabled={loading}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="button-icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary create-plan-submit-button"
            disabled={loading || !description.trim()}
          >
            {loading ? (
              <>
                <svg className="chat-widget-spinner button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Gerando Plano...
              </>
            ) : (
              <>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="button-icon">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Gerar Meu Plano Personalizado
              </>
            )}
          </button>
        </div>
      </form>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Nossa IA está criando um plano personalizado para você...</p>
        </div>
      )}
    </div>
  );
};

export default CreateCustomPlanPage;

