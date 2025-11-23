import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userAPI, authAPI } from '../services/api';

/**
 * AuthContext - Centralized authentication state management
 * 
 * Provides authentication state and methods to all components
 * Replaces direct localStorage usage throughout the app
 */

interface UserProfile {
  id?: number;
  nome: string;
  email: string;
  username?: string;
  idade?: number;
  cpf?: string;
  is_superuser?: boolean;
  is_staff?: boolean;
  is_admin?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const loggedInStatus = localStorage.getItem('isLoggedIn');
      
      if (loggedInStatus === 'true') {
        // Try to fetch user profile from API
        try {
          const profile = await userAPI.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
          localStorage.setItem('userProfile', JSON.stringify(profile));
        } catch (err: any) {
          // If 401, check if it's a temporary network issue or real auth failure
          if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
            // Wait a bit and try once more (might be a timing issue)
            try {
              await new Promise(resolve => setTimeout(resolve, 500));
              const retryProfile = await userAPI.getProfile();
              setUser(retryProfile);
              setIsAuthenticated(true);
              localStorage.setItem('userProfile', JSON.stringify(retryProfile));
            } catch (retryErr: any) {
              // If retry also fails, clear everything
              console.warn('Authentication check failed after retry:', retryErr);
              setIsAuthenticated(false);
              setUser(null);
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('userProfile');
            }
            return;
          }
          
          // For other errors (network, etc.), fallback to localStorage if available
          const storedProfile = localStorage.getItem('userProfile');
          if (storedProfile) {
            try {
              const profile = JSON.parse(storedProfile);
              setUser(profile);
              setIsAuthenticated(true);
              // Try to refresh profile in background
              userAPI.getProfile().then(updatedProfile => {
                setUser(updatedProfile);
                localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
              }).catch(() => {
                // Silent fail - keep using stored profile
              });
            } catch {
              // Invalid stored profile
              setIsAuthenticated(false);
              setUser(null);
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('userProfile');
            }
          } else {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('isLoggedIn');
          }
        }
      } else {
        // No logged in status, but check if there's a valid session cookie
        // This handles the case where user refreshed page but localStorage was cleared
        try {
          const profile = await userAPI.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userProfile', JSON.stringify(profile));
        } catch {
          // No valid session
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await authAPI.login(username, password, rememberMe);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userProfile', JSON.stringify(response.user));
        window.dispatchEvent(new Event('storage'));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    }
    
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userProfile');
    window.dispatchEvent(new Event('storage'));
  };

  const refreshUser = async () => {
    try {
      const profile = await userAPI.getProfile();
      setUser(profile);
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (err) {
      console.error('Error refreshing user:', err);
      // Fallback to stored profile
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          setUser(profile);
        } catch {
          // Invalid stored profile
        }
      }
    }
  };

  const isAdmin = (): boolean => {
    if (!user) return false;
    return user.is_superuser === true || user.is_staff === true || user.is_admin === true;
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refreshUser,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

