// Mock API for authentication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

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
  // Login user
  async login(email, password) {
    await delay();
    
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Create a mock token
    const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
    
    // Store token in localStorage
    localStorage.setItem('authToken', token);
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return {
      user: userWithoutPassword,
      token
    };
  },

  // Register new user
  async register(userData) {
    await delay();
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = {
      id: MOCK_USERS.length + 1,
      ...userData,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`
    };
    
    MOCK_USERS.push(newUser);
    
    // Auto-login after registration
    const token = btoa(JSON.stringify({ userId: newUser.id, timestamp: Date.now() }));
    localStorage.setItem('authToken', token);
    
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    
    return {
      user: userWithoutPassword,
      token
    };
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
