"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

type OrderStatus = "PAID" | "PREPARING" | "READY_FOR_DELIVERY" | "DELIVERING" | "COMPLETED"

interface Order {
  id: string
  customerName: string
  items: Array<{ name: string; quantity: number; image: string }>
  total: number
  status: OrderStatus
  address: string
  time: string
}

// Mock orders
const initialOrders: Order[] = [
  {
    id: "FD-000125",
    customerName: "Nguyễn Văn A",
    items: [
      { name: "Burger Bò Phô Mai", quantity: 2, image: "/burger-cheese.jpg" },
      { name: "Trà Đào", quantity: 1, image: "/peach-tea.jpg" },
    ],
    total: 203000,
    status: "PAID",
    address: "12 Nguyễn Huệ, Q1",
    time: "14:30",
  },
  {
    id: "FD-000124",
    customerName: "Trần Thị B",
    items: [{ name: "Gà Rán Giòn", quantity: 3, image: "/fried-chicken.jpg" }],
    total: 177000,
    status: "PREPARING",
    address: "45 Lê Lợi, Q1",
    time: "14:25",
  },
  {
    id: "FD-000123",
    customerName: "Lê Văn C",
    items: [
      { name: "Burger Bò Phô Mai", quantity: 1, image: "/burger-cheese.jpg" },
      { name: "Khoai Tây Chiên", quantity: 2, image: "/french-fries.jpg" },
    ],
    total: 147000,
    status: "READY_FOR_DELIVERY",
    address: "78 Pasteur, Q1",
    time: "14:20",
  },
]

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const { toast } = useToast()

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    toast({
      title: "Đã cập nhật trạng thái",
      description: `Đơn hàng ${orderId} đã được cập nhật`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold text-foreground md:text-3xl">Quản lý đơn hàng</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">#{order.id}</h3>
                      <Badge variant="secondary">{order.time}</Badge>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      Khách hàng: <span className="font-medium text-foreground">{order.customerName}</span>
                    </p>
                    <p className="mb-3 text-sm text-muted-foreground">Địa chỉ: {order.address}</p>

                    {/* Items */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1">
                          <div className="relative h-6 w-6 overflow-hidden rounded">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="text-sm">
                            {item.name} x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-lg font-bold text-primary">{order.total.toLocaleString("vi-VN")}₫</p>
                  </div>

                  {/* Status Control */}
                  <div className="flex flex-col gap-3 md:w-64">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAID">Đã thanh toán</SelectItem>
                        <SelectItem value="PREPARING">Đang chuẩn bị</SelectItem>
                        <SelectItem value="READY_FOR_DELIVERY">Sẵn sàng giao</SelectItem>
                        <SelectItem value="DELIVERING">Đang giao hàng</SelectItem>
                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
