import { useState, useEffect } from 'react';
import { 
  Radio,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Phone,
  ShoppingBag,
  Calendar,
  Search,
  Send,
  AlertCircle,
  Play,
  Map
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderAPI, droneAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import DroneTrackingMap from '@/components/drone/DroneTrackingMap';

const statusConfig = {
  ready: {
    label: 'Sẵn sàng giao',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle,
  },
  assigned: {
    label: 'Đã gán đơn',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  preparing: {
    label: 'Đang chuẩn bị',
    color: 'bg-blue-100 text-blue-800',
    icon: Package,
  }
};

export default function DroneControlPage() {
  const [drones, setDrones] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDroneId, setSelectedDroneId] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [trackingOrders, setTrackingOrders] = useState(new Set()); // Orders being tracked
  const [orderDistances, setOrderDistances] = useState({}); // Order distances
  const { toast } = useToast();

  // Fetch drones and orders
  const fetchData = async () => {
    try {
      setLoading(true);
      const [dronesData, ordersData] = await Promise.all([
        droneAPI.getAvailableDrones(),
        orderAPI.getAll('all')
      ]);
      
      setDrones(dronesData.drones || []);
      
      // Filter orders that are ready for delivery or already assigned
      // Show both 'ready' (chưa gán) and 'assigned' (đã gán) orders
      const assignableOrders = (ordersData.orders || []).filter(order => 
        order.status === 'ready' || order.status === 'assigned'
      );
      setOrders(assignableOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenAssignModal = (order) => {
    setSelectedOrder(order);
    setSelectedDroneId('');
    setIsAssignModalOpen(true);
  };

  const handleAssignDrone = async () => {
    if (!selectedDroneId) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Vui lòng chọn drone',
      });
      return;
    }

    try {
      await droneAPI.assignOrderToDrone(selectedOrder.id, selectedDroneId);
      toast({
        variant: 'default',
        title: 'Thành công',
        description: 'Gán đơn hàng cho drone thành công',
      });
      setIsAssignModalOpen(false);
      setSelectedOrder(null);
      setSelectedDroneId('');
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể gán đơn hàng cho drone',
      });
    }
  };

  const handleStartDelivery = async (order) => {
    try {
      await droneAPI.startDelivery(order.id);
      toast({
        variant: 'default',
        title: 'Thành công',
        description: 'Đã bắt đầu giao hàng',
      });
      
      // Add to tracking orders
      setTrackingOrders(prev => new Set(prev).add(order.id));
      
      // Start tracking on map after a short delay to ensure map is rendered
      setTimeout(() => {
        if (window.droneTrackingRefs && window.droneTrackingRefs[order.id]) {
          window.droneTrackingRefs[order.id].startTracking();
        }
      }, 500);
      
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể bắt đầu giao hàng',
      });
    }
  };

  const handleDistanceUpdate = (orderId, distance) => {
    setOrderDistances(prev => ({
      ...prev,
      [orderId]: distance
    }));
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      String(order.id || '').toLowerCase().includes(searchLower) ||
      (order.customerName || '').toLowerCase().includes(searchLower) ||
      (order.customerPhone || '').includes(searchTerm)
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Điều Khiển Drone</h1>
        <p className="mt-2 text-gray-600">
          Quản lý và gán đơn hàng cho drone giao hàng
        </p>
      </div>

      {/* Available Drones Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Radio className="h-5 w-5 text-green-600" />
              Drone Có Sẵn
            </h2>
          </div>
          {loading ? (
            <div className="text-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          ) : drones.length === 0 ? (
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Không có drone nào có sẵn</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {drones.map(drone => (
                <div 
                  key={drone.drone_id} 
                  className="border-2 border-green-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">{drone.model}</h3>
                      <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium whitespace-nowrap">
                        Rảnh
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span>Sức chứa: <strong>{drone.capacity} kg</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'Không tìm thấy đơn hàng' : 'Không có đơn hàng nào có thể gán'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map(order => {
              const statusInfo = statusConfig[order.status] || statusConfig.ready;
              const StatusIcon = statusInfo.icon;
              
              return (
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
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </span>
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
                            <span className="font-medium">Khách hàng:</span>
                            <span>{order.customerName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">SĐT:</span>
                            <span>{order.customerPhone || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Địa chỉ:</span>
                            <span className="truncate">{order.customerAddress || order.deliveryAddress || 'N/A'}</span>
                          </div>
                          {order.drone_model && (
                            <div className="flex items-center gap-2 text-sm">
                              <Radio className="h-4 w-4 text-green-600" />
                              <span className="font-medium">Drone:</span>
                              <span className="text-green-700 font-semibold">{order.drone_model}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Drone Tracking Map - Show if order has drone assigned */}
                      {order.drone_id && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Map className="h-5 w-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">
                              {trackingOrders.has(order.id) ? 'Theo dõi Drone Real-time' : 'Bản đồ Drone'}
                            </h4>
                          </div>
                          <DroneTrackingMap
                            key={`map-${order.id}-${trackingOrders.has(order.id)}`}
                            droneId={order.drone_id}
                            orderId={order.id}
                            onDistanceUpdate={(distance) => handleDistanceUpdate(order.id, distance)}
                            destinationLat={10.8231} // TODO: Get from order/restaurant coordinates
                            destinationLng={106.6297}
                            autoStart={trackingOrders.has(order.id)}
                          />
                          {orderDistances[order.id] !== undefined && (
                            <div className="mt-2 text-sm font-semibold text-orange-600">
                              Khoảng cách còn lại: {orderDistances[order.id].toFixed(2)} km
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-3 flex-wrap">
                        {order.status === 'assigned' && order.drone_model && (
                          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                            ✓ Đã gán cho {order.drone_model}
                          </div>
                        )}
                        {order.status === 'assigned' && order.drone_model && !trackingOrders.has(order.id) && (
                          <Button
                            onClick={() => handleStartDelivery(order)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Bắt đầu bay
                          </Button>
                        )}
                        <Button
                          onClick={() => handleOpenAssignModal(order)}
                          className={`${order.status === 'assigned' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {order.status === 'assigned' ? 'Đổi Drone' : 'Gán Drone'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Assign Drone Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedOrder(null);
          setSelectedDroneId('');
        }}
        title={`Gán Drone cho Đơn Hàng #${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Khách hàng:</span>
                <span className="font-medium">{selectedOrder.customerName || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="font-medium text-orange-600">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Địa chỉ giao:</span>
                <span className="font-medium text-right">{selectedOrder.customerAddress || selectedOrder.deliveryAddress || 'N/A'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Drone
              </label>
              <Select value={selectedDroneId} onValueChange={setSelectedDroneId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn drone để gán đơn hàng" />
                </SelectTrigger>
                <SelectContent>
                  {drones.map(drone => (
                    <SelectItem key={drone.drone_id} value={String(drone.drone_id)}>
                      {drone.model} - Sức chứa: {drone.capacity}kg
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAssignDrone}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!selectedDroneId}
              >
                <Send className="h-4 w-4 mr-2" />
                Xác Nhận Gán
              </Button>
              <Button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedOrder(null);
                  setSelectedDroneId('');
                }}
                variant="outline"
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

