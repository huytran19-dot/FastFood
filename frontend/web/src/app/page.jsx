import { useState, useEffect, useRef } from "react"
import { RestaurantCard } from "@/components/restaurant-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Zap, Shield, Clock, Loader2 } from "lucide-react"
import { publicAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate, useSearchParams } from "react-router-dom"

const features = [
  {
    icon: Zap,
    title: "Giao hàng siêu tốc",
    description: "Drone bay thẳng đến tận nơi, tiết kiệm thời gian tối đa",
  },
  {
    icon: Shield,
    title: "An toàn & bảo mật",
    description: "Công nghệ hiện đại đảm bảo đồ ăn luôn nguyên vẹn",
  },
  {
    icon: Clock,
    title: "Theo dõi realtime",
    description: "Xem drone bay đến đâu trên bản đồ mọi lúc",
  },
]

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Refs for scrolling
  const restaurantsRef = useRef(null)
  const featuresRef = useRef(null)

  useEffect(() => {
    fetchRestaurants()
  }, [])

  useEffect(() => {
    const searchQuery = searchParams.get('search')
    if (searchQuery && restaurants.length > 0) {
      const query = searchQuery.toLowerCase()
      const filtered = restaurants.filter(r => 
        r.name.toLowerCase().includes(query) || 
        r.address.toLowerCase().includes(query)
      )
      setFilteredRestaurants(filtered)
      // Auto scroll to restaurants section when searching
      scrollToRestaurants()
    } else {
      setFilteredRestaurants(restaurants)
    }
  }, [searchParams, restaurants])

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      const data = await publicAPI.getRestaurants()
      
      // Transform data để match với UI component
      const transformedData = data.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.image_url || "/delicious-burger-restaurant.jpg",
        rating: restaurant.rating || 4.5,
        deliveryTime: "15-20 phút", // Có thể tính toán từ location sau
        address: restaurant.address,
        droneEnabled: true, // Mặc định true vì đã approved
      }))
      
      setRestaurants(transformedData)
    } catch (error) {
      console.error('Failed to fetch restaurants:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhà hàng. Vui lòng thử lại sau.",
        variant: "destructive"
      })
      // Fallback to empty array
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }

  const scrollToRestaurants = () => {
    restaurantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleViewAll = () => {
    // Có thể navigate đến trang restaurants list riêng hoặc scroll xuống
    scrollToRestaurants()
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 border border-border bg-background text-foreground" variant="outline">
              <Plane className="mr-1 h-3 w-3" />
              Công nghệ giao hàng drone
            </Badge>
            <h1 className="mb-6 text-5xl font-black tracking-tight leading-tight text-foreground md:text-6xl text-balance">
              Đặt đồ ăn, giao bằng drone ⚡
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl text-pretty">
              Trải nghiệm giao đồ ăn nhanh chóng và hiện đại nhất Việt Nam. Drone bay thẳng đến tận nơi trong vài phút!
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:items-center">
              <Button 
                size="lg" 
                className="rounded-full bg-black text-white h-11 px-6 hover:bg-black/90"
                onClick={scrollToRestaurants}
              >
                Xem nhà hàng
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full h-11 px-6 border-border"
                onClick={scrollToFeatures}
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="border-y border-border bg-card py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-gray-200 to-gray-300 shadow-lg">
                    <Icon className="h-8 w-8 text-gray-800" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section ref={restaurantsRef} className="py-12 bg-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Nhà hàng nổi bật</h2>
              <p className="mt-2 text-muted-foreground">
                Khám phá các nhà hàng hỗ trợ giao hàng drone
              </p>
            </div>
            <Button variant="outline" onClick={handleViewAll}>
              Xem tất cả
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Đang tải danh sách nhà hàng...</p>
              </div>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchParams.get('search') 
                  ? `Không tìm thấy nhà hàng nào với từ khóa "${searchParams.get('search')}"`
                  : "Chưa có nhà hàng nào"
                }
              </p>
              {searchParams.get('search') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/')}
                >
                  Xem tất cả nhà hàng
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} {...restaurant} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promotions Section */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">Ưu đãi hôm nay</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
              <h3 className="mb-2 text-2xl font-bold">Giảm 50K</h3>
              <p className="mb-4 opacity-90">Cho đơn hàng đầu tiên từ 150K</p>
              <Badge className="bg-primary-foreground text-primary">Mã: DRONE50</Badge>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 p-8 text-secondary-foreground">
              <h3 className="mb-2 text-2xl font-bold">Miễn phí ship</h3>
              <p className="mb-4 opacity-90">Giao hàng drone miễn phí cho đơn từ 200K</p>
              <Badge className="bg-secondary-foreground text-secondary">Mã: FREESHIP</Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
