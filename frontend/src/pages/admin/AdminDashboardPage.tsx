import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { careerAPI } from '../../services/api';
import '../../styles/pages.css';

/**
 * Admin Dashboard Page
 * 
 * Overview dashboard for administrators showing key metrics and quick actions
 */

interface DashboardStats {
  totalPaths: number;
  predefinedPaths: number;
  personalizedPaths: number;
  totalStages: number;
  totalUsers: number; // Placeholder - would need backend endpoint
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPaths: 0,
    predefinedPaths: 0,
    personalizedPaths: 0,
    totalStages: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allPaths = await careerAPI.getAll();
      
      // Calculate stats
      const predefinedPaths = allPaths.filter((p: any) => p.path_type === 'PRE');
      const personalizedPaths = allPaths.filter((p: any) => p.path_type === 'PER');
      
      let totalStages = 0;
      allPaths.forEach((path: any) => {
        if (path.stages && Array.isArray(path.stages)) {
          totalStages += path.stages.length;
        }
      });

      setStats({
        totalPaths: allPaths.length,
        predefinedPaths: predefinedPaths.length,
        personalizedPaths: personalizedPaths.length,
        totalStages,
        totalUsers: 0, // TODO: Backend endpoint needed
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Erro ao carregar estatísticas do dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container admin-container">
        <div className="loading-modern">
          <div className="loading-spinner-large"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container admin-container">
        <div className="error-message-modern">
          <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
        <button onClick={fetchDashboardStats} className="btn-primary">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="page-container admin-container">
      <header className="admin-header">
        <div>
          <h1>Dashboard Administrativo</h1>
          <p className="admin-subtitle">Visão geral do sistema JobPathAI</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalPaths}</div>
            <div className="stat-label">Total de Trilhas</div>
            <div className="stat-sublabel">
              {stats.predefinedPaths} pré-definidas, {stats.personalizedPaths} personalizadas
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalStages}</div>
            <div className="stat-label">Total de Etapas</div>
            <div className="stat-sublabel">Em todas as trilhas</div>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Usuários Ativos</div>
            <div className="stat-sublabel">Gerenciar via Django Admin</div>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.predefinedPaths}</div>
            <div className="stat-label">Trilhas Pré-definidas</div>
            <div className="stat-sublabel">Disponíveis para usuários</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Ações Rápidas</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/career-paths/new" className="action-card action-card-primary">
            <div className="action-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3>Nova Trilha</h3>
            <p>Criar uma nova trilha de carreira pré-definida</p>
          </Link>

          <Link to="/admin/career-paths" className="action-card action-card-gradient">
            <div className="action-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>Gerenciar Trilhas</h3>
            <p>Visualizar, editar e deletar trilhas existentes</p>
          </Link>

          <Link to="/admin/areas" className="action-card action-card-secondary">
            <div className="action-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3>Gerenciar Áreas</h3>
            <p>Organizar trilhas por áreas profissionais</p>
          </Link>

          <div className="action-card action-card-outline" style={{ cursor: 'default', opacity: 0.9 }}>
            <div className="action-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3>Gerenciar Usuários</h3>
            <p>Use o Django Admin para gerenciar usuários</p>
          </div>
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="dashboard-section">
        <h2 className="section-title">Atividade Recente</h2>
        <div className="empty-state-dashboard">
          <div className="empty-state-icon-large">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3>Nenhuma atividade recente</h3>
          <p>As atividades do sistema aparecerão aqui quando houver dados disponíveis.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

