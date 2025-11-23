import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/pages.css';

/**
 * Admin Areas Management Page
 * 
 * Placeholder page for managing professional areas
 * Note: Backend model for Areas may need to be created
 */

const AdminAreasPage: React.FC = () => {
  // Placeholder data - would come from backend
  const [areas] = useState([
    { id: 1, name: 'Tecnologia', description: 'Desenvolvimento de software, DevOps, etc.', pathCount: 5 },
    { id: 2, name: 'Design', description: 'UX/UI, Design Gráfico, etc.', pathCount: 3 },
    { id: 3, name: 'Dados', description: 'Ciência de Dados, Análise, etc.', pathCount: 2 },
  ]);

  return (
    <div className="page-container admin-container">
      <header className="admin-header">
        <div>
          <h1>Gerenciar Áreas Profissionais</h1>
          <p className="admin-subtitle">Organize trilhas por áreas profissionais</p>
        </div>
        <button className="btn-primary" disabled>
          + Nova Área
        </button>
      </header>

      <div className="empty-state-dashboard">
        <div className="empty-state-icon-large">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3>Gerenciamento de Áreas</h3>
        <p>
          Esta funcionalidade está em desenvolvimento. 
          Por enquanto, as áreas podem ser gerenciadas através do Django Admin.
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          <strong>Nota:</strong> Um modelo de Área pode precisar ser criado no backend 
          para suportar esta funcionalidade completamente.
        </p>
        <div className="empty-state-actions" style={{ marginTop: '2rem' }}>
          <Link to="/admin/career-paths" className="btn-primary">
            Voltar para Trilhas
          </Link>
          <Link to="/admin" className="btn-secondary">
            Ir para Dashboard
          </Link>
        </div>
      </div>

      {/* Placeholder: Would show areas list when implemented */}
      {areas.length > 0 && (
        <div style={{ marginTop: '2rem', opacity: 0.5 }}>
          <h3 style={{ marginBottom: '1rem' }}>Áreas Existentes (Exemplo)</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Trilhas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((area) => (
                  <tr key={area.id}>
                    <td><strong>{area.name}</strong></td>
                    <td>{area.description}</td>
                    <td>{area.pathCount}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-small btn-secondary" disabled>
                          Editar
                        </button>
                        <button className="btn-small btn-danger" disabled>
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAreasPage;

