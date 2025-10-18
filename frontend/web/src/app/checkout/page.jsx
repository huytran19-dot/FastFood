import { useState } from "react"
import { ChevronLeft, CreditCard, Wallet, Banknote, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

// Mock cart data
const mockCartItems = [
  { id: "1", name: "Burger Bò Phô Mai", price: 89000, quantity: 2, image: "/burger-cheese.jpg" },
  { id: "4", name: "Trà Đào", price: 25000, quantity: 1, image: "/peach-tea.jpg" },
]

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("wallet")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 15000
  const total = subtotal + deliveryFee

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setIsProcessing(true)

    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Đặt hàng thành công!",
        description: "Drone sẽ giao hàng trong 15-20 phút",
      })
      navigate("/tracking/FD-000123")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Thanh toán</h1>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Forms */}
            <div className="space-y-6 lg:col-span-2">
              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Địa chỉ giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input id="fullName" placeholder="Nguyễn Văn A" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input id="phone" type="tel" placeholder="0909 123 456" required />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Địa chỉ chi tiết</Label>
                      <Textarea
                        id="address"
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="note">Ghi chú đơn hàng</Label>
                      <Textarea
                        id="note"
                        placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="mb-3 flex items-center space-x-3 rounded-lg border border-border p-4">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label
                        htmlFor="wallet"
                        className="flex flex-1 cursor-pointer items-center gap-3"
                      >
                        <Wallet className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Ví điện tử</div>
                          <div className="text-sm text-muted-foreground">MoMo, ZaloPay, VNPay</div>
                        </div>
                      </Label>
                    </div>

                    <div className="mb-3 flex items-center space-x-3 rounded-lg border border-border p-4">
                      <RadioGroupItem value="card" id="card" />
                      <Label
                        htmlFor="card"
                        className="flex flex-1 cursor-pointer items-center gap-3"
                      >
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Thẻ tín dụng/ghi nợ</div>
                          <div className="text-sm text-muted-foreground">Visa, Mastercard</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label
                        htmlFor="cod"
                        className="flex flex-1 cursor-pointer items-center gap-3"
                      >
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Tiền mặt</div>
                          <div className="text-sm text-muted-foreground">Thanh toán khi nhận hàng</div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {mockCartItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="line-clamp-1 text-sm font-medium text-foreground">
                            {item.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">x{item.quantity}</p>
                          <p className="text-sm font-semibold text-primary">
                            {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="border-t border-border pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium">{subtotal.toLocaleString("vi-VN")}₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí giao hàng</span>
                      <span className="font-medium">{deliveryFee.toLocaleString("vi-VN")}₫</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-border pt-2 text-base">
                      <span className="font-semibold">Tổng cộng</span>
                      <span className="font-bold text-primary">{total.toLocaleString("vi-VN")}₫</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                    {isProcessing ? "Đang xử lý..." : "Đặt hàng"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
