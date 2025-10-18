import { Home, Store, Package, MapPin, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const location = useLocation()
  const pathname = location.pathname

  const navItems = [
    { href: "/", icon: Home, label: "Trang chủ" },
    { href: "/restaurants", icon: Store, label: "Nhà hàng" },
    { href: "/orders", icon: Package, label: "Đơn hàng" },
    { href: "/tracking", icon: MapPin, label: "Theo dõi" },
    { href: "/account", icon: User, label: "Tài khoản" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
