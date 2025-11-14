// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper functions
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
    const error = new Error(data.message || 'Có lỗi xảy ra');
    error.status = response.status;
    throw error;
  }
  
  return data;
};

// Auth API
export const authAPI = {
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/restaurant/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    const data = await handleResponse(response);
    
    // Only save token here - user and restaurant will be managed by AuthContext
    localStorage.setItem('authToken', data.token);
    
    return data;
  },

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

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  async logout() {
    localStorage.removeItem('authToken');
    // Don't remove user/restaurant here - AuthContext manages that
    return true;
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};

// Category API
export const categoryAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/restaurant/categories`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data) {
    const response = await fetch(`${API_BASE_URL}/restaurant/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/restaurant/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/restaurant/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async toggleStatus(id) {
    const response = await fetch(`${API_BASE_URL}/restaurant/categories/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// Menu API
export const menuAPI = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data) {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async toggleAvailability(id) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// Restaurant API
export const restaurantAPI = {
  async register(restaurantData) {
    const response = await fetch(`${API_BASE_URL}/restaurant`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...restaurantData,
        review_status: 'PENDING'
      }),
    });
    
    return handleResponse(response);
  },

  async getMine() {
    const response = await fetch(`${API_BASE_URL}/restaurant/mine`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/restaurant/${id}`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/restaurant/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },

  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurant/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.warn('Stats API not available (401/404), returning default values');
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
      console.warn('Stats API error, returning default values:', error.message);
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

// Order API
export const orderAPI = {
  async getAll(status = 'all') {
    const url = status === 'all' 
      ? `${API_BASE_URL}/restaurant/orders`
      : `${API_BASE_URL}/restaurant/orders?status=${status}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/restaurant/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  async updateStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/restaurant/orders/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    
    return handleResponse(response);
  }
};

// Drone API
export const droneAPI = {
  async getAvailableDrones() {
    const response = await fetch(`${API_BASE_URL}/restaurant/drones`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  async assignOrderToDrone(orderId, droneId) {
    const response = await fetch(`${API_BASE_URL}/restaurant/orders/${orderId}/assign-drone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ drone_id: droneId }),
    });
    
    return handleResponse(response);
  },

  async startDelivery(orderId) {
    const response = await fetch(`${API_BASE_URL}/restaurant/orders/${orderId}/start-delivery`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  async getDronePosition(droneId) {
    const response = await fetch(`${API_BASE_URL}/restaurant/drones/${droneId}/position`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  async getOrderDistance(orderId) {
    const response = await fetch(`${API_BASE_URL}/restaurant/orders/${orderId}/distance`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  }
};
