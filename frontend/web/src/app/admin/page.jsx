import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Users, Package, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

// Mock stats
const stats = [
  {
    title: "Tổng nhà hàng",
    value: "48",
    icon: Store,
    color: "text-primary",
    bgColor: "bg-primary/10",
    change: "+12%",
  },
  {
    title: "Người dùng",
    value: "2,547",
    icon: Users,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    change: "+23%",
  },
  {
    title: "Đơn hàng hôm nay",
    value: "342",
    icon: Package,
    color: "text-warning",
    bgColor: "bg-warning/10",
    change: "+8%",
  },
  {
    title: "Doanh thu",
    value: "125M",
    icon: TrendingUp,
    color: "text-success",
    bgColor: "bg-success/10",
    change: "+15%",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Quản trị hệ thống</h1>
            <p className="text-muted-foreground">Tổng quan và quản lý nền tảng</p>
          </div>
          
          <Button asChild>
            <Link to="/admin/restaurants/new">Thêm nhà hàng</Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                      <p className="mt-1 text-sm text-success">{stat.change} so với tháng trước</p>
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
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Quản lý nhà hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Xem danh sách, thêm mới và quản lý các nhà hàng trên nền tảng
              </p>
              <Button className="w-full" asChild>
                <Link to="/admin/restaurants">Xem danh sách</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle>Quản lý người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">Xem và quản lý tài khoản người dùng và chủ nhà hàng</p>
              <Button className="w-full" asChild>
                <Link to="/admin/users">Xem người dùng</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
