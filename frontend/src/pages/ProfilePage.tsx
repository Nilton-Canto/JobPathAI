import React, { useState } from 'react';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: 'usuario_exemplo',
    email: 'usuario@exemplo.com',
    age: '30',
    cpf: '123.456.789-00',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSave = () => {
    // Placeholder para salvar os dados no backend
    console.log('Dados salvos (placeholder):', userData);
    setIsEditing(false);
    alert('Perfil atualizado (simulado)!');
  };

  return (
    <div className="page-container profile-container">
      <h2>Seu Perfil</h2>
      <p>Aqui você poderá visualizar e editar suas informações de perfil.</p>

      <div className="profile-details">
        <h3>Informações Básicas</h3>
        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="form-group">
              <label htmlFor="username">Nome de Usuário:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">E-mail:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="age">Idade:</label>
              <input
                type="number"
                id="age"
                name="age"
                value={userData.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cpf">CPF:</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={userData.cpf}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Salvar</button>
            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ marginLeft: '1rem' }}>Cancelar</button>
          </form>
        ) : (
          <>
            <p><strong>Nome de Usuário:</strong> {userData.username}</p>
            <p><strong>E-mail:</strong> {userData.email}</p>
            <p><strong>Idade:</strong> {userData.age}</p>
            <p><strong>CPF:</strong> {userData.cpf}</p>
            <button onClick={() => setIsEditing(true)} className="btn-primary">Editar Perfil</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
