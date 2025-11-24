import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { areaAPI, careerAPI, stageAPI, skillsAPI } from '../../services/api';
import '../../styles/pages.css';
import '../../styles/components.css';

/**
 * Admin Edit Career Path Page
 *
 * Edita trilha existente e gerencia etapas
 */

interface CareerStage {
  id?: number;
  title: string;
  description: string;
  order: number;
  skills: any[];
}

interface Skill {
  id: number;
  name: string;
  description?: string;
}

const AdminEditCareerPathPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [areas, setAreas] = useState<{ id: number; name: string }[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

  // Career Path Data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pathType, setPathType] = useState<'PRE' | 'PER'>('PRE');
  const [selectedAreaId, setSelectedAreaId] = useState<number | ''>('');
  const [level, setLevel] = useState('');
  const [estimatedTimeMonths, setEstimatedTimeMonths] = useState<number | ''>('');
  const [hoursPerWeek, setHoursPerWeek] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);

  // Stages
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
    if (!id) return;
    const pathId = parseInt(id);
    fetchCareerPath(pathId);
    fetchAvailableSkills();
    fetchAreas();
  }, [id]);

  const fetchAreas = async () => {
    try {
      const response = await areaAPI.getAll();
      const data = Array.isArray(response) ? response : (response as any)?.results || [];
      setAreas(
        data.map((area: any) => ({
          id: area.id,
          name: area.name,
        }))
      );
    } catch (err) {
      console.warn('Não foi possível carregar áreas para o seletor:', err);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const skills = await skillsAPI.getAll();
      setAvailableSkills(skills);
    } catch (err) {
      console.warn('Could not fetch available skills:', err);
    }
  };

  const fetchCareerPath = async (pathId: number) => {
    try {
      setLoading(true);
      setError(null);
      const path = await careerAPI.getById(pathId);

      setTitle(path.title || '');
      setDescription(path.description || '');
      setPathType(path.path_type || 'PRE');
      const areaId = (path as any).area?.id || (path as any).area || '';
      setSelectedAreaId(areaId || '');
      setLevel(path.level || '');
      setEstimatedTimeMonths(path.estimated_time_months || '');
      setHoursPerWeek(path.hours_per_week || '');
      setIsActive(path.is_active !== undefined ? path.is_active : true);

      if (Array.isArray(path.stages)) {
        const sortedStages = [...path.stages].sort((a: any, b: any) => a.order - b.order);
        setStages(sortedStages);
      } else {
        setStages([]);
      }
    } catch (err: any) {
      console.error('Error fetching career path:', err);
      setError(err.message || 'Erro ao carregar trilha. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = () => {
    if (!currentStage.title.trim() || !currentStage.description.trim()) {
      alert('Preencha título e descrição da etapa.');
      return;
    }

    if (editingStageIndex !== null) {
      const updated = [...stages];
      updated[editingStageIndex] = { ...currentStage };
      setStages(updated);
      setEditingStageIndex(null);
    } else {
      const newOrder = stages.length > 0 ? Math.max(...stages.map((s) => s.order)) + 1 : 1;
      setStages([...stages, { ...currentStage, order: newOrder }]);
    }

    setCurrentStage({
      title: '',
      description: '',
      order: stages.length + 1,
      skills: [],
    });
    setShowStageForm(false);
  };

  const handleEditStage = (index: number) => {
    const stage = stages[index];
    setCurrentStage({ ...stage, skills: stage.skills || [] });
    setEditingStageIndex(index);
    setShowStageForm(true);
  };

  const handleRemoveStage = async (index: number) => {
    if (!window.confirm('Tem certeza que deseja remover esta etapa?')) return;
    const stage = stages[index];

    if (stage.id) {
      try {
        await stageAPI.delete(stage.id);
      } catch (err) {
        console.error('Error deleting stage:', err);
        alert('Erro ao deletar etapa no backend. Ela será removida apenas localmente.');
      }
    }

    const remaining = stages.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setStages(remaining);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === stages.length - 1)) {
      return;
    }
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
    newStages.forEach((stage, i) => (stage.order = i + 1));
    setStages(newStages);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedStageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragEnd = () => {
    setDraggedStageIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedStageIndex !== null && draggedStageIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedStageIndex === null || draggedStageIndex === dropIndex) return;

    const newStages = [...stages];
    const dragged = newStages[draggedStageIndex];
    newStages.splice(draggedStageIndex, 1);
    newStages.splice(dropIndex, 0, dragged);
    newStages.forEach((stage, i) => (stage.order = i + 1));

    setStages(newStages);
    setDraggedStageIndex(null);
    setDragOverIndex(null);
  };

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const existingSkill = availableSkills.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    const skillToAdd = existingSkill || { name: trimmed };
    if (!currentStage.skills.some((s: any) => (typeof s === 'string' ? s : s.name) === skillToAdd.name)) {
      setCurrentStage({ ...currentStage, skills: [...currentStage.skills, skillToAdd] });
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setCurrentStage({
      ...currentStage,
      skills: currentStage.skills.filter((s: any) => {
        const name = typeof s === 'string' ? s : s.name;
        return name !== skillName;
      }),
    });
  };

  const handleSaveStages = async () => {
    if (!id) return;
    const pathId = parseInt(id);
    for (const stage of stages) {
      const stageData = {
        career_path: pathId,
        title: stage.title,
        description: stage.description,
        order: stage.order,
        skills: stage.skills.map((s: any) => (typeof s === 'object' && s.id ? s.id : s.name)),
      };
      if (stage.id) {
        await stageAPI.update(stage.id, stageData);
      } else {
        await stageAPI.create(stageData);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title.trim() || !description.trim()) {
      setError('Preencha título e descrição da trilha.');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const careerPathData: any = {
        title: title.trim(),
        description: description.trim(),
        path_type: pathType,
        is_active: isActive,
        area_id: selectedAreaId || null,
        level: level.trim() || null,
        estimated_time_months: estimatedTimeMonths ? Number(estimatedTimeMonths) : null,
        hours_per_week: hoursPerWeek ? Number(hoursPerWeek) : null,
      };

      await careerAPI.update(parseInt(id), careerPathData);
      await handleSaveStages();

      setSuccessMessage('Trilha atualizada com sucesso!');
      setTimeout(() => navigate('/admin/career-paths'), 1500);
    } catch (err: any) {
      console.error('Error updating career path:', err);
      setError(err.message || 'Erro ao atualizar trilha. Verifique se o backend está rodando.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container admin-container">
        <div className="loading-modern">
          <div className="loading-spinner-large"></div>
          <p>Carregando trilha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container admin-container">
      <header className="admin-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1>Editar Trilha de Carreira</h1>
          <p className="admin-subtitle">Modifique as informações da trilha e gerencie suas etapas</p>
        </div>
        <button onClick={() => navigate('/admin/career-paths')} className="btn-secondary">
          Voltar
        </button>
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} className="profile-form-modern" style={{ margin: 0 }}>
          <div className="form-section" style={{ marginBottom: '1.5rem' }}>
            <h3>Informações da Trilha</h3>
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
                  disabled={saving}
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
                  disabled={saving}
                >
                  <option value="PRE">Pré-definida</option>
                  <option value="PER">Personalizada</option>
                </select>
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
                disabled={saving}
              />
            </div>

            <div className="form-grid">
              <div className="form-group-modern">
                <label htmlFor="area">Área Profissional</label>
                <select
                  id="area"
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value ? Number(e.target.value) : '')}
                  className="form-input-modern"
                  disabled={saving || areas.length === 0}
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
                  disabled={saving}
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
                  min={1}
                  max={120}
                  disabled={saving}
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
                  min={1}
                  max={168}
                  disabled={saving}
                />
                <small>Horas de estudo recomendadas por semana</small>
              </div>
            </div>

            <div className="form-group-modern">
              <label htmlFor="isActive" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={saving}
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <span>Trilha ativa (disponível para usuários)</span>
              </label>
              <small>Desmarque para desativar a trilha temporariamente</small>
            </div>
          </div>

          <div className="form-section" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>Etapas da Trilha</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  {stages.length === 0 ? 'Nenhuma etapa adicionada' : `${stages.length} etapa(s)`}
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
                    order: stages.length > 0 ? Math.max(...stages.map((s) => s.order)) + 1 : 1,
                    skills: [],
                  });
                }}
                className="btn-primary"
                disabled={saving}
              >
                + Adicionar Etapa
              </button>
            </div>

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
                      min={1}
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
                      list="skills-list"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          handleAddSkill(input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <datalist id="skills-list">
                      {availableSkills.map((skill) => (
                        <option key={skill.id} value={skill.name} />
                      ))}
                    </datalist>
                  </div>
                  {currentStage.skills.length > 0 && (
                    <div className="skills-tags">
                      {currentStage.skills.map((skill, idx) => {
                        const skillName = typeof skill === 'string' ? skill : skill.name;
                        return (
                          <span key={idx} className="skill-tag">
                            {skillName}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skillName)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#1976d2',
                                cursor: 'pointer',
                                marginLeft: '0.5rem',
                                padding: 0,
                              }}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button type="button" onClick={handleAddStage} className="btn-primary btn-add-skill-submit">
                  {editingStageIndex !== null ? 'Salvar Alterações' : 'Adicionar Etapa'}
                </button>
              </div>
            )}

            {stages.length > 0 ? (
              <div className="stages-section">
                {stages
                  .sort((a, b) => a.order - b.order)
                  .map((stage, index) => {
                    const skillNames = stage.skills?.map((s: any) => (typeof s === 'string' ? s : s.name)) || [];
                    const isDragging = draggedStageIndex === index;
                    const isDragOver = dragOverIndex === index;
                    return (
                      <div
                        key={stage.id || index}
                        className={`stage-card ${isDragging ? 'stage-dragging' : ''} ${isDragOver ? 'stage-drag-over' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{ cursor: 'grab', transition: 'all 0.2s ease' }}
                      >
                        <div className="stage-drag-handle" style={{ cursor: 'grab', padding: '0.5rem', color: '#9ca3af' }}>
                          ☰
                        </div>
                        <div className="stage-number">{stage.order}</div>
                        <div className="stage-content" style={{ flex: 1 }}>
                          <h4>{stage.title}</h4>
                          <p>{stage.description}</p>
                          {skillNames.length > 0 && (
                            <div className="stage-skills">
                              <strong>Habilidades:</strong>
                              <div className="skills-tags" style={{ marginTop: '0.5rem' }}>
                                {skillNames.map((skillName, idx) => (
                                  <span key={idx} className="skill-tag">
                                    {skillName}
                                  </span>
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
                          <button type="button" onClick={() => handleEditStage(index)} className="btn-small btn-secondary" title="Editar">
                            Editar
                          </button>
                          <button type="button" onClick={() => handleRemoveStage(index)} className="btn-small btn-danger" title="Remover">
                            Remover
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              !showStageForm && (
                <div className="empty-state-modern">
                  <div className="empty-state-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3>Nenhuma etapa adicionada</h3>
                  <p>Adicione etapas para definir o caminho da trilha de carreira.</p>
                </div>
              )
            )}
          </div>

          <div className="form-actions-modern">
            <button type="button" onClick={() => navigate('/admin/career-paths')} className="btn-secondary" disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="button-spinner"></span>
                  Salvando...
                </>
              ) : (
                <>
                  Salvar Alterações
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        <aside
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            position: 'sticky',
            top: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Status</p>
              <strong style={{ color: '#111827' }}>{isActive ? 'Ativa' : 'Inativa'}</strong>
            </div>
            <span className={`badge ${isActive ? 'badge-success' : 'badge-secondary'}`}>{isActive ? 'Ativa' : 'Inativa'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Etapas</p>
              <strong style={{ color: '#111827' }}>{stages.length}</strong>
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Arraste para reordenar</div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '1rem' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Tipo da trilha</p>
            <strong style={{ color: '#111827' }}>{pathType === 'PRE' ? 'Pré-definida' : 'Personalizada'}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminEditCareerPathPage;
