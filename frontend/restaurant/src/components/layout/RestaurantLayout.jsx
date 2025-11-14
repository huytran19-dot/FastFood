import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChevronDown,
  Radio
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function RestaurantLayout({ children }) {
  const { user, restaurant, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Bảng Điều Khiển',
      href: '/restaurant/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Quản Lý Đơn Hàng',
      href: '/restaurant/orders',
      icon: ShoppingCart
    },
    {
      name: 'Điều Khiển Drone',
      href: '/restaurant/drones',
      icon: Radio
    },
    {
      name: 'Quản Lý Menu',
      href: '/restaurant/menu',
      icon: Package
    },
    {
      name: 'Quản Lý Danh Mục',
      href: '/restaurant/categories',
      icon: Package
    }
    // Deliveries menu item temporarily disabled - feature under development
    // {
    //   name: 'Giao Hàng',
    //   href: '/restaurant/deliveries',
    //   icon: Truck
    // }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo & Restaurant Info */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none mr-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <Link to="/restaurant/dashboard" className="flex items-center gap-3">
                <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-lg font-bold text-gray-900">
                    {restaurant?.name || 'FastFood'}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      restaurant?.review_status === 'APPROVED' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {restaurant?.review_status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{restaurant?.address || 'Trần Hưng Đạo'}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Center - Navigation (Desktop) */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center gap-4">
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || 'Chủ FastFood'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/restaurant/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" />
                      Thông Tin Cá Nhân
                    </Link>
                    <Link
                      to="/restaurant/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Store className="h-4 w-4" />
                      Thông Tin Nhà Hàng
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng Xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium ${
                      active
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Click outside to close dropdowns */}
      {(isProfileDropdownOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}
