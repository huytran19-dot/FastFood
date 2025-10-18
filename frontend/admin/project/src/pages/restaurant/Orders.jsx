import { useEffect, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../auth/AuthContext';
import {
  getMyRestaurant,
  getOrdersByRestaurant,
  getOrderItems,
  updateOrderStatus
} from '../../api/restaurant';

const STATUS_FLOW = {
  'PENDING': 'PAID',
  'PAID': 'PREPARING',
  'PREPARING': 'READY_FOR_DELIVERY',
  'READY_FOR_DELIVERY': 'DELIVERING',
  'DELIVERING': 'COMPLETED',
  'COMPLETED': null,
  'CANCELLED': null,
  'FAILED': null
};

export function RestaurantOrders() {
  const { user_id } = useAuth();
  const [restaurantId, setRestaurantId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { showToast } = useToast();

  const fetchData = async () => {
    if (!user_id) return;

    setIsLoading(true);
    try {
      const restaurant = await getMyRestaurant(user_id);
      setRestaurantId(restaurant.restaurant_id);
      const ordersData = await getOrdersByRestaurant(restaurant.restaurant_id);
      setOrders(ordersData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user_id]);

  const handleRowClick = async (order) => {
    setSelectedOrder(order);
    const items = await getOrderItems(order.order_id);
    setOrderItems(items);
    setIsDrawerOpen(true);
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const nextStatus = STATUS_FLOW[currentStatus];
    if (!nextStatus) {
      showToast('Không thể chuyển trạng thái tiếp theo', 'error');
      return;
    }

    try {
      await updateOrderStatus(orderId, nextStatus);
      showToast('Cập nhật trạng thái thành công', 'success');
      fetchData();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
      }
    } catch (error) {
      showToast('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      'PENDING': 'Đánh dấu đã thanh toán',
      'PAID': 'Bắt đầu chuẩn bị',
      'PREPARING': 'Sẵn sàng giao hàng',
      'READY_FOR_DELIVERY': 'Bắt đầu giao hàng',
      'DELIVERING': 'Hoàn tất',
      'COMPLETED': '',
      'CANCELLED': '',
      'FAILED': ''
    };
    return labels[currentStatus] || '';
  };

  const columns = [
    { key: 'order_id', header: 'Mã ĐH', sortable: true },
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
      header: 'Thời gian',
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
                <p className="text-sm text-gray-600">Khách hàng</p>
                <p className="font-medium text-gray-900">ID: {selectedOrder.customer_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <Badge status={selectedOrder.status} type="order" />
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
                <p className="font-medium text-gray-900">{selectedOrder.delivery_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng tiền</p>
                <p className="font-medium text-gray-900">{formatCurrency(selectedOrder.total_price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
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

            {STATUS_FLOW[selectedOrder.status] && (
              <button
                onClick={() => handleUpdateStatus(selectedOrder.order_id, selectedOrder.status)}
                className="w-full px-4 py-3 bg-[#FF4D4F] text-white rounded-lg hover:bg-[#ff3739] transition-colors font-medium"
              >
                {getNextStatusLabel(selectedOrder.status)}
              </button>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
