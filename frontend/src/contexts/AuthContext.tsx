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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          // Check if it's a connection error (backend not running)
          const isConnectionError = err.message?.includes('Failed to fetch') || 
                                   err.message?.includes('ERR_CONNECTION_REFUSED') ||
                                   err.message?.includes('NetworkError') ||
                                   err instanceof TypeError;
          
          // If 401, user is not authenticated - clear everything
          if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userProfile');
            return;
          }
          
          // If connection error, use localStorage as fallback (backend might be starting)
          if (isConnectionError) {
            console.warn('Backend connection failed, using localStorage fallback');
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
              try {
                const profile = JSON.parse(storedProfile);
                setUser(profile);
                setIsAuthenticated(true);
                // Don't clear localStorage on connection errors - user might still be valid
                return;
              } catch {
                // Invalid stored profile
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userProfile');
              }
            } else {
              // No stored profile, but keep isLoggedIn flag in case backend comes back
              setIsAuthenticated(false);
              setUser(null);
            }
            return;
          }
          
          // For other errors, fallback to localStorage if available
          const storedProfile = localStorage.getItem('userProfile');
          if (storedProfile) {
            try {
              const profile = JSON.parse(storedProfile);
              setUser(profile);
              setIsAuthenticated(true);
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
        setIsAuthenticated(false);
        setUser(null);
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
      
      // Check if it's a connection error
      const isConnectionError = err.message?.includes('Failed to fetch') || 
                               err.message?.includes('ERR_CONNECTION_REFUSED') ||
                               err.message?.includes('NetworkError') ||
                               err instanceof TypeError;
      
      if (isConnectionError) {
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      }
      
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
    } catch (err: any) {
      console.error('Error refreshing user:', err);
      
      // Check if it's a connection error
      const isConnectionError = err.message?.includes('Failed to fetch') || 
                               err.message?.includes('ERR_CONNECTION_REFUSED') ||
                               err.message?.includes('NetworkError') ||
                               err instanceof TypeError;
      
      // If connection error, don't clear user data - just log warning
      if (isConnectionError) {
        console.warn('Backend connection failed during refresh, keeping current user data');
        return;
      }
      
      // For other errors, fallback to stored profile
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
