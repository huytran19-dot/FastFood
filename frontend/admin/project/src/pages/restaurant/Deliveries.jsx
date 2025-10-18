import { useEffect, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { MapPlaceholder } from '../../components/map/MapPlaceholder';
import { useAuth } from '../../auth/AuthContext';
import { getMyRestaurant, getDeliveriesByRestaurant, getLastLocation } from '../../api/restaurant';
export function RestaurantDeliveries() {
  const { user_id } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchData = async () => {
    if (!user_id) return;

    setIsLoading(true);
    try {
      const restaurant = await getMyRestaurant(user_id);
      const deliveriesData = await getDeliveriesByRestaurant(restaurant.restaurant_id);
      setDeliveries(deliveriesData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user_id]);

  const handleRowClick = async (delivery) => {
    setSelectedDelivery(delivery);
    if (delivery.drone_id) {
      const location = await getLastLocation(delivery.drone_id);
      setLastLocation(location);
    } else {
      setLastLocation(null);
    }
    setIsDrawerOpen(true);
  };

  const columns = [
    { key: 'delivery_id', header: 'Mã GH', sortable: true },
    { key: 'order_id', header: 'Mã ĐH', sortable: true },
    { key: 'drone_id', header: 'Drone' },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (d) => <Badge status={d.status} type="delivery" />
    },
    {
      key: 'delivered_at',
      header: 'Thời gian giao',
      render: (d) => d.delivered_at ? new Date(d.delivered_at).toLocaleString('vi-VN') : 'Chưa giao'
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Giao hàng</h1>
        <div className="bg-white rounded-2xl shadow-md h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Giao hàng</h1>

      <DataTable data={deliveries} columns={columns} onRowClick={handleRowClick} />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Giao hàng #${selectedDelivery?.delivery_id}`}
      >
        {selectedDelivery && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="font-medium text-gray-900">#{selectedDelivery.order_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Drone</p>
                <p className="font-medium text-gray-900">#{selectedDelivery.drone_id || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Trạng thái</p>
                <Badge status={selectedDelivery.status} type="delivery" />
              </div>
              {selectedDelivery.delivered_at && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Thời gian giao</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedDelivery.delivered_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Timeline giao hàng</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    ['ASSIGNED', 'EN_ROUTE', 'DROPPED'].includes(selectedDelivery.status)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-700">Đã phân công</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    ['EN_ROUTE', 'DROPPED'].includes(selectedDelivery.status)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-700">Đang trên đường</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedDelivery.status === 'DROPPED' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-700">Đã giao hàng</span>
                </div>
              </div>
            </div>

            {selectedDelivery.start_location && selectedDelivery.end_location && (
              <MapPlaceholder
                startLocation={selectedDelivery.start_location}
                endLocation={selectedDelivery.end_location}
                isAnimating={selectedDelivery.status === 'EN_ROUTE'}
              />
            )}

            {lastLocation && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Vị trí hiện tại</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-blue-700">Vĩ độ</p>
                    <p className="font-mono text-blue-900">{lastLocation.latitude}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Kinh độ</p>
                    <p className="font-mono text-blue-900">{lastLocation.longitude}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Độ cao</p>
                    <p className="font-mono text-blue-900">{lastLocation.altitude}m</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Ghi nhận lúc</p>
                    <p className="text-blue-900">{new Date(lastLocation.recorded_at).toLocaleTimeString('vi-VN')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
