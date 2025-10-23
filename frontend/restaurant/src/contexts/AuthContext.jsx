import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, restaurantAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        
        // Load restaurant if user has one
        if (userData.restaurant_id) {
          const restaurantData = await restaurantAPI.getMine();
          setRestaurant(restaurantData);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear invalid auth
      await authAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      setUser(data.user);
      
      // Load restaurant if exists
      if (data.user.restaurant_id) {
        const restaurantData = await restaurantAPI.getMine();
        setRestaurant(restaurantData);
      }
      
      toast({
        title: 'Đăng nhập thành công',
        description: `Xin chào, ${data.user.name}!`,
      });
      
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
        title: 'Đăng ký thành công',
        description: 'Tài khoản của bạn đã được tạo',
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

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setRestaurant(null);
      
      toast({
        title: 'Đăng xuất thành công',
        description: 'Hẹn gặp lại bạn!',
      });
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
  };

  const value = {
    user,
    restaurant,
    loading,
    login,
    register,
    logout,
    updateRestaurant,
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
