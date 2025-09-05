import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../components/FormStyles.css';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar a lógica de login aqui (placeholder por enquanto)
    if (username === 'testuser' && password === 'testpass') {
      alert('Login bem-sucedido!'); // Mensagem para o usuário
      // Redirecionar para a dashboard ou página inicial
    } else {
      setError('Usuário ou senha inválidos.'); // Mensagem para o usuário
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
        <button type="submit">Entrar</button>
      </form>
      <p>Não tem uma conta? <Link to="/register">Cadastre-se</Link></p>
    </div>
  );
};

export default LoginPage;
