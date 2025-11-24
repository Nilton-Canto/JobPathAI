import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { areaAPI } from '../../services/api';
import '../../styles/pages.css';

/**
 * Admin Areas Management Page
 * 
 * Full CRUD interface for managing professional areas
 */

interface Area {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  path_count?: number;
  created_at?: string;
  updated_at?: string;
}

const AdminAreasPage: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      setError(null);
      const areasData = await areaAPI.getAll();
      
      // Fetch path count for each area (if not included in response)
      const areasWithCounts = await Promise.all(
        areasData.map(async (area: Area) => {
          try {
            const areaDetails = await areaAPI.getById(area.id);
            return { ...area, path_count: areaDetails.path_count || 0 };
          } catch {
            return { ...area, path_count: 0 };
          }
        })
      );
      
      setAreas(areasWithCounts);
    } catch (err: any) {
      console.error('Error fetching areas:', err);
      setError(err.message || 'Erro ao carregar áreas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: '', description: '', is_active: true });
    setShowCreateForm(true);
    setError(null);
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      description: area.description || '',
      is_active: area.is_active,
    });
    setShowEditForm(true);
    setError(null);
  };

  const handleViewDetails = async (area: Area) => {
    try {
      const areaDetails = await areaAPI.getById(area.id);
      setSelectedArea(areaDetails);
      setShowDetailsModal(true);
    } catch (err: any) {
      console.error('Error fetching area details:', err);
      setError(err.message || 'Erro ao carregar detalhes da área');
    }
  };

  const handleDelete = async (area: Area) => {
    if (area.path_count && area.path_count > 0) {
      alert(`Não é possível deletar a área "${area.name}" porque ela possui ${area.path_count} trilha(s) associada(s).`);
      return;
    }

    if (!window.confirm(`Tem certeza que deseja deletar a área "${area.name}"?`)) {
      return;
    }

    try {
      setDeletingId(area.id);
      await areaAPI.delete(area.id);
      setAreas(areas.filter((a) => a.id !== area.id));
      setSuccessMessage(`Área "${area.name}" deletada com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting area:', err);
      const errorMessage = err.message || 'Erro ao deletar área';
      if (errorMessage.includes('trilha')) {
        alert(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Por favor, preencha o nome da área.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingArea) {
        // Update
        const updated = await areaAPI.update(editingArea.id, formData);
        setAreas(areas.map((a) => (a.id === editingArea.id ? updated : a)));
        setSuccessMessage(`Área "${updated.name}" atualizada com sucesso!`);
        setShowEditForm(false);
        setEditingArea(null);
      } else {
        // Create
        const created = await areaAPI.create(formData);
        setAreas([...areas, created]);
        setSuccessMessage(`Área "${created.name}" criada com sucesso!`);
        setShowCreateForm(false);
      }
      
      setFormData({ name: '', description: '', is_active: true });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving area:', err);
      setError(err.message || 'Erro ao salvar área');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingArea(null);
    setFormData({ name: '', description: '', is_active: true });
    setError(null);
  };

  return (
    <div className="page-container admin-container">
      <header className="admin-header">
        <div>
          <h1>Áreas Profissionais</h1>
          <p className="admin-subtitle">
            Gerencie as áreas profissionais disponíveis no sistema
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          + Nova Área
        </button>
      </header>

      {error && (
        <div className="error-message-modern" style={{ marginBottom: '1.5rem' }}>
          <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
          <button 
            onClick={() => setError(null)} 
            className="btn-secondary"
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
          >
            Fechar
          </button>
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

      {loading ? (
        <div className="empty-state-dashboard">
          <div className="loading-spinner-large"></div>
          <p>Carregando áreas profissionais...</p>
        </div>
      ) : areas.length === 0 ? (
        <div className="empty-state-dashboard">
          <div className="empty-state-icon-large">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3>Nenhuma área encontrada</h3>
          <p>Crie sua primeira área profissional para começar.</p>
          <div className="empty-state-actions" style={{ marginTop: '2rem' }}>
            <button onClick={handleCreate} className="btn-primary">
              Criar Primeira Área
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            background: '#f9fafb', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9375rem' }}>
              <strong style={{ color: '#1f2937' }}>{areas.length}</strong> {areas.length === 1 ? 'área profissional' : 'áreas profissionais'} cadastradas
            </p>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Área Profissional</th>
                  <th>Status</th>
                  <th>Trilhas Ativas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {areas
                  .sort((a, b) => {
                    // Sort by active status first, then by name
                    if (a.is_active !== b.is_active) {
                      return a.is_active ? -1 : 1;
                    }
                    return a.name.localeCompare(b.name);
                  })
                  .map((area) => (
                    <tr key={area.id}>
                      <td>
                        <strong style={{ fontSize: '1rem', color: '#1f2937' }}>{area.name}</strong>
                        {area.description && (
                          <p className="table-description" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
                            {area.description}
                          </p>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${area.is_active ? 'badge-success' : 'badge-secondary'}`}>
                          {area.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}>
                          {area.path_count || 0}
                        </span>
                        <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                          {area.path_count === 1 ? 'trilha' : 'trilhas'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => handleViewDetails(area)}
                            className="btn-small btn-secondary"
                            title="Ver detalhes"
                          >
                            Detalhes
                          </button>
                          <button
                            onClick={() => handleEdit(area)}
                            className="btn-small btn-secondary"
                            title="Editar área"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(area)}
                            disabled={deletingId === area.id || (area.path_count && area.path_count > 0)}
                            className={`btn-small ${(area.path_count && area.path_count > 0) ? 'btn-disabled' : 'btn-danger'}`}
                            title={(area.path_count && area.path_count > 0) ? 'Não pode deletar: trilhas associadas' : 'Deletar área'}
                          >
                            {deletingId === area.id ? 'Deletando...' : 'Deletar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || showEditForm) && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{editingArea ? 'Editar Área Profissional' : 'Nova Área Profissional'}</h2>
              <button onClick={handleCancel} className="modal-close" aria-label="Fechar">
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              <form onSubmit={handleSubmit} className="profile-form-modern" style={{ margin: 0 }}>
              <div className="form-group-modern">
                <label htmlFor="name">Nome da Área *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input-modern"
                  placeholder="Ex: Tecnologia"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group-modern">
                <label htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input-modern"
                  placeholder="Descreva a área profissional..."
                  rows={4}
                  disabled={saving}
                />
              </div>

              <div className="form-group-modern">
                <label htmlFor="is_active" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    disabled={saving}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                  />
                  <span>Área ativa (disponível para uso)</span>
                </label>
              </div>

              <div className="form-actions-modern">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving || !formData.name.trim()}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      {editingArea ? 'Salvando...' : 'Criando...'}
                    </>
                  ) : (
                    editingArea ? 'Salvar Alterações' : 'Criar Área'
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedArea && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Detalhes da Área Profissional</h2>
              <button onClick={() => setShowDetailsModal(false)} className="modal-close" aria-label="Fechar">
                ×
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                  Nome da Área
                </label>
                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {selectedArea.name}
                </p>
              </div>

              {selectedArea.description && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                    Descrição
                  </label>
                  <p style={{ color: '#374151', margin: 0, lineHeight: '1.6' }}>
                    {selectedArea.description}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                  Status
                </label>
                <span className={`badge ${selectedArea.is_active ? 'badge-success' : 'badge-secondary'}`}>
                  {selectedArea.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                  Trilhas Associadas
                </label>
                <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  {selectedArea.path_count || 0} {selectedArea.path_count === 1 ? 'trilha' : 'trilhas'}
                </p>
              </div>

              {selectedArea.created_at && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                    Criada em
                  </label>
                  <p style={{ color: '#374151', margin: 0 }}>
                    {new Date(selectedArea.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}

              <div className="form-actions-modern form-actions-centered" style={{ marginTop: '2rem' }}>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedArea);
                  }}
                  className="btn-primary"
                >
                  Editar Área
                </button>
                <Link
                  to={`/admin/career-paths?area=${encodeURIComponent(selectedArea.name)}`}
                  className="btn-secondary"
                >
                  Ver Trilhas
                </Link>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAreasPage;
