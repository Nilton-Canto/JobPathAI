import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { careerAPI } from '../../services/api';
// Styles imported via main.tsx -> styles/index.css

interface CareerPath {
  id: number;
  title: string;
  description: string;
  path_type: string;
  stages?: any[];
  created_at?: string;
}

const AdminCareerPathsPage: React.FC = () => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCareerPaths();
  }, []);

  const fetchCareerPaths = async () => {
    try {
      setLoading(true);
      setError(null);
      const paths = await careerAPI.getAll();
      
      // Ensure paths is an array
      if (Array.isArray(paths)) {
        setCareerPaths(paths);
      } else {
        console.error('Expected array but got:', paths);
        setCareerPaths([]);
        setError('Formato de dados inválido recebido do servidor.');
      }
    } catch (err) {
      console.error('Error fetching career paths:', err);
      setError('Erro ao carregar trilhas.');
      setCareerPaths([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar esta trilha?')) {
      return;
    }

    try {
      await careerAPI.delete(id);
      setCareerPaths(careerPaths.filter((path) => path.id !== id));
    } catch (err) {
      console.error('Error deleting career path:', err);
      alert('Erro ao deletar trilha.');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Carregando trilhas...</div>
      </div>
    );
  }

  return (
    <div className="page-container admin-container">
      <header className="admin-header">
        <h1>Gerir Trilhas de Carreira</h1>
        <Link to="/admin/career-paths/new" className="btn-primary">
          + Nova Trilha
        </Link>
      </header>

      {error && <div className="error-message">{error}</div>}

      {careerPaths.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma trilha cadastrada.</p>
          <Link to="/admin/career-paths/new" className="btn-primary">
            Criar Primeira Trilha
          </Link>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome da Trilha</th>
                <th>Tipo</th>
                <th>Etapas</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {careerPaths.map((path) => (
                <tr key={path.id}>
                  <td>
                    <strong>{path.title}</strong>
                    <p className="table-description">{path.description}</p>
                  </td>
                  <td>
                    <span className={`badge ${path.path_type === 'PRE' ? 'badge-primary' : 'badge-secondary'}`}>
                      {path.path_type === 'PRE' ? 'Pré-definida' : 'Personalizada'}
                    </span>
                  </td>
                  <td>{path.stages?.length || 0}</td>
                  <td>
                    {path.created_at
                      ? new Date(path.created_at).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => navigate(`/admin/career-paths/${path.id}/edit`)}
                        className="btn-small btn-secondary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(path.id)}
                        className="btn-small btn-danger"
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCareerPathsPage;
