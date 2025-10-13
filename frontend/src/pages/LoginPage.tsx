import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/FormStyles.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        // Login bem-sucedido - busca dados do usuário
        try {
          const userResponse = await fetch('http://127.0.0.1:8000/api/user-profile/', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            localStorage.setItem('userProfile', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
          } else {
            // Se não conseguir buscar o perfil, usa dados básicos
            localStorage.setItem('userProfile', JSON.stringify({
              nome: username,
              email: '',
              idade: 0,
              cpf: ''
            }));
            localStorage.setItem('isLoggedIn', 'true');
          }
        } catch (profileError) {
          console.warn('Erro ao buscar perfil do usuário:', profileError);
          // Continua com login mesmo sem perfil
          localStorage.setItem('userProfile', JSON.stringify({
            nome: username,
            email: '',
            idade: 0,
            cpf: ''
          }));
          localStorage.setItem('isLoggedIn', 'true');
        }
        
        navigate('/dashboard');
      } else {
        const errorData = await response.json().catch(() => null);
        if (errorData?.error) {
          setError(errorData.error);
        } else {
          setError('Usuário ou senha inválidos.');
        }
      }
    } catch (err) {
      setError('Erro de rede. Verifique se o backend está rodando.');
      console.error('Erro na requisição de login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
    </div>
  );
};

export default LoginPage;
