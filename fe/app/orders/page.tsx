import { OrderSummaryCard } from "@/components/order-summary-card"
import { EmptyState } from "@/components/empty-state"
import { Package } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock orders data
const orders = [
  {
    id: "FD-000123",
    date: "Hôm nay, 14:30",
    restaurant: "Fast Burger Drone",
    restaurantImage: "/delicious-burger-restaurant.jpg",
    total: 203000,
    status: "DELIVERING" as const,
    itemCount: 3,
  },
  {
    id: "FD-000122",
    date: "Hôm qua, 19:15",
    restaurant: "Pizza Express",
    restaurantImage: "/italian-pizza-restaurant.jpg",
    total: 350000,
    status: "COMPLETED" as const,
    itemCount: 2,
  },
  {
    id: "FD-000121",
    date: "2 ngày trước, 12:00",
    restaurant: "Phở Hà Nội",
    restaurantImage: "/vietnamese-pho-restaurant.png",
    total: 120000,
    status: "COMPLETED" as const,
    itemCount: 2,
  },
  {
    id: "FD-000120",
    date: "3 ngày trước, 18:45",
    restaurant: "Sushi Tokyo",
    restaurantImage: "/japanese-sushi-restaurant.png",
    total: 450000,
    status: "COMPLETED" as const,
    itemCount: 5,
  },
]

export default function OrdersPage() {
  const activeOrders = orders.filter((order) =>
    ["PENDING", "PAID", "PREPARING", "READY_FOR_DELIVERY", "DELIVERING"].includes(order.status),
  )
  const completedOrders = orders.filter((order) => order.status === "COMPLETED")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Đơn hàng của tôi</h1>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="active">Đang xử lý ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Đã hoàn thành ({completedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Chưa có đơn hàng nào"
                description="Bạn chưa có đơn hàng nào đang xử lý"
                action={{ label: "Đặt món ngay", href: "/" }}
              />
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <OrderSummaryCard key={order.id} {...order} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Chưa có đơn hàng nào"
                description="Bạn chưa hoàn thành đơn hàng nào"
                action={{ label: "Đặt món ngay", href: "/" }}
              />
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <OrderSummaryCard key={order.id} {...order} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
