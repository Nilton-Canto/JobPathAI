import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { areaAPI, careerAPI, stageAPI } from '../../services/api';
import '../../styles/pages.css';
import '../../styles/components.css';

/**
 * Admin Create Career Path Page
 * 
 * Form to create a new career path with stages
 */

interface CareerStage {
  title: string;
  description: string;
  order: number;
  skills: string[]; // Skill names as strings for now
}

const AdminCreateCareerPathPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [areas, setAreas] = useState<{ id: number; name: string }[]>([]);
  
  // Career Path Form Data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pathType, setPathType] = useState<'PRE' | 'PER'>('PRE');
  const [selectedAreaId, setSelectedAreaId] = useState<number | ''>('');
  const [level, setLevel] = useState('');
  const [estimatedTimeMonths, setEstimatedTimeMonths] = useState<number | ''>('');
  const [hoursPerWeek, setHoursPerWeek] = useState<number | ''>('');
  
  // Stages Management
  const [stages, setStages] = useState<CareerStage[]>([]);
  const [showStageForm, setShowStageForm] = useState(false);
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  const [currentStage, setCurrentStage] = useState<CareerStage>({
    title: '',
    description: '',
    order: 1,
    skills: [],
  });
  const [draggedStageIndex, setDraggedStageIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const response = await areaAPI.getAll();
        // API may return paginated {results}, normalize to array
        const data = Array.isArray(response) ? response : response?.results || [];
        setAreas(
          data.map((area: any) => ({
            id: area.id,
            name: area.name,
          }))
        );
      } catch (err) {
        console.warn('Não foi possível carregar áreas, usando seletor vazio:', err);
      }
    };

    loadAreas();
  }, []);

  const handleAddStage = () => {
    if (!currentStage.title.trim() || !currentStage.description.trim()) {
      alert('Por favor, preencha título e descrição da etapa.');
      return;
    }

    if (editingStageIndex !== null) {
      // Edit existing stage
      const updatedStages = [...stages];
      updatedStages[editingStageIndex] = { ...currentStage };
      setStages(updatedStages);
      setEditingStageIndex(null);
    } else {
      // Add new stage
      const newOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) + 1 : 1;
      setStages([...stages, { ...currentStage, order: newOrder }]);
    }

    // Reset form
    setCurrentStage({
      title: '',
      description: '',
      order: stages.length + 1,
      skills: [],
    });
    setShowStageForm(false);
  };

  const handleEditStage = (index: number) => {
    setCurrentStage(stages[index]);
    setEditingStageIndex(index);
    setShowStageForm(true);
  };

  const handleRemoveStage = (index: number) => {
    if (window.confirm('Tem certeza que deseja remover esta etapa?')) {
      const updatedStages = stages.filter((_, i) => i !== index);
      // Reorder remaining stages
      const reorderedStages = updatedStages.map((stage, i) => ({
        ...stage,
        order: i + 1,
      }));
      setStages(reorderedStages);
    }
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === stages.length - 1)
    ) {
      return;
    }

    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap stages
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    
    // Update orders
    newStages.forEach((stage, i) => {
      stage.order = i + 1;
    });

    setStages(newStages);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    (e.target as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedStageIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedStageIndex !== null && draggedStageIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedStageIndex === null || draggedStageIndex === dropIndex) {
      setDraggedStageIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newStages = [...stages];
    const draggedStage = newStages[draggedStageIndex];
    
    // Remove dragged stage
    newStages.splice(draggedStageIndex, 1);
    
    // Insert at new position
    newStages.splice(dropIndex, 0, draggedStage);
    
    // Update orders
    newStages.forEach((stage, i) => {
      stage.order = i + 1;
    });

    setStages(newStages);
    setDraggedStageIndex(null);
    setDragOverIndex(null);
  };

  const handleAddSkill = (skillName: string) => {
    if (skillName.trim() && !currentStage.skills.includes(skillName.trim())) {
      setCurrentStage({
        ...currentStage,
        skills: [...currentStage.skills, skillName.trim()],
      });
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setCurrentStage({
      ...currentStage,
      skills: currentStage.skills.filter(s => s !== skillName),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    
    // Validation
    if (!title.trim() || !description.trim()) {
      setError('Por favor, preencha título e descrição da trilha.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (stages.length === 0) {
      setError('Por favor, adicione pelo menos uma etapa à trilha.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate all stages have required fields
    const invalidStages = stages.filter(stage => !stage.title.trim() || !stage.description.trim());
    if (invalidStages.length > 0) {
      setError('Todas as etapas devem ter título e descrição preenchidos.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create career path
      const careerPathData: any = {
        title: title.trim(),
        description: description.trim(),
        path_type: pathType,
      };

      // Add optional fields if provided
      if (selectedAreaId) {
        careerPathData.area_id = selectedAreaId;
      }
      if (level.trim()) {
        careerPathData.level = level.trim();
      }
      if (estimatedTimeMonths) {
        careerPathData.estimated_time_months = Number(estimatedTimeMonths);
      }
      if (hoursPerWeek) {
        careerPathData.hours_per_week = Number(hoursPerWeek);
      }
      // Set as active by default
      careerPathData.is_active = true;

      const createdPath = await careerAPI.create(careerPathData);

      // Create stages if any were added
      if (stages.length > 0) {
        for (const stage of stages) {
          const stageData = {
            career_path: createdPath.id,
            title: stage.title,
            description: stage.description,
            order: stage.order,
            // Backend espera IDs de skills; enquanto não mapeamos nomes -> IDs, enviamos vazio para não quebrar
            skills: [],
          };
          await stageAPI.create(stageData);
        }
      }

      setSuccessMessage('Trilha criada com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate(`/admin/career-paths/${createdPath.id}/edit`);
      }, 1500);
    } catch (err: any) {
      console.error('Error creating career path:', err);
      setError(err.message || 'Erro ao criar trilha. Verifique se o backend está rodando.');
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container admin-container">
      <header className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Criar Nova Trilha de Carreira</h1>
          <p className="admin-subtitle">Defina uma nova trilha pré-definida para os usuários</p>
        </div>
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

      <form 
        onSubmit={handleSubmit} 
        className="profile-form-modern"
        style={{ maxWidth: '100%' }}
      >
        {/* Career Path Basic Info */}
        <div className="form-section" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>Informações da Trilha</h3>
          <div className="form-grid">
            <div className="form-group-modern">
              <label htmlFor="title">Título da Trilha *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input-modern"
                placeholder="Ex: Desenvolvedor Full Stack"
                required
                disabled={loading}
              />
            </div>

          <div className="form-group-modern">
            <label htmlFor="pathType">Tipo de Trilha *</label>
            <select
              id="pathType"
              value={pathType}
              onChange={(e) => setPathType(e.target.value as 'PRE' | 'PER')}
              className="form-input-modern"
              required
              disabled={loading}
            >
              <option value="PRE">Pré-definida</option>
              <option value="PER">Personalizada</option>
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group-modern">
            <label htmlFor="area">Área Profissional</label>
            <select
              id="area"
              value={selectedAreaId}
              onChange={(e) => setSelectedAreaId(e.target.value ? Number(e.target.value) : '')}
              className="form-input-modern"
              disabled={loading || areas.length === 0}
            >
              <option value="">Selecione uma área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-modern">
            <label htmlFor="level">Nível</label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="form-input-modern"
              disabled={loading}
            >
              <option value="">Selecione um nível</option>
              <option value="Iniciante">Iniciante</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
              <option value="Iniciante a Intermediário">Iniciante a Intermediário</option>
              <option value="Intermediário a Avançado">Intermediário a Avançado</option>
            </select>
          </div>

        </div>

        <div className="form-grid">
          <div className="form-group-modern">
            <label htmlFor="estimatedTimeMonths">Tempo Estimado (meses)</label>
            <input
              type="number"
              id="estimatedTimeMonths"
              value={estimatedTimeMonths}
              onChange={(e) => setEstimatedTimeMonths(e.target.value ? parseInt(e.target.value) : '')}
              className="form-input-modern"
              placeholder="Ex: 6"
              min="1"
              max="120"
              disabled={loading}
            />
            <small>Número de meses estimados para completar a trilha</small>
          </div>

          <div className="form-group-modern">
            <label htmlFor="hoursPerWeek">Horas por Semana</label>
            <input
              type="number"
              id="hoursPerWeek"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value ? parseInt(e.target.value) : '')}
              className="form-input-modern"
              placeholder="Ex: 10"
              min="1"
              max="168"
              disabled={loading}
            />
            <small>Horas de estudo recomendadas por semana</small>
          </div>
        </div>

          <div className="form-group-modern">
            <label htmlFor="description">Descrição *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input-modern"
              placeholder="Descreva a trilha de carreira, seus objetivos e público-alvo..."
              rows={4}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Stages Management */}
        <div className="form-section" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.25rem', color: '#1f2937' }}>Etapas da Trilha</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                {stages.length === 0 
                  ? 'Nenhuma etapa adicionada' 
                  : `${stages.length} ${stages.length === 1 ? 'etapa adicionada' : 'etapas adicionadas'}`
                }
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowStageForm(true);
                setEditingStageIndex(null);
                setCurrentStage({
                  title: '',
                  description: '',
                  order: stages.length + 1,
                  skills: [],
                });
              }}
              className="btn-primary"
              disabled={loading}
            >
              + Adicionar Etapa
            </button>
          </div>

          {stages.length === 0 && !showStageForm && (
            <div className="empty-state-modern" style={{ 
              padding: '3rem 2rem',
              textAlign: 'center',
              background: '#f9fafb',
              borderRadius: '0.5rem',
              border: '2px dashed #e5e7eb'
            }}>
              <div className="empty-state-icon" style={{ marginBottom: '1rem' }}>
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#9ca3af' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Nenhuma etapa adicionada</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Adicione etapas para definir o caminho da trilha de carreira.</p>
              <button
                type="button"
                onClick={() => {
                  setShowStageForm(true);
                  setEditingStageIndex(null);
                  setCurrentStage({
                    title: '',
                    description: '',
                    order: 1,
                    skills: [],
                  });
                }}
                className="btn-primary"
                disabled={loading}
              >
                + Adicionar Primeira Etapa
              </button>
            </div>
          )}

          {/* Stage Form */}
          {showStageForm && (
            <div className="add-skill-form">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4>{editingStageIndex !== null ? 'Editar Etapa' : 'Nova Etapa'}</h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowStageForm(false);
                    setEditingStageIndex(null);
                    setCurrentStage({
                      title: '',
                      description: '',
                      order: stages.length + 1,
                      skills: [],
                    });
                  }}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Cancelar
                </button>
              </div>

              <div className="form-grid">
                <div className="form-group-modern">
                  <label htmlFor="stageTitle">Título da Etapa *</label>
                  <input
                    type="text"
                    id="stageTitle"
                    value={currentStage.title}
                    onChange={(e) => setCurrentStage({ ...currentStage, title: e.target.value })}
                    className="form-input-modern"
                    placeholder="Ex: Fundamentos de Programação"
                    required
                  />
                </div>

                <div className="form-group-modern">
                  <label htmlFor="stageOrder">Ordem</label>
                  <input
                    type="number"
                    id="stageOrder"
                    value={currentStage.order}
                    onChange={(e) => setCurrentStage({ ...currentStage, order: parseInt(e.target.value) || 1 })}
                    className="form-input-modern"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group-modern">
                <label htmlFor="stageDescription">Descrição *</label>
                <textarea
                  id="stageDescription"
                  value={currentStage.description}
                  onChange={(e) => setCurrentStage({ ...currentStage, description: e.target.value })}
                  className="form-input-modern"
                  placeholder="Descreva o que o usuário aprenderá nesta etapa..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group-modern">
                <label htmlFor="stageSkills">Habilidades (opcional)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    id="stageSkills"
                    className="form-input-modern"
                    placeholder="Digite o nome da habilidade e pressione Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        handleAddSkill(input.value);
                        input.value = '';
                      }
                    }}
                  />
                </div>
                {currentStage.skills.length > 0 && (
                  <div className="skills-tags">
                    {currentStage.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#1976d2',
                            cursor: 'pointer',
                            marginLeft: '0.5rem',
                            padding: '0',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddStage}
                className="btn-primary btn-add-skill-submit"
              >
                {editingStageIndex !== null ? 'Salvar Alterações' : 'Adicionar Etapa'}
              </button>
            </div>
          )}

          {/* Stages List */}
          {stages.length > 0 && (
            <div className="stages-section">
              {stages
                .sort((a, b) => a.order - b.order)
                .map((stage, index) => {
                  const isDragging = draggedStageIndex === index;
                  const isDragOver = dragOverIndex === index;
                  
                  return (
                    <div
                      key={index}
                      className={`stage-card ${isDragging ? 'stage-dragging' : ''} ${isDragOver ? 'stage-drag-over' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      style={{
                        cursor: 'grab',
                        transition: 'all 0.2s ease',
                        transform: isDragging ? 'scale(0.95)' : isDragOver ? 'translateX(10px)' : 'none',
                        opacity: isDragging ? 0.5 : 1,
                      }}
                    >
                      <div className="stage-drag-handle" style={{ 
                        cursor: 'grab',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                      }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      <div className="stage-number">{stage.order}</div>
                      <div className="stage-content" style={{ flex: 1 }}>
                        <h4>{stage.title}</h4>
                        <p>{stage.description}</p>
                        {stage.skills.length > 0 && (
                          <div className="stage-skills">
                            <strong>Habilidades:</strong>
                            <div className="skills-tags" style={{ marginTop: '0.5rem' }}>
                              {stage.skills.map((skill, idx) => (
                                <span key={idx} className="skill-tag">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveStage(index, 'up')}
                          className="btn-small btn-secondary"
                          disabled={index === 0}
                          title="Mover para cima"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStage(index, 'down')}
                          className="btn-small btn-secondary"
                          disabled={index === stages.length - 1}
                          title="Mover para baixo"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditStage(index)}
                          className="btn-small btn-secondary"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(index)}
                          className="btn-small btn-danger"
                          title="Remover"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions-modern">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Tem certeza que deseja cancelar? As alterações não salvas serão perdidas.')) {
                navigate('/admin/career-paths');
              }
            }}
            className="btn-secondary"
            disabled={loading}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !title.trim() || !description.trim() || stages.length === 0}
            title={
              !title.trim() || !description.trim() 
                ? 'Preencha título e descrição da trilha' 
                : stages.length === 0 
                ? 'Adicione pelo menos uma etapa' 
                : 'Criar trilha de carreira'
            }
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Criando...
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Criar Trilha
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCreateCareerPathPage;

