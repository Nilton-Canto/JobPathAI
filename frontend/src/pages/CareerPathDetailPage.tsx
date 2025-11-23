import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { careerAPI } from '../services/api';
import ProgressBar from '../components/ProgressBar';
// Styles imported via main.tsx -> styles/index.css

interface CareerStage {
  id: number;
  title: string;
  description: string;
  order: number;
  is_completed?: boolean;
  skills?: any[];
}

interface CareerPath {
  id: number;
  title: string;
  description: string;
  path_type: string;
  stages: CareerStage[];
  created_at?: string;
}

const CareerPathDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [careerPath, setCareerPath] = useState<CareerPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCareerPath(parseInt(id));
    }
  }, [id]);

  const fetchCareerPath = async (pathId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const path = await careerAPI.getById(pathId);
      setCareerPath(path);
    } catch (err: any) {
      console.error('Error fetching career path:', err);
      
      let errorMessage = 'Erro ao carregar detalhes da trilha.';
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e se o backend está rodando na porta 8000.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão com o backend. Verifique se o servidor está rodando em http://127.0.0.1:8000';
      } else if (err.message) {
        errorMessage = `Erro: ${err.message}`;
      }
      
      setError(errorMessage);
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

  const getAllSkills = (): string[] => {
    if (!careerPath || !careerPath.stages) return [];
    const skillsSet = new Set<string>();
    careerPath.stages.forEach((stage) => {
      if (stage.skills) {
        stage.skills.forEach((skill) => {
          if (typeof skill === 'string') {
            skillsSet.add(skill);
          } else if (skill.name) {
            skillsSet.add(skill.name);
          }
        });
      }
    });
    return Array.from(skillsSet);
  };

  const estimateTime = (): string => {
    // Estimate: 2-3 weeks per stage on average
    const totalStages = careerPath?.stages?.length || 0;
    const weeks = Math.ceil(totalStages * 2.5);
    const months = Math.ceil(weeks / 4);
    
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      if (remainingMonths > 0) {
        return `${years} ano${years > 1 ? 's' : ''} e ${remainingMonths} mês${remainingMonths > 1 ? 'es' : ''}`;
      }
      return `${years} ano${years > 1 ? 's' : ''}`;
    }
    return `${months} mês${months > 1 ? 'es' : ''}`;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-modern">
          <div className="loading-spinner-large"></div>
          <p>Carregando detalhes da trilha...</p>
        </div>
      </div>
    );
  }

  if (error || !careerPath) {
    return (
      <div className="page-container">
        <div className="error-message-modern">
          <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong>Erro ao carregar trilha</strong>
            <p>{error || 'Trilha de carreira não encontrada.'}</p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/explore-career-paths')} className="btn-primary">
            Voltar para Explorar Trilhas
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const allSkills = getAllSkills();
  const estimatedTime = estimateTime();

  return (
    <div className="page-container my-plan-container">
      {/* Header Section */}
      <div className="plan-header-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <span className={`path-type-badge ${careerPath.path_type === 'PRE' ? 'badge-primary' : 'badge-secondary'}`}>
              {careerPath.path_type === 'PRE' ? 'Trilha Pré-definida' : 'Trilha Personalizada'}
            </span>
          </div>
          <Link to="/explore-career-paths" className="btn-secondary" style={{ textDecoration: 'none' }}>
            ← Voltar
          </Link>
        </div>
        
        <h1>{careerPath.title}</h1>
        <p style={{ fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '2rem' }}>{careerPath.description}</p>
        
        {/* Info Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Total de Etapas</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {careerPath.stages.length}
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Tempo Estimado</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {estimatedTime}
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Habilidades</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {allSkills.length}
            </div>
          </div>
        </div>

        {/* Progress (if user has started) */}
        {progress > 0 && (
          <div className="progress-section">
            <div className="progress-info">
              <span className="progress-percentage">{progress}%</span>
              <span className="progress-label">concluído</span>
            </div>
            <ProgressBar progress={progress} size="large" showLabel={true} />
          </div>
        )}
      </div>

      {/* Skills Section */}
      {allSkills.length > 0 && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
            Habilidades Desenvolvidas
          </h2>
          <div className="skills-grid">
            {allSkills.map((skill, index) => (
              <span key={index} className="skill-tag" style={{ padding: '0.5rem 1rem', background: '#e3f2fd', color: '#1976d2', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stages Section */}
      <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1.5rem' }}>
          Etapas da Trilha
        </h2>
        <div className="stages-section">
          {careerPath.stages.map((stage, index) => (
            <div key={stage.id} className="stage-card" style={{ opacity: stage.is_completed ? 0.7 : 1 }}>
              <div className={`stage-number ${stage.is_completed ? 'stage-number-completed' : ''}`}>
                {stage.is_completed ? '✓' : stage.order}
              </div>
              <div className="stage-content">
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {stage.title}
                </h3>
                <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '1rem' }}>
                  {stage.description}
                </p>
                {stage.skills && stage.skills.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Habilidades desta etapa:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {stage.skills.map((skill: any, skillIndex: number) => (
                        <span key={skillIndex} className="skill-tag" style={{ padding: '0.25rem 0.75rem', background: '#e3f2fd', color: '#1976d2', borderRadius: '0.375rem', fontSize: '0.8125rem' }}>
                          {typeof skill === 'string' ? skill : skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {stage.is_completed && (
                <span className="stage-badge stage-badge-completed">Concluído</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Section */}
      <div style={{ marginTop: '2rem', padding: '2rem', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.5rem' }}>
          Pronto para começar?
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          {progress > 0 
            ? 'Continue sua jornada nesta trilha de carreira!'
            : 'Comece sua jornada profissional seguindo esta trilha passo a passo.'}
        </p>
        <Link to={`/my-plan/${careerPath.id}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {progress > 0 ? 'Continuar Trilha' : 'Começar Trilha'}
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default CareerPathDetailPage;

