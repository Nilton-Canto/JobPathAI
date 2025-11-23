import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { careerAPI } from '../services/api';
import '../components/FormStyles.css';

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
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [filteredPaths, setFilteredPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('Todas as Áreas');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCareerPaths();
  }, []);

  useEffect(() => {
    filterPaths();
  }, [searchTerm, selectedArea, careerPaths]);

  const fetchCareerPaths = async () => {
    try {
      setLoading(true);
      const paths = await careerAPI.getPredefined();
      setCareerPaths(paths);
      setFilteredPaths(paths);
    } catch (err) {
      console.error('Error fetching career paths:', err);
      setError('Erro ao carregar trilhas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filterPaths = () => {
    let filtered = [...careerPaths];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (path) =>
          path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by area (if area field exists in the future)
    if (selectedArea !== 'Todas as Áreas') {
      // TODO: Implement area filtering when area field is added to CareerPath model
    }

    setFilteredPaths(filtered);
  };

  const handleSelectPath = (pathId: number) => {
    // TODO: Implement path selection logic
    navigate(`/career-path/${pathId}`);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Carregando trilhas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchCareerPaths} className="btn-primary">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Explorar Trilhas de Carreira</h1>
        <p>Descubra caminhos pré-definidos para as profissões mais procuradas.</p>
      </header>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Pesquisar trilhas (ex: Design, Dados...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="filter-select"
        >
          <option>Todas as Áreas</option>
          <option>Tecnologia</option>
          <option>Design</option>
          <option>Negócios</option>
          <option>Dados</option>
        </select>
      </div>

      {filteredPaths.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma trilha encontrada.</p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('Todas as Áreas');
              }}
              className="btn-secondary"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="career-paths-grid">
          {filteredPaths.map((path) => (
            <div key={path.id} className="career-path-card">
              <h3>{path.title}</h3>
              <p className="career-path-description">{path.description}</p>
              <div className="career-path-meta">
                <span className="stage-count">
                  {path.stages?.length || 0} etapas
                </span>
                <span className="path-type-badge">
                  {path.path_type === 'PRE' ? 'Pré-definida' : 'Personalizada'}
                </span>
              </div>
              <button
                onClick={() => handleSelectPath(path.id)}
                className="btn-primary"
              >
                Explorar Trilha
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreCareerPathsPage;

