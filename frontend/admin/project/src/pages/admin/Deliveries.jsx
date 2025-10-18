import { useEffect, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { MapPlaceholder } from '../../components/map/MapPlaceholder';
import { getDeliveries } from '../../api/admin';
import { getLastLocation } from '../../api/restaurant';
export function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const data = await getDeliveries();
        setDeliveries(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

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
    { key: 'delivery_id', header: 'Mã giao hàng', sortable: true },
    { key: 'order_id', header: 'Mã đơn', sortable: true },
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
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <Badge status={selectedDelivery.status} type="delivery" />
              </div>
              {selectedDelivery.delivered_at && (
                <div>
                  <p className="text-sm text-gray-600">Thời gian giao</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedDelivery.delivered_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
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
