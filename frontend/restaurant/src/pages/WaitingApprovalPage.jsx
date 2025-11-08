import { useEffect, useState } from 'react';
import { Clock, AlertCircle, Phone, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WaitingApprovalPage() {
  const navigate = useNavigate();
  const [pendingRestaurant, setPendingRestaurant] = useState(null);

  useEffect(() => {
    document.title = 'Đang chờ duyệt - FastFood Restaurant';
    
    // Lấy thông tin nhà hàng từ localStorage (đã lưu khi đăng ký hoặc login)
    const savedRestaurant = localStorage.getItem('pendingRestaurant');
    if (savedRestaurant) {
      setPendingRestaurant(JSON.parse(savedRestaurant));
    }
    
    // Đảm bảo xóa token và session vì trang này không yêu cầu đăng nhập
    localStorage.removeItem('token');
    localStorage.removeItem('restaurant');
  }, []);

  const handleBackToLogin = () => {
    localStorage.removeItem('pendingRestaurant');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Card chính */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          {/* Tiêu đề */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Đang chờ duyệt
          </h1>

          {/* Thông tin nhà hàng */}
          {pendingRestaurant && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">
                Thông tin nhà hàng đã đăng ký:
              </h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Tên nhà hàng:</span> {pendingRestaurant.name}</p>
                <p><span className="font-medium">Địa chỉ:</span> {pendingRestaurant.address}</p>
                <p><span className="font-medium">Số điện thoại:</span> {pendingRestaurant.phone}</p>
              </div>
            </div>
          )}

          {/* Thông báo */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Đơn đăng ký của bạn đang được xem xét
                </h3>
                <p className="text-yellow-800 text-sm leading-relaxed">
                  Đội ngũ quản trị viên của chúng tôi đang xem xét thông tin nhà hàng của bạn. 
                  Quá trình này thường mất từ 24-48 giờ làm việc. Chúng tôi sẽ thông báo cho bạn 
                  qua email ngay khi có kết quả.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Quy trình duyệt:</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                  <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                </div>
                <div className="pb-8">
                  <p className="font-medium text-gray-900">Đăng ký thành công</p>
                  <p className="text-sm text-gray-600">Thông tin đã được gửi đến hệ thống</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                </div>
                <div className="pb-8">
                  <p className="font-medium text-gray-900">Đang xem xét</p>
                  <p className="text-sm text-gray-600">Admin đang kiểm tra thông tin</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Hoàn tất</p>
                  <p className="text-sm text-gray-400">Nhận kết quả qua email</p>
                </div>
              </div>
            </div>
          </div>

          {/* Liên hệ hỗ trợ */}
          <div className="border-t pt-6">
            <p className="text-center text-gray-600 mb-4">
              Cần hỗ trợ? Liên hệ với chúng tôi:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a
                href="tel:1900xxxx"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="font-medium">1900 xxxx</span>
              </a>
              <a
                href="mailto:support@fastfood.vn"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="font-medium">support@fastfood.vn</span>
              </a>
            </div>

            {/* Action button */}
            <button
              onClick={handleBackToLogin}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại đăng nhập
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Bạn có thể đóng trang này. Chúng tôi sẽ gửi email thông báo kết quả.
        </p>
      </div>
    </div>
  );
}
