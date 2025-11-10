import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, authAPI } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Load cart khi component mount hoặc authentication status thay đổi
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated) {
        try {
          const cartData = await cartAPI.getCart();
          setCart(cartData);
        } catch (error) {
          console.error('Failed to load cart:', error);
          // Nếu lỗi 401 hoặc user không tồn tại, clear cart và token
          if (error.message.includes('401') || error.message.includes('không tồn tại')) {
            setCart({ items: [], total: 0, itemCount: 0 });
            // Clear invalid token
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        }
      } else {
        // Clear cart khi logout
        setCart({ items: [], total: 0, itemCount: 0 });
      }
    };

    loadCart();
  }, [isAuthenticated]); // Thêm dependency để reload khi auth status thay đổi

  // Thêm món vào giỏ hàng
  const addToCart = async (menuItemId, quantity = 1) => {
    if (!authAPI.isAuthenticated()) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để thêm món vào giỏ hàng",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const updatedCart = await cartAPI.addToCart(menuItemId, quantity);
      setCart(updatedCart);
      toast({
        title: "Đã thêm vào giỏ hàng",
        description: "Món ăn đã được thêm vào giỏ hàng của bạn",
      });
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm món vào giỏ hàng",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng
  const updateQuantity = async (cartItemId, quantity) => {
    if (!authAPI.isAuthenticated()) {
      return false;
    }

    setLoading(true);
    try {
      const updatedCart = await cartAPI.updateQuantity(cartItemId, quantity);
      setCart(updatedCart);
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật số lượng",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xóa món
  const removeItem = async (cartItemId) => {
    if (!authAPI.isAuthenticated()) {
      return false;
    }

    setLoading(true);
    try {
      const updatedCart = await cartAPI.removeItem(cartItemId);
      setCart(updatedCart);
      toast({
        title: "Đã xóa",
        description: "Món ăn đã được xóa khỏi giỏ hàng",
      });
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa món",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!authAPI.isAuthenticated()) {
      return false;
    }

    setLoading(true);
    try {
      await cartAPI.clearCart();
      setCart({ items: [], total: 0, itemCount: 0 });
      toast({
        title: "Đã xóa giỏ hàng",
        description: "Giỏ hàng của bạn đã được làm trống",
      });
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa giỏ hàng",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart
  const refreshCart = async () => {
    if (!authAPI.isAuthenticated()) {
      setCart({ items: [], total: 0, itemCount: 0 });
      return;
    }

    try {
      const cartData = await cartAPI.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
