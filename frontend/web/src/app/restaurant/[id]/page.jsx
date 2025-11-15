import { useState, useEffect } from "react"
import { Star, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuItemCard } from "@/components/menu-item-card"
import { CartDrawer } from "@/components/cart-drawer"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"
import { useParams } from "react-router-dom"
import { publicAPI } from "@/lib/api"
import { useCart } from "@/contexts/CartContext"
import RestaurantMapView from "@/components/map/RestaurantMapView"

export default function RestaurantPage() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const { cart, addToCart, loading: cartLoading } = useCart()

  useEffect(() => {
    if (id) {
      fetchRestaurantData()
      // Scroll to top when entering restaurant page
      window.scrollTo(0, 0)
    }
  }, [id])

  const fetchRestaurantData = async () => {
    try {
      setLoading(true)
      
      // Fetch menu and categories in parallel
      const [menuData, categoriesData] = await Promise.all([
        publicAPI.getRestaurantMenu(id),
        publicAPI.getRestaurantCategories(id).catch(() => []) // Fallback to empty array if fails
      ])
      
      // Set restaurant info
      setRestaurant({
        id: menuData.restaurant.id,
        name: menuData.restaurant.name,
        image: menuData.restaurant.image_url || "/delicious-burger-restaurant.jpg",
        rating: menuData.restaurant.rating || 4.5,
        address: menuData.restaurant.address,
        phone: menuData.restaurant.phone,
        lat: menuData.restaurant.lat,
        lng: menuData.restaurant.lng,
        openTime: "08:00 - 22:00", // Có thể thêm vào database sau
        isOpen: true,
      })

      // Set categories
      setCategories(categoriesData || [])

      // Transform menu items with category info
      const transformedMenu = menuData.menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        image: item.image_url || "/placeholder.svg",
        category: item.category ? item.category : null,
        category_id: item.category_id,
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

  const handleAddToCart = async (item) => {
    // addToCart từ CartContext sẽ handle toast
    await addToCart(item.id, 1)
  }

  const filteredItems = activeTab === "all" 
    ? menuItems 
    : activeTab === "uncategorized"
    ? menuItems.filter((item) => !item.category_id)
    : menuItems.filter((item) => item.category_id === parseInt(activeTab))

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
          <CartDrawer />
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
            <div>
              <span>{restaurant.address}</span>
            </div>
            <div>
              <span>{restaurant.phone}</span>
            </div>
            <div>
              <span>{restaurant.openTime}</span>
            </div>
          </div>
        </div>

        {/* Restaurant Location Map */}
        {restaurant.lat && restaurant.lng && (
          <div className="mb-6">
            <RestaurantMapView 
              lat={restaurant.lat}
              lng={restaurant.lng}
              restaurantName={restaurant.name}
              address={restaurant.address}
              height="300px"
            />
          </div>
        )}

        {/* Menu Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">
              Tất cả ({menuItems.length})
            </TabsTrigger>
            {menuItems.filter(item => !item.category_id).length > 0 && (
              <TabsTrigger value="uncategorized">
                Chưa phân loại ({menuItems.filter(item => !item.category_id).length})
              </TabsTrigger>
            )}
            {categories
              .filter(cat => cat.status === 1) // Only show active categories
              .map((category) => {
                const itemCount = menuItems.filter(item => item.category_id === category.id).length
                if (itemCount === 0) return null
                return (
                  <TabsTrigger key={category.id} value={category.id.toString()}>
                    {category.name} ({itemCount})
                  </TabsTrigger>
                )
              })}
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
      {cart.items.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 md:hidden">
          <Button className="w-full shadow-lg" size="lg" asChild>
            <Link to="/checkout">
              Xem giỏ hàng ({cart.itemCount}) •{" "}
              {cart.total.toLocaleString("vi-VN")}₫
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
