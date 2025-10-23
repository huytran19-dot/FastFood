import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Plane, Mail, Lock } from 'lucide-react';
import { Input } from '../../components/ui/FormControls';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      
      // Admin app only - redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF4D4F] via-[#ff6b6d] to-[#00B8A9] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF4D4F] to-[#00B8A9] rounded-2xl mb-4">
            <Plane className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">FastFood Drone Delivery</h1>
          <p className="text-gray-600 mt-2">Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#FF4D4F] to-[#ff6b6d] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">Tài khoản demo Admin:</p>
          <div className="mt-3 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">Admin</p>
              <p className="text-gray-600">admin@fastfood.com / admin123</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            Chủ nhà hàng vui lòng đăng nhập tại <br/>
            <a href="http://localhost:5175" target="_blank" rel="noopener noreferrer" className="font-medium text-[#FF4D4F] hover:underline">
              http://localhost:5175
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
