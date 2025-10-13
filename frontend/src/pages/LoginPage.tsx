import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/FormStyles.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Inicializar o hook de navegação
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Novo estado para mensagem de sucesso

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores
    setSuccessMessage(null); // Limpa mensagens de sucesso anteriores

    try {
      const response = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sucesso no login
        setSuccessMessage('Login bem-sucedido! Redirecionando...'); // Mensagem inline
        console.log('Usuário logado:', data);
        localStorage.setItem('isLoggedIn', 'true'); // Definir status de login
        window.dispatchEvent(new Event('storage')); // Forçar atualização do Header
        setTimeout(() => {
          navigate('/dashboard'); // Redirecionar para o dashboard após um pequeno delay
        }, 1500); // 1.5 segundos para o usuário ver a mensagem
      } else {
        // Erro no login
        setError(data.error || 'Usuário ou senha inválidos.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
      console.error('Erro na requisição de login:', err);
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
        {successMessage && <p className="success-message">{successMessage}</p>} {/* Exibir mensagem de sucesso */}
        <button type="submit">Entrar</button>
      </form>
      <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
    </div>
  );
};

export default LoginPage;
