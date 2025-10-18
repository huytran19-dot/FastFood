import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
            <User size={18} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
