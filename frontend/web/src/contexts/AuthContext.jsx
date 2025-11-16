import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Listen for account lock events via Socket.IO
  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('🔌 [AUTH] Connected to Socket.IO for account monitoring');
    });

    // Listen for account locked event
    socket.on('user:account-locked', (data) => {
      console.log('🔒 [AUTH] Received account-locked event:', data);
      
      // Check if this event is for current user
      if (data.userId === user.id) {
        console.log('🔒 [AUTH] Current user account locked, logging out...');
        
        // Force logout
        authAPI.logout();
        setUser(null);
        
        // Show notification
        toast({
          variant: 'destructive',
          title: 'Tài khoản đã bị khóa',
          description: data.message || 'Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ.',
          duration: 10000,
        });

        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, toast]);

  const loadUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { user: loggedInUser } = await authAPI.login(email, password);
      setUser(loggedInUser);
      
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${loggedInUser.name}`,
      });
      
      return loggedInUser;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message,
      });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      // KHÔNG set user vào context vì chưa verify email
      // User cần verify email trước khi login
      
      toast({
        title: 'Đăng ký thành công!',
        description: 'Vui lòng kiểm tra email để xác thực tài khoản.',
      });
      
      return response;
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
      
      toast({
        title: 'Logged out',
        description: 'See you next time!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: error.message,
      });
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
