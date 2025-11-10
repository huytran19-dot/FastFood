import { useState, useEffect } from "react"
import { ChevronLeft, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QuantityStepper } from "@/components/quantity-stepper"
import { EmptyState } from "@/components/empty-state"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"
import { useCart } from "@/contexts/CartContext"

export default function CartPage() {
  const { cart, updateQuantity, removeItem, loading } = useCart()
  const { toast } = useToast()

  const handleUpdateQuantity = async (cartItemId, quantity) => {
    const q = Math.max(1, Number(quantity) || 1)
    await updateQuantity(cartItemId, q)
  }

  const handleRemoveItem = async (cartItemId) => {
    await removeItem(cartItemId)
  }

  const deliveryFee = 15000
  const total = cart.total + deliveryFee

  if (cart.items.length === 0) {
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
          <h1 className="text-2xl font-bold text-foreground">Giỏ hàng ({cart.itemCount})</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.items.map((item) => (
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
                          <p className="text-sm text-muted-foreground">{item.description || ''}</p>
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
                          {item.subtotal.toLocaleString("vi-VN")}₫
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
                    <span className="font-medium text-foreground">{cart.total.toLocaleString("vi-VN")}₫</span>
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
