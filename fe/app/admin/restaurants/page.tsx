"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

interface Restaurant {
  id: string
  name: string
  owner: string
  phone: string
  address: string
  image: string
  status: "APPROVED" | "PENDING" | "SUSPENDED"
  rating: number
}

// Mock restaurants
const initialRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Fast Burger Drone",
    owner: "Nguyễn Văn A",
    phone: "0909 000 111",
    address: "123 Trần Hưng Đạo, Q1",
    image: "/delicious-burger-restaurant.jpg",
    status: "APPROVED",
    rating: 4.7,
  },
  {
    id: "2",
    name: "Pizza Express",
    owner: "Trần Thị B",
    phone: "0909 000 222",
    address: "456 Nguyễn Huệ, Q1",
    image: "/italian-pizza-restaurant.jpg",
    status: "APPROVED",
    rating: 4.5,
  },
  {
    id: "3",
    name: "Phở Hà Nội",
    owner: "Lê Văn C",
    phone: "0909 000 333",
    address: "789 Lê Lợi, Q1",
    image: "/vietnamese-pho-restaurant.png",
    status: "PENDING",
    rating: 4.8,
  },
]

const statusConfig = {
  APPROVED: { label: "Đã duyệt", color: "bg-success text-success-foreground" },
  PENDING: { label: "Chờ duyệt", color: "bg-warning text-warning-foreground" },
  SUSPENDED: { label: "Tạm ngưng", color: "bg-destructive text-destructive-foreground" },
}

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.owner.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    setRestaurants((prev) => prev.filter((restaurant) => restaurant.id !== id))
    toast({
      title: "Đã xóa nhà hàng",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Quản lý nhà hàng</h1>
            <p className="text-muted-foreground">Danh sách tất cả nhà hàng trên nền tảng</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/admin/restaurants/new">
              <Plus className="h-4 w-4" />
              Thêm nhà hàng
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm nhà hàng hoặc chủ sở hữu..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => {
            const status = statusConfig[restaurant.status]
            return (
              <Card key={restaurant.id} className="overflow-hidden">
                <div className="relative aspect-video">
                  <Image
                    src={restaurant.image || "/placeholder.svg"}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                  <Badge className={`absolute right-2 top-2 ${status.color}`}>{status.label}</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{restaurant.name}</h3>
                  <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                    <p>Chủ sở hữu: {restaurant.owner}</p>
                    <p>SĐT: {restaurant.phone}</p>
                    <p>{restaurant.address}</p>
                    <p>Đánh giá: {restaurant.rating} ⭐</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Pencil className="mr-1 h-3 w-3" />
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleDelete(restaurant.id)}
                    >
                      <Trash2 className="mr-1 h-3 w-3 text-destructive" />
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
