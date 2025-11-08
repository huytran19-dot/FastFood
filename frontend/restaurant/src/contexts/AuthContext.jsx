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
        
        try {
          const restaurantData = await restaurantAPI.getMine();
          if (restaurantData) {
            setRestaurant(restaurantData);
            localStorage.setItem('restaurant', JSON.stringify(restaurantData));
          }
        } catch (err) {
          console.warn('Failed to refresh restaurant data, using cached:', err.message);
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
      
      const isPending = data.restaurant?.review_status === 'PENDING';
      
      if (!isPending) {
        setUser(data.user);
        
        if (data.restaurant) {
          setRestaurant(data.restaurant);
          localStorage.setItem('restaurant', JSON.stringify(data.restaurant));
        }
      }
      
      toast({
        title: isPending ? 'Tài khoản đang chờ duyệt' : 'Đăng nhập thành công',
        description: isPending 
          ? 'Nhà hàng của bạn đang được xem xét' 
          : `Xin chào, ${data.user.name}!`,
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
        title: 'Đăng ký tài khoản thành công',
        description: 'Vui lòng đăng ký thông tin nhà hàng',
      });
      
      navigate('/restaurant/register');
      
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
      localStorage.removeItem('restaurant');
      
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
