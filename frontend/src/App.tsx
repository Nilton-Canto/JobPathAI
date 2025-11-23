import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header/Header';
import OnboardingPage from './pages/OnboardingPage';
import AdminLayout from './components/Layout/AdminLayout';
import UserLayout from './components/Layout/UserLayout';
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
          
          {/* Admin Routes - Admin Layout (includes AdminHeader) */}
          <Route path="/admin/*" element={<AdminLayout />} />
          
          {/* User Routes - User Layout (includes Header and ProtectedUserRoute) */}
          <Route path="/*" element={<UserLayout />} />
          
          {/* 404 - Fallback */}
          <Route path="*" element={<><Header /><main><NotFoundPage /></main></>} />
        </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
