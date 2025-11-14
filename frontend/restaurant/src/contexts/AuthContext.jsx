import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, restaurantAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const storedUser = localStorage.getItem('user');
        const storedRestaurant = localStorage.getItem('restaurant');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        if (storedRestaurant) {
          setRestaurant(JSON.parse(storedRestaurant));
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      await authAPI.logout();
      setUser(null);
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      
      // Always set user and save to localStorage
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Handle restaurant based on status
      if (data.restaurant) {
        const { review_status } = data.restaurant;
        
        if (review_status === 'APPROVED') {
          // Only set restaurant in context if APPROVED
          setRestaurant(data.restaurant);
          localStorage.setItem('restaurant', JSON.stringify(data.restaurant));
          localStorage.removeItem('pendingRestaurant'); // Clear any pending data
          
          toast({
            title: 'Đăng nhập thành công',
            description: `Xin chào, ${data.user.name}!`,
          });
        } else if (review_status === 'PENDING') {
          // Save to pendingRestaurant instead for status pages
          setRestaurant(null);
          localStorage.removeItem('restaurant');
          localStorage.setItem('pendingRestaurant', JSON.stringify(data.restaurant));
          
          toast({
            title: 'Nhà hàng đang chờ duyệt',
            description: 'Nhà hàng của bạn đang được xem xét',
          });
        } else if (review_status === 'REJECTED') {
          // Save to pendingRestaurant for rejected status too
          setRestaurant(null);
          localStorage.removeItem('restaurant');
          localStorage.setItem('pendingRestaurant', JSON.stringify(data.restaurant));
          
          toast({
            variant: 'destructive',
            title: 'Nhà hàng bị từ chối',
            description: 'Vui lòng kiểm tra lý do và đăng ký lại',
          });
        }
      } else {
        // No restaurant at all - need to register
        setRestaurant(null);
        localStorage.removeItem('restaurant');
        localStorage.removeItem('pendingRestaurant');
        
        toast({
          title: 'Đăng nhập thành công',
          description: 'Vui lòng đăng ký thông tin nhà hàng',
        });
      }
      
      return data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Đăng nhập thất bại',
        description: error.message,
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      setUser(data.user);
      
      toast({
        title: 'Đăng ký tài khoản thành công',
        description: 'Đăng nhập để tiếp tục',
      });
      
      return data;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Đăng ký thất bại',
        description: error.message,
      });
      throw error;
    }
  };

  const logout = async (showToast = true) => {
    try {
      await authAPI.logout();
      setUser(null);
      setRestaurant(null);
      localStorage.removeItem('user');
      localStorage.removeItem('restaurant');
      localStorage.removeItem('pendingRestaurant');
      
      if (showToast) {
        toast({
          title: 'Đăng xuất thành công',
          description: 'Hẹn gặp lại bạn!',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message,
      });
    }
  };

  const updateRestaurant = (restaurantData) => {
    setRestaurant(restaurantData);
    if (restaurantData) {
      localStorage.setItem('restaurant', JSON.stringify(restaurantData));
    } else {
      localStorage.removeItem('restaurant');
    }
  };

  const refreshRestaurant = async () => {
    try {
      const restaurantData = await restaurantAPI.getMine();
      if (restaurantData) {
        setRestaurant(restaurantData);
        localStorage.setItem('restaurant', JSON.stringify(restaurantData));
      } else {
        setRestaurant(null);
        localStorage.removeItem('restaurant');
      }
      return restaurantData;
    } catch (error) {
      console.error('Failed to refresh restaurant:', error);
      setRestaurant(null);
      localStorage.removeItem('restaurant');
      return null;
    }
  };

  const value = {
    user,
    restaurant,
    loading,
    login,
    register,
    logout,
    updateRestaurant,
    refreshRestaurant,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
