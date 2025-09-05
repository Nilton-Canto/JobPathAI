import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found">
      <h2>404 - Página não encontrada</h2>
      <p>A página que você está procurando não existe.</p>
      <Link to="/">Voltar ao início</Link>
    </div>
  );
};

export default NotFoundPage;
