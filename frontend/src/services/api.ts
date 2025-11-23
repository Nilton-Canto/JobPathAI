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
};

/**
 * Skills API
 */
export const skillsAPI = {
  /**
   * Get all skills
   */
  async getAll() {
    const response = await fetchAPI('/api/v1/skills/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }

    return await response.json();
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
      throw new Error(error.error || 'Chat failed');
    }

    return await response.json();
  },
};

