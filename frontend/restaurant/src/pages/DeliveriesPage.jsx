import { Rocket, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function DeliveriesPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl shadow-lg border-2 border-gray-200">
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center">
                  <Rocket className="h-12 w-12 text-blue-600" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Tính năng Giao Hàng Drone
                </h1>
                <p className="text-lg text-gray-600">
                  Đang trong quá trình phát triển
                </p>
              </div>

              {/* Description */}
              <div className="bg-blue-50 rounded-lg p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Chúng tôi đang phát triển hệ thống giao hàng bằng drone thông minh 
                      để mang đến trải nghiệm giao hàng nhanh chóng và hiện đại nhất.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features Coming Soon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Tính năng sắp ra mắt:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                      <span>Theo dõi drone thời gian thực</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                      <span>Quản lý đơn giao hàng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                      <span>Điều khiển drone từ xa</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Lợi ích:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                      <span>Giao hàng nhanh chóng</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                      <span>Tiết kiệm chi phí</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                      <span>Thân thiện môi trường</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Vui lòng quay lại sau để trải nghiệm tính năng mới này! 🚀
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
