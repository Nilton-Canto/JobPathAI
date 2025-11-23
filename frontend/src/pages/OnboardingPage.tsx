import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
// Styles imported via main.tsx -> styles/index.css

/**
 * OnboardingPage Component
 * 
 * Collects additional user information after registration
 * Helps personalize the experience and recommend relevant career paths
 */
const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [onboardingData, setOnboardingData] = useState({
    area_interesse: '',
    nivel_experiencia: 'sem_experiencia',
    objetivos: '',
  });

  const areasInteresse = [
    'Desenvolvimento Web',
    'Desenvolvimento Mobile',
    'Ciência de Dados',
    'Inteligência Artificial',
    'Design UX/UI',
    'Marketing Digital',
    'Gestão de Projetos',
    'Análise de Negócios',
    'Outra',
  ];

  const niveisExperiencia = [
    { value: 'sem_experiencia', label: 'Sem Experiência' },
    { value: 'estagiario', label: 'Estagiário' },
    { value: 'junior', label: 'Júnior' },
    { value: 'pleno', label: 'Pleno' },
    { value: 'senior', label: 'Sênior' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOnboardingData(prev => ({ ...prev, [name]: value }));
  };

  const handleAreaSelect = (area: string) => {
    setOnboardingData(prev => ({ ...prev, area_interesse: area }));
  };

  const handleNext = () => {
    if (step === 1 && !onboardingData.area_interesse) {
      setError('Por favor, selecione uma área de interesse');
      return;
    }
    if (step === 2 && !onboardingData.nivel_experiencia) {
      setError('Por favor, selecione seu nível de experiência');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update user profile with onboarding data
      await userAPI.updateProfile({
        area_interesse: onboardingData.area_interesse,
        nivel_experiencia: onboardingData.nivel_experiencia,
      });

      // Store in localStorage
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        localStorage.setItem('userProfile', JSON.stringify({
          ...profile,
          area_interesse: onboardingData.area_interesse,
          nivel_experiencia: onboardingData.nivel_experiencia,
        }));
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar informações. Você pode completar isso depois no seu perfil.');
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page-wrapper">
      <div className="onboarding-container">
        <div className="onboarding-progress">
          <div className="onboarding-progress-bar">
            <div 
              className="onboarding-progress-fill" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <span className="onboarding-progress-text">Passo {step} de 3</span>
        </div>

        <div className="onboarding-content">
          {step === 1 && (
            <div className="onboarding-step">
              <div className="onboarding-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="onboarding-title">Qual área te interessa?</h2>
              <p className="onboarding-description">
                Selecione a área profissional que você deseja seguir. Isso nos ajudará a recomendar as melhores trilhas para você.
              </p>
              <div className="onboarding-areas-grid">
                {areasInteresse.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleAreaSelect(area)}
                    className={`onboarding-area-card ${onboardingData.area_interesse === area ? 'selected' : ''}`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              {onboardingData.area_interesse === 'Outra' && (
                <div className="form-group-modern" style={{ marginTop: '1rem' }}>
                  <input
                    type="text"
                    name="area_interesse"
                    value={onboardingData.area_interesse}
                    onChange={(e) => setOnboardingData(prev => ({ ...prev, area_interesse: e.target.value }))}
                    className="form-input-modern"
                    placeholder="Digite sua área de interesse"
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="onboarding-step">
              <div className="onboarding-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="onboarding-title">Qual seu nível de experiência?</h2>
              <p className="onboarding-description">
                Isso nos ajuda a personalizar o conteúdo e as recomendações para o seu nível atual.
              </p>
              <div className="onboarding-levels-list">
                {niveisExperiencia.map((nivel) => (
                  <button
                    key={nivel.value}
                    type="button"
                    onClick={() => setOnboardingData(prev => ({ ...prev, nivel_experiencia: nivel.value }))}
                    className={`onboarding-level-card ${onboardingData.nivel_experiencia === nivel.value ? 'selected' : ''}`}
                  >
                    <span className="level-label">{nivel.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="onboarding-step">
              <div className="onboarding-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="onboarding-title">Quase lá!</h2>
              <p className="onboarding-description">
                Você pode adicionar seus objetivos de carreira (opcional). Isso nos ajuda a criar recomendações ainda mais personalizadas.
              </p>
              <div className="form-group-modern">
                <label htmlFor="objetivos">Objetivos de Carreira (opcional)</label>
                <textarea
                  id="objetivos"
                  name="objetivos"
                  value={onboardingData.objetivos}
                  onChange={handleChange}
                  className="form-input-modern"
                  rows={4}
                  placeholder="Ex: Quero me tornar um desenvolvedor full-stack sênior em 2 anos..."
                />
              </div>
            </div>
          )}

          {error && (
            <div className="error-message-modern" role="alert">
              <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="onboarding-actions">
            {step > 1 && (
              <button onClick={handleBack} className="btn-secondary" disabled={loading}>
                Voltar
              </button>
            )}
            <button onClick={handleSkip} className="btn-secondary" disabled={loading}>
              Pular
            </button>
            {step < 3 ? (
              <button onClick={handleNext} className="btn-primary" disabled={loading}>
                Próximo
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : (
              <button onClick={handleComplete} className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    Concluir
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

