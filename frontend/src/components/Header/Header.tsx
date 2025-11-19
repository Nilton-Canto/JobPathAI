import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica o status de login no localStorage
    const loggedInStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');

    // Opcional: Adicionar um event listener para atualizações de login/logout
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault(); // Impede a navegação padrão do Link
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    navigate('/login'); // Redireciona para a página de login após o logout
  };

  return (
    <header className="header">
      <h1>JobPathAI</h1>
      <nav>
        <ul>
          {isLoggedIn ? (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/profile">Perfil</Link></li>
              <li><Link to="/login" onClick={handleLogout}>Sair</Link></li> {/* Usar Link para Sair */}
            </>
          ) : (
            <>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Cadastre-se</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
