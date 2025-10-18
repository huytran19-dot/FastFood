import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { Input, Textarea } from '../../components/ui/FormControls';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../auth/AuthContext';
import { getMyRestaurant, updateMyRestaurant, getDronesByRestaurant } from '../../api/restaurant';
export function RestaurantProfile() {
  const { user_id } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [droneCount, setDroneCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    address: ''
  });

  const { showToast } = useToast();

  const fetchData = async () => {
    if (!user_id) return;

    setIsLoading(true);
    try {
      const restaurantData = await getMyRestaurant(user_id);
      setRestaurant(restaurantData);
      setFormData({
        name: restaurantData.name,
        description: restaurantData.description || '',
        phone: restaurantData.phone || '',
        address: restaurantData.address || ''
      });

      const drones = await getDronesByRestaurant(restaurantData.restaurant_id);
      setDroneCount(drones.length);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user_id) return;

    setIsSaving(true);
    try {
      await updateMyRestaurant(user_id, formData);
      showToast('Lưu thay đổi thành công', 'success');
      fetchData();
    } catch (error) {
      showToast('Lỗi khi lưu thay đổi', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Hồ sơ nhà hàng</h1>
        <div className="bg-white rounded-2xl shadow-md h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Hồ sơ nhà hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF4D4F] to-[#00B8A9] rounded-xl flex items-center justify-center">
                <Store className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Thông tin nhà hàng</h2>
                <p className="text-sm text-gray-600">Cập nhật thông tin của bạn</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Tên nhà hàng"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Textarea
                label="Mô tả"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />

              <Input
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />

              <button
                type="submit"
                disabled={isSaving}
                className="w-full px-4 py-2 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin tổng quan</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Mã nhà hàng</p>
                <p className="font-medium text-gray-900">#{restaurant?.restaurant_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Đánh giá</p>
                <p className="font-medium text-gray-900">{restaurant?.rating || 'N/A'} / 5.0</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  restaurant?.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {restaurant?.status === 1 ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="font-medium text-gray-900">
                  {restaurant?.created_at ? new Date(restaurant.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Drone của bạn</h3>
            <div className="text-center py-6">
              <p className="text-4xl font-bold text-[#FF4D4F]">{droneCount}</p>
              <p className="text-sm text-gray-600 mt-2">Tổng số drone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
