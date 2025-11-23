import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerAPI } from '../services/api';
import CareerPathCard from '../components/CareerPathCard';
// Styles imported via main.tsx -> styles/index.css

interface CareerPath {
  id: number;
  title: string;
  description: string;
  path_type: string;
  stages?: CareerStage[];
}

interface CareerStage {
  id: number;
  title: string;
  description: string;
  order: number;
  is_completed: boolean;
}

const MyCareerPathsPage: React.FC = () => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [filteredPaths, setFilteredPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('progress'); // progress, recent, name
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCareerPaths();
  }, []);

  useEffect(() => {
    filterPaths();
  }, [searchTerm, sortBy, careerPaths]);

  const fetchMyCareerPaths = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user's career paths (personalized + associated predefined)
      const userPaths = await careerAPI.getUserPaths();
      const allPaths = await careerAPI.getAll();
      
      // Combine user's personalized paths with all paths (for now, until backend implements proper association)
      // In the future, backend should return only paths associated with the user
      const pathsToShow = userPaths.length > 0 ? userPaths : allPaths;
      
      setCareerPaths(pathsToShow);
      setFilteredPaths(pathsToShow);
    } catch (err: any) {
      console.error('Error fetching my career paths:', err);
      
      let errorMessage = 'Erro ao carregar suas trilhas.';
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e se o backend está rodando na porta 8000.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão com o backend. Verifique se o servidor está rodando em http://127.0.0.1:8000';
      } else if (err.message) {
        errorMessage = `Erro: ${err.message}`;
      }
      
      setError(errorMessage);
      setCareerPaths([]);
      setFilteredPaths([]);
    } finally {
      setLoading(false);
    }
  };

  const filterPaths = () => {
    let filtered = [...careerPaths];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((path) => {
        const matchesTitle = path.title.toLowerCase().includes(searchLower);
        const matchesDescription = path.description.toLowerCase().includes(searchLower);
        const matchesStages = path.stages?.some((stage) =>
          stage.title.toLowerCase().includes(searchLower) ||
          stage.description?.toLowerCase().includes(searchLower)
        );
        return matchesTitle || matchesDescription || matchesStages;
      });
    }

    // Sort paths
    if (sortBy === 'progress') {
      // Sort by progress (highest first)
      filtered.sort((a, b) => {
        const aCompleted = a.stages?.filter((s) => s.is_completed).length || 0;
        const aTotal = a.stages?.length || 0;
        const aProgress = aTotal > 0 ? aCompleted / aTotal : 0;
        
        const bCompleted = b.stages?.filter((s) => s.is_completed).length || 0;
        const bTotal = b.stages?.length || 0;
        const bProgress = bTotal > 0 ? bCompleted / bTotal : 0;
        
        return bProgress - aProgress;
      });
    } else if (sortBy === 'recent') {
      // Sort by most recently started (would need created_at or started_at field)
      // For now, keep original order
      filtered.reverse();
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredPaths(filtered);
  };

  const calculateProgress = (path: CareerPath): number => {
    if (!path.stages || path.stages.length === 0) return 0;
    const completed = path.stages.filter((s) => s.is_completed).length;
    return Math.round((completed / path.stages.length) * 100);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-modern">
          <div className="loading-spinner-large"></div>
          <p>Carregando suas trilhas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message-modern">
          <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong>Erro ao carregar suas trilhas</strong>
            <p>{error}</p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={fetchMyCareerPaths} className="btn-primary">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Tentar Novamente
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header-modern">
        <div className="page-header-content">
          <div className="page-header-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1>Minhas Trilhas de Carreira</h1>
            <p>Gerencie e acompanhe o progresso de todas as suas trilhas de carreira.</p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar suas trilhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="search-clear"
              aria-label="Limpar busca"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="progress">Maior Progresso</option>
          <option value="recent">Mais Recentes</option>
          <option value="name">Ordem Alfabética</option>
        </select>
      </div>

      {/* Career Paths Grid */}
      {filteredPaths.length === 0 ? (
        <div className="empty-state-modern">
          <div className="empty-state-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3>
            {careerPaths.length === 0 
              ? 'Você ainda não possui trilhas de carreira' 
              : 'Nenhuma trilha encontrada com os filtros selecionados'}
          </h3>
          <p>
            {careerPaths.length === 0
              ? 'Explore trilhas pré-definidas ou crie um plano personalizado para começar sua jornada profissional!'
              : 'Tente ajustar os filtros de busca para encontrar suas trilhas.'}
          </p>
          {careerPaths.length === 0 && (
            <div className="empty-state-actions">
              <button
                onClick={() => navigate('/explore-career-paths')}
                className="btn-primary"
              >
                Explorar Trilhas
              </button>
              <button
                onClick={() => navigate('/create-custom-plan')}
                className="btn-secondary"
              >
                Criar Plano Personalizado
              </button>
            </div>
          )}
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSortBy('progress');
              }}
              className="btn-secondary"
              style={{ marginTop: '1rem' }}
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <>
          {filteredPaths.length > 0 && (
            <div style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
              Mostrando {filteredPaths.length} {filteredPaths.length === 1 ? 'trilha' : 'trilhas'}
              {careerPaths.length !== filteredPaths.length && ` de ${careerPaths.length} total`}
            </div>
          )}
          <div className="career-paths-grid">
            {filteredPaths.map((path) => {
              const progress = calculateProgress(path);
              return (
                <CareerPathCard
                  key={path.id}
                  id={path.id}
                  title={path.title}
                  description={path.description}
                  path_type={path.path_type as 'PRE' | 'PER'}
                  stages={path.stages || []}
                  showProgress={true}
                  showStagesPreview={true}
                  linkTo={`/my-plan/${path.id}`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MyCareerPathsPage;

