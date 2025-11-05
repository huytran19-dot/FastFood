import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { restaurantAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Store, Package, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, restaurant } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    totalMenuItems: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await restaurantAPI.getStats()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Lỗi: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bảng Điều Khiển</h1>
        <p className="mt-2 text-muted-foreground">
          Chào mừng trở lại, {user?.name || 'Chủ FastFood'}
        </p>
      </div>

      {/* Restaurant Info Card */}
      {restaurant && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle>{restaurant.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.review_status === 'APPROVED' 
                      ? 'bg-green-100 text-green-800' 
                      : restaurant.review_status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.review_status === 'APPROVED' ? 'Đã duyệt' : 
                     restaurant.review_status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                  </span>
                  <span>•</span>
                  <span>{restaurant.address || 'Chưa cập nhật địa chỉ'}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Doanh Thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% so với tháng trước
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Đơn Hàng
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedOrders} đơn hoàn thành
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đơn Đang Xử Lý
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cần xử lý ngay
            </p>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Món Ăn
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMenuItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Món ăn trong menu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng Quan Đơn Hàng</CardTitle>
          <CardDescription>Thống kê trạng thái đơn hàng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Đã hoàn thành</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{stats.completedOrders}</span>
                <span className="text-sm text-muted-foreground">
                  ({Math.round((stats.completedOrders / stats.totalOrders) * 100)}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Đang xử lý</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{stats.pendingOrders}</span>
                <span className="text-sm text-muted-foreground">
                  ({Math.round((stats.pendingOrders / stats.totalOrders) * 100)}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Đã hủy</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{stats.cancelledOrders}</span>
                <span className="text-sm text-muted-foreground">
                  ({Math.round((stats.cancelledOrders / stats.totalOrders) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao Tác Nhanh</CardTitle>
          <CardDescription>Các tác vụ thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => window.location.href = '/restaurant/orders'}
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
            >
              <ShoppingCart className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Quản Lý Đơn Hàng</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Xem và xử lý đơn hàng
              </p>
            </button>
            
            <button
              onClick={() => window.location.href = '/restaurant/menu'}
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
            >
              <Package className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Quản Lý Menu</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Thêm và chỉnh sửa món ăn
              </p>
            </button>
            
            <button
              onClick={() => window.location.href = '/restaurant/profile'}
              className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
            >
              <Store className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Thông Tin Nhà Hàng</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Cập nhật thông tin
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
