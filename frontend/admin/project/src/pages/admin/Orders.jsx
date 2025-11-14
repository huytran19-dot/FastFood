import { useEffect, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/FormControls';
import { useToast } from '../../components/ui/Toast';
import { getOrders, getRestaurants, getDrones, assignOrderToDrone } from '../../api/admin';
import { getOrderItems } from '../../api/restaurant';
export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [drones, setDrones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('all');
  const [selectedDroneId, setSelectedDroneId] = useState('');
  const { showToast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [restaurantsData, dronesData] = await Promise.all([
        getRestaurants(),
        getDrones()
      ]);
      setRestaurants(restaurantsData);
      setDrones(dronesData || []);
      
      // Fetch orders with restaurant filter
      const restaurantId = selectedRestaurantId === 'all' ? null : selectedRestaurantId;
      const ordersData = await getOrders(restaurantId);
      setOrders(ordersData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRestaurantId]);

  const handleRowClick = async (order) => {
    setSelectedOrder(order);
    const items = await getOrderItems(order.order_id);
    setOrderItems(items);
    setIsDrawerOpen(true);
  };

  const getRestaurantName = (restaurantId) => {
    return restaurants.find(r => r.restaurant_id === restaurantId)?.name || 'N/A';
  };

  const handleAssignDrone = async () => {
    if (!selectedDroneId) {
      showToast('Vui lòng chọn drone', 'error');
      return;
    }

    try {
      await assignOrderToDrone(selectedOrder.order_id, selectedDroneId);
      showToast('Gán đơn hàng cho drone thành công', 'success');
      setIsAssignModalOpen(false);
      setSelectedDroneId('');
      fetchData(); // Refresh data
      setIsDrawerOpen(false); // Close drawer
    } catch (error) {
      showToast(error.message || 'Lỗi khi gán đơn hàng cho drone', 'error');
    }
  };

  const handleOpenAssignModal = (order) => {
    setSelectedOrder(order);
    setIsAssignModalOpen(true);
    setSelectedDroneId('');
  };

  // Get available drones (is_available = true)
  const availableDrones = drones.filter(d => d.is_available);

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
      key: 'assigned_drone',
      header: 'Drone được gán',
      render: (o) => o.assigned_drone 
        ? <span className="text-sm text-gray-700">{o.assigned_drone.model}</span>
        : <span className="text-sm text-gray-400">Chưa gán</span>
    },
    {
      key: 'created_at',
      header: 'Ngày tạo',
      render: (o) => new Date(o.created_at).toLocaleString('vi-VN'),
      sortable: true
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (o) => {
        // Only show assign button for orders that can be assigned (CONFIRMED, PREPARING)
        const canAssign = ['CONFIRMED', 'PREPARING'].includes(o.status);
        if (!canAssign) return null;
        
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenAssignModal(o);
            }}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Gán drone
          </button>
        );
      }
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Đơn hàng</h1>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">Lọc theo nhà hàng:</label>
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Tất cả nhà hàng</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.restaurant_id} value={restaurant.restaurant_id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
      </div>

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

            {/* Assign Drone Button */}
            {['CONFIRMED', 'PREPARING'].includes(selectedOrder.status) && (
              <div className="border-t pt-4">
                <button
                  onClick={() => handleOpenAssignModal(selectedOrder)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Gán đơn hàng cho drone
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Assign Drone Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedDroneId('');
        }} 
        title={`Gán đơn hàng #${selectedOrder?.order_id} cho drone`}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Chỉ có thể gán đơn hàng cho drone đang rảnh (Có thể sử dụng).
            </p>
          </div>

          <Select
            label="Chọn drone"
            value={selectedDroneId}
            onChange={(e) => setSelectedDroneId(e.target.value)}
            options={[
              { value: '', label: '-- Chọn drone --' },
              ...availableDrones.map(d => ({
                value: d.drone_id,
                label: `${d.model} (Pin: ${d.battery}%, Sức chứa: ${d.capacity}kg)`
              }))
            ]}
            required
          />

          {availableDrones.length === 0 && (
            <p className="text-sm text-red-600">
              Không có drone nào đang rảnh. Vui lòng đợi hoặc thêm drone mới.
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAssignDrone}
              disabled={!selectedDroneId || availableDrones.length === 0}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gán drone
            </button>
            <button
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedDroneId('');
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
