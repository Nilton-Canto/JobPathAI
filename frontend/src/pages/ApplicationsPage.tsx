import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/FormStyles.css';

interface JobApplication {
  id: number;
  vaga: {
    titulo: string;
    empresa: string;
  };
  status: string;
  status_display: string;
  data_candidatura: string;
}

const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch applications
      // const data = await applicationsAPI.getAll();
      // setApplications(data);
      
      // Mock data for now
      setApplications([]);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Erro ao carregar candidaturas.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDENTE': 'status-badge-pending',
      'APROVADA': 'status-badge-approved',
      'REJEITADA': 'status-badge-rejected',
      'EM_ANALISE': 'status-badge-analyzing',
    };
    return statusMap[status] || 'status-badge-default';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Carregando candidaturas...</div>
      </div>
    );
  }

  return (
    <div className="page-container applications-container">
      <div className="page-header-modern">
        <div className="page-header-content">
          <div className="page-header-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1>Minhas Candidaturas</h1>
            <p>Acompanhe o status das suas candidaturas a vagas</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message-modern" role="alert">
          <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="empty-state-modern">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3>Nenhuma candidatura encontrada</h3>
          <p>Você ainda não se candidatou a nenhuma vaga.</p>
          <button 
            onClick={() => navigate('/explore-career-paths')} 
            className="btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Explorar Vagas
          </button>
        </div>
      ) : (
        <div className="applications-table-container">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Vaga</th>
                <th>Status</th>
                <th>Data da Candidatura</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <div className="application-job-info">
                      <strong>{application.vaga.titulo}</strong>
                      <span className="application-company">{application.vaga.empresa}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                      {application.status_display}
                    </span>
                  </td>
                  <td>
                    {new Date(application.data_candidatura).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td>
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => navigate(`/application/${application.id}`)}
                    >
                      Ver Detalhes
                    </button>
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

export default ApplicationsPage;

