import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
// Styles imported via main.tsx -> styles/index.css

const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [terms, setTerms] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
      let formattedValue = value;

      if (value.length > 3) {
          formattedValue = `${value.slice(0, 3)}.${value.slice(3)}`;
      }
      if (value.length > 6) {
          formattedValue = `${formattedValue.slice(0, 7)}.${formattedValue.slice(7)}`;
      }
      if (value.length > 9) {
          formattedValue = `${formattedValue.slice(0, 11)}-${formattedValue.slice(11)}`;
      }

      setCpf(formattedValue.slice(0, 14)); // Limit to CPF length with mask
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (!terms) {
      setError('Você deve concordar com os Termos de Serviço e Política de Privacidade.');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name,
        username,
        email,
        age,
        cpf,
        password,
        confirm_password: confirmPassword,
      });

      setError(null);
      
      // Backend now returns user data after auto-login
      // Update AuthContext with user data
      if (response.user) {
        // Update localStorage and AuthContext
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userProfile', JSON.stringify(response.user));
        
        // Refresh AuthContext to update authentication state
        // Only refresh if we have a successful response
        try {
          await refreshUser();
        } catch (refreshErr) {
          // If refresh fails, still proceed with the data we have
          console.warn('Failed to refresh user after registration, but proceeding:', refreshErr);
        }
      }
      
      setSuccessMessage('Usuário cadastrado com sucesso! Redirecionando...');
      setTimeout(() => {
        // Redirect to onboarding to collect additional info
        navigate('/onboarding');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      
      // Check if it's a connection error
      const isConnectionError = err.message?.includes('Failed to fetch') || 
                               err.message?.includes('ERR_CONNECTION_REFUSED') ||
                               err.message?.includes('NetworkError') ||
                               err instanceof TypeError;
      
      if (isConnectionError) {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8000.');
      } else {
        setError(err.message || 'Erro de rede. Verifique se o backend está rodando.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container-modern">
        <div className="login-header">
          <div className="login-logo register-logo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
          <h2 className="login-title">Crie a sua conta</h2>
          <p className="login-subtitle">Comece hoje a sua jornada profissional</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-inputs-group">
            <div className="form-input-wrapper">
              <label htmlFor="name" className="sr-only">Nome Completo</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome Completo"
                required
                className="form-input form-input-top"
                disabled={loading}
              />
            </div>
            <div className="form-input-wrapper">
              <label htmlFor="username" className="sr-only">Nome de Usuário</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nome de Usuário"
                required
                className="form-input"
                disabled={loading}
              />
            </div>
            <div className="form-input-wrapper">
              <label htmlFor="email" className="sr-only">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                required
                className="form-input"
                disabled={loading}
              />
            </div>
            <div className="form-input-wrapper">
              <label htmlFor="age" className="sr-only">Idade</label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Idade"
                required
                min="1"
                max="120"
                className="form-input"
                disabled={loading}
              />
            </div>
            <div className="form-input-wrapper">
              <label htmlFor="cpf" className="sr-only">CPF</label>
              <input
                type="text"
                id="cpf"
                value={cpf}
                onChange={handleCpfChange}
                placeholder="CPF (000.000.000-00)"
                required
                className="form-input"
                disabled={loading}
              />
            </div>
            <div className="form-input-wrapper">
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="form-input"
                disabled={loading}
              />
            </div>
            <div className="form-input-wrapper">
              <label htmlFor="confirmPassword" className="sr-only">Confirmar Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar Senha"
                required
                className="form-input form-input-bottom"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="error-message-modern" role="alert">
              <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="register-terms">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="checkbox-input"
                required
                disabled={loading}
              />
              <span>
                Concordo com os{' '}
                <Link to="/terms" className="terms-link">Termos de Serviço</Link>
                {' '}e{' '}
                <Link to="/privacy" className="terms-link">Política de Privacidade</Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !terms}
            className="login-button"
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Registrando...
              </>
            ) : (
              <>
                <svg className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125c0 .621.504 1.125 1.125 1.125h2.25a1.125 1.125 0 001.125-1.125V6a2.25 2.25 0 00-2.25-2.25h-2.25A2.25 2.25 0 009 6v.75m0 0v3" />
                </svg>
                Registrar
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            Já tem uma conta?
            <Link to="/login" className="login-footer-link">
              Entre aqui
            </Link>
          </p>
        </div>

        {successMessage && (
          <div className="success-toast" role="status" aria-live="polite">
            <svg className="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
