import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../services/api';
// Styles imported via main.tsx -> styles/index.css

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loginResponse = await authAPI.login(username, password);
      
      // Login bem-sucedido
      if (loginResponse.success) {
        // Salva dados do usuário retornados pelo login
        if (loginResponse.user) {
          localStorage.setItem('userProfile', JSON.stringify(loginResponse.user));
          localStorage.setItem('isLoggedIn', 'true');
          
          // Redirect based on user type
          const isAdmin = loginResponse.user.is_superuser || loginResponse.user.is_staff || loginResponse.user.is_admin;
          if (isAdmin) {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          // Fallback: se não retornou dados do usuário, tenta buscar perfil
          try {
            const userData = await userAPI.getProfile();
            localStorage.setItem('userProfile', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            
            const isAdmin = userData.is_superuser || userData.is_staff || userData.is_admin;
            if (isAdmin) {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          } catch (profileError) {
            console.warn('Erro ao buscar perfil do usuário:', profileError);
            // Cria perfil básico temporário
            localStorage.setItem('userProfile', JSON.stringify({
              username: username,
              nome: username,
              email: '',
              idade: 0,
              cpf: '',
              is_superuser: false,
              is_staff: false,
              is_admin: false
            }));
            localStorage.setItem('isLoggedIn', 'true');
            navigate('/dashboard');
          }
        }
      }
      
      window.dispatchEvent(new Event('storage')); // Notify Header component
    } catch (err: any) {
      setError(err.message || 'Erro de rede. Verifique se o backend está rodando.');
      console.error('Erro na requisição de login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container-modern">
        <div className="login-header">
          <div className="login-logo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="login-title">JobPathAI</h2>
          <p className="login-subtitle">Planeie a sua carreira com inteligência</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-inputs-group">
            <div className="form-input-wrapper">
              <label htmlFor="username" className="sr-only">Nome de usuário</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nome de usuário"
                required
                className="form-input form-input-top"
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

          <div className="login-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-input"
                disabled={loading}
              />
              <span>Lembrar-me</span>
            </label>
            <Link to="/forgot-password" className="forgot-password-link">
              Esqueceu-se da senha?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Entrando...
              </>
            ) : (
              <>
                <svg className="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                </svg>
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-footer-text">
            Ainda não tem conta?
            <Link to="/register" className="login-footer-link">
              Registe-se gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
