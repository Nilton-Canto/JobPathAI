import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { favoritesAPI } from '../services/api';
// Styles imported via main.tsx -> styles/index.css

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
  showFavorite?: boolean;
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
  showFavorite = false,
  onClick,
  linkTo,
  className = '',
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const totalStages = stages.length;
  const completedStages = stages.filter((s) => s.is_completed).length;
  const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  
  // Get first 3 stages for preview
  const previewStages = showStagesPreview ? stages.slice(0, 3) : [];

  useEffect(() => {
    if (showFavorite) {
      checkFavoriteStatus();
    }
  }, [showFavorite, id]);

  const checkFavoriteStatus = async () => {
    try {
      const favorited = await favoritesAPI.isFavorited(id);
      setIsFavorited(favorited);
    } catch (err) {
      // Silently fail - favorites may not be implemented yet
      console.warn('Could not check favorite status:', err);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (favoriteLoading) return;
    
    try {
      setFavoriteLoading(true);
      if (isFavorited) {
        await favoritesAPI.remove(id);
        setIsFavorited(false);
      } else {
        await favoritesAPI.add(id);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Show error to user
      alert('Erro ao atualizar favoritos. Tente novamente.');
    } finally {
      setFavoriteLoading(false);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {totalStages > 0 && (
            <div className="career-path-stages-count">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>{totalStages} etapas</span>
            </div>
          )}
          {showFavorite && (
            <button
              onClick={handleFavoriteClick}
              disabled={favoriteLoading}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: favoriteLoading ? 'wait' : 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                color: isFavorited ? '#f59e0b' : '#9ca3af',
                transition: 'color 0.2s',
              }}
              title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <svg
                fill={isFavorited ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ width: '1.5rem', height: '1.5rem' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          )}
        </div>
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
          <Link
            to={linkTo}
            className="btn-primary career-path-card-button"
          >
            <span>{showProgress ? 'Continuar Trilha' : 'Explorar Trilha'}</span>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        ) : (
          <button
            onClick={handleClick}
            className="btn-primary career-path-card-button"
          >
            <span>{showProgress ? 'Continuar Trilha' : 'Explorar Trilha'}</span>
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

