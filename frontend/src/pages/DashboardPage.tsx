import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { careerAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Tooltip from '../components/Tooltip';
// Styles imported via main.tsx -> styles/index.css

interface CareerPath {
  id: number;
  title: string;
  description: string;
  path_type: string;
  stages?: any[];
}

interface DashboardStats {
  activePaths: number;
  completedStages: number;
  totalStages: number;
  progressPercentage: number;
  nextStageTitle?: string;
  nextStagePath?: string;
  recommendedPaths: number;
  skillsLearned: number;
}

const DashboardPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activePaths, setActivePaths] = useState<CareerPath[]>([]);
  const [primaryPath, setPrimaryPath] = useState<CareerPath | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    activePaths: 0,
    completedStages: 0,
    totalStages: 0,
    progressPercentage: 0,
    nextStageTitle: undefined,
    nextStagePath: undefined,
    recommendedPaths: 0,
    skillsLearned: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Refresh user profile from context
      if (!user) {
        await refreshUser();
      }

      // Fetch user's career paths
      try {
        // Get only paths that user has explicitly associated with
        const userPaths = await careerAPI.getUserPaths();
        
        // Only show paths that user has associated with (no fallback to all paths)
        const pathsToShow = userPaths;
        
        // Set primary path (first path or most progressed)
        if (pathsToShow.length > 0) {
          // Find path with highest progress (use progress_percent from backend if available)
          const pathWithProgress = pathsToShow.map((path: CareerPath) => {
            // Use progress_percent from backend if available, otherwise calculate
            let progress = 0;
            if ((path as any).progress_percent !== undefined) {
              progress = (path as any).progress_percent / 100;
            } else {
              const completed = path.stages?.filter((s: any) => s.is_completed).length || 0;
              const total = path.stages?.length || 0;
              progress = total > 0 ? completed / total : 0;
            }
            return { path, progress };
          }).sort((a: { path: CareerPath; progress: number }, b: { path: CareerPath; progress: number }) => b.progress - a.progress);
          
          setPrimaryPath(pathWithProgress[0]?.path || pathsToShow[0]);
          // Show other paths (excluding primary)
          const otherPaths = pathsToShow.filter((p: CareerPath) => p.id !== (pathWithProgress[0]?.path.id || pathsToShow[0].id));
          setActivePaths(otherPaths.slice(0, 2)); // Show 2 other paths
        } else {
          setPrimaryPath(null);
          setActivePaths([]);
        }
        
        // Calculate stats
        let totalStages = 0;
        let completedStages = 0;
        let nextStage: any = null;
        let nextStagePathId: number | null = null;
        const allSkills = new Set<string>();
        
        // Find next stage to complete and collect skills (only from user's associated paths)
        pathsToShow.forEach((path: CareerPath) => {
          if (path.stages) {
            totalStages += path.stages.length;
            const pathCompletedStages = path.stages.filter((stage: any) => stage.is_completed).length;
            completedStages += pathCompletedStages;
            
            // Find next incomplete stage
            if (!nextStage) {
              const incompleteStage = path.stages.find((stage: any) => !stage.is_completed);
              if (incompleteStage) {
                nextStage = incompleteStage;
                nextStagePathId = path.id;
              }
            }
            
            // Collect skills from completed stages
            path.stages.forEach((stage: any) => {
              if (stage.is_completed && stage.skills) {
                stage.skills.forEach((skill: any) => {
                  if (typeof skill === 'string') {
                    allSkills.add(skill);
                  } else if (skill.name) {
                    allSkills.add(skill.name);
                  }
                });
              }
            });
          }
        });

        const progressPercentage = totalStages > 0 
          ? Math.round((completedStages / totalStages) * 100) 
          : 0;

        // Get predefined paths count for recommendations (from all available paths, not just user's)
        const allAvailablePaths = await careerAPI.getAll({ is_active: 'true', path_type: 'PRE' });
        const predefinedPaths = Array.isArray(allAvailablePaths) ? allAvailablePaths : [];

        setStats({
          activePaths: pathsToShow.length,
          completedStages,
          totalStages,
          progressPercentage,
          nextStageTitle: nextStage?.title,
          nextStagePath: nextStagePathId ? `/my-plan/${nextStagePathId}` : undefined,
          recommendedPaths: predefinedPaths.length,
          skillsLearned: allSkills.size,
        });
      } catch (pathsError) {
        console.warn('Could not fetch career paths:', pathsError);
        // Continue without paths data
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container-modern">
        <div className="loading-modern">
          <div className="loading-spinner-large"></div>
          <p>Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container-modern">
        <div className="error-message-modern">
          <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Voltar ao Login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container-modern">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Bem-vindo(a), <span className="welcome-name">{user?.nome || 'Usuário'}</span>!
          </h1>
          <p className="welcome-subtitle">
            Gerencie sua jornada profissional e acompanhe seu progresso
          </p>
        </div>
        <div className="welcome-avatar">
          <div className="avatar-circle">
            {user?.nome?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats-grid">
        <Tooltip content="Número total de trilhas de carreira que você está seguindo atualmente">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.07-.547 3.42 3.42 0 014.384 0 3.42 3.42 0 001.07.547 3.42 3.42 0 003.14 3.14 3.42 3.42 0 00.547 1.07 3.42 3.42 0 010 4.384 3.42 3.42 0 00-.547 1.07 3.42 3.42 0 01-3.14 3.14 3.42 3.42 0 00-1.07.547 3.42 3.42 0 01-4.384 0 3.42 3.42 0 00-1.07-.547 3.42 3.42 0 01-3.14-3.14 3.42 3.42 0 00-.547-1.07 3.42 3.42 0 010-4.384 3.42 3.42 0 00.547-1.07 3.42 3.42 0 013.14-3.14z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.activePaths}</div>
            <div className="stat-label">Trilhas Ativas</div>
          </div>
        </div>
        </Tooltip>

        <Tooltip content="Percentual geral de conclusão de todas as etapas de todas as suas trilhas">
        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.progressPercentage}%</div>
            <div className="stat-label">Progresso Geral</div>
          </div>
        </div>
        </Tooltip>

        <Tooltip content="Total de etapas que você já completou em todas as suas trilhas">
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.completedStages}</div>
              <div className="stat-label">Etapas Concluídas</div>
              <div className="stat-sublabel">de {stats.totalStages} total</div>
            </div>
          </div>
        </Tooltip>

        <Tooltip content="Habilidades únicas que você desenvolveu ao completar etapas das trilhas">
        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="stat-content">
              <div className="stat-number">{stats.skillsLearned}</div>
              <div className="stat-label">Habilidades Desenvolvidas</div>
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Primary Path Highlight */}
      {primaryPath && (
        <div className="dashboard-section">
          <div className="section-header-inline">
            <h2 className="section-title">Trilha Principal</h2>
            <Link to="/my-career-paths" className="section-link">
              Gerenciar Trilhas →
            </Link>
          </div>
          <div className="primary-path-card">
            <div className="primary-path-badge">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Trilha Principal
            </div>
            <div className="primary-path-content">
              <h3 className="primary-path-title">{primaryPath.title}</h3>
              <p className="primary-path-description">{primaryPath.description}</p>
              {primaryPath.stages && primaryPath.stages.length > 0 && (
                <div className="primary-path-progress">
                  {(() => {
                    const completed = primaryPath.stages.filter((s: any) => s.is_completed).length;
                    const total = primaryPath.stages.length;
                    const progress = Math.round((completed / total) * 100);
                    return (
                      <>
                        <div className="progress-info">
                          <span className="progress-label">{completed} de {total} etapas concluídas</span>
                          <span className="progress-percentage">{progress}%</span>
                        </div>
                        <div className="progress-bar progress-bar-medium">
                          <div className="progress-fill progress-fill-primary" style={{ width: `${progress}%` } as React.CSSProperties} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
              <Link to={`/my-plan/${primaryPath.id}`} className="btn-primary primary-path-button">
                Ver Detalhes
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Next Step Highlight */}
      {stats.nextStageTitle && stats.nextStagePath && (
        <div className="dashboard-section">
          <div className="next-step-card">
            <div className="next-step-header">
              <div className="next-step-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="next-step-content">
                <h3 className="next-step-title">Próxima Etapa Recomendada</h3>
                <p className="next-step-description">{stats.nextStageTitle}</p>
              </div>
            </div>
            <Link to={stats.nextStagePath} className="next-step-button">
              Continuar Trilha
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
        </div>
      </div>
      )}

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Ações Rápidas</h2>
        <div className="quick-actions-grid">
          <Link to="/explore-career-paths" className="action-card action-card-primary">
            <div className="action-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3>Explorar Trilhas</h3>
            <p>Descubra trilhas de carreira pré-definidas</p>
          </Link>

          <Link to="/create-custom-plan" className="action-card action-card-gradient">
            <div className="action-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3>Criar Plano IA</h3>
            <p>Gere um plano personalizado com inteligência artificial</p>
          </Link>

          <Link to="/chat-mentor" className="action-card action-card-secondary">
            <div className="action-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3>Mentor IA</h3>
            <p>Converse com nosso mentor de carreira inteligente ou use o botão de chat flutuante</p>
          </Link>

          <Link to="/profile" className="action-card action-card-outline">
            <div className="action-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3>Meu Perfil</h3>
            <p>Visualize e edite suas informações pessoais</p>
          </Link>
        </div>
      </div>

      {/* Other Active Career Paths */}
      {activePaths.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header-inline">
            <h2 className="section-title">Outras Trilhas</h2>
            <Link to="/explore-career-paths" className="section-link">
              Ver todas →
            </Link>
          </div>
          <div className="career-paths-preview">
            {activePaths.map((path) => {
              const completedStages = path.stages?.filter((s: any) => s.is_completed).length || 0;
              const totalStages = path.stages?.length || 0;
              const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

              return (
                <Link 
                  key={path.id} 
                  to={`/my-plan/${path.id}`}
                  className="path-preview-card"
                >
                  <div className="path-preview-header">
                    <h3>{path.title}</h3>
                    <span className={`path-type-badge ${path.path_type === 'PRE' ? 'badge-primary' : 'badge-secondary'}`}>
                      {path.path_type === 'PRE' ? 'Pré-definida' : 'Personalizada'}
                    </span>
                  </div>
                  <p className="path-preview-description">{path.description}</p>
                  <div className="path-preview-progress">
                    <div className="progress-bar-small" style={{ '--progress-width': `${progress}%` } as React.CSSProperties & { '--progress-width': string }}>
                      <div className="progress-fill-small"></div>
                    </div>
                    <span className="progress-text-small">
                      {completedStages} de {totalStages} etapas ({progress}%)
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State - No Active Paths */}
      {!primaryPath && activePaths.length === 0 && (
        <div className="dashboard-section">
          <div className="empty-state-dashboard">
            <div className="empty-state-icon-large">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>Comece sua jornada profissional</h3>
            <p>Você ainda não possui trilhas de carreira ativas. Explore trilhas pré-definidas ou crie um plano personalizado!</p>
            <div className="empty-state-actions">
              <Link to="/explore-career-paths" className="btn-primary">
                Explorar Trilhas
              </Link>
              <Link to="/create-custom-plan" className="btn-secondary">
                Criar Plano Personalizado
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
