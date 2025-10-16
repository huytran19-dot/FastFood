import { useState } from "react"
import { ChevronLeft, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QuantityStepper } from "@/components/quantity-stepper"
import { EmptyState } from "@/components/empty-state"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

// Mock cart data
const initialCartItems = [
  {
    id: "1",
    name: "Burger Bò Phô Mai",
    price: 89000,
    quantity: 2,
    image: "/burger-cheese.jpg",
    restaurant: "Fast Burger Drone",
  },
  {
    id: "4",
    name: "Trà Đào",
    price: 25000,
    quantity: 1,
    image: "/peach-tea.jpg",
    restaurant: "Fast Burger Drone",
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const { toast } = useToast()

  const handleUpdateQuantity = (id, quantity) => {
    const q = Math.max(1, Number(quantity) || 1);
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity: q } : item))
    );
  }

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
    toast({
      title: "Đã xóa khỏi giỏ hàng",
    })
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 15000
  const total = subtotal + deliveryFee

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Giỏ hàng</h1>
          </div>
          <EmptyState
            icon={ShoppingCart}
            title="Giỏ hàng của bạn đang trống"
            description="Thêm món ăn yêu thích vào giỏ hàng để bắt đầu đặt hàng"
            action={{ label: "Khám phá món ngon", href: "/" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Giỏ hàng ({cartItems.length})</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <img 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.restaurant}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 -mr-2"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(quantity) => handleUpdateQuantity(item.id, quantity)}
                        />
                        <p className="text-base font-bold text-foreground">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">Tóm tắt đơn hàng</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium text-foreground">{subtotal.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí giao hàng</span>
                    <span className="font-medium text-foreground">{deliveryFee.toLocaleString("vi-VN")}₫</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base">
                    <span className="font-semibold text-foreground">Tổng cộng</span>
                    <span className="font-bold text-foreground">{total.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>
                <Button className="mt-6 w-full" size="lg" asChild>
                  <Link to="/checkout">Thanh toán</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
