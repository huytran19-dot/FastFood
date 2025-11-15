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

  // Lấy categories của nhà hàng
  async getRestaurantCategories(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/public/restaurants/${id}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch categories');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  },
};

// API functions
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

// ===== USER API (cần auth) =====
export const userAPI = {
  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy thông tin user');
      }

      return data;
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw error;
    }
  },

  // Cập nhật profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi cập nhật profile');
      }

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(data));

      return data;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  },

  // Đổi mật khẩu
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi đổi mật khẩu');
      }

      return data;
    } catch (error) {
      console.error('❌ Error changing password:', error);
      throw error;
    }
  },
};

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ===== CART API (cần auth) =====
export const cartAPI = {
  // Lấy giỏ hàng hiện tại
  async getCart() {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy giỏ hàng');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      throw error;
    }
  },

  // Thêm món vào giỏ hàng
  async addToCart(menuItemId, quantity = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          menu_item_id: menuItemId,
          quantity,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi thêm vào giỏ hàng');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw error;
    }
  },

  // Cập nhật số lượng
  async updateQuantity(cartItemId, quantity) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi cập nhật số lượng');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      throw error;
    }
  },

  // Xóa món khỏi giỏ hàng
  async removeItem(cartItemId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi xóa món');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error removing item:', error);
      throw error;
    }
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart() {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi xóa giỏ hàng');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      throw error;
    }
  },
};

// ===== ORDER API (cần auth) =====
export const orderAPI = {
  // Tạo đơn hàng mới
  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tạo đơn hàng');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  },

  // Lấy danh sách đơn hàng
  async getOrders(limit = 20, offset = 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách đơn hàng');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng
  async getOrderDetail(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy chi tiết đơn hàng');
      }


      return data.data;
    } catch (error) {
      console.error('❌ Error fetching order detail:', error);
      throw error;
    }
  },

  // Hủy đơn hàng
  async cancelOrder(orderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi hủy đơn hàng');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      throw error;
    }
  },

  // Xác nhận OTP khi nhận hàng
  async verifyOTP(orderId, otp) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Mã OTP không đúng');
      }

      return data;
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      throw error;
    }
  },
};
