import { useState, useEffect } from "react"
import { io } from 'socket.io-client'
import { ChevronLeft, Phone, MessageCircle, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DroneTrackingMap } from "@/components/drone-tracking-map"
import { DroneStatusBadge } from "@/components/drone-status-badge"
import { Link, useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom"
import { orderAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Helper function to remove coordinates from address for display
const removeCoordinatesFromAddress = (address) => {
  if (!address) return 'N/A';
  const parts = address.split(',');
  if (parts.length < 2) return address;
  
  // Check if last two parts are coordinates
  const lat = parseFloat(parts[parts.length - 2].trim());
  const lng = parseFloat(parts[parts.length - 1].trim());
  
  if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
    // Remove last two parts (coordinates)
    return parts.slice(0, -2).join(',').trim();
  }
  
  return address;
}

export default function TrackingPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [dronePosition, setDronePosition] = useState(null)

  useEffect(() => {
    fetchOrderDetail()
    
    // Setup Socket.IO for real-time drone tracking
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      // Join order-specific room to get updates
      socket.emit('join:order', orderId)
    })

    // Listen for drone position updates (only when delivering to customer, NOT when returning)
    socket.on('drone:update', (data) => {
      // Only process updates for this order's drone
      // Check if this update is for our order (convert both to number for comparison)
      if (data.orderId && parseInt(data.orderId) !== parseInt(orderId)) {
        return;
      }
      
      // Only show drone when flying TO customer, hide when RETURNING or AT_RESTAURANT
      if (data.phase === 'TO_CUSTOMER' || data.status === 'DELIVERING') {
        setDronePosition({
          lat: data.lat,
          lng: data.lng,
          progress: data.progress,
          etaMs: data.etaMs,
          distanceRemaining: data.distanceRemaining
        })
      } else if (data.phase === 'RETURNING' || data.phase === 'AT_RESTAURANT') {
        // Hide drone when returning to restaurant
        setDronePosition(null)
      }
    })

    // Listen for order status updates
    socket.on('order:update', (data) => {
      if (parseInt(data.orderId) === parseInt(orderId)) {
        fetchOrderDetail()
        
        // Clear drone position when order completed
        if (data.status === 'COMPLETED' || data.droneStatus === 'returning') {
          setDronePosition(null)
        }
      }
    })

    socket.on('disconnect', () => {
    })

    return () => {
      socket.emit('leave:order', orderId)
      socket.disconnect()
    }
  }, [orderId])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const data = await orderAPI.getOrderDetail(orderId)
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    
    if (!otp || otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập mã OTP 6 số"
      })
      return
    }

    try {
      setVerifying(true)
      await orderAPI.verifyOTP(orderId, otp)
      
      toast({
        title: "Thành công!",
        description: "Đã xác nhận nhận hàng thành công"
      })
      
      // Refresh order data
      fetchOrderDetail()
      setOtp('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Mã OTP không đúng, vui lòng thử lại"
      })
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy đơn hàng</p>
            <Button className="mt-4" onClick={() => navigate('/orders')}>Quay lại</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/orders">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Theo dõi đơn hàng</h1>
              <p className="text-sm text-muted-foreground">Mã đơn: {order.id}</p>
            </div>
          </div>
          <DroneStatusBadge status={order.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Map & Timeline */}
          <div className="space-y-6 lg:col-span-2">
            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Vị trí drone</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-gray-100 rounded text-xs font-mono">
                    <div>Drone ID: {order.drone_id || 'N/A'}</div>
                    <div>Restaurant: {order.restaurant?.lat}, {order.restaurant?.lng}</div>
                    <div>Customer: {order.delivery_address_detail?.lat}, {order.delivery_address_detail?.lng}</div>
                    <div>Status: {order.status}</div>
                    <div>Show Map: {(order.drone_id && order.restaurant?.lat && order.restaurant?.lng && order.delivery_address_detail?.lat && order.delivery_address_detail?.lng) ? 'YES ✅' : 'NO ❌'}</div>
                  </div>
                )}
                
                {order.drone_id && order.restaurant?.lat && order.restaurant?.lng && 
                 order.delivery_address_detail?.lat && order.delivery_address_detail?.lng ? (
                  <div>
                    <DroneTrackingMap
                      orderId={order.id}
                      droneId={order.drone_id}
                      restaurantLat={order.restaurant.lat}
                      restaurantLng={order.restaurant.lng}
                      customerLat={order.delivery_address_detail.lat}
                      customerLng={order.delivery_address_detail.lng}
                      status={order.status}
                      realtimePosition={dronePosition}
                    />
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center bg-muted/30 rounded-lg border border-border">
                    <p className="text-muted-foreground text-sm mb-2">
                      {order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'READY'
                        ? '🍳 Đang chuẩn bị đơn hàng...' 
                        : '📍 Đang tải bản đồ...'}
                    </p>
                    {!order.drone_id && (
                      <p className="text-xs text-gray-400">Chưa có drone được gán</p>
                    )}
                    {(!order.restaurant?.lat || !order.restaurant?.lng) && (
                      <p className="text-xs text-gray-400">Thiếu tọa độ nhà hàng</p>
                    )}
                    {(!order.delivery_address_detail?.lat || !order.delivery_address_detail?.lng) && (
                      <p className="text-xs text-gray-400">Thiếu tọa độ giao hàng</p>
                    )}
                  </div>
                )}
                <div className="mt-4 flex items-start justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian dự kiến</p>
                    <p className="text-lg font-semibold text-foreground">{order.estimatedTime || '20-30 phút'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Địa chỉ giao hàng</p>
                    <p className="text-sm font-medium text-foreground">{removeCoordinatesFromAddress(order.delivery?.address)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Pending */}
                  <div className={`flex items-center gap-3 ${['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'WAITING_OTP', 'COMPLETED'].includes(order.status) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className="h-3 w-3 rounded-full bg-current" />
                    <div className="flex-1">
                      <p className="font-medium">Đơn hàng đã được tạo</p>
                      {order.payment?.method === 'VNPAY' && order.status === 'PENDING' && (
                        <p className="text-xs text-orange-600">Chờ thanh toán VNPay...</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Payment Success (for VNPay) */}
                  {order.payment?.method === 'VNPAY' && (
                    <div className={`flex items-center gap-3 ${order.payment?.status === 'PAID' || ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'WAITING_OTP', 'COMPLETED'].includes(order.status) ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <div className="h-3 w-3 rounded-full bg-current" />
                      <div className="flex-1">
                        <p className="font-medium">Đã thanh toán qua VNPay</p>
                        {order.payment?.status === 'PAID' && (
                          <p className="text-xs">Đơn hàng tự động được xác nhận</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Confirmed */}
                  <div className={`flex items-center gap-3 ${['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'WAITING_OTP', 'COMPLETED'].includes(order.status) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className="h-3 w-3 rounded-full bg-current" />
                    <p className="font-medium">Nhà hàng đã xác nhận</p>
                  </div>
                  
                  {/* Preparing */}
                  <div className={`flex items-center gap-3 ${['PREPARING', 'READY', 'DELIVERING', 'WAITING_OTP', 'COMPLETED'].includes(order.status) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className="h-3 w-3 rounded-full bg-current" />
                    <p className="font-medium">Đang chuẩn bị món ăn</p>
                  </div>
                  
                  {/* Ready */}
                  <div className={`flex items-center gap-3 ${['READY', 'DELIVERING', 'WAITING_OTP', 'COMPLETED'].includes(order.status) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className="h-3 w-3 rounded-full bg-current" />
                    <p className="font-medium">Sẵn sàng giao hàng</p>
                  </div>
                  
                  {/* Delivering */}
                  <div className={`flex items-center gap-3 ${['DELIVERING', 'WAITING_OTP', 'COMPLETED'].includes(order.status) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className="h-3 w-3 rounded-full bg-current" />
                    <p className="font-medium">Drone đang giao hàng</p>
                  </div>
                  
                  {/* Waiting OTP */}
                  <div className={`flex items-center gap-3 ${['WAITING_OTP', 'COMPLETED'].includes(order.status) ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className="h-3 w-3 rounded-full bg-current" />
                    <p className="font-medium">Drone đã đến nơi - Chờ xác nhận OTP</p>
                  </div>
                  
                  {/* Completed */}
                  <div className={`flex items-center gap-3 ${order.status === 'COMPLETED' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <div className="h-3 w-3 rounded-full bg-current" />
                    <p className="font-medium">Đã giao hàng thành công</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Info */}
          <div className="space-y-6 lg:col-span-1">
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Nhà hàng</p>
                  <p className="font-medium text-foreground">{order.restaurant?.name || 'N/A'}</p>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                        <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold">Tổng cộng</span>
                    <span className="font-bold text-primary">{order.total_price?.toLocaleString("vi-VN") || '0'}₫</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OTP Verification - Show only when status is WAITING_OTP */}
            {order.status === 'WAITING_OTP' && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <Key className="h-5 w-5" />
                    Xác nhận nhận hàng
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    Drone đã đến! Vui lòng kiểm tra hàng và nhập mã OTP để xác nhận
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Nhập mã OTP 6 số"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="text-center text-2xl font-bold tracking-widest"
                        disabled={verifying}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      disabled={verifying || otp.length !== 6}
                    >
                      {verifying ? 'Đang xác nhận...' : 'Xác nhận nhận hàng'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <Phone className="h-4 w-4" />
                  Gọi nhà hàng
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                  <MessageCircle className="h-4 w-4" />
                  Nhắn tin hỗ trợ
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
