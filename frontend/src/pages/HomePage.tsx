import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Transforme Sua Carreira com JobPathAI</h1>
        <p>
          Planejamento de carreira inteligente e personalizado, impulsionado por IA.
          Descubra o seu caminho profissional ideal e alcance seus objetivos.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">Comece Agora</Link>
          <Link to="/login" className="btn-secondary">Já sou Cliente</Link>
        </div>
      </section>

      <section className="about-section">
        <h2>Sobre o JobPathAI</h2>
        <p>
          JobPathAI é a sua plataforma definitiva para planejamento de carreira. 
          Com o poder da Inteligência Artificial, oferecemos trilhas personalizadas, 
          análise de lacunas de habilidades e acompanhamento de progresso 
          para garantir que você esteja sempre no caminho certo.
        </p>
      </section>

      <section className="features-section">
        <h2>Nossos Recursos</h2>
        <div className="feature-grid">
          <div className="feature-item">
            <h3>Trilhas Personalizadas</h3>
            <p>Obtenha um plano de carreira feito sob medida para você.</p>
          </div>
          <div className="feature-item">
            <h3>Agente LLM</h3>
            <p>Receba sugestões inteligentes e esclareça suas dúvidas.</p>
          </div>
          <div className="feature-item">
            <h3>Acompanhamento de Progresso</h3>
            <p>Monitore seu desenvolvimento e ajuste seu plano dinamicamente.</p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2>O Que Dizem Nossos Usuários</h2>
        <div className="testimonial-item">
          <p>"O JobPathAI transformou minha forma de ver minha carreira. As recomendações são incríveis!"</p>
          <span>- Maria Silva, Desenvolvedora Front-end</span>
        </div>
        <div className="testimonial-item">
          <p>"Consegui identificar minhas lacunas e focar no que realmente importa para meu crescimento."</p>
          <span>- João Santos, Analista de Dados</span>
        </div>
      </section>

      <section className="contact-section">
        <h2>Entre em Contato</h2>
        <p>Tem dúvidas ou quer saber mais? Fale conosco!</p>
        <Link to="/contact" className="btn-primary">Fale Conosco</Link> {/* Rota a ser criada futuramente */}
      </section>
    </div>
  );
};

export default HomePage;
