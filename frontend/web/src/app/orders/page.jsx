import { useState, useEffect } from "react"
import { io } from "socket.io-client"
import { OrderSummaryCard } from "@/components/order-summary-card"
import { EmptyState } from "@/components/empty-state"
import { Package } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { orderAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Scroll to top khi vào trang
    window.scrollTo(0, 0)
    fetchOrders()

    // Setup Socket.IO for real-time order updates
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {

    });

    // Listen for order updates
    socket.on('order:update', (data) => {

      
      // Update order in list or refresh
      setOrders(prevOrders => {
        const orderExists = prevOrders.some(order => order.id === data.orderId);
        
        if (orderExists) {
          // Update existing order
          const updatedOrders = prevOrders.map(order => {
            if (order.id === data.orderId) {
              return {
                ...order,
                status: data.status || order.status
              };
            }
            return order;
          });

          // Show toast for status update
          if (data.message) {
            toast({
              title: '📦 Cập nhật đơn hàng',
              description: data.message,
              duration: 3000,
            });
          }

          return updatedOrders;
        } else {
          // New order created, refresh list and show notification
          toast({
            title: '🎉 Đơn hàng mới!',
            description: 'Đơn hàng của bạn đã được tạo thành công',
            duration: 5000,
          });
          fetchOrders();
          return prevOrders;
        }
      });
    });

    socket.on('disconnect', () => {

    });

    // Auto refresh every 30 seconds to ensure we don't miss any orders
    const refreshInterval = setInterval(() => {

      fetchOrders();
    }, 30000);

    return () => {
      socket.disconnect();
      clearInterval(refreshInterval);
    };
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getOrders()
      // Map API data to component format
      const mappedOrders = (response.orders || []).map(order => ({
        id: order.id,
        date: order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : 'N/A',
        restaurant: order.restaurant?.name || 'N/A',
        restaurantImage: order.restaurant?.image_url || "/placeholder.svg",
        total: order.total_price || 0,
        status: order.status || 'PENDING',
        itemCount: order.items_count || 0
      }))
      setOrders(mappedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Đơn hàng của tôi</h1>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    )
  }
  const activeOrders = orders.filter((order) =>
    ["PENDING", "CONFIRMED", "PAID", "PREPARING", "READY", "READY_FOR_DELIVERY", "DELIVERING", "WAITING_OTP"].includes(order.status),
    ["PENDING", "CONFIRMED", "PREPARING", "READY_FOR_DELIVERY", "DELIVERING"].includes(order.status),
  )
  const completedOrders = orders.filter((order) => order.status === "COMPLETED")
  const cancelledOrders = orders.filter((order) => order.status === "CANCELLED")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Đơn hàng của tôi</h1>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="active">Đang xử lý ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Đã hoàn thành ({completedOrders.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Đã hủy ({cancelledOrders.length})</TabsTrigger>
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

          <TabsContent value="cancelled" className="mt-6">
            {cancelledOrders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Chưa có đơn hàng nào bị hủy"
                description="Bạn chưa có đơn hàng nào bị hủy"
                action={{ label: "Đặt món ngay", href: "/" }}
              />
            ) : (
              <div className="space-y-4">
                {cancelledOrders.map((order) => (
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
