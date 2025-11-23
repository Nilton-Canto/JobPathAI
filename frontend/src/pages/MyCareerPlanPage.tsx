import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { careerAPI, stageAPI } from '../services/api';
import '../components/FormStyles.css';

interface CareerStage {
  id: number;
  title: string;
  description: string;
  order: number;
  is_completed: boolean;
  completed_at?: string;
  skills?: any[];
}

interface CareerPath {
  id: number;
  title: string;
  description: string;
  path_type: string;
  stages: CareerStage[];
  created_at: string;
}

const MyCareerPlanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingStage, setCompletingStage] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchCareerPath(parseInt(id));
    }
  }, [id]);

  const fetchCareerPath = async (pathId: number) => {
    try {
      setLoading(true);
      const path = await careerAPI.getById(pathId);
      setCareerPath(path);
    } catch (err) {
      console.error('Error fetching career path:', err);
      setError('Erro ao carregar plano de carreira.');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (): number => {
    if (!careerPath || !careerPath.stages || careerPath.stages.length === 0) {
      return 0;
    }
    const completed = careerPath.stages.filter((stage) => stage.is_completed).length;
    return Math.round((completed / careerPath.stages.length) * 100);
  };

  const getCurrentStage = (): CareerStage | null => {
    if (!careerPath || !careerPath.stages) return null;
    return careerPath.stages.find((stage) => !stage.is_completed) || null;
  };

  const handleCompleteStage = async (stageId: number) => {
    try {
      setCompletingStage(stageId);
      await stageAPI.markCompleted(stageId);
      
      // Refresh career path data
      if (id) {
        await fetchCareerPath(parseInt(id));
      }
    } catch (err) {
      console.error('Error completing stage:', err);
      alert('Erro ao marcar etapa como concluída. Tente novamente.');
    } finally {
      setCompletingStage(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Carregando plano de carreira...</div>
      </div>
    );
  }

  if (error || !careerPath) {
    return (
      <div className="page-container">
        <div className="error-message">{error || 'Plano de carreira não encontrado.'}</div>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  const progress = calculateProgress();
  const currentStage = getCurrentStage();
  const completedStages = careerPath.stages.filter((stage) => stage.is_completed);
  const upcomingStages = careerPath.stages.filter((stage) => !stage.is_completed);

  return (
    <div className="page-container my-plan-container">
      <div className="plan-header-section">
        <div className="plan-status-badge">
          <span className="status-dot"></span>
          Em Progresso
        </div>
        <h1>{careerPath.title}</h1>
        <p>{careerPath.description}</p>
        
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-percentage">{progress}%</span>
            <span className="progress-label">concluído</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {completedStages.length} de {careerPath.stages.length} etapas finalizadas
          </p>
        </div>
      </div>

      <div className="stages-section">
        {/* Completed Stages */}
        {completedStages.map((stage) => (
          <div key={stage.id} className="stage-card stage-completed">
            <div className="stage-number stage-number-completed">✓</div>
            <div className="stage-content">
              <h3 className="stage-title-completed">{stage.title}</h3>
              <p className="stage-description">{stage.description}</p>
            </div>
            <span className="stage-badge stage-badge-completed">Concluído</span>
          </div>
        ))}

        {/* Current Stage */}
        {currentStage && (
          <div className="stage-card stage-current">
            <div className="stage-badge-current">Etapa Atual</div>
            <div className="stage-number stage-number-current">{currentStage.order}</div>
            <div className="stage-content">
              <h3>{currentStage.title}</h3>
              <p>{currentStage.description}</p>
              
              {currentStage.skills && currentStage.skills.length > 0 && (
                <div className="stage-skills">
                  <h4>Habilidades:</h4>
                  <div className="skills-tags">
                    {currentStage.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleCompleteStage(currentStage.id)}
                className="btn-primary"
                disabled={completingStage === currentStage.id}
              >
                {completingStage === currentStage.id
                  ? 'Marcando...'
                  : 'Marcar Etapa como Concluída'}
              </button>
            </div>
          </div>
        )}

        {/* Upcoming Stages */}
        {upcomingStages
          .filter((stage) => stage.id !== currentStage?.id)
          .map((stage) => (
            <div key={stage.id} className="stage-card stage-upcoming">
              <div className="stage-number">{stage.order}</div>
              <div className="stage-content">
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
            </div>
          ))}
      </div>

      <div className="plan-actions">
        <p>Tem dúvidas sobre alguma destas etapas ou quer ajustar o seu plano?</p>
        <button
          onClick={() => navigate('/chat-mentor')}
          className="btn-secondary"
        >
          Falar com o Mentor IA
        </button>
      </div>
    </div>
  );
};

export default MyCareerPlanPage;

