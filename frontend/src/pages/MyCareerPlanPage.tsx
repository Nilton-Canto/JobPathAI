import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { careerAPI, stageAPI } from '../services/api';
// Styles imported via main.tsx -> styles/index.css

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
      // Use progress endpoint to get user-specific progress data
      try {
        const progressData = await careerAPI.getProgress(pathId);
        // Also get full path details for description and other fields
        const fullPath = await careerAPI.getById(pathId);
        // Transform progress data to match CareerPath interface
        setCareerPath({
          id: progressData.career_path_id,
          title: progressData.career_path_title,
          description: fullPath.description || '',
          path_type: fullPath.path_type || 'PRE',
          stages: progressData.stages || [],
          created_at: progressData.started_at,
        });
      } catch (progressErr: any) {
        // If user not associated, show error
        if (progressErr.message && progressErr.message.includes('não está associado')) {
          setError('Você não está associado a esta trilha. Associe-se primeiro na página de detalhes.');
        } else {
          // Fallback to getById if progress endpoint fails for other reasons
          const path = await careerAPI.getById(pathId);
          setCareerPath(path);
        }
      }
    } catch (err) {
      console.error('Error fetching career path:', err);
      setError('Erro ao carregar plano de carreira.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeavePath = async () => {
    if (!id || !careerPath) return;
    
    if (!window.confirm(`Tem certeza que deseja sair da trilha "${careerPath.title}"? Você poderá associar-se novamente depois.`)) {
      return;
    }

    try {
      await careerAPI.leavePath(parseInt(id));
      navigate('/my-career-paths');
    } catch (err: any) {
      console.error('Error leaving path:', err);
      alert(err.message || 'Erro ao sair da trilha. Tente novamente.');
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

  const getStatus = (): { label: string; badgeClass: string } => {
    const progress = calculateProgress();
    if (progress === 100) {
      return { label: 'Concluída', badgeClass: 'badge-success' };
    } else if (progress > 0) {
      return { label: 'Em Progresso', badgeClass: 'badge-info' };
    } else {
      return { label: 'Não Iniciada', badgeClass: 'badge-secondary' };
    }
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
        <div className={`plan-status-badge ${getStatus().badgeClass}`}>
          <span className="status-dot"></span>
          {getStatus().label}
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
            <div className="stage-number stage-number-completed">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.5rem', height: '1.5rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="stage-content">
              <h3 className="stage-title-completed">{stage.title}</h3>
              <p className="stage-description">{stage.description}</p>
              {stage.completed_at && (
                <p className="stage-completed-date" style={{ fontSize: '0.875rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 500 }}>
                  Concluído em {new Date(stage.completed_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
            <span className="stage-badge stage-badge-completed">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Concluído
            </span>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p>Tem dúvidas sobre alguma destas etapas ou quer ajustar o seu plano?</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Use o botão de chat no canto inferior direito para conversar com o Mentor IA
            </p>
          </div>
          <button
            onClick={handleLeavePath}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Sair da Trilha
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCareerPlanPage;

