import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { token: null, role: null, user_id: null, restaurant_ids: [] };
      }
    }
    return { token: null, role: null, user_id: null, restaurant_ids: [] };
  });

  useEffect(() => {
    if (authState.token) {
      localStorage.setItem('auth', JSON.stringify(authState));
    } else {
      localStorage.removeItem('auth');
    }
  }, [authState]);

  const login = async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email === 'admin@fastfood.vn' && password === 'admin123') {
      setAuthState({
        token: 'mock-token-admin',
        role: 'admin',
        user_id: 1,
        restaurant_ids: []
      });
    } else if (email === 'owner@fastfood.vn' && password === 'owner123') {
      setAuthState({
        token: 'mock-token-owner',
        role: 'restaurant_owner',
        user_id: 2,
        restaurant_ids: [1]
      });
    } else {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
  };

  const logout = () => {
    setAuthState({ token: null, role: null, user_id: null, restaurant_ids: [] });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        isAuthenticated: !!authState.token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
