import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  CreditCard,
  Plane,
  TruckIcon,
  BarChart3,
  Menu,
  UtensilsCrossed,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useState } from 'react';

export function Sidebar() {
  const { role } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { to: '/admin/users', icon: Users, label: 'Người dùng' },
    { to: '/admin/restaurants', icon: Store, label: 'Nhà hàng' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Đơn hàng' },
    { to: '/admin/payments', icon: CreditCard, label: 'Thanh toán' },
    { to: '/admin/drones', icon: Plane, label: 'Drone' },
    { to: '/admin/deliveries', icon: TruckIcon, label: 'Giao hàng' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Phân tích' }
  ];

  const restaurantLinks = [
    { to: '/restaurant/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { to: '/restaurant/menu', icon: UtensilsCrossed, label: 'Thực đơn' },
    { to: '/restaurant/orders', icon: ShoppingBag, label: 'Đơn hàng' },
    { to: '/restaurant/drones', icon: Plane, label: 'Drone' },
    { to: '/restaurant/deliveries', icon: TruckIcon, label: 'Giao hàng' },
    { to: '/restaurant/profile', icon: User, label: 'Hồ sơ' }
  ];

  const links = role === 'admin' ? adminLinks : restaurantLinks;

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF4D4F] to-[#00B8A9] rounded-xl flex items-center justify-center">
            <Plane className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">FastFood Drone</h1>
            <p className="text-xs text-gray-500">
              {role === 'admin' ? 'Quản trị' : 'Nhà hàng'}
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#FF4D4F] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <link.icon size={20} />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
