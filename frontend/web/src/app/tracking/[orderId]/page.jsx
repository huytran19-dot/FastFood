import { ChevronLeft, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderTimeline } from "@/components/order-timeline"
import { DroneMapPlaceholder } from "@/components/drone-map-placeholder"
import { DroneStatusBadge } from "@/components/drone-status-badge"
import { Link } from "react-router-dom"
import { useParams } from "react-router-dom"

// Mock order data
const order = {
  id: "FD-000123",
  status: "DELIVERING",
  restaurant: {
    name: "Fast Burger Drone",
    phone: "0909 000 111",
  },
  items: [
    {
      id: "1",
      name: "Burger Bò Phô Mai",
      quantity: 2,
      price: 89000,
      image: "/burger-cheese.jpg",
    },
    {
      id: "4",
      name: "Trà Đào",
      quantity: 1,
      price: 25000,
      image: "/peach-tea.jpg",
    },
  ],
  address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
  estimatedTime: "15-20 phút",
  total: 203000,
}

export default function TrackingPage() {
  const { orderId } = useParams()

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
                <DroneMapPlaceholder status={order.status} />
                <div className="mt-4 flex items-start justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian dự kiến</p>
                    <p className="text-lg font-semibold text-foreground">{order.estimatedTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Địa chỉ giao hàng</p>
                    <p className="text-sm font-medium text-foreground">{order.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái đơn hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline currentStatus={order.status} />
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
                  <p className="font-medium text-foreground">{order.restaurant.name}</p>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  {order.items.map((item) => (
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
                    <span className="font-bold text-primary">{order.total.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
