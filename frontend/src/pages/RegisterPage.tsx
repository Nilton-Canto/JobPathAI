import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/FormStyles.css';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.'); // Mensagem para o usuário
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          username,
          email,
          age,
          cpf,
          password,
          confirm_password: confirmPassword,
        }),
      });

      if (response.ok) {
        setError(null);
        setSuccessMessage('Usuário cadastrado com sucesso! Redirecionando...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }

      const data = await response.json().catch(() => null);
      if (data?.detail) {
        setError(data.detail);
      } else {
        setError('Falha ao cadastrar. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro de rede. Verifique se o backend está rodando.');
    }
  };

  return (
    <div className="register-container">
      <h2>Cadastro de Novo Usuário</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nome:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Nome de Usuário:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="age">Idade:</label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cpf">CPF:</label>
          <input
            type="text"
            id="cpf"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
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
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Senha:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Cadastrar</button>
      </form>
      <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            background: '#10b981',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            fontWeight: 600,
            zIndex: 1000,
          }}
        >
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
