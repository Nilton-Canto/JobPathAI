import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import '../components/FormStyles.css';

interface UserProfile {
  nome: string;
  email: string;
  idade: number;
  cpf: string;
  username?: string;
}

const ProfilePage: React.FC = () => {
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
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        setUserData({
          nome: profile.nome || '',
          email: profile.email || '',
          idade: profile.idade || 0,
          cpf: profile.cpf || '',
          username: profile.username || '',
        });
      } else {
        try {
          const profile = await userAPI.getProfile();
          setUserData(profile);
          localStorage.setItem('userProfile', JSON.stringify(profile));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // TODO: Implement update API when backend is ready
      // await userAPI.updateProfile(userData);
      
      // For now, update localStorage
      localStorage.setItem('userProfile', JSON.stringify(userData));
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
                  />
                </div>
              </div>
            </div>
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
                  <div className="info-value">{userData.cpf || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
