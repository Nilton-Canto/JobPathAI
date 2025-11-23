/**
 * API Service Layer
 * Centralized service for making API calls to the Django backend
 */

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for session authentication
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
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
  async login(username: string, password: string) {
    const response = await fetchAPI('/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
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
   */
  async getAll() {
    const response = await fetchAPI('/api/v1/career-paths/');
    
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
   * Get user's career paths
   */
  async getUserPaths() {
    const allPaths = await this.getAll();
    return allPaths.filter((path: any) => path.path_type === 'PER');
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
    const response = await fetchAPI(`/api/v1/career-paths/${id}/`, {
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
  async checkUsers(id: number) {
    // TODO: Backend should implement endpoint to check users associated with path
    // For now, return empty array
    try {
      const response = await fetchAPI(`/api/v1/career-paths/${id}/users/`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : (data.results || []);
      }
    } catch (err) {
      // Endpoint may not exist yet
      console.warn('Could not check associated users:', err);
    }
    return [];
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
   */
  async markCompleted(id: number) {
    const response = await fetchAPI(`/api/v1/career-stages/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_completed: true }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Update failed' }));
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

