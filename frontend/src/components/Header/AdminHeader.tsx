import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

/**
 * AdminHeader Component - Admin Area Only
 * 
 * This header is specifically for admin users.
 * Features a dark, professional design to distinguish from the user area.
 * Includes navigation for admin-specific routes.
 */
const AdminHeader: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');
    };

    checkAuthStatus();

    const handleStorageChange = () => {
      const newStatus = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(newStatus);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await authAPI.logout();
    } catch (err) {
      // Logout API may not be implemented yet, continue with local logout
      console.warn('Logout API call failed:', err);
    }
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="admin-header-nav">
      <div className="admin-header-content">
        <div className="admin-header-left">
          <Link to="/admin" className="admin-logo">
            <div className="admin-logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="admin-logo-text">JobPathAI Admin</span>
          </Link>
          <nav className={`admin-nav ${isMobileMenuOpen ? 'admin-nav-open' : ''}`}>
            <Link to="/admin/career-paths" className="admin-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Trilhas
            </Link>
            <Link to="/admin/areas" className="admin-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Áreas
            </Link>
            <Link to="/admin/users" className="admin-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Utilizadores
            </Link>
          </nav>
        </div>
        <div className="admin-header-right">
          {isLoggedIn && (
            <Link 
              to="/login" 
              onClick={(e) => {
                e.preventDefault();
                handleLogout(e as any);
                setIsMobileMenuOpen(false);
              }} 
              className="admin-logout-link"
            >
              Sair
            </Link>
          )}
          <button 
            className="admin-mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
            </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

