import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <h1>JobPathAI</h1>
      <nav>
        <ul>
          <li><Link to="/">Início</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/profile">Perfil</Link></li>
          <li><Link to="/logout">Sair</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
