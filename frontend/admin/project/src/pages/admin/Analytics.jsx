export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Phân tích</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng 14 ngày gần nhất</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Biểu đồ đường (mock data)
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo nhà hàng</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Biểu đồ cột (mock data)
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Phân bố trạng thái đơn hàng</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Biểu đồ tròn (mock data)
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Chỉ số hiệu suất</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Tỉ lệ đơn thành công</p>
              <p className="text-2xl font-semibold text-green-900">94.5%</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Thời gian giao trung bình</p>
              <p className="text-2xl font-semibold text-blue-900">18 phút</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Số lượt giao/drone/ngày</p>
              <p className="text-2xl font-semibold text-purple-900">12.3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
