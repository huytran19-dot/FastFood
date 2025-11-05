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
    const response = await fetch(`${API_BASE_URL}/restaurants/mine`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
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
    const response = await fetch(`${API_BASE_URL}/restaurant/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    
    return handleResponse(response);
  }
};
