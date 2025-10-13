import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/FormStyles.css';

interface UserProfile {
  nome: string;
  email: string;
  idade: number;
  cpf: string;
}

const DashboardPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simula busca dos dados do usuário
    // Em uma implementação real, faria uma chamada para a API
    const fetchUserProfile = async () => {
      try {
        // Por enquanto, vamos simular dados do localStorage ou fazer uma chamada para a API
        const userData = localStorage.getItem('userProfile');
        if (userData) {
          setUserProfile(JSON.parse(userData));
        } else {
          // Se não há dados, redireciona para login
          navigate('/login');
        }
      } catch (err) {
        setError('Erro ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const handleEditProfile = () => {
    // Implementar edição de perfil
    alert('Funcionalidade de edição de perfil será implementada em breve!');
  };

  const handleExploreCareers = () => {
    // Implementar exploração de trilhas
    alert('Funcionalidade de trilhas de carreira será implementada em breve!');
  };

  const handleCreatePlan = () => {
    // Implementar criação de plano personalizado
    alert('Funcionalidade de plano personalizado será implementada em breve!');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/login')}>Voltar ao Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Bem-vindo(a), {userProfile?.nome || 'Usuário'}!</h1>
        <p>Você está logado na sua área inicial do JobPathAI</p>
      </div>

      <div className="user-info-card">
        <h3>Informações da Conta</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Nome completo:</span>
            <span className="info-value">{userProfile?.nome}</span>
          </div>
          <div className="info-item">
            <span className="info-label">E-mail:</span>
            <span className="info-value">{userProfile?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Idade:</span>
            <span className="info-value">{userProfile?.idade} anos</span>
          </div>
          <div className="info-item">
            <span className="info-label">CPF:</span>
            <span className="info-value">{userProfile?.cpf}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          className="btn btn-primary" 
          onClick={handleExploreCareers}
        >
          Explorar Trilhas de Carreira
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleCreatePlan}
        >
          Criar Plano Personalizado
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={handleEditProfile}
        >
          Editar Perfil
        </button>
        <button 
          className="btn btn-danger" 
          onClick={handleLogout}
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
