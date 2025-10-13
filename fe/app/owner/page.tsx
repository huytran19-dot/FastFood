import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ChefHat, Plane, CheckCircle2, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Mock stats
const stats = [
  {
    title: "Đơn hàng mới",
    value: "12",
    icon: Package,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Đang chuẩn bị",
    value: "8",
    icon: ChefHat,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    title: "Đang giao",
    value: "15",
    icon: Plane,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    title: "Hoàn thành hôm nay",
    value: "47",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Đánh giá trung bình",
    value: "4.7",
    icon: Star,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
]

export default function OwnerDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Bảng điều khiển</h1>
            <p className="text-muted-foreground">Quản lý nhà hàng của bạn</p>
          </div>
          <Button asChild>
            <Link href="/owner/orders">Xem đơn hàng</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Quản lý đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Xem và cập nhật trạng thái đơn hàng</p>
              <Button className="w-full" asChild>
                <Link href="/owner/orders">Xem đơn hàng</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Quản lý thực đơn</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Thêm, sửa, xóa món ăn trong thực đơn</p>
              <Button className="w-full" asChild>
                <Link href="/owner/menu">Quản lý menu</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Quản lý Drone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Theo dõi trạng thái drone giao hàng</p>
              <Button className="w-full" asChild>
                <Link href="/owner/drones">Xem drone</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
