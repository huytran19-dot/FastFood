import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
} from 'lucide-react'

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

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrderDetail()
  }, [orderId])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const data = await orderAPI.getOrderDetail(orderId)
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order detail:', error)
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể tải thông tin đơn hàng',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return

    try {
      await orderAPI.cancelOrder(orderId)
      toast({
        title: 'Thành công',
        description: 'Đã hủy đơn hàng',
      })
      fetchOrderDetail()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.message || 'Không thể hủy đơn hàng',
      })
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Chờ xử lý', variant: 'warning', icon: Clock },
      confirmed: { label: 'Đã xác nhận', variant: 'default', icon: CheckCircle },
      preparing: { label: 'Đang chuẩn bị', variant: 'default', icon: Package },
      ready: { label: 'Sẵn sàng', variant: 'default', icon: CheckCircle },
      delivering: { label: 'Đang giao', variant: 'default', icon: Package },
      delivered: { label: 'Đã giao', variant: 'success', icon: CheckCircle },
      cancelled: { label: 'Đã hủy', variant: 'destructive', icon: XCircle },
    }

    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ thanh toán', variant: 'warning' },
      PAID: { label: 'Đã thanh toán', variant: 'success' },
      FAILED: { label: 'Thất bại', variant: 'destructive' },
      REFUNDED: { label: 'Đã hoàn tiền', variant: 'default' },
    }

    const config = statusConfig[status?.toUpperCase()] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không tìm thấy đơn hàng</h3>
          <p className="text-muted-foreground mb-4">
            Đơn hàng #{orderId} không tồn tại hoặc bạn không có quyền xem
          </p>
          <Button onClick={() => navigate('/orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </div>
    )
  }

  const canCancelOrder = ['pending', 'confirmed'].includes(order.status)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/orders')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Đơn hàng #{order.id}</h1>
            <p className="text-muted-foreground">
              Đặt lúc: {formatDateTime(order.created_at)}
            </p>
          </div>
          <div className="text-right">
            {getStatusBadge(order.status)}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Restaurant Info */}
        {order.restaurant && (
          <Card>
            <CardHeader>
              <CardTitle>Nhà hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold">{order.restaurant.name}</p>
                <p className="text-sm text-muted-foreground">
                  {order.restaurant.address}
                </p>
                {order.restaurant.phone && (
                  <p className="text-sm text-muted-foreground">
                    {order.restaurant.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin giao hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Người nhận</p>
              <p className="font-semibold">
                {order.delivery?.name || order.user?.full_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Số điện thoại</p>
              <p>
                {order.delivery?.phone || order.user?.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Địa chễ giao hàng</p>
              <p>
                {removeCoordinatesFromAddress(order.delivery?.address)}
              </p>
            </div>
            {order.note && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Ghi chú</p>
                <p className="text-sm">{order.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{item.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatPrice(item.subtotal || item.price * item.quantity)}
                  </p>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{formatPrice((order.items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>{formatPrice(order.delivery?.fee || 15000)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(order.total_price || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Phương thức</span>
              <span className="font-medium">
                {order.payment?.method === 'COD' ? 'Tiền mặt (COD)' : order.payment?.method || 'Tiền mặt'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Trạng thái</span>
              {getPaymentStatusBadge(order.payment?.status)}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/tracking/${orderId}`)}
            className="flex-1"
          >
            Theo dõi đơn hàng
          </Button>
          {canCancelOrder && (
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Hủy đơn hàng
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
