"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Mock users (restaurant owners)
const mockUsers = [
  { id: "1", name: "Nguyễn Văn A", email: "nguyenvana@example.com" },
  { id: "2", name: "Trần Thị B", email: "tranthib@example.com" },
  { id: "3", name: "Lê Văn C", email: "levanc@example.com" },
]

export default function CreateRestaurantPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Tạo nhà hàng thành công!",
        description: "Nhà hàng mới đã được thêm vào hệ thống",
      })
      router.push("/admin/restaurants")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/restaurants">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thêm nhà hàng mới</h1>
            <p className="text-muted-foreground">Tạo nhà hàng mới trên nền tảng</p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin nhà hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Owner Selection */}
                <div>
                  <Label htmlFor="owner">Chủ sở hữu</Label>
                  <Select required>
                    <SelectTrigger id="owner">
                      <SelectValue placeholder="Chọn chủ sở hữu" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-muted-foreground">Chọn người dùng sẽ quản lý nhà hàng này</p>
                </div>

                {/* Restaurant Name */}
                <div>
                  <Label htmlFor="name">Tên nhà hàng</Label>
                  <Input id="name" placeholder="Fast Burger Drone" required />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" type="tel" placeholder="0909 000 111" required />
                </div>

                {/* Address */}
                <div>
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input id="address" placeholder="123 Trần Hưng Đạo, Quận 1, TP.HCM" required />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea id="description" placeholder="Mô tả về nhà hàng..." rows={4} />
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="image">URL hình ảnh</Label>
                  <Input id="image" placeholder="/restaurant-image.jpg" />
                  <p className="mt-1 text-sm text-muted-foreground">Đường dẫn đến hình ảnh nhà hàng</p>
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select defaultValue="APPROVED">
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                      <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                      <SelectItem value="SUSPENDED">Tạm ngưng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Đang tạo..." : "Tạo nhà hàng"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
