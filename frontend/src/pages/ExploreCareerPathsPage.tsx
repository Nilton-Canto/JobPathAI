import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

const ExploreCareerPathsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [filteredPaths, setFilteredPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedArea, setSelectedArea] = useState(searchParams.get('area') || 'Todas as Áreas');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'Todos os Níveis');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevancia');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCareerPaths();
  }, []);

  useEffect(() => {
    filterPaths();
  }, [searchTerm, selectedArea, selectedLevel, sortBy, careerPaths]);

  // Update URL query params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedArea !== 'Todas as Áreas') params.set('area', selectedArea);
    if (selectedLevel !== 'Todos os Níveis') params.set('level', selectedLevel);
    if (sortBy !== 'relevancia') params.set('sort', sortBy);
    
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedArea, selectedLevel, sortBy, setSearchParams]);

  const fetchCareerPaths = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Attempt to fetch career paths from API
      const paths = await careerAPI.getPredefined();
      
      // Validate response
      if (!Array.isArray(paths)) {
        throw new Error('Formato de resposta inválido do servidor');
      }
      
      setCareerPaths(paths);
      setFilteredPaths(paths);
    } catch (err: any) {
      console.error('Error fetching career paths:', err);
      
      // Determine error type and message
      let errorMessage = 'Erro ao carregar trilhas.';
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Network error - backend not reachable
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e se o backend está rodando na porta 8000.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão com o backend. Verifique se o servidor está rodando em http://127.0.0.1:8000';
      } else if (err.message) {
        errorMessage = `Erro: ${err.message}`;
      } else {
        errorMessage = 'Erro desconhecido ao carregar trilhas. Tente novamente mais tarde.';
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

    // Filter by search term (searches in title, description, and stage titles)
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

    // Filter by area (searches in title/description for area keywords)
    if (selectedArea !== 'Todas as Áreas') {
      const areaKeywords: { [key: string]: string[] } = {
        'Tecnologia': ['tecnologia', 'tech', 'desenvolvimento', 'programação', 'software', 'web', 'mobile', 'dev'],
        'Design': ['design', 'ux', 'ui', 'interface', 'visual', 'criativo'],
        'Negócios': ['negócio', 'business', 'gestão', 'gerenciamento', 'empreendedorismo', 'marketing'],
        'Dados': ['dados', 'data', 'análise', 'analytics', 'ciência de dados', 'big data', 'machine learning'],
      };
      
      const keywords = areaKeywords[selectedArea] || [];
      if (keywords.length > 0) {
        filtered = filtered.filter((path) => {
          const text = `${path.title} ${path.description}`.toLowerCase();
          return keywords.some(keyword => text.includes(keyword));
        });
      }
    }

    // Filter by level (based on stage count - heuristic)
    if (selectedLevel !== 'Todos os Níveis') {
      filtered = filtered.filter((path) => {
        const stageCount = path.stages?.length || 0;
        if (selectedLevel === 'Iniciante') return stageCount <= 5;
        if (selectedLevel === 'Intermediário') return stageCount > 5 && stageCount <= 10;
        if (selectedLevel === 'Avançado') return stageCount > 10;
        return true;
      });
    }

    // Sort paths
    if (sortBy === 'relevancia') {
      // Sort by match quality (if searching) or default order
      filtered.sort((a, b) => {
        if (searchTerm) {
          const aScore = calculateRelevanceScore(a, searchTerm);
          const bScore = calculateRelevanceScore(b, searchTerm);
          return bScore - aScore;
        }
        return 0;
      });
    } else if (sortBy === 'etapas') {
      filtered.sort((a, b) => (b.stages?.length || 0) - (a.stages?.length || 0));
    } else if (sortBy === 'alfabetica') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredPaths(filtered);
  };

  const calculateRelevanceScore = (path: CareerPath, term: string): number => {
    const termLower = term.toLowerCase();
    let score = 0;
    
    if (path.title.toLowerCase().includes(termLower)) score += 10;
    if (path.description.toLowerCase().includes(termLower)) score += 5;
    path.stages?.forEach((stage) => {
      if (stage.title.toLowerCase().includes(termLower)) score += 2;
    });
    
    return score;
  };

  // Removed handleSelectPath - now using linkTo prop in CareerPathCard

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-modern">
          <div className="loading-spinner-large"></div>
          <p>Carregando trilhas de carreira...</p>
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
            <strong>Erro ao carregar trilhas</strong>
            <p>{error}</p>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={fetchCareerPaths} className="btn-primary">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h1>Explorar Trilhas de Carreira</h1>
            <p>Descubra caminhos pré-definidos para as profissões mais procuradas e comece sua jornada profissional.</p>
          </div>
        </div>
      </header>

      <div className="filters-section">
        <div className="search-box">
          <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Pesquisar trilhas, etapas, habilidades..."
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
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="filter-select"
          aria-label="Filtrar por área profissional"
        >
          <option>Todas as Áreas</option>
          <option>Tecnologia</option>
          <option>Design</option>
          <option>Negócios</option>
          <option>Dados</option>
        </select>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="filter-select"
          aria-label="Filtrar por nível"
        >
          <option>Todos os Níveis</option>
          <option>Iniciante</option>
          <option>Intermediário</option>
          <option>Avançado</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
          aria-label="Ordenar trilhas"
        >
          <option value="relevancia">Relevância</option>
          <option value="etapas">Mais Etapas</option>
          <option value="alfabetica">Ordem Alfabética</option>
        </select>
      </div>

      {filteredPaths.length === 0 ? (
        <div className="empty-state-modern">
          <div className="empty-state-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3>
            {careerPaths.length === 0 
              ? 'Nenhuma trilha disponível' 
              : 'Nenhuma trilha encontrada com os filtros selecionados'}
          </h3>
          <p>
            {careerPaths.length === 0
              ? 'Não há trilhas de carreira cadastradas no sistema. Entre em contato com o administrador.'
              : 'Tente ajustar os filtros de busca ou limpar todos os filtros para ver todas as trilhas disponíveis.'}
          </p>
          {(searchTerm || selectedArea !== 'Todas as Áreas' || selectedLevel !== 'Todos os Níveis') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('Todas as Áreas');
                setSelectedLevel('Todos os Níveis');
                setSortBy('relevancia');
              }}
              className="btn-secondary"
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
            {filteredPaths.map((path) => (
            <CareerPathCard
              key={path.id}
              id={path.id}
              title={path.title}
              description={path.description}
              path_type={path.path_type as 'PRE' | 'PER'}
              stages={path.stages || []}
              showStagesPreview={true}
              showFavorite={true}
              linkTo={`/career-path/${path.id}`}
            />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ExploreCareerPathsPage;

