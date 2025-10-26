import { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin } from '../api/auth';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    // Khôi phục từ sessionStorage khi F5 (refresh)
    const stored = sessionStorage.getItem('auth');
    if (stored) {
      try {
        console.log("🔄 [AuthContext] Restoring auth from sessionStorage");
        return JSON.parse(stored);
      } catch {
        return { token: null, role: null, user_id: null, user: null, restaurant_ids: [] };
      }
    }
    console.log("🔄 [AuthContext] No auth found - user must login");
    return { token: null, role: null, user_id: null, user: null, restaurant_ids: [] };
  });

  useEffect(() => {
    if (authState.token) {
      // Lưu vào sessionStorage (mất khi đóng tab, giữ khi F5)
      sessionStorage.setItem('auth', JSON.stringify(authState));
      console.log("💾 [AuthContext] Auth saved to sessionStorage");
    } else {
      // Xóa hết khi logout
      sessionStorage.removeItem('auth');
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log("🗑️ [AuthContext] Auth cleared");
    }
  }, [authState]);

  const login = async (email, password) => {
    try {
      console.log("🔐 [AuthContext] Calling API login...");
      
      // Call real API
      const data = await loginAdmin(email, password);
      
      console.log("✅ [AuthContext] API response:", data);
      
      // Set auth state with real data from backend
      setAuthState({
        token: data.token,
        role: 'admin', // Backend returns role in JWT
        user_id: data.user.id,
        user: data.user,
        restaurant_ids: []
      });
      
      console.log("✅ [AuthContext] Auth state updated");
    } catch (error) {
      console.error("❌ [AuthContext] Login error:", error);
      throw new Error(error.message || 'Email hoặc mật khẩu không đúng');
    }
  };

  const logout = () => {
    console.log("🚪 [AuthContext] Logging out...");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({ token: null, role: null, user_id: null, user: null, restaurant_ids: [] });
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
