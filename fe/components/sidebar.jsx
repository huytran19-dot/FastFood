import { Home, Store, Package, MapPin, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname

  const navItems = [
    { href: "/", icon, label: "Trang chủ" },
    { href: "/restaurants", icon, label: "Nhà hàng" },
    { href: "/orders", icon, label: "Đơn hàng" },
    { href: "/tracking", icon, label: "Theo dõi" },
    { href: "/account", icon, label: "Tài khoản" },
  ]

  return (
    <aside className="hidden w-64 border-r border-border bg:card md">
      <nav className="flex flex-col gap-2 p:4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href})
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:accent hover:accent-foreground",
              )}
            >
              <Icon className="h-5 w:5" />
              {item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
