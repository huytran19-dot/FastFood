import { useEffect, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { getOrders, getRestaurants } from '../../api/admin';
import { getOrderItems } from '../../api/restaurant';
export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, restaurantsData] = await Promise.all([
        getOrders(),
        getRestaurants()
      ]);
      setOrders(ordersData);
      setRestaurants(restaurantsData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = async (order) => {
    setSelectedOrder(order);
    const items = await getOrderItems(order.order_id);
    setOrderItems(items);
    setIsDrawerOpen(true);
  };

  const getRestaurantName = (restaurantId) => {
    return restaurants.find(r => r.restaurant_id === restaurantId)?.name || 'N/A';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const columns = [
    { key: 'order_id', header: 'Mã đơn', sortable: true },
    {
      key: 'restaurant_id',
      header: 'Nhà hàng',
      render: (o) => getRestaurantName(o.restaurant_id)
    },
    { key: 'customer_id', header: 'Khách hàng' },
    {
      key: 'total_price',
      header: 'Tổng tiền',
      render: (o) => formatCurrency(o.total_price),
      sortable: true
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (o) => <Badge status={o.status} type="order" />
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      render: (o) => new Date(o.created_at).toLocaleString('vi-VN'),
      sortable: true
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Đơn hàng</h1>
        <div className="bg-white rounded-2xl shadow-md h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Đơn hàng</h1>

      <DataTable data={orders} columns={columns} onRowClick={handleRowClick} />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Đơn hàng #${selectedOrder?.order_id}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nhà hàng</p>
                <p className="font-medium text-gray-900">{getRestaurantName(selectedOrder.restaurant_id)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <Badge status={selectedOrder.status} type="order" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Khách hàng</p>
                <p className="font-medium text-gray-900">ID: {selectedOrder.customer_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng tiền</p>
                <p className="font-medium text-gray-900">{formatCurrency(selectedOrder.total_price)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
              <p className="font-medium text-gray-900">{selectedOrder.delivery_address}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Món ăn</h3>
              <div className="space-y-2">
                {orderItems.map(item => (
                  <div key={item.order_item_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Món #{item.item_id}</p>
                      {item.note && <p className="text-sm text-gray-600">{item.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">x{item.quantity}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
