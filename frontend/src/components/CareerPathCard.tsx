import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import '../components/FormStyles.css';

/**
 * CareerPathCard Component
 * 
 * Reusable card component for displaying career path information
 * Used in ExploreCareerPathsPage, Dashboard, and other pages
 */
interface CareerStage {
  id: number;
  title: string;
  description?: string;
  order: number;
  is_completed?: boolean;
  skills?: any[];
}

interface CareerPathCardProps {
  id: number;
  title: string;
  description: string;
  path_type: 'PRE' | 'PER';
  stages?: CareerStage[];
  showProgress?: boolean;
  showStagesPreview?: boolean;
  onClick?: (id: number) => void;
  linkTo?: string;
  className?: string;
}

const CareerPathCard: React.FC<CareerPathCardProps> = ({
  id,
  title,
  description,
  path_type,
  stages = [],
  showProgress = false,
  showStagesPreview = false,
  onClick,
  linkTo,
  className = '',
}) => {
  const totalStages = stages.length;
  const completedStages = stages.filter((s) => s.is_completed).length;
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  
  // Get first 3 stages for preview
  const previewStages = showStagesPreview ? stages.slice(0, 3) : [];

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const cardContent = (
    <div className={`career-path-card ${className}`}>
      <div className="career-path-card-header">
        <div className="career-path-card-title-section">
          <h3 className="career-path-card-title">{title}</h3>
          <span className={`path-type-badge ${path_type === 'PRE' ? 'badge-primary' : 'badge-secondary'}`}>
            {path_type === 'PRE' ? 'Pré-definida' : 'Personalizada'}
          </span>
        </div>
        {totalStages > 0 && (
          <div className="career-path-stages-count">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{totalStages} etapas</span>
          </div>
        )}
      </div>

      <p className="career-path-description">{description}</p>

      {showProgress && totalStages > 0 && (
        <div className="career-path-progress-section">
          <ProgressBar 
            progress={progress} 
            showLabel={true}
            completed={completedStages}
            total={totalStages}
          />
        </div>
      )}

      {showStagesPreview && previewStages.length > 0 && (
        <div className="career-path-stages-preview">
          <h4 className="stages-preview-title">Etapas:</h4>
          <ul className="stages-preview-list">
            {previewStages.map((stage, index) => (
              <li key={stage.id || index} className="stage-preview-item">
                <span className={`stage-preview-number ${stage.is_completed ? 'completed' : ''}`}>
                  {stage.order}
                </span>
                <span className="stage-preview-title">{stage.title}</span>
                {stage.is_completed && (
                  <svg className="stage-preview-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            ))}
            {totalStages > 3 && (
              <li className="stage-preview-more">
                +{totalStages - 3} etapas restantes
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="career-path-card-actions">
        {linkTo ? (
          <Link to={linkTo} className="btn-primary career-path-card-button">
            {showProgress ? 'Continuar Trilha' : 'Explorar Trilha'}
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        ) : (
          <button onClick={handleClick} className="btn-primary career-path-card-button">
            {showProgress ? 'Continuar Trilha' : 'Explorar Trilha'}
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return cardContent;
};

export default CareerPathCard;

