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
      // TODO: Implement LLM API integration when backend is ready
      // const plan = await llmAPI.generatePlan(description);
      
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Navigate to the generated plan page
      // navigate(`/my-plan/${plan.id}`);
      
      // Temporary: show success message
      alert('Plano personalizado será gerado em breve! Esta funcionalidade está em desenvolvimento.');
      
    } catch (err) {
      console.error('Error generating plan:', err);
      setError('Erro ao gerar plano. Tente novamente mais tarde.');
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

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !description.trim()}
          >
            {loading ? 'Gerando Plano...' : 'Gerar Meu Plano Personalizado'}
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

