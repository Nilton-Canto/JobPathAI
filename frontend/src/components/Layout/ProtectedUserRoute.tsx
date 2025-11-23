import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Verificando permissões...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is admin, redirect to admin area
  if (isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  // Regular user - allow access
  return <>{children}</>;
};

export default ProtectedUserRoute;

