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
import MyCareerPathsPage from './pages/MyCareerPathsPage';
import CareerPathDetailPage from './pages/CareerPathDetailPage';
import OnboardingPage from './pages/OnboardingPage';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedUserRoute from './components/Layout/ProtectedUserRoute';
import ChatWidget from './components/ChatWidget/ChatWidget';
import { AuthProvider } from './contexts/AuthContext';
// Styles imported via main.tsx -> styles/index.css

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Floating Chat Widget - Available on all pages when logged in */}
        <ChatWidget />
        <Routes>
        {/* Public Routes - User Header */}
        <Route path="/login" element={<><Header /><main><LoginPage /></main></>} />
        <Route path="/register" element={<><Header /><main><RegisterPage /></main></>} />
        <Route path="/onboarding" element={<><Header /><main><OnboardingPage /></main></>} />
        <Route path="/forgot-password" element={<><Header /><main><ForgotPasswordPage /></main></>} />
        <Route path="/" element={<><Header /><main><HomePage /></main></>} />
        
        {/* User Routes - User Header - Protected from Admin Access */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedUserRoute>
              <Header /><main><DashboardPage /></main>
            </ProtectedUserRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedUserRoute>
              <Header /><main><ProfilePage /></main>
            </ProtectedUserRoute>
          } 
        />
        <Route 
          path="/applications" 
          element={
            <ProtectedUserRoute>
              <Header /><main><ApplicationsPage /></main>
            </ProtectedUserRoute>
          } 
        />
        <Route 
          path="/my-career-paths" 
          element={
            <ProtectedUserRoute>
              <Header /><main><MyCareerPathsPage /></main>
            </ProtectedUserRoute>
          } 
        />
        <Route 
          path="/explore-career-paths" 
          element={
            <ProtectedUserRoute>
              <Header /><main><ExploreCareerPathsPage /></main>
            </ProtectedUserRoute>
          } 
        />
        <Route 
          path="/create-custom-plan" 
          element={
            <ProtectedUserRoute>
              <Header /><main><CreateCustomPlanPage /></main>
            </ProtectedUserRoute>
          } 
        />
        <Route 
          path="/chat-mentor" 
          element={
            <ProtectedUserRoute>
              <Header /><main><ChatMentorPage /></main>
            </ProtectedUserRoute>
          } 
        />
        <Route 
          path="/career-path/:id" 
          element={
            <ProtectedUserRoute>
              <Header /><main><CareerPathDetailPage /></main>
            </ProtectedUserRoute>
          } 
        />
        <Route 
          path="/my-plan/:id" 
          element={
            <ProtectedUserRoute>
              <Header /><main><MyCareerPlanPage /></main>
            </ProtectedUserRoute>
          } 
        />
        
        {/* Admin Routes - Admin Layout (includes AdminHeader) */}
        <Route path="/admin/*" element={<AdminLayout />} />
        
        {/* 404 */}
        <Route path="*" element={<><Header /><main><NotFoundPage /></main></>} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
