import { useEffect, useState } from 'react';
import { Users, Store, ShoppingBag, TruckIcon, DollarSign, Plane } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { getUsers, getRestaurants, getOrders, getDrones } from '../../api/admin';
export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    todayOrders: 0,
    deliveringOrders: 0,
    todayRevenue: 0,
    idleDrones: 0,
    activeDrones: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, restaurants, orders, drones] = await Promise.all([
          getUsers(),
          getRestaurants(),
          getOrders(),
          getDrones()
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => o.created_at.startsWith(today));
        const deliveringOrders = orders.filter(o => o.status === 'DELIVERING');
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total_price, 0);

        setStats({
          totalUsers: users.length,
          totalRestaurants: restaurants.length,
          todayOrders: todayOrders.length,
          deliveringOrders: deliveringOrders.length,
          todayRevenue,
          idleDrones: drones.filter(d => d.status === 'IDLE').length,
          activeDrones: drones.filter(d => d.status === 'EN_ROUTE').length
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Tổng quan</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
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
          title="Tổng người dùng"
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Tổng nhà hàng"
          value={stats.totalRestaurants}
          icon={Store}
          iconColor="text-green-600"
        />
        <StatCard
          title="Đơn hôm nay"
          value={stats.todayOrders}
          icon={ShoppingBag}
          iconColor="text-orange-600"
        />
        <StatCard
          title="Đang giao"
          value={stats.deliveringOrders}
          icon={TruckIcon}
          iconColor="text-purple-600"
        />
        <StatCard
          title="Doanh thu hôm nay"
          value={`${(stats.todayRevenue / 1000).toFixed(0)}K`}
          icon={DollarSign}
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Drone nhàn rỗi"
          value={stats.idleDrones}
          icon={Plane}
          iconColor="text-gray-600"
        />
        <StatCard
          title="Drone đang bay"
          value={stats.activeDrones}
          icon={Plane}
          iconColor="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng theo ngày</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Biểu đồ cột (mock data)
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo nhà hàng</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Biểu đồ tròn (mock data)
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái Drone</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-semibold text-gray-900">{stats.idleDrones}</p>
            <p className="text-sm text-gray-600 mt-1">IDLE</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-semibold text-blue-900">0</p>
            <p className="text-sm text-blue-600 mt-1">DISPATCHING</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-semibold text-purple-900">{stats.activeDrones}</p>
            <p className="text-sm text-purple-600 mt-1">EN_ROUTE</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-2xl font-semibold text-amber-900">1</p>
            <p className="text-sm text-amber-600 mt-1">RETURNING</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-semibold text-red-900">0</p>
            <p className="text-sm text-red-600 mt-1">INACTIVE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
