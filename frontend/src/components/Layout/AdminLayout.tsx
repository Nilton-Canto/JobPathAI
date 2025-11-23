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
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
