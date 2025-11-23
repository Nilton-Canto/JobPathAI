import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminHeader: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  return (
    <header className="admin-header-nav">
      <div className="admin-header-content">
        <div className="admin-header-left">
          <Link to="/admin" className="admin-logo">
            <div className="admin-logo-icon">JP</div>
            <span className="admin-logo-text">Admin Panel</span>
          </Link>
          <nav className="admin-nav">
            <Link to="/admin/career-paths" className="admin-nav-link">
              Trilhas
            </Link>
            <Link to="/admin/areas" className="admin-nav-link">
              Áreas
            </Link>
            <Link to="/admin/users" className="admin-nav-link">
              Utilizadores
            </Link>
          </nav>
        </div>
        <div className="admin-header-right">
          {isLoggedIn && (
            <button onClick={handleLogout} className="admin-logout-btn">
              Sair
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

