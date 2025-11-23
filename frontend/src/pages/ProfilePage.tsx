import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
// Styles imported via main.tsx -> styles/index.css

interface UserSkill {
  id?: number;
  skill_id?: number;
  skill_name: string;
  skill_categoria?: string;
  nivel: 'basico' | 'intermediario' | 'avancado' | 'expert';
  anos_experiencia?: number;
}

interface UserLanguage {
  id?: number;
  language_name: string;
  nivel: 'basico' | 'intermediario' | 'avancado' | 'fluente' | 'nativo';
}

interface UserProfile {
  nome: string;
  email: string;
  idade: number;
  cpf: string;
  username?: string;
  area_interesse?: string;
  nivel_experiencia?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  habilidades?: UserSkill[];
  linguas?: UserLanguage[];
}

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState<UserProfile>({
    nome: '',
    email: '',
    idade: 0,
    cpf: '',
    username: '',
    area_interesse: '',
    nivel_experiencia: 'sem_experiencia',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    habilidades: [],
    linguas: [],
  });
  
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    nivel: 'intermediario' as UserSkill['nivel'],
    anos_experiencia: '',
    categoria: '',
  });
  
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [newLanguage, setNewLanguage] = useState({
    language_name: '',
    nivel: 'intermediario' as UserLanguage['nivel'],
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Use user from context, or refresh if not available
      let profile = user;
      if (!profile) {
        await refreshUser();
        profile = user;
      }
      
      if (profile) {
        setUserData({
          nome: profile.nome || '',
          email: profile.email || '',
          idade: profile.idade || 0,
          cpf: profile.cpf ? formatCPF(profile.cpf) : '',
          username: profile.username || '',
          area_interesse: profile.area_interesse || '',
          nivel_experiencia: profile.nivel_experiencia || 'sem_experiencia',
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          portfolio_url: profile.portfolio_url || '',
          habilidades: profile.habilidades || [],
          linguas: profile.linguas || [],
        });
      } else {
        // Try to fetch from API as fallback
        try {
          const apiProfile = await userAPI.getProfile();
          const formattedProfile = {
            ...apiProfile,
            cpf: apiProfile.cpf ? formatCPF(apiProfile.cpf) : '',
            area_interesse: apiProfile.area_interesse || '',
            nivel_experiencia: apiProfile.nivel_experiencia || 'sem_experiencia',
            linkedin_url: apiProfile.linkedin_url || '',
            github_url: apiProfile.github_url || '',
            portfolio_url: apiProfile.portfolio_url || '',
            habilidades: apiProfile.habilidades || [],
            linguas: apiProfile.linguas || [],
          };
          setUserData(formattedProfile);
          await refreshUser(); // Update context
        } catch (apiError) {
          console.warn('Could not fetch profile from API');
          navigate('/login');
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format CPF with mask: 000.000.000-00
   */
  const formatCPF = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  /**
   * Remove CPF mask to store only digits
   * Will be used when API update is implemented
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unformatCPF = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  const handleAddSkill = () => {
    if (!newSkill.skill_name.trim()) {
      setError('Por favor, informe o nome da habilidade');
      return;
    }

    const skillToAdd: UserSkill = {
      skill_name: newSkill.skill_name.trim(),
      skill_categoria: newSkill.categoria || undefined,
      nivel: newSkill.nivel,
      anos_experiencia: newSkill.anos_experiencia ? parseInt(newSkill.anos_experiencia) : undefined,
    };

    // Check if skill already exists
    if (userData.habilidades?.some(h => h.skill_name.toLowerCase() === skillToAdd.skill_name.toLowerCase())) {
      setError('Esta habilidade já foi adicionada');
      return;
    }

    setUserData(prev => ({
      ...prev,
      habilidades: [...(prev.habilidades || []), skillToAdd],
    }));

    setNewSkill({ skill_name: '', nivel: 'intermediario', anos_experiencia: '', categoria: '' });
    setShowAddSkill(false);
    setError(null);
  };

  const handleAddLanguage = () => {
    if (!newLanguage.language_name.trim()) {
      setError('Por favor, informe o nome do idioma');
      return;
    }

    const languageToAdd: UserLanguage = {
      language_name: newLanguage.language_name.trim(),
      nivel: newLanguage.nivel,
    };

    // Check if language already exists
    if (userData.linguas?.some(l => l.language_name.toLowerCase() === languageToAdd.language_name.toLowerCase())) {
      setError('Este idioma já foi adicionado');
      return;
    }

    setUserData(prev => ({
      ...prev,
      linguas: [...(prev.linguas || []), languageToAdd],
    }));

    setNewLanguage({ language_name: '', nivel: 'intermediario' });
    setShowAddLanguage(false);
    setError(null);
  };

  const handleRemoveLanguage = (index: number) => {
    setUserData(prev => ({
      ...prev,
      linguas: prev.linguas?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleRemoveSkill = (index: number) => {
    setUserData(prev => ({
      ...prev,
      habilidades: prev.habilidades?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for CPF field
    if (name === 'cpf') {
      const formatted = formatCPF(value);
      setUserData(prevData => ({ ...prevData, [name]: formatted.slice(0, 14) }));
    } else {
    setUserData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // TODO: Implement update API when backend is ready
      // Prepare data for API (remove CPF mask before sending)
      // const dataToSave = {
      //   ...userData,
      //   cpf: unformatCPF(userData.cpf) // Store CPF without mask
      // };
      // await userAPI.updateProfile(dataToSave);
      
      // For now, refresh user profile from context
      await refreshUser();
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-modern">
          <div className="loading-spinner-large"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container profile-page-modern">
      <div className="profile-header-modern">
        <div className="profile-avatar-large">
          <span>{userData.nome.charAt(0).toUpperCase()}</span>
        </div>
        <div className="profile-header-info">
          <h1>{userData.nome || 'Usuário'}</h1>
          <p className="profile-email">{userData.email}</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="btn-edit-profile"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar Perfil
          </button>
        )}
      </div>

      {success && (
        <div className="success-message-modern" role="alert">
          <svg className="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Perfil atualizado com sucesso!
        </div>
      )}

      {error && (
        <div className="error-message-modern" role="alert">
          <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="profile-content-modern">
        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="profile-form-modern">
            <div className="form-section">
              <h3>Informações Pessoais</h3>
              <div className="form-grid">
                <div className="form-group-modern">
                  <label htmlFor="nome">Nome Completo</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={userData.nome}
                    onChange={handleChange}
                    required
                    className="form-input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                    className="form-input-modern"
                    disabled
                  />
                  <small>O e-mail não pode ser alterado</small>
                </div>
                <div className="form-group-modern">
                  <label htmlFor="username">Nome de Usuário</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={userData.username || ''}
                    onChange={handleChange}
                    className="form-input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="idade">Idade</label>
                  <input
                    type="number"
                    id="idade"
                    name="idade"
                    value={userData.idade}
                    onChange={handleChange}
                    required
                    min="1"
                    max="120"
                    className="form-input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="cpf">CPF</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={userData.cpf}
                    onChange={handleChange}
                    required
                    className="form-input-modern"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  <small>Formato: 000.000.000-00</small>
                </div>
                <div className="form-group-modern">
                  <label htmlFor="area_interesse">Área de Interesse</label>
                  <input
                    type="text"
                    id="area_interesse"
                    name="area_interesse"
                    value={userData.area_interesse || ''}
                    onChange={handleChange}
                    className="form-input-modern"
                    placeholder="Ex: Desenvolvimento Web, Design, Marketing"
                  />
                  <small>Área profissional que você deseja seguir</small>
                </div>
                <div className="form-group-modern">
                  <label htmlFor="nivel_experiencia">Nível de Experiência</label>
                  <select
                    id="nivel_experiencia"
                    name="nivel_experiencia"
                    value={userData.nivel_experiencia || 'sem_experiencia'}
                    onChange={(e) => setUserData(prev => ({ ...prev, nivel_experiencia: e.target.value }))}
                    className="form-input-modern"
                  >
                    <option value="sem_experiencia">Sem Experiência</option>
                    <option value="estagiario">Estagiário</option>
                    <option value="junior">Júnior</option>
                    <option value="pleno">Pleno</option>
                    <option value="senior">Sênior</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="form-section">
              <h3>Links Profissionais</h3>
              <div className="form-grid">
                <div className="form-group-modern">
                  <label htmlFor="linkedin_url">LinkedIn</label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={userData.linkedin_url || ''}
                    onChange={handleChange}
                    className="form-input-modern"
                    placeholder="https://linkedin.com/in/seu-perfil"
                  />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="github_url">GitHub</label>
                  <input
                    type="url"
                    id="github_url"
                    name="github_url"
                    value={userData.github_url || ''}
                    onChange={handleChange}
                    className="form-input-modern"
                    placeholder="https://github.com/seu-usuario"
                  />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="portfolio_url">Portfolio</label>
                  <input
                    type="url"
                    id="portfolio_url"
                    name="portfolio_url"
                    value={userData.portfolio_url || ''}
                    onChange={handleChange}
                    className="form-input-modern"
                    placeholder="https://seu-portfolio.com"
                  />
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="form-section">
              <div className="skills-section-header">
                <h3>Habilidades</h3>
                <button
                  type="button"
                  onClick={() => setShowAddSkill(!showAddSkill)}
                  className="btn-secondary btn-add-skill"
                >
                  {showAddSkill ? 'Cancelar' : '+ Adicionar Habilidade'}
                </button>
              </div>

              {showAddSkill && (
                <div className="add-skill-form">
                  <div className="form-grid">
                    <div className="form-group-modern">
                      <label htmlFor="skill-name">Nome da Habilidade *</label>
                      <input
                        type="text"
                        id="skill-name"
                        value={newSkill.skill_name}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, skill_name: e.target.value }))}
                        className="form-input-modern"
                        placeholder="Ex: JavaScript, Python, React..."
                        required
                      />
                    </div>
                    <div className="form-group-modern">
                      <label htmlFor="skill-categoria">Categoria (opcional)</label>
                      <input
                        type="text"
                        id="skill-categoria"
                        value={newSkill.categoria}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, categoria: e.target.value }))}
                        className="form-input-modern"
                        placeholder="Ex: Técnica, Ferramenta, Soft Skill..."
                      />
                    </div>
                    <div className="form-group-modern">
                      <label htmlFor="skill-nivel">Nível de Proficiência</label>
                      <select
                        id="skill-nivel"
                        value={newSkill.nivel}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, nivel: e.target.value as UserSkill['nivel'] }))}
                        className="form-input-modern"
                      >
                        <option value="basico">Básico</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="avancado">Avançado</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <div className="form-group-modern">
                      <label htmlFor="skill-anos">Anos de Experiência (opcional)</label>
                      <input
                        type="number"
                        id="skill-anos"
                        value={newSkill.anos_experiencia}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, anos_experiencia: e.target.value }))}
                        className="form-input-modern"
                        min="0"
                        max="50"
                        placeholder="Ex: 3"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="btn-primary btn-add-skill-submit"
                  >
                    Adicionar Habilidade
                  </button>
                </div>
              )}

              {userData.habilidades && userData.habilidades.length > 0 ? (
                <div className="skills-grid">
                  {userData.habilidades.map((skill, index) => (
                    <div key={index} className="skill-tag-large">
                      <div className="skill-tag-content">
                        <span className="skill-name">{skill.skill_name}</span>
                        {skill.skill_categoria && (
                          <span className="skill-category">{skill.skill_categoria}</span>
                        )}
                        <span className="skill-level">
                          {skill.nivel === 'basico' ? 'Básico' : 
                           skill.nivel === 'intermediario' ? 'Intermediário' : 
                           skill.nivel === 'avancado' ? 'Avançado' : 'Expert'}
                        </span>
                        {skill.anos_experiencia && (
                          <span className="skill-years">{skill.anos_experiencia} {skill.anos_experiencia === 1 ? 'ano' : 'anos'}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="skill-remove-btn"
                        aria-label="Remover habilidade"
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-skills">
                  <p>Nenhuma habilidade adicionada ainda.</p>
                  {!showAddSkill && (
                    <button
                      type="button"
                      onClick={() => setShowAddSkill(true)}
                      className="btn-secondary btn-add-first-skill"
                    >
                      Adicionar Primeira Habilidade
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Languages Section */}
            <div className="form-section">
              <div className="skills-section-header">
                <h3>Idiomas</h3>
                <button
                  type="button"
                  onClick={() => setShowAddLanguage(!showAddLanguage)}
                  className="btn-secondary btn-add-skill"
                >
                  {showAddLanguage ? 'Cancelar' : '+ Adicionar Idioma'}
                </button>
              </div>

              {showAddLanguage && (
                <div className="add-skill-form">
                  <div className="form-grid">
                    <div className="form-group-modern">
                      <label htmlFor="language-name">Nome do Idioma *</label>
                      <input
                        type="text"
                        id="language-name"
                        value={newLanguage.language_name}
                        onChange={(e) => setNewLanguage(prev => ({ ...prev, language_name: e.target.value }))}
                        className="form-input-modern"
                        placeholder="Ex: Inglês, Espanhol, Francês..."
                        required
                      />
                    </div>
                    <div className="form-group-modern">
                      <label htmlFor="language-nivel">Nível de Proficiência</label>
                      <select
                        id="language-nivel"
                        value={newLanguage.nivel}
                        onChange={(e) => setNewLanguage(prev => ({ ...prev, nivel: e.target.value as UserLanguage['nivel'] }))}
                        className="form-input-modern"
                      >
                        <option value="basico">Básico</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="avancado">Avançado</option>
                        <option value="fluente">Fluente</option>
                        <option value="nativo">Nativo</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="btn-primary btn-add-skill-submit"
                  >
                    Adicionar Idioma
                  </button>
                </div>
              )}

              {userData.linguas && userData.linguas.length > 0 ? (
                <div className="skills-grid">
                  {userData.linguas.map((language, index) => (
                    <div key={index} className="skill-tag-large">
                      <div className="skill-tag-content">
                        <span className="skill-name">{language.language_name}</span>
                        <span className="skill-level">
                          {language.nivel === 'basico' ? 'Básico' : 
                           language.nivel === 'intermediario' ? 'Intermediário' : 
                           language.nivel === 'avancado' ? 'Avançado' : 
                           language.nivel === 'fluente' ? 'Fluente' : 'Nativo'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(index)}
                        className="skill-remove-btn"
                        aria-label="Remover idioma"
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-skills">
                  <p>Nenhum idioma adicionado ainda.</p>
                  {!showAddLanguage && (
                    <button
                      type="button"
                      onClick={() => setShowAddLanguage(true)}
                      className="btn-secondary btn-add-first-skill"
                    >
                      Adicionar Primeiro Idioma
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions - Now at the end */}
            <div className="form-actions-modern">
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  loadUserProfile();
                }} 
                className="btn-secondary"
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="button-spinner"></span>
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info-modern">
            <div className="info-section">
              <h3>Informações Pessoais</h3>
              <div className="info-grid">
                <div className="info-item-modern">
                  <div className="info-label">Nome Completo</div>
                  <div className="info-value">{userData.nome || '-'}</div>
                </div>
                <div className="info-item-modern">
                  <div className="info-label">E-mail</div>
                  <div className="info-value">{userData.email || '-'}</div>
                </div>
                <div className="info-item-modern">
                  <div className="info-label">Nome de Usuário</div>
                  <div className="info-value">{userData.username || '-'}</div>
                </div>
                <div className="info-item-modern">
                  <div className="info-label">Idade</div>
                  <div className="info-value">{userData.idade ? `${userData.idade} anos` : '-'}</div>
                </div>
                <div className="info-item-modern">
                  <div className="info-label">CPF</div>
                  <div className="info-value">
                    {userData.cpf ? formatCPF(userData.cpf) : '-'}
                  </div>
                </div>
                <div className="info-item-modern">
                  <div className="info-label">Área de Interesse</div>
                  <div className="info-value">{userData.area_interesse || '-'}</div>
                </div>
                <div className="info-item-modern">
                  <div className="info-label">Nível de Experiência</div>
                  <div className="info-value">
                    {userData.nivel_experiencia === 'sem_experiencia' ? 'Sem Experiência' :
                     userData.nivel_experiencia === 'estagiario' ? 'Estagiário' :
                     userData.nivel_experiencia === 'junior' ? 'Júnior' :
                     userData.nivel_experiencia === 'pleno' ? 'Pleno' :
                     userData.nivel_experiencia === 'senior' ? 'Sênior' : '-'}
                  </div>
                </div>
              </div>
            </div>
            {(userData.linkedin_url || userData.github_url || userData.portfolio_url) && (
              <div className="info-section">
                <h3>Links Profissionais</h3>
                <div className="info-grid">
                  {userData.linkedin_url && (
                    <div className="info-item-modern">
                      <div className="info-label">LinkedIn</div>
                      <div className="info-value">
                        <a href={userData.linkedin_url} target="_blank" rel="noopener noreferrer" className="profile-link">
                          {userData.linkedin_url}
                        </a>
                      </div>
                    </div>
                  )}
                  {userData.github_url && (
                    <div className="info-item-modern">
                      <div className="info-label">GitHub</div>
                      <div className="info-value">
                        <a href={userData.github_url} target="_blank" rel="noopener noreferrer" className="profile-link">
                          {userData.github_url}
                        </a>
                      </div>
                    </div>
                  )}
                  {userData.portfolio_url && (
                    <div className="info-item-modern">
                      <div className="info-label">Portfolio</div>
                      <div className="info-value">
                        <a href={userData.portfolio_url} target="_blank" rel="noopener noreferrer" className="profile-link">
                          {userData.portfolio_url}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Skills Section - View Mode */}
            {userData.habilidades && userData.habilidades.length > 0 && (
              <div className="info-section">
                <h3>Habilidades</h3>
                <div className="skills-grid">
                  {userData.habilidades.map((skill, index) => (
                    <div key={index} className="skill-tag-large">
                      <div className="skill-tag-content">
                        <span className="skill-name">{skill.skill_name}</span>
                        {skill.skill_categoria && (
                          <span className="skill-category">{skill.skill_categoria}</span>
                        )}
                        <span className="skill-level">
                          {skill.nivel === 'basico' ? 'Básico' : 
                           skill.nivel === 'intermediario' ? 'Intermediário' : 
                           skill.nivel === 'avancado' ? 'Avançado' : 'Expert'}
                        </span>
                        {skill.anos_experiencia && (
                          <span className="skill-years">{skill.anos_experiencia} {skill.anos_experiencia === 1 ? 'ano' : 'anos'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section - View Mode */}
            {userData.linguas && userData.linguas.length > 0 && (
              <div className="info-section">
                <h3>Idiomas</h3>
                <div className="skills-grid">
                  {userData.linguas.map((language, index) => (
                    <div key={index} className="skill-tag-large">
                      <div className="skill-tag-content">
                        <span className="skill-name">{language.language_name}</span>
                        <span className="skill-level">
                          {language.nivel === 'basico' ? 'Básico' : 
                           language.nivel === 'intermediario' ? 'Intermediário' : 
                           language.nivel === 'avancado' ? 'Avançado' : 
                           language.nivel === 'fluente' ? 'Fluente' : 'Nativo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
