import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import DashboardPage from '../../pages/DashboardPage';
import ProfilePage from '../../pages/ProfilePage';
import ApplicationsPage from '../../pages/ApplicationsPage';
import ExploreCareerPathsPage from '../../pages/ExploreCareerPathsPage';
import CreateCustomPlanPage from '../../pages/CreateCustomPlanPage';
import ChatMentorPage from '../../pages/ChatMentorPage';
import MyCareerPlanPage from '../../pages/MyCareerPlanPage';
import MyCareerPathsPage from '../../pages/MyCareerPathsPage';
import CareerPathDetailPage from '../../pages/CareerPathDetailPage';
import ProtectedUserRoute from './ProtectedUserRoute';

/**
 * User Layout Component
 * Wraps all user/client routes with user-specific header and layout
 * Includes authentication checks via ProtectedUserRoute
 * 
 * This component centralizes the user area layout, similar to AdminLayout
 */
const UserLayout: React.FC = () => {
  const location = useLocation();
  
  // Check if current route is a user route
  const userRoutes = [
    '/dashboard',
    '/profile',
    '/applications',
    '/my-career-paths',
    '/explore-career-paths',
    '/create-custom-plan',
    '/chat-mentor',
  ];
  
  const isUserRoute = userRoutes.some(route => location.pathname.startsWith(route)) ||
    location.pathname.startsWith('/career-path/') ||
    location.pathname.startsWith('/my-plan/');

  if (!isUserRoute) {
    return null; // Let parent router handle this route
  }

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedUserRoute>
                <DashboardPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedUserRoute>
                <ProfilePage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedUserRoute>
                <ApplicationsPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/my-career-paths"
            element={
              <ProtectedUserRoute>
                <MyCareerPathsPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/explore-career-paths"
            element={
              <ProtectedUserRoute>
                <ExploreCareerPathsPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/create-custom-plan"
            element={
              <ProtectedUserRoute>
                <CreateCustomPlanPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/chat-mentor"
            element={
              <ProtectedUserRoute>
                <ChatMentorPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/career-path/:id"
            element={
              <ProtectedUserRoute>
                <CareerPathDetailPage />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/my-plan/:id"
            element={
              <ProtectedUserRoute>
                <MyCareerPlanPage />
              </ProtectedUserRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
};

export default UserLayout;

