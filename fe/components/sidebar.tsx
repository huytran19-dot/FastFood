"use client"

import { Home, Store, Package, MapPin, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "Trang chủ" },
    { href: "/restaurants", icon: Store, label: "Nhà hàng" },
    { href: "/orders", icon: Package, label: "Đơn hàng" },
    { href: "/tracking", icon: MapPin, label: "Theo dõi" },
    { href: "/account", icon: User, label: "Tài khoản" },
  ]

  return (
    <aside className="hidden w-64 border-r border-border bg-card md:block">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
