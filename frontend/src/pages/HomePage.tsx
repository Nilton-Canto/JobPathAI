import React from 'react';
import { Link } from 'react-router-dom';
import '../components/FormStyles.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page-wrapper">
      {/* Hero Section */}
      <section className="hero-section-modern">
        <div className="hero-content">
          <div className="hero-badge">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Planejamento de Carreira Inteligente</span>
          </div>
          <h1 className="hero-title">
            Transforme Sua Carreira com
            <span className="hero-title-highlight"> JobPathAI</span>
          </h1>
          <p className="hero-description">
            Planejamento de carreira inteligente e personalizado, impulsionado por IA.
            Descubra o seu caminho profissional ideal e alcance seus objetivos.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-hero-primary">
              Comece Agora
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/login" className="btn-hero-secondary">
              Já sou Cliente
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-graphic">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="url(#gradient1)" opacity="0.2" />
              <path d="M100 40 L140 100 L100 160 L60 100 Z" fill="url(#gradient1)" opacity="0.4" />
              <circle cx="100" cy="100" r="30" fill="url(#gradient1)" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-modern">
        <div className="section-header">
          <h2>Nossos Recursos</h2>
          <p>Tudo que você precisa para planejar sua carreira com sucesso</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3>Trilhas Personalizadas</h3>
            <p>Obtenha um plano de carreira feito sob medida para você, baseado em seus interesses e habilidades.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3>Agente LLM</h3>
            <p>Receba sugestões inteligentes e esclareça suas dúvidas com nosso assistente virtual baseado em IA.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>Acompanhamento de Progresso</h3>
            <p>Monitore seu desenvolvimento e ajuste seu plano dinamicamente conforme você avança.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section-modern">
        <div className="about-content">
          <div className="about-text">
            <h2>Sobre o JobPathAI</h2>
            <p>
              JobPathAI é a sua plataforma definitiva para planejamento de carreira. 
              Com o poder da Inteligência Artificial, oferecemos trilhas personalizadas, 
              análise de lacunas de habilidades e acompanhamento de progresso 
              para garantir que você esteja sempre no caminho certo.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Usuários Ativos</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Trilhas Disponíveis</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Satisfação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section-modern">
        <div className="section-header">
          <h2>O Que Dizem Nossos Usuários</h2>
          <p>Depoimentos reais de pessoas que transformaram suas carreiras</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-quote">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>
            <p>"O JobPathAI transformou minha forma de ver minha carreira. As recomendações são incríveis e me ajudaram a focar no que realmente importa!"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">MS</div>
              <div>
                <div className="testimonial-name">Maria Silva</div>
                <div className="testimonial-role">Desenvolvedora Front-end</div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-quote">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
            </div>
            <p>"Consegui identificar minhas lacunas e focar no que realmente importa para meu crescimento. A plataforma é intuitiva e os resultados são visíveis!"</p>
            <div className="testimonial-author">
              <div className="testimonial-avatar">JS</div>
              <div>
                <div className="testimonial-name">João Santos</div>
                <div className="testimonial-role">Analista de Dados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section-modern">
        <div className="cta-content">
          <h2>Pronto para Transformar Sua Carreira?</h2>
          <p>Junte-se a milhares de profissionais que já estão no caminho certo</p>
          <Link to="/register" className="btn-cta">
            Começar Agora
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
