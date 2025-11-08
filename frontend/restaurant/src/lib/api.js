// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper functions
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }
  
  return data;
};

// Auth API
export const authAPI = {
  // Login for restaurant owners
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/restaurant/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    const data = await handleResponse(response);
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('restaurant', JSON.stringify(data.restaurant));
    
    return data;
  },

  // Register new restaurant owner
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/signup-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    const data = await handleResponse(response);
    
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  // Get current user info with restaurant status
  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Logout
  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return true;
  },

  // Check if authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};

// Restaurant API
export const restaurantAPI = {
  // Register a new restaurant
  async register(restaurantData) {
    const response = await fetch(`${API_BASE_URL}/restaurants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...restaurantData,
        review_status: 'PENDING'
      }),
    });
    
    return handleResponse(response);
  },

  // Get owner's restaurant
  async getMine() {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/mine`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        console.warn('Restaurant API not available (401/404)');
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Failed to fetch restaurant:', error.message);
      return null;
    }
  },

  // Get restaurant by ID
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Update restaurant info
  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  // Get restaurant statistics
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurant/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.warn('Stats API not available (401/404), using mock data');
        return {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
          totalMenuItems: 0
        };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn('Stats API error, using mock data:', error.message);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        totalMenuItems: 0
      };
    }
  }
};

// Menu API
export const menuAPI = {
  // Get all menu items
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.is_available !== undefined) params.append('is_available', filters.is_available);
    
    const url = `${API_BASE_URL}/menu${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get single menu item
  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Create menu item
  async create(menuData) {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(menuData),
    });
    
    return handleResponse(response);
  },

  // Update menu item
  async update(id, menuData) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(menuData),
    });
    
    return handleResponse(response);
  },

  // Toggle menu item availability
  async toggleAvailability(id) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Delete menu item
  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get menu statistics
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/menu/stats`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  }
};
