import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header/Header'; // Importar o componente Header
import DashboardPage from './pages/DashboardPage'; // Importar o componente DashboardPage
import ProfilePage from './pages/ProfilePage'; // Importar o componente ProfilePage
import './App.css'; // Estilos do App

function App() {
  return (
    <Router>
      <Header /> {/* Renderizar o Header aqui */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} /> {/* Nova rota para o Dashboard */}
          <Route path="/profile" element={<ProfilePage />} /> {/* Nova rota para o Perfil */}
          {/* Rotas futuras, ex: Dashboard, Perfil, Trilhas */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
