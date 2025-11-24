/**
 * API Service Layer
 * Centralized service for making API calls to the Django backend
 */

// Base URL for the backend API.
// Falls back to the current host on porta 8000 to keep cookies/CSRF in the same site.
const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

/**
 * Get CSRF token from cookies
 */
function getCsrfToken(): string | null {
  // Try to get CSRF token from cookie
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Fetch CSRF token from backend
 * This ensures we have a valid CSRF token before making write requests
 */
async function fetchCsrfToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/csrf-token/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      // The backend sets the cookie, but also returns the token in JSON
      // Try to get from cookie first, then from response
      let token = getCsrfToken();
      if (!token && data.csrfToken) {
        token = data.csrfToken;
      }
      return token;
    }
  } catch (err) {
    console.warn('Failed to fetch CSRF token from endpoint:', err);
  }
  return null;
}


/**
 * Generic fetch wrapper with error handling and CSRF token support
 */
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Determine if this is a write operation that needs CSRF token
  const method = options.method || 'GET';
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  
  // Get CSRF token if needed - fetch it first if not available
  let csrfToken: string | null = null;
  if (needsCsrf) {
    csrfToken = getCsrfToken();
    
    // If no CSRF token available, fetch it from the dedicated endpoint
    // This ensures we have the CSRF cookie before attempting write operations
    if (!csrfToken) {
      csrfToken = await fetchCsrfToken();
      
      // If still no token, try making a GET request to any endpoint as fallback
      if (!csrfToken) {
        try {
          await fetch(`${API_BASE_URL}/api/v1/career-paths/`, {
            method: 'GET',
            credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
          });
          
          // Wait a moment for the cookie to be processed by the browser
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Try to get the token again after the request
          csrfToken = getCsrfToken();
        } catch (err) {
          console.warn('Failed to fetch CSRF token:', err);
        }
      }
    }
  }
  
  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Merge with existing headers if provided
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }
  
  // Add CSRF token if available and needed
  if (csrfToken && needsCsrf) {
    headers['X-CSRFToken'] = csrfToken;
  }
  
  const defaultOptions: RequestInit = {
    headers,
    credentials: 'include', // Include cookies for session authentication
    ...options,
  };

  try {
    let response = await fetch(url, defaultOptions);
    
    // If we get a 403, check if it's CSRF or authentication issue
    if (!response.ok && response.status === 403) {
      const responseText = await response.clone().text();
      let responseData: any = {};
      try {
        responseData = JSON.parse(responseText);
      } catch {
        // Not JSON, use text
      }
      
      // Check if it's a CSRF issue or authentication issue
      const isAuthError = responseData.detail?.includes('Authentication') || 
                         responseData.error?.includes('Authentication') ||
                         responseText.includes('Authentication');
      
      if (isAuthError && needsCsrf) {
        // This might be a CSRF issue - try to get token and retry
        console.warn('403 Forbidden - attempting to get CSRF token and retry');
        
        // Wait a bit for cookies to be set, then check again
        await new Promise(resolve => setTimeout(resolve, 100));
        const retryCsrfToken = getCsrfToken();
        
        if (retryCsrfToken && !csrfToken) {
          // Update headers with CSRF token
          const retryHeaders: Record<string, string> = {
            ...headers,
            'X-CSRFToken': retryCsrfToken,
          };
          const retryOptions: RequestInit = {
            ...defaultOptions,
            headers: retryHeaders,
          };
          response = await fetch(url, retryOptions);
        } else if (!retryCsrfToken) {
          // If still no token, try making a GET request first to get the CSRF cookie
          try {
            await fetch(`${API_BASE_URL}/api/v1/career-paths/`, {
              method: 'GET',
              credentials: 'include',
            });
            const newCsrfToken = getCsrfToken();
            if (newCsrfToken) {
              const finalHeaders: Record<string, string> = {
                ...headers,
                'X-CSRFToken': newCsrfToken,
              };
              const finalOptions: RequestInit = {
                ...defaultOptions,
                headers: finalHeaders,
              };
              response = await fetch(url, finalOptions);
            }
          } catch (err) {
            console.warn('Failed to fetch CSRF token:', err);
          }
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Login user
   * Returns: { success: boolean, message: string, user?: {...} }
   * The backend now returns user data directly in the login response
   */
  async login(username: string, password: string, rememberMe: boolean = false) {
    const response = await fetchAPI('/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password, remember_me: rememberMe }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Backend returns { success, message, user } directly
    return data;
  },

  /**
   * Register new user
   */
  async register(userData: {
    name: string;
    username: string;
    email: string;
    age: string;
    cpf: string;
    password: string;
    confirm_password: string;
  }) {
    const response = await fetchAPI('/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(error.detail || 'Registration failed');
    }

    return await response.json();
  },

  /**
   * Logout user
   */
  async logout() {
    const response = await fetchAPI('/logout/', {
      method: 'POST',
    });
    return response.ok;
  },
};

/**
 * User Profile API
 */
export const userAPI = {
  /**
   * Get user profile
   */
  async getProfile() {
    const response = await fetchAPI('/api/user-profile/');
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401 Unauthorized - User not authenticated');
      }
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  },

  /**
   * Check if current user is admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      return profile.is_superuser === true || profile.is_staff === true || profile.is_admin === true;
    } catch {
      // Try to get from localStorage as fallback
      try {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          return profile.is_superuser === true || profile.is_staff === true || profile.is_admin === true;
        }
      } catch {
        return false;
      }
      return false;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData: any) {
    const response = await fetchAPI('/api/user-profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(error.error || 'Update failed');
    }

    return await response.json();
  },
};

/**
 * Career Paths API
 */
export const careerAPI = {
  /**
   * Get all career paths
   * Handles paginated responses from Django REST Framework
   * @param queryParams - Optional query parameters for filtering (e.g., { area: 'Tecnologia', level: 'Iniciante', is_active: 'true' })
   */
  async getAll(queryParams?: Record<string, string>) {
    let url = '/api/v1/career-paths/';
    
    // Build query string if params provided
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      url += `?${params.toString()}`;
    }
    
    const response = await fetchAPI(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch career paths');
    }

    const data = await response.json();
    
    // Django REST Framework returns paginated data with 'results' key
    // If it's paginated, return the results array, otherwise return the data as-is
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      return data.results;
    }
    
    // If it's already an array, return it
    if (Array.isArray(data)) {
      return data;
    }
    
    // Fallback: return empty array if unexpected format
    console.warn('Unexpected career paths response format:', data);
    return [];
  },

  /**
   * Get career path by ID
   */
  async getById(id: number) {
    const response = await fetchAPI(`/api/v1/career-paths/${id}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch career path');
    }

    return await response.json();
  },

  /**
   * Get predefined career paths only
   */
  async getPredefined() {
    const allPaths = await this.getAll();
    return allPaths.filter((path: any) => path.path_type === 'PRE');
  },

  /**
   * Get user's associated career paths (both predefined and personalized)
   * Only returns paths that the user has explicitly associated with
   * Uses dedicated endpoint that returns only associated paths with user-specific progress
   */
  async getUserPaths() {
    const response = await fetchAPI('/api/v1/career-paths/my-paths/');
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch user paths' }));
      throw new Error(error.error || 'Failed to fetch user paths');
    }
    
    const data = await response.json();
    // Handle paginated response
    return Array.isArray(data) ? data : (data.results || []);
  },
  
  /**
   * Leave/deactivate a career path (set is_active to false)
   */
  async leavePath(pathId: number) {
    const response = await fetchAPI(`/api/v1/career-paths/${pathId}/leave/`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to leave path' }));
      throw new Error(error.error || 'Failed to leave path');
    }

    return await response.json();
  },

  /**
   * Create new career path
   */
  async create(careerPathData: any) {
    const response = await fetchAPI('/api/v1/career-paths/', {
      method: 'POST',
      body: JSON.stringify(careerPathData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Creation failed' }));
      throw new Error(error.error || 'Creation failed');
    }

    return await response.json();
  },

  /**
   * Update career path
   */
  async update(id: number, careerPathData: any) {
    const response = await fetchAPI(`/api/v1/career-paths/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(careerPathData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(error.error || 'Update failed');
    }

    return await response.json();
  },

  /**
   * Delete career path
   */
  async delete(id: number) {
    const response = await fetchAPI(`/api/v1/career-paths/${id}/`, {
      method: 'DELETE',
    });

    return response.ok;
  },

  /**
   * Toggle active status of career path
   */
  async toggleActive(id: number, isActive: boolean) {
    const response = await fetchAPI(`/api/v1/career-paths/${id}/toggle_active/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(error.error || 'Update failed');
    }

    return await response.json();
  },

  /**
   * Check if career path has associated users
   */
  async checkUsers(id: number): Promise<{ has_users: boolean }> {
    const response = await fetchAPI(`/api/v1/career-paths/${id}/check_users/`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to check users' }));
      throw new Error(error.error || 'Failed to check users');
    }

    return await response.json();
  },

  /**
   * Associate career path with user (start following a path)
   */
  async associateWithUser(pathId: number) {
    const response = await fetchAPI(`/api/v1/career-paths/${pathId}/associate/`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Association failed' }));
      throw new Error(error.error || 'Association failed');
    }

    return await response.json();
  },

  /**
   * Get progress for a specific career path
   */
  async getProgress(pathId: number) {
    const response = await fetchAPI(`/api/v1/career-paths/${pathId}/progress/`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch progress' }));
      throw new Error(error.error || 'Failed to fetch progress');
    }

    return await response.json();
  },

  /**
   * Get list of available professional areas (legacy endpoint)
   */
  async getAreas() {
    const response = await fetchAPI('/api/v1/career-paths/areas/');

    if (!response.ok) {
      throw new Error('Failed to fetch areas');
    }

    return await response.json();
  },

  /**
   * Get list of available difficulty levels
   */
  async getLevels() {
    const response = await fetchAPI('/api/v1/career-paths/levels/');

    if (!response.ok) {
      throw new Error('Failed to fetch levels');
    }

    return await response.json();
  },
};

/**
 * Professional Areas API
 */
export const areaAPI = {
  /**
   * Get all areas
   */
  async getAll(queryParams?: Record<string, string>) {
    let url = '/api/v1/areas/';
    
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      url += `?${params.toString()}`;
    }
    
    const response = await fetchAPI(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch areas');
    }

    const data = await response.json();
    
    // Handle paginated responses
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      return data.results;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  },

  /**
   * Get area by ID
   */
  async getById(id: number) {
    const response = await fetchAPI(`/api/v1/areas/${id}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch area');
    }

    return await response.json();
  },

  /**
   * Create new area
   */
  async create(areaData: { name: string; description?: string; is_active?: boolean }) {
    const response = await fetchAPI('/api/v1/areas/', {
      method: 'POST',
      body: JSON.stringify(areaData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Creation failed' }));
      throw new Error(error.error || error.detail || 'Creation failed');
    }

    return await response.json();
  },

  /**
   * Update area
   */
  async update(id: number, areaData: { name?: string; description?: string; is_active?: boolean }) {
    const response = await fetchAPI(`/api/v1/areas/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(areaData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(error.error || error.detail || 'Update failed');
    }

    return await response.json();
  },

  /**
   * Delete area
   */
  async delete(id: number) {
    const response = await fetchAPI(`/api/v1/areas/${id}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Deletion failed' }));
      throw new Error(error.error || error.detail || 'Deletion failed');
    }

    return true;
  },
};

/**
 * Career Stages API
 */
export const stageAPI = {
  /**
   * Get all stages
   */
  async getAll() {
    const response = await fetchAPI('/api/v1/career-stages/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch career stages');
    }

    return await response.json();
  },

  /**
   * Get stage by ID
   */
  async getById(id: number) {
    const response = await fetchAPI(`/api/v1/career-stages/${id}/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch career stage');
    }

    return await response.json();
  },

  /**
   * Mark stage as completed
   * Validates that previous stages are completed before allowing this one
   */
  async markCompleted(id: number) {
    const response = await fetchAPI(`/api/v1/career-stages/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: true }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Update failed' }));
      
      // Check if it's a validation error about previous stages
      if (response.status === 400 && error.error) {
        throw new Error(error.error);
      }
      
      throw new Error(error.error || 'Update failed');
    }

    return await response.json();
  },

  /**
   * Create new stage
   */
  async create(stageData: any) {
    const response = await fetchAPI('/api/v1/career-stages/', {
      method: 'POST',
      body: JSON.stringify(stageData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Creation failed' }));
      throw new Error(error.error || 'Creation failed');
    }

    return await response.json();
  },

  /**
   * Update stage
   */
  async update(id: number, stageData: any) {
    const response = await fetchAPI(`/api/v1/career-stages/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(stageData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Update failed' }));
      throw new Error(error.error || 'Update failed');
    }

    return await response.json();
  },

  /**
   * Delete stage
   */
  async delete(id: number) {
    const response = await fetchAPI(`/api/v1/career-stages/${id}/`, {
      method: 'DELETE',
    });

    return response.ok;
  },
};

/**
 * Skills API
 */
export const skillsAPI = {
  /**
   * Get all available skills
   */
  async getAll() {
    const response = await fetchAPI('/api/v1/skills/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }

    const data = await response.json();
    
    // Handle paginated responses
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      return data.results;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  },

  /**
   * Get user's skills (from student_area)
   * TODO: Implement when backend endpoint is ready
   */
  async getUserSkills() {
    // This would call something like /api/v1/user-skills/
    // For now, return empty array
    return [];
  },

  /**
   * Add skill to user profile
   * TODO: Implement when backend endpoint is ready
   */
  async addUserSkill(skillData: { skill_id: number; nivel: string; anos_experiencia?: number }) {
    // This would call POST /api/v1/user-skills/
    throw new Error('Not implemented yet');
  },

  /**
   * Remove skill from user profile
   * TODO: Implement when backend endpoint is ready
   */
  async removeUserSkill(skillId: number) {
    // This would call DELETE /api/v1/user-skills/{id}/
    throw new Error('Not implemented yet');
  },
};

/**
 * Favorites API
 */
export const favoritesAPI = {
  /**
   * Get user's favorite career paths
   */
  async getAll() {
    const response = await fetchAPI('/api/v1/favorites/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    const data = await response.json();
    
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      return data.results;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  },

  /**
   * Add career path to favorites
   */
  async add(pathId: number) {
    const response = await fetchAPI('/api/v1/favorites/', {
      method: 'POST',
      body: JSON.stringify({ career_path_id: pathId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to add favorite' }));
      throw new Error(error.error || 'Failed to add favorite');
    }

    return await response.json();
  },

  /**
   * Remove career path from favorites
   */
  async remove(pathId: number) {
    const response = await fetchAPI(`/api/v1/favorites/${pathId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove favorite' }));
      throw new Error(error.error || 'Failed to remove favorite');
    }

    return response.ok;
  },

  /**
   * Check if career path is favorited
   */
  async isFavorited(pathId: number): Promise<boolean> {
    try {
      const favorites = await this.getAll();
      return favorites.some((fav: any) => fav.career_path_id === pathId || fav.career_path?.id === pathId);
    } catch {
      return false;
    }
  },
};

/**
 * LLM API (for personalized career plans)
 */
export const llmAPI = {
  /**
   * Generate personalized career plan
   */
  async generatePlan(description: string) {
    const response = await fetchAPI('/api/llm/generate-plan/', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Generation failed' }));
      throw new Error(error.error || 'Generation failed');
    }

    return await response.json();
  },

  /**
   * Chat with mentor AI
   */
  async chat(message: string, conversationId?: string) {
    const response = await fetchAPI('/api/llm/chat/', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Chat failed' }));
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      throw new Error(error.error || 'Chat failed');
    }

    return await response.json();
  },
};


