import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="welcome-container">
      <h1>Bem-vindo ao JobPathAI</h1>
      <p>
        Seu sistema inteligente de recomendação de carreira. 
        Descubra o melhor caminho para sua carreira profissional com a ajuda da inteligência artificial.
      </p>
      <div className="welcome-buttons">
        <Link to="/login">Fazer Login</Link>
        <Link to="/register">Criar Conta</Link>
      </div>
    </div>
  );
};

export default HomePage;
