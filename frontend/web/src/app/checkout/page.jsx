import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
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
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { orderAPI } from "@/lib/api"
import LocationPickerWithAddress from "@/components/map/LocationPickerWithAddress"

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [isProcessing, setIsProcessing] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: ""
  })
  const [location, setLocation] = useState({ lat: 10.762622, lng: 106.660172 }) // Default: TP.HCM
  const { toast } = useToast()
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    // Redirect nếu chưa login
    if (!isAuthenticated) {
      toast({
        title: "Vui lòng đăng nhập",
        description: "Bạn cần đăng nhập để thanh toán",
        variant: "destructive"
      })
      navigate("/login")
      return
    }

    // Refresh cart from server to ensure fresh data
    refreshCart()

  }, [isAuthenticated, navigate, toast, refreshCart])

  // Check cart after refresh
  useEffect(() => {
    // Redirect nếu giỏ hàng trống
    if (cart.items.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm món trước khi thanh toán",
        variant: "destructive"
      })
      navigate("/")
      return
    }

    // Pre-fill thông tin từ user
    if (user) {
      setDeliveryInfo(prev => ({
        ...prev,
        fullName: user.full_name || user.name || "",
        phone: user.phone || ""
      }))
    }
  }, [cart.items, user, navigate, toast])

  const subtotal = cart.total || 0
  const deliveryFee = 15000
  const total = subtotal + deliveryFee

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    
    // Validate
    if (!deliveryInfo.fullName || !deliveryInfo.phone || !deliveryInfo.address) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin giao hàng",
        variant: "destructive"
      })
      return
    }

    // Kiểm tra giỏ hàng từ server trước khi đặt hàng

    
    try {
      const serverCart = await cartAPI.getCart();

      
      if (!serverCart || !serverCart.items || serverCart.items.length === 0) {
        toast({
          title: "Giỏ hàng trống",
          description: "Vui lòng thêm món vào giỏ hàng trước khi thanh toán",
          variant: "destructive"
        })
        // Refresh cart state
        await refreshCart();
        return
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kiểm tra giỏ hàng. Vui lòng thử lại",
        variant: "destructive"
      })
      return
    }

    if (cart.items.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm món trước khi thanh toán",
        variant: "destructive"
      })
      return
    }

    // Lấy restaurant_id từ món đầu tiên (giả sử tất cả món cùng nhà hàng)
    // TODO: Trong thực tế cần check tất cả món cùng restaurant
    const firstItem = cart.items[0]
    if (!firstItem || !firstItem.restaurant_id) {
      toast({
        title: "Lỗi",
        description: "Không xác định được nhà hàng",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      // Validate coordinates
      if (!deliveryInfo.lat || !deliveryInfo.lng) {
        toast({
          title: "Chưa chọn vị trí",
          description: "Vui lòng chọn vị trí giao hàng trên bản đồ hoặc chọn từ gợi ý địa chỉ",
          variant: "destructive"
        })
        setIsProcessing(false)
        return
      }

      // Format delivery address with coordinates: "address, lat, lng"
      const formattedAddress = `${deliveryInfo.address}, ${deliveryInfo.lat}, ${deliveryInfo.lng}`;
      
      console.log('📍 Creating order with coordinates:', {
        address: deliveryInfo.address,
        lat: deliveryInfo.lat,
        lng: deliveryInfo.lng,
        formatted: formattedAddress
      });
      // Map payment method từ UI sang backend
      const paymentMethodMap = {
        'wallet': 'VNPAY',
        'card': 'VNPAY', 
        'cod': 'COD'
      }

      const mappedPaymentMethod = paymentMethodMap[paymentMethod] || 'COD'

      // Gọi API tạo đơn hàng
      const orderData = {
        restaurant_id: firstItem.restaurant_id,
        delivery_address: formattedAddress, // Include lat,lng in address
        delivery_phone: deliveryInfo.phone,
        delivery_name: deliveryInfo.fullName,
        note: deliveryInfo.note,
        payment_method: mappedPaymentMethod
      }

      const result = await orderAPI.createOrder(orderData)
      
      // Clear cart sau khi đặt hàng thành công
      await clearCart()
      
      // Hiển thị thông báo và chuyển đến trang orders
      // Nếu thanh toán VNPay, chuyển đến trang thanh toán
      if (result.payment_url) {
        // Không clear cart ngay vì user có thể hủy thanh toán VNPay
        window.location.href = result.payment_url
        return
      }

      // Nếu thanh toán COD, clear cart và chuyển đến trang orders
      clearCart() // Xóa giỏ hàng sau khi đặt hàng thành công
      setIsProcessing(false)
      toast({
        title: "Đặt hàng thành công!",
        description: "Đơn hàng của bạn đã được tạo",
      })
      navigate("/orders")
      
    } catch (error) {
      setIsProcessing(false)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đặt hàng. Vui lòng thử lại",
        variant: "destructive"
      })
    }
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
                  <CardTitle>Địa chỉ giao hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Họ và tên</Label>
                      <Input 
                        id="fullName" 
                        placeholder="Nguyễn Văn A" 
                        value={deliveryInfo.fullName}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, fullName: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="0909 123 456"
                        value={deliveryInfo.phone}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Địa chỉ chi tiết</Label>
                      <Textarea
                        id="address"
                        placeholder="VD: 123 Lê Lợi, Quận 1, TP.HCM"
                        value={deliveryInfo.address}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        💡 Nhấp vào bản đồ để tự tư chọn vị trí xem gợi ý địa chỉ
                      </p>
                    </div>
                    
                    {/* Map Location Picker */}
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Chọn vị trí trên bản đồ</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        💡 Chọn chính xác vị trí để drone giao hàng đúng địa điểm
                      </p>
                      <LocationPickerWithAddress
                        onLocationSelect={(coords, address) => {
                          setLocation(coords)
                          if (address && !deliveryInfo.address) {
                            setDeliveryInfo({...deliveryInfo, address: address})
                          }
                        }}
                        initialLocation={location}
                      />
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="note">Ghi chú đơn hàng</Label>
                      <Textarea
                        id="note"
                        placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
                        value={deliveryInfo.note}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, note: e.target.value})}
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
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div>
                      <div className="font-medium">Tiền mặt (COD)</div>
                      <div className="text-sm text-muted-foreground">Thanh toán khi nhận hàng</div>
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
                          <div className="text-sm text-muted-foreground"> VNPay</div>
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
                    {cart.items.map((item) => (
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
                            {(item.subtotal || 0).toLocaleString("vi-VN")}₫
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
