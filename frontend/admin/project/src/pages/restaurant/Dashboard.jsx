import { useEffect, useState } from 'react';
import { ShoppingBag, Clock, TruckIcon, CheckCircle, Plane } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../auth/AuthContext';
import { getMyRestaurant, getOrdersByRestaurant, getDronesByRestaurant } from '../../api/restaurant';

export function RestaurantDashboard() {
  const { user_id } = useAuth();
  const [stats, setStats] = useState({
    todayOrders: 0,
    preparing: 0,
    delivering: 0,
    completed: 0,
    activeDrones: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user_id) return;

      try {
        const restaurant = await getMyRestaurant(user_id);
        const [orders, drones] = await Promise.all([
          getOrdersByRestaurant(restaurant.restaurant_id),
          getDronesByRestaurant(restaurant.restaurant_id)
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => o.created_at.startsWith(today));

        setStats({
          todayOrders: todayOrders.length,
          preparing: orders.filter(o => o.status === 'PREPARING').length,
          delivering: orders.filter(o => o.status === 'DELIVERING').length,
          completed: orders.filter(o => o.status === 'COMPLETED').length,
          activeDrones: drones.filter(d => d.status === 'ACTIVE').length
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user_id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Đơn mới hôm nay"
          value={stats.todayOrders}
          icon={ShoppingBag}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Đang chuẩn bị"
          value={stats.preparing}
          icon={Clock}
          iconColor="text-orange-600"
        />
        <StatCard
          title="Đang giao"
          value={stats.delivering}
          icon={TruckIcon}
          iconColor="text-purple-600"
        />
        <StatCard
          title="Đã hoàn tất"
          value={stats.completed}
          icon={CheckCircle}
          iconColor="text-green-600"
        />
        <StatCard
          title="Drone đang hoạt động"
          value={stats.activeDrones}
          icon={Plane}
          iconColor="text-blue-600"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu 7 ngày gần nhất</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Biểu đồ cột (mock data)
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 5 món bán chạy</h2>
        <div className="space-y-3">
          {['Burger Bò Phô Mai', 'Gà Rán Giòn', 'Khoai Tây Chiên', 'Coca Cola', 'Salad Rau Củ'].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">{item}</span>
              <span className="text-sm text-gray-600">{Math.floor(Math.random() * 50 + 20)} đơn</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
