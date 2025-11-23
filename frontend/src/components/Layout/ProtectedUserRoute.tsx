import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { userAPI } from '../../services/api';

/**
 * ProtectedUserRoute Component
 * 
 * Protects user/client routes from admin access.
 * If an admin tries to access user routes, they are redirected to /admin.
 * Regular users can access normally.
 */
interface ProtectedUserRouteProps {
  children: React.ReactNode;
}

const ProtectedUserRoute: React.FC<ProtectedUserRouteProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // Check if user is logged in
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is admin
      const adminStatus = await userAPI.isAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Verificando permissões...</p>
      </div>
    );
  }

  // If user is admin, redirect to admin area
  if (isAdmin === true) {
    return <Navigate to="/admin" replace />;
  }

  // Regular user or not logged in - allow access
  return <>{children}</>;
};

export default ProtectedUserRoute;

