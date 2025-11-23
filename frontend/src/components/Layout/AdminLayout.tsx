import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import AdminDashboardPage from '../../pages/admin/AdminDashboardPage';
import AdminCareerPathsPage from '../../pages/admin/AdminCareerPathsPage';
import AdminCreateCareerPathPage from '../../pages/admin/AdminCreateCareerPathPage';
import AdminEditCareerPathPage from '../../pages/admin/AdminEditCareerPathPage';
import AdminAreasPage from '../../pages/admin/AdminAreasPage';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Admin Layout Component
 * Wraps all admin routes with admin-specific header and layout
 * Includes authentication and authorization checks
 */
const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      if (!isAdmin()) {
        // Not an admin, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="admin-layout">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (!isAdmin()) {
    return (
      <div className="admin-layout">
        <div className="admin-access-denied">
          <svg className="access-denied-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para acessar esta área.</p>
          <p>Redirecionando para o dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/dashboard" element={<AdminDashboardPage />} />
          <Route path="/career-paths" element={<AdminCareerPathsPage />} />
          <Route path="/career-paths/new" element={<AdminCreateCareerPathPage />} />
          <Route path="/career-paths/:id/edit" element={<AdminEditCareerPathPage />} />
          <Route path="/areas" element={<AdminAreasPage />} />
          <Route path="/users" element={
            <div className="page-container admin-container">
              <header className="admin-header">
                <div>
                  <h1>Gerenciar Usuários</h1>
                  <p className="admin-subtitle">Use o Django Admin para gerenciar usuários</p>
                </div>
              </header>
              <div className="empty-state-dashboard">
                <div className="empty-state-icon-large">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3>Gerenciamento de Usuários via Django Admin</h3>
                <p>
                  Para gerenciar usuários, utilize o painel administrativo do Django.
                </p>
                <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  Acesse: <code style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>http://localhost:8000/admin/</code>
                </p>
                <div className="empty-state-actions" style={{ marginTop: '2rem' }}>
                  <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer" className="btn-primary">
                    Abrir Django Admin
                  </a>
                  <Link to="/admin" className="btn-secondary">
                    Voltar para Dashboard
                  </Link>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
