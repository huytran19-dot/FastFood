import { RestaurantCard } from "@/components/restaurant-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Zap, Shield, Clock } from "lucide-react"

// Mock data
const restaurants = [
  {
    id: "1",
    name: "Fast Burger Drone",
    image: "/delicious-burger-restaurant.jpg",
    rating: 4.7,
    deliveryTime: "15-20 phút",
    address: "123 Trần Hưng Đạo, Q1",
    droneEnabled: true,
  },
  {
    id: "2",
    name: "Pizza Express",
    image: "/italian-pizza-restaurant.jpg",
    rating: 4.5,
    deliveryTime: "20-25 phút",
    address: "456 Nguyễn Huệ, Q1",
    droneEnabled: true,
  },
  {
    id: "3",
    name: "Phở Hà Nội",
    image: "/vietnamese-pho-restaurant.png",
    rating: 4.8,
    deliveryTime: "10-15 phút",
    address: "789 Lê Lợi, Q1",
    droneEnabled: true,
  },
  {
    id: "4",
    name: "Sushi Tokyo",
    image: "/japanese-sushi-restaurant.png",
    rating: 4.6,
    deliveryTime: "25-30 phút",
    address: "321 Hai Bà Trưng, Q3",
    droneEnabled: true,
  },
  {
    id: "5",
    name: "Gà Rán Giòn",
    image: "/fried-chicken-restaurant.png",
    rating: 4.4,
    deliveryTime: "15-20 phút",
    address: "654 Võ Văn Tần, Q3",
    droneEnabled: true,
  },
  {
    id: "6",
    name: "Bún Bò Huế",
    image: "/vietnamese-bun-bo-hue.jpg",
    rating: 4.9,
    deliveryTime: "10-15 phút",
    address: "987 Pasteur, Q1",
    droneEnabled: true,
  },
]

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
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-secondary text-secondary-foreground" variant="secondary">
              <Plane className="mr-1 h-3 w-3" />
              Công nghệ giao hàng drone
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl text-balance">
              Đặt đồ ăn, giao bằng drone ⚡
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl text-pretty">
              Trải nghiệm giao đồ ăn nhanh chóng và hiện đại nhất Việt Nam. Drone bay thẳng đến tận nơi trong vài phút!
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="text-base">
                Xem nhà hàng
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent">
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary">
                    <Icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">Nhà hàng nổi bật</h2>
              <p className="mt-2 text-muted-foreground">Khám phá các nhà hàng hỗ trợ giao hàng drone</p>
            </div>
            <Button variant="outline">Xem tất cả</Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} {...restaurant} />
            ))}
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">Ưu đãi hôm nay</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
              <h3 className="mb-2 text-2xl font-bold">Giảm 50K</h3>
              <p className="mb-4 text-primary-foreground/90">Cho đơn hàng đầu tiên từ 150K</p>
              <Badge className="bg-primary-foreground text-primary">Mã: DRONE50</Badge>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 p-8 text-secondary-foreground">
              <h3 className="mb-2 text-2xl font-bold">Miễn phí ship</h3>
              <p className="mb-4 text-secondary-foreground/90">Giao hàng drone miễn phí cho đơn từ 200K</p>
              <Badge className="bg-secondary-foreground text-secondary">Mã: FREESHIP</Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
