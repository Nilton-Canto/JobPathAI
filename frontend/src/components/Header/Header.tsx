import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

/**
 * Header Component - User/Client Area Only
 * 
 * This header is specifically for regular users/clients.
 * Admin users should access the admin area via direct URL (/admin/*)
 * which uses a separate AdminHeader component.
 * 
 * No admin links or navigation should appear here to maintain clear separation.
 */
const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <div className="header-logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <h1>JobPathAI</h1>
      </Link>
      <nav className={`header-nav ${isMobileMenuOpen ? 'header-nav-open' : ''}`}>
        <ul>
          {isLoggedIn ? (
            <>
              <li><Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link></li>
              <li><Link to="/explore-career-paths" onClick={() => setIsMobileMenuOpen(false)}>Explorar Trilhas</Link></li>
              <li><Link to="/chat-mentor" onClick={() => setIsMobileMenuOpen(false)}>Mentor IA</Link></li>
              <li><Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Perfil</Link></li>
              <li>
                <Link 
                  to="/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout(e as any);
                    setIsMobileMenuOpen(false);
                  }} 
                  className="header-logout-link"
                >
                  Sair
                </Link>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link></li>
              <li><Link to="/register" className="header-register-link" onClick={() => setIsMobileMenuOpen(false)}>Cadastre-se</Link></li>
            </>
          )}
        </ul>
      </nav>
      <button 
        className="header-mobile-menu-toggle"
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
    </header>
  );
};

export default Header;
