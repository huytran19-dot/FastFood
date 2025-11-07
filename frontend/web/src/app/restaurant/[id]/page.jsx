import { useState, useEffect } from "react"
import { Star, Clock, MapPin, Phone, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuItemCard } from "@/components/menu-item-card"
import { CartDrawer } from "@/components/cart-drawer"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"
import { useParams } from "react-router-dom"
import { publicAPI } from "@/lib/api"

export default function RestaurantPage() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState([])
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    if (id) {
      fetchRestaurantData()
    }
  }, [id])

  const fetchRestaurantData = async () => {
    try {
      setLoading(true)
      const data = await publicAPI.getRestaurantMenu(id)
      
      // Set restaurant info
      setRestaurant({
        id: data.restaurant.id,
        name: data.restaurant.name,
        image: data.restaurant.image_url || "/delicious-burger-restaurant.jpg",
        rating: data.restaurant.rating || 4.5,
        address: data.restaurant.address,
        phone: data.restaurant.phone,
        openTime: "08:00 - 22:00", // Có thể thêm vào database sau
        isOpen: true,
      })

      // Transform menu items
      const transformedMenu = data.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        image: item.image_url || "/placeholder.svg",
        category: item.category_id ? `category-${item.category_id}` : "other",
      }))
      
      setMenuItems(transformedMenu)
    } catch (error) {
      console.error('Failed to fetch restaurant data:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin nhà hàng. Vui lòng thử lại sau.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id)
      if (existingItem) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    toast({
      title: "Đã thêm vào giỏ hàng",
      description: "Món đã được thêm vào giỏ",
    })
  }

  const handleUpdateQuantity = (id, quantity) => {
  setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
    toast({
      title: "Đã xóa khỏi giỏ hàng",
    })
  }

  const handleUpdateNote = (id, note) => {
  setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, note } : item)))
  }

  const filteredItems = activeTab === "all" ? menuItems : menuItems.filter((item) => item.category === activeTab)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin nhà hàng...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy nhà hàng</p>
          <Button asChild>
            <Link to="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
  <div className="min-h-screen bg-background">
      {/* Header Image */}
      <div className="relative h-64 w-full md:h-80">
        <img src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <Button variant="ghost" size="icon" className="absolute left-4 top-4 bg-background/80 backdrop-blur-sm" asChild>
          <Link to="/">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="absolute right-4 top-4">
          <CartDrawer
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onUpdateNote={handleUpdateNote}
          />
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">{restaurant.name}</h1>
            <Badge variant={restaurant.isOpen ? "default" : "secondary"} className="bg-success text-success-foreground">
              {restaurant.isOpen ? "Đang mở cửa" : "Đã đóng cửa"}
            </Badge>
          </div>
          <div className="mb-3 flex items-center gap-1 text-warning">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-semibold text-foreground">{restaurant.rating}</span>
            <span className="text-muted-foreground">(250+ đánh giá)</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{restaurant.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{restaurant.openTime}</span>
            </div>
          </div>
        </div>

        {/* Menu Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="combo">Combo</TabsTrigger>
            <TabsTrigger value="drinks">Đồ uống</TabsTrigger>
            <TabsTrigger value="desserts">Tráng miệng</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Chưa có món ăn nào trong danh mục này</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} {...item} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Cart Button - Mobile */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 md:hidden">
          <Button className="w-full shadow-lg" size="lg" asChild>
            <Link to="/checkout">
              Xem giỏ hàng ({cartItems.length}) •{" "}
              {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString("vi-VN")}₫
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
