import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import AdminCareerPathsPage from '../../pages/admin/AdminCareerPathsPage';
import { userAPI } from '../../services/api';

/**
 * Admin Layout Component
 * Wraps all admin routes with admin-specific header and layout
 * Includes authentication and authorization checks
 */
const AdminLayout: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        navigate('/login');
        return;
      }

      // Check if user is admin
      const adminStatus = await userAPI.isAdmin();
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        // Not an admin, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
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

  if (isAdmin === null) {
    return null;
  }

  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/career-paths" replace />} />
          <Route path="/career-paths" element={<AdminCareerPathsPage />} />
          <Route path="/career-paths/new" element={<div className="admin-placeholder">Nova Trilha (em desenvolvimento)</div>} />
          <Route path="/career-paths/:id/edit" element={<div className="admin-placeholder">Editar Trilha (em desenvolvimento)</div>} />
          <Route path="/areas" element={<div className="admin-placeholder">Gerenciar Áreas (em desenvolvimento)</div>} />
          <Route path="/users" element={<div className="admin-placeholder">Gerenciar Usuários (em desenvolvimento)</div>} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminLayout;
