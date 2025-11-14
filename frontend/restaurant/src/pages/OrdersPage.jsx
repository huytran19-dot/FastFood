import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck,
  User,
  MapPin,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Eye,
  ChevronDown,
  Package,
  Radio
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { orderAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    badgeColor: 'bg-yellow-500'
  },
  preparing: {
    label: 'Đang chuẩn bị',
    color: 'bg-blue-100 text-blue-800',
    icon: Package,
    badgeColor: 'bg-blue-500'
  },
  ready: {
    label: 'Sẵn sàng giao',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle,
    badgeColor: 'bg-purple-500'
  },
  assigned: {
    label: 'Đã gán đơn',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    badgeColor: 'bg-green-500'
  },
  delivering: {
    label: 'Đang giao',
    color: 'bg-orange-100 text-orange-800',
    icon: Truck,
    badgeColor: 'bg-orange-500'
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    badgeColor: 'bg-green-500'
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    badgeColor: 'bg-red-500'
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAll(selectedStatus);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách đơn hàng',
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    if (!searchTerm) {
      return matchesStatus;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      String(order.id || '').toLowerCase().includes(searchLower) ||
      (order.customerName || '').toLowerCase().includes(searchLower) ||
      (order.customerPhone || '').includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    assigned: orders.filter(o => o.status === 'assigned').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật trạng thái đơn hàng',
      });
      // Refresh orders list
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái đơn hàng',
      });
    }
  };

  const handleViewDetail = async (order) => {
    try {
      // Fetch full order detail from API
      const data = await orderAPI.getById(order.id);
      setSelectedOrder(data.order);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      // Fallback to using order from list
      setSelectedOrder(order);
      setIsDetailModalOpen(true);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải chi tiết đơn hàng',
      });
    }
  };

  const StatusBadge = ({ status }) => {
    const config = statusConfig[status] || {
      label: status || 'Unknown',
      color: 'bg-gray-100 text-gray-800',
      icon: Clock,
      badgeColor: 'bg-gray-500'
    };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Đơn Hàng</h1>
        <p className="mt-2 text-gray-600">
          Xem và xử lý đơn hàng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card 
          className={`cursor-pointer transition-all ${selectedStatus === 'all' ? 'ring-2 ring-gray-500' : 'hover:shadow-md'}`}
          onClick={() => setSelectedStatus('all')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Tất cả</p>
              <p className="text-2xl font-bold mt-1">{stats.all}</p>
            </div>
          </CardContent>
        </Card>

        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-all ${selectedStatus === key ? 'ring-2 ring-' + key : 'hover:shadow-md'}`}
              onClick={() => setSelectedStatus(key)}
            >
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="flex justify-center">
                    <div className={`p-2 rounded-full ${config.badgeColor} bg-opacity-20`}>
                      <Icon className={`h-5 w-5 ${config.color.split(' ')[1]}`} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{config.label}</p>
                  <p className="text-xl font-bold">{stats[key]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải đơn hàng...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      {!loading && (
        <div className="space-y-4">
          {filteredOrders.map(order => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">#{order.id}</h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatTime(order.orderTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="text-2xl font-bold text-orange-600">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span>{order.customerAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Món ăn:</p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  {order.note && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                      <span className="font-medium">Ghi chú:</span> {order.note}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleViewDetail(order)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    Chi tiết
                  </button>

                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Xác nhận & Bắt đầu chuẩn bị
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <XCircle className="h-4 w-4" />
                        Hủy đơn
                      </button>
                    </>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'ready')}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Sẵn sàng giao
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                      <Radio className="h-4 w-4" />
                      <span>Vui lòng qua <strong>Điều Khiển Drone</strong> để gán đơn cho drone</span>
                    </div>
                  )}

                  {order.status === 'delivering' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Hoàn thành
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có đơn hàng
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Không tìm thấy đơn hàng phù hợp' : 'Chưa có đơn hàng nào'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <StatusBadge status={selectedOrder.status} />
            </div>

            {/* Customer Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{selectedOrder.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{selectedOrder.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span>{selectedOrder.customerAddress}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Chi tiết món ăn</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="font-bold text-gray-600">{item.quantity}x</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            {selectedOrder.note && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Ghi chú</h3>
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">{selectedOrder.note}</p>
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="font-bold text-orange-600">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Thời gian đặt:</span>
                <span>{formatTime(selectedOrder.orderTime)}</span>
              </div>
              {selectedOrder.deliveryTime && (
                <div className="flex items-center justify-between">
                  <span>Thời gian giao:</span>
                  <span>{formatTime(selectedOrder.deliveryTime)}</span>
                </div>
              )}
              {selectedOrder.completedTime && (
                <div className="flex items-center justify-between">
                  <span>Hoàn thành lúc:</span>
                  <span>{formatTime(selectedOrder.completedTime)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
