import React from 'react';
import '../components/FormStyles.css';

/**
 * ProgressBar Component
 * 
 * Reusable progress bar component with customizable styling
 * Used in Dashboard, CareerPathCard, MyCareerPlanPage, etc.
 */
interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  completed?: number;
  total?: number;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'success' | 'info' | 'warning';
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  completed,
  total,
  size = 'medium',
  color = 'primary',
  animated = true,
  className = '',
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const sizeClasses = {
    small: 'progress-bar-small',
    medium: 'progress-bar-medium',
    large: 'progress-bar-large',
  };

  const colorClasses = {
    primary: 'progress-fill-primary',
    success: 'progress-fill-success',
    info: 'progress-fill-info',
    warning: 'progress-fill-warning',
  };

  return (
    <div className={`progress-bar-wrapper ${className}`}>
      {showLabel && (completed !== undefined && total !== undefined) && (
        <div className="progress-info">
          <span className="progress-label">
            {completed} de {total} etapas
          </span>
          <span className="progress-percentage">{clampedProgress}%</span>
        </div>
      )}
      <div className={`progress-bar ${sizeClasses[size]}`}>
        <div
          className={`progress-fill ${colorClasses[color]} ${animated ? 'progress-animated' : ''}`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso: ${clampedProgress}%`}
        />
      </div>
      {showLabel && !(completed !== undefined && total !== undefined) && (
        <div className="progress-text">
          <span>{clampedProgress}% concluído</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

