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
  is_active?: boolean;
  user_count?: number; // Number of users associated with this path
}

const AdminCareerPathsPage: React.FC = () => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
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
    const path = careerPaths.find(p => p.id === id);
    if (!path) return;

    // Check for associated users
    try {
      const associatedUsers = await careerAPI.checkUsers(id);
      if (associatedUsers.length > 0) {
        const userCount = associatedUsers.length;
        const message = `Esta trilha está associada a ${userCount} ${userCount === 1 ? 'usuário' : 'usuários'}. ` +
          `Não é possível deletar trilhas com usuários associados. ` +
          `Considere desativar a trilha ao invés de deletá-la.`;
        alert(message);
        return;
      }
    } catch (err) {
      console.warn('Could not check associated users, proceeding with deletion:', err);
    }

    if (!window.confirm(`Tem certeza que deseja deletar a trilha "${path.title}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await careerAPI.delete(id);
      setCareerPaths(careerPaths.filter((path) => path.id !== id));
      setSuccessMessage(`Trilha "${path.title}" deletada com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting career path:', err);
      const errorMsg = err.message?.includes('usuários') 
        ? err.message 
        : 'Erro ao deletar trilha. Verifique se o backend está rodando.';
      alert(errorMsg);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const path = careerPaths.find(p => p.id === id);
    if (!path) return;

    setTogglingIds(prev => new Set(prev).add(id));

    try {
      const updated = await careerAPI.toggleActive(id, !currentStatus);
      setCareerPaths(careerPaths.map(p => 
        p.id === id ? { ...p, is_active: updated.is_active ?? !currentStatus } : p
      ));
      setSuccessMessage(
        `Trilha "${path.title}" ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error toggling active status:', err);
      alert('Erro ao alterar status da trilha. Verifique se o backend está rodando.');
    } finally {
      setTogglingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
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

      {error && (
        <div className="error-message-modern" style={{ marginBottom: '1.5rem' }}>
          <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message-modern" style={{ marginBottom: '1.5rem' }}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

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
                <th>Status</th>
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
                    <button
                      onClick={() => handleToggleActive(path.id, path.is_active ?? true)}
                      disabled={togglingIds.has(path.id)}
                      className={`btn-small ${path.is_active !== false ? 'btn-success' : 'btn-secondary'}`}
                      style={{
                        minWidth: '100px',
                        opacity: togglingIds.has(path.id) ? 0.6 : 1,
                        cursor: togglingIds.has(path.id) ? 'not-allowed' : 'pointer',
                      }}
                      title={path.is_active !== false ? 'Clique para desativar' : 'Clique para ativar'}
                    >
                      {togglingIds.has(path.id) ? (
                        <span style={{ 
                          display: 'inline-block', 
                          animation: 'spin 1s linear infinite',
                          fontSize: '1rem',
                        }}>⟳</span>
                      ) : path.is_active !== false ? (
                        <>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '0.25rem', verticalAlign: 'middle', display: 'inline-block' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Ativa
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '0.25rem', verticalAlign: 'middle', display: 'inline-block' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Inativa
                        </>
                      )}
                    </button>
                  </td>
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
                        title="Editar trilha"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(path.id)}
                        className="btn-small btn-danger"
                        title="Deletar trilha"
                        disabled={path.user_count && path.user_count > 0}
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
