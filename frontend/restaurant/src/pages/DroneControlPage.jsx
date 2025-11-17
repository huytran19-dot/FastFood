import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  Package,
  CheckCircle,
  Clock,
  Search,
  Send,
  AlertCircle,
  Play
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderAPI, droneAPI } from '../lib/api';
import { restaurantAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import DroneTrackingMap from '@/components/drone/DroneTrackingMap';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const statusConfig = {
  confirmed: {
    label: 'Sẵn sàng giao',
    color: 'bg-purple-100 text-purple-800',
    icon: CheckCircle,
  },
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
  },
  delivering: {
    label: 'Đang giao',
    color: 'bg-orange-100 text-orange-800',
    icon: Send,
  },
  waiting_otp: {
    label: 'Chờ OTP',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  returning: {
    label: 'Đang bay về',
    color: 'bg-cyan-100 text-cyan-800',
    icon: Send,
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  }
};

// Helper functions to parse customer coordinates from address (format: "address, lat, lng")
const parseCustomerLat = (address) => {
  if (!address) return null;
  const parts = address.split(',');
  if (parts.length < 3) return null; // Need at least: address, lat, lng
  const lat = parseFloat(parts[parts.length - 2].trim());
  const isValid = !isNaN(lat) && lat >= -90 && lat <= 90;
  return isValid ? lat : null;
};

const parseCustomerLng = (address) => {
  if (!address) return null;
  const parts = address.split(',');
  if (parts.length < 3) return null; // Need at least: address, lat, lng
  const lng = parseFloat(parts[parts.length - 1].trim());
  const isValid = !isNaN(lng) && lng >= -180 && lng <= 180;
  return isValid ? lng : null;
};

// Helper function to remove coordinates from address for display
const removeCoordinatesFromAddress = (address) => {
  if (!address) return 'N/A';
  const parts = address.split(',');
  if (parts.length < 3) return address; // Need at least 3 parts to have coordinates
  
  // Check if last two parts are coordinates
  const lat = parseFloat(parts[parts.length - 2].trim());
  const lng = parseFloat(parts[parts.length - 1].trim());
  
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    // Remove last two parts (coordinates)
    return parts.slice(0, -2).join(',').trim();
  }
  
  return address;
};

export default function DroneControlPage() {
  const [drones, setDrones] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState(null); // Restaurant coordinates
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedDroneId, setSelectedDroneId] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [trackingOrders, setTrackingOrders] = useState(new Set()); // Orders being tracked
  const [orderDistances, setOrderDistances] = useState({}); // Order distances
  const { toast } = useToast();

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {});

    // Listen for drone status updates (when drone is assigned)
    socket.on('drone:status:update', (data) => {
      // Update drone status in real-time
      setDrones(prevDrones => {
        const updated = prevDrones.map(drone => {
          // Convert both to number for comparison to avoid type mismatch
          if (Number(drone.id) === Number(data.droneId)) {
            return { ...drone, status: data.status };
          }
          return drone;
        });
        return updated;
      });

      // Show toast notification
      if (data.status === 'assigned') {
        toast({
          title: '✅ Đã gán drone',
          description: `${data.model} đã được gán cho đơn #${data.orderNumber}`,
          duration: 3000,
        });
      }
    });

    // Listen for drone position updates (for map tracking)
    socket.on('drone:update', (data) => {
      console.log('🛸 Drone position update:', data);
      // Update will be handled by DroneTrackingMap via Socket.IO
      // This is just for logging
    });

    // Listen for order updates
    socket.on('order:update', (data) => {
      console.log('📦 Order update received:', data);
      
      // Store toast data to show after state update
      let shouldShowToast = false;
      let toastData = null;
      let shouldRemoveOrder = false;
      
      // Update orders list
      setOrders(prevOrders => {
        return prevOrders
          .map(order => {
            if (order.id === data.orderId || order.id === parseInt(data.orderId)) {
              // Update order with new status
              const updatedOrder = { ...order };
              
              if (data.status === 'DELIVERING' && data.delivery_otp) {
                updatedOrder.status = 'delivering';
                updatedOrder.delivery_otp = data.delivery_otp;
                
                // Mark for toast
                shouldShowToast = true;
                toastData = {
                  title: '🚁 Drone đang bay!',
                  description: `Đơn #${order.id} - Mã OTP: ${data.delivery_otp}`,
                  duration: 10000,
                };
              } else if (data.status === 'WAITING_OTP') {
                updatedOrder.status = 'waiting_otp';
                updatedOrder.delivery_otp = data.delivery_otp;
                
                // Mark for toast
                shouldShowToast = true;
                toastData = {
                  title: '🎯 Drone đã đến!',
                  description: `Đơn #${order.id} - Mã OTP: ${data.delivery_otp}`,
                  duration: 10000,
                };
              } else if (data.status === 'COMPLETED' && data.droneStatus === 'returning') {
                // Keep order visible while drone is returning - user wants to see it on map
                updatedOrder.status = 'returning';
                updatedOrder.delivery_otp = null; // Clear OTP
                
                // Mark for toast
                shouldShowToast = true;
                toastData = {
                  title: '✅ Giao hàng thành công!',
                  description: `Đơn #${order.id} - Drone đang bay về nhà hàng`,
                  duration: 5000,
                };
              } else if (data.status === 'COMPLETED' && data.droneStatus?.toLowerCase() === 'idle') {
                // NOW remove order - drone has returned to restaurant
                shouldRemoveOrder = true;
                
                // Mark for toast
                shouldShowToast = true;
                toastData = {
                  title: '✅ Drone đã về nhà hàng',
                  description: `Đơn #${order.id} hoàn tất - Drone sẵn sàng cho đơn tiếp theo`,
                  duration: 5000,
                };
                
                // Return null to filter out
                return null;
              } else if (data.status === 'DELIVERING') {
                updatedOrder.status = 'delivering';
              }
              
              return updatedOrder;
            }
            return order;
          })
          .filter(order => order !== null); // Remove null entries (completed/returning orders)
      });
      
      // Show toast AFTER state update
      if (shouldShowToast && toastData) {
        toast(toastData);
      }
    });

    socket.on('disconnect', () => {});

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  // Fetch drones and orders
  const fetchData = async () => {
    try {
      setLoading(true);
      const [dronesData, ordersData, restaurantData] = await Promise.all([
        droneAPI.getAvailableDrones(),
        orderAPI.getAll('all'),
        restaurantAPI.getMine()
      ]);
      
      setDrones(dronesData.drones || []);
      
      // API returns restaurant directly, not wrapped in {restaurant: ...}
      const restaurant = restaurantData || null;
      setRestaurantInfo(restaurant);
      
      // Filter orders that are ready for delivery or in delivery process
      // Include 'returning' so user can see drone flying back on map
      // Exclude 'completed' as those are done
      const deliverableOrders = (ordersData.orders || []).filter(order => 
        ['ready', 'confirmed', 'assigned', 'delivering', 'waiting_otp', 'returning'].includes(order.status)
      );
      
      setOrders(deliverableOrders);
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
      // Direct API call instead of using droneAPI object
      const token = localStorage.getItem('authToken');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/restaurant/orders/${selectedOrder.id}/assign-drone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ drone_id: selectedDroneId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      toast({
        variant: 'default',
        title: 'Thành công',
        description: 'Gán đơn hàng cho drone thành công',
      });
      setIsAssignModalOpen(false);
      setSelectedOrder(null);
      setSelectedDroneId('');
      
      // Refresh data immediately to get updated status from DB
      fetchData();
    } catch (error) {
      console.error('❌ Assign error:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể gán đơn hàng cho drone',
      });
    }
  };

  const handleStartDelivery = async (order) => {
    try {
      // Direct API call
      const token = localStorage.getItem('authToken');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/restaurant/orders/${order.id}/start-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }
      
      // Update order in state with OTP from response
      if (data.data?.delivery_otp) {
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === order.id 
              ? { ...o, status: 'delivering', delivery_otp: data.data.delivery_otp }
              : o
          )
        );
      }
      
      toast({
        variant: 'default',
        title: 'Thành công',
        description: `Đã bắt đầu giao hàng - OTP: ${data.data?.delivery_otp || 'N/A'}`,
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
      console.error('❌ Start delivery error:', error);
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
            <h2 className="text-xl font-semibold">Drone Có Sẵn</h2>
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
              {drones.map(drone => {
                // Map status to Vietnamese display
                const statusMap = {
                  'idle': { text: 'Rảnh', color: 'bg-green-100 text-green-700' },
                  'assigned': { text: 'Đã gán đơn', color: 'bg-blue-100 text-blue-700' },
                  'delivering': { text: 'Đang giao', color: 'bg-orange-100 text-orange-700' },
                  'waiting_otp': { text: 'Chờ OTP', color: 'bg-purple-100 text-purple-700' },
                  'returning': { text: 'Đang về', color: 'bg-yellow-100 text-yellow-700' }
                };
                const droneStatus = statusMap[drone.status?.toLowerCase()] || statusMap['idle'];

                return (
                  <div 
                    key={drone.id} 
                    className="border-2 border-green-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-gray-900">{drone.model}</h3>
                        <div className={`px-2 py-1 ${droneStatus.color} rounded-full text-xs font-medium whitespace-nowrap`}>
                          {droneStatus.text}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>Sức chứa: <strong>{drone.capacity} kg</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">#{order.id}</h3>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
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
                          <div className="text-sm">
                            <span className="font-medium">Khách hàng:</span>
                            <span className="ml-2">{order.customerName || 'N/A'}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">SĐT:</span>
                            <span className="ml-2">{order.customerPhone || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Địa chỉ:</span>
                            <span className="ml-2 truncate">{removeCoordinatesFromAddress(order.customerAddress || order.deliveryAddress)}</span>
                          </div>
                          {order.drone_model && (
                            <div className="text-sm">
                              <span className="font-medium">Drone:</span>
                              <span className="ml-2 text-green-700 font-semibold">{order.drone_model}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Drone Tracking Map - Show if order has drone assigned */}
                      {order.drone_id && (
                          <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-lg p-4 border border-blue-100">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {trackingOrders.has(order.id) ? '🛰️ Theo dõi Real-time' : '📍 Bản đồ Drone'}
                              </h4>
                            </div>
                            {trackingOrders.has(order.id) && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-green-700">Đang bay</span>
                              </div>
                            )}
                          </div>
                          <DroneTrackingMap
                            key={`map-${order.id}-${trackingOrders.has(order.id)}`}
                            droneId={order.drone_id}
                            orderId={order.id}
                            onDistanceUpdate={(distance) => handleDistanceUpdate(order.id, distance)}
                            restaurantLat={restaurantInfo?.lat ? Number(restaurantInfo.lat) : null}
                            restaurantLng={restaurantInfo?.lng ? Number(restaurantInfo.lng) : null}
                            destinationLat={
                              parseCustomerLat(order.customerAddress || order.customer_address) || 
                              parseCustomerLat(order.deliveryAddress || order.delivery_address) ||
                              (restaurantInfo?.lat ? Number(restaurantInfo.lat) + 0.01 : 10.8231)
                            }
                            destinationLng={
                              parseCustomerLng(order.customerAddress || order.customer_address) || 
                              parseCustomerLng(order.deliveryAddress || order.delivery_address) ||
                              (restaurantInfo?.lng ? Number(restaurantInfo.lng) + 0.01 : 106.6297)
                            }
                            autoStart={trackingOrders.has(order.id)}
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-3 flex-wrap">
                        {/* Waiting OTP - Show OTP code and verify button */}
                        {order.status === 'waiting_otp' && order.delivery_otp && (
                          <div className="px-6 py-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                            <div className="text-xs text-yellow-700 font-medium mb-1">Mã OTP giao hàng:</div>
                            <div className="text-2xl font-bold text-yellow-900 tracking-widest">{order.delivery_otp}</div>
                            <div className="text-xs text-yellow-700 mt-2">⏳ Chờ khách hàng xác nhận...</div>
                          </div>
                        )}
                        
                        {/* Delivering - Show status */}
                        {order.status === 'delivering' && (
                          <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium animate-pulse">
                            🚁 Drone đang bay đến khách hàng...
                          </div>
                        )}
                        
                        {/* Returning - Show status */}
                        {order.status === 'returning' && (
                          <div className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg text-sm font-medium">
                            🔄 Drone đang bay về nhà hàng...
                          </div>
                        )}
                        
                        {/* Completed - Show status */}
                        {order.status === 'completed' && (
                          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                            ✅ Đã hoàn thành - Drone đã về
                          </div>
                        )}
                        
                        {/* Assigned - Show assign info and start button */}
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
                        
                        {/* Ready orders without drone - can assign drone */}
                        {order.status === 'ready' && !order.drone_id && (
                          <Button
                            onClick={() => handleOpenAssignModal(order)}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Gán Drone
                          </Button>
                        )}
                        
                        {/* Orders with drone (CONFIRMED/PREPARING/READY) - can start delivery */}
                        {['confirmed', 'preparing', 'ready'].includes(order.status) && order.drone_id && order.drone_model && (
                          <>
                            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                              ✓ Đã gán cho {order.drone_model}
                            </div>
                            <Button
                              onClick={() => handleStartDelivery(order)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Bắt đầu giao
                            </Button>
                          </>
                        )}
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
                <span className="font-medium text-right">{removeCoordinatesFromAddress(selectedOrder.customerAddress || selectedOrder.deliveryAddress)}</span>
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
                  {drones.filter(drone => drone.status?.toLowerCase() === 'idle').map(drone => (
                    <SelectItem key={drone.id} value={String(drone.id)}>
                      {drone.model} - Sức chứa: {drone.capacity}kg - Rảnh
                    </SelectItem>
                  ))}
                  {drones.filter(drone => drone.status?.toLowerCase() === 'idle').length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-gray-500">
                      Hiện không có drone rảnh. Vui lòng đợi...
                    </div>
                  )}
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

