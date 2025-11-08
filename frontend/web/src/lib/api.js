// API for authentication with email verification
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ===== PUBLIC API (không cần auth) =====
export const publicAPI = {
  // Lấy danh sách nhà hàng
  async getRestaurants() {
    try {
      const response = await fetch(`${API_BASE_URL}/public/restaurants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch restaurants');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error fetching restaurants:', error);
      throw error;
    }
  },

  // Lấy thông tin nhà hàng
  async getRestaurantById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/public/restaurants/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch restaurant');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error fetching restaurant:', error);
      throw error;
    }
  },

  // Lấy menu của nhà hàng
  async getRestaurantMenu(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/public/restaurants/${id}/menu`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch menu');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error fetching menu:', error);
      throw error;
    }
  },
};

// Mock user database (in a real app, this would be on the server)
const MOCK_USERS = [
  {
    id: 1,
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User',
    phone: '+1234567890',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
  }
];

// Mock API functions
export const authAPI = {
  // Register new user (with email verification)
  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }

    return data;
  },

  // Login user (requires email verification)
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    // Store token in localStorage
    if (data.data && data.data.token) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data.data;
  },

  // Verify email
  async verifyEmail(token) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Xác thực email thất bại');
    }

    return data;
  },

  // Resend verification email
  async resendVerification(email) {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gửi lại email thất bại');
    }

    return data;
  },

  // Get current user
  async getCurrentUser() {
    await delay(200);
    
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      return user;
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }
  },

  // Logout
  async logout() {
    await delay(200);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return true;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
};

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

