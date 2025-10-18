import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

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
      const { user: newUser } = await authAPI.register(userData);
      setUser(newUser);
      
      toast({
        title: 'Account created!',
        description: 'Welcome to FastFood!',
      });
      
      return newUser;
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
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
