import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header/Header';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ApplicationsPage from './pages/ApplicationsPage';
import ExploreCareerPathsPage from './pages/ExploreCareerPathsPage';
import CreateCustomPlanPage from './pages/CreateCustomPlanPage';
import ChatMentorPage from './pages/ChatMentorPage';
import MyCareerPlanPage from './pages/MyCareerPlanPage';
import AdminLayout from './components/Layout/AdminLayout';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - User Header */}
        <Route path="/login" element={<><Header /><main><LoginPage /></main></>} />
        <Route path="/register" element={<><Header /><main><RegisterPage /></main></>} />
        <Route path="/forgot-password" element={<><Header /><main><ForgotPasswordPage /></main></>} />
        <Route path="/" element={<><Header /><main><HomePage /></main></>} />
        
        {/* User Routes - User Header */}
        <Route path="/dashboard" element={<><Header /><main><DashboardPage /></main></>} />
        <Route path="/profile" element={<><Header /><main><ProfilePage /></main></>} />
        <Route path="/applications" element={<><Header /><main><ApplicationsPage /></main></>} />
        <Route path="/explore-career-paths" element={<><Header /><main><ExploreCareerPathsPage /></main></>} />
        <Route path="/create-custom-plan" element={<><Header /><main><CreateCustomPlanPage /></main></>} />
        <Route path="/chat-mentor" element={<><Header /><main><ChatMentorPage /></main></>} />
        <Route path="/my-plan/:id" element={<><Header /><main><MyCareerPlanPage /></main></>} />
        
        {/* Admin Routes - Admin Layout (includes AdminHeader) */}
        <Route path="/admin/*" element={<AdminLayout />} />
        
        {/* 404 */}
        <Route path="*" element={<><Header /><main><NotFoundPage /></main></>} />
      </Routes>
    </Router>
  );
}

export default App;
