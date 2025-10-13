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
  const navigate = useNavigate(); // Inicializar o hook de navegação
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Novo estado para mensagem de sucesso

  // Funções de validação
  const validateName = (name: string) => {
    if (!name.trim()) return 'O nome não pode ser vazio.';
    return null;
  };

  const validateUsername = (username: string) => {
    if (!username.trim()) return 'O nome de usuário não pode ser vazio.';
    if (username.length < 3) return 'O nome de usuário deve ter pelo menos 3 caracteres.';
    // Adicionar mais validações, se necessário (ex: alfanumérico)
    return null;
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'O e-mail não pode ser vazio.';
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email)) return 'Formato de e-mail inválido.';
    return null;
  };

  const validateAge = (ageStr: string) => {
    const ageNum = parseInt(ageStr, 10);
    if (isNaN(ageNum)) return 'A idade deve ser um número.';
    if (ageNum < 18) return 'Você deve ter pelo menos 18 anos.';
    return null;
  };

  const validateCpf = (cpf: string) => {
    if (!cpf.trim()) return 'O CPF não pode ser vazio.';
    // Regex básica para formato XXX.XXX.XXX-XX
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) return 'Formato de CPF inválido (ex: 123.456.789-00).';
    return null;
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
    if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.';
    if (!/[a-z]/.test(password)) return 'A senha deve conter pelo menos uma letra minúscula.';
    if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos um número.';
    if (!/[^A-Za-z0-9]/.test(password)) return 'A senha deve conter pelo menos um caractere especial.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null); // Limpa mensagens de sucesso anteriores

    // Executar validações
    let validationError = validateName(name);
    if (validationError) { setError(validationError); return; }

    validationError = validateUsername(username);
    if (validationError) { setError(validationError); return; }

    validationError = validateEmail(email);
    if (validationError) { setError(validationError); return; }

    validationError = validateAge(age);
    if (validationError) { setError(validationError); return; }

    validationError = validateCpf(cpf);
    if (validationError) { setError(validationError); return; }

    validationError = validatePassword(password);
    if (validationError) { setError(validationError); return; }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, username, email, age, cpf, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Cadastro realizado com sucesso! Redirecionando para o login...'); // Mensagem inline
        console.log('Usuário cadastrado:', data);
        window.dispatchEvent(new Event('storage')); // Opcional: Para manter consistência, mesmo que não faça auto-login
        setTimeout(() => {
          navigate('/login'); // Redirecionar para a página de login após um pequeno delay
        }, 1500); // 1.5 segundos para o usuário ver a mensagem
      } else {
        setError(data.error || 'Erro no cadastro. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
      console.error('Erro na requisição de cadastro:', err);
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
        {successMessage && <p className="success-message">{successMessage}</p>} {/* Exibir mensagem de sucesso */}
        <button type="submit">Cadastrar</button>
      </form>
      <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
    </div>
  );
};

export default RegisterPage;
