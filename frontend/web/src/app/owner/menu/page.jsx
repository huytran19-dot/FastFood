import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

// Mock menu items
const initialMenuItems = [
  {
    id: "1",
    name: "Burger Bò Phô Mai",
    description: "Burger bò Úc 100% với phô mai cheddar tan chảy",
    price: 89000,
    image: "/burger-cheese.jpg",
  available: true,
    category: "Combo",
  },
  {
    id: "2",
    name: "Gà Rán Giòn",
    description: "Gà rán giòn tan với công thức bí mật",
    price: 59000,
    image: "/fried-chicken.jpg",
  available: true,
    category: "Combo",
  },
  {
    id: "3",
    name: "Khoai Tây Chiên",
    description: "Khoai tây chiên giòn rụm, ăn kèm tương cà",
    price: 29000,
    image: "/french-fries.jpg",
  available: true,
    category: "Combo",
  },
]

export default function OwnerMenuPage() {
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleToggleAvailability = (id) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, available: !item.available } : item)))
    toast({
      title: "Đã cập nhật trạng thái",
    })
  }

  const handleDelete = (id) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
    toast({
      title: "Đã xóa món ăn",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Quản lý thực đơn</h1>
            <p className="text-muted-foreground">Thêm, sửa, xóa món ăn</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm món mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm món ăn mới</DialogTitle>
              </DialogHeader>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên món</Label>
                  <Input id="name" placeholder="Burger Bò Phô Mai" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea id="description" placeholder="Mô tả chi tiết về món ăn" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá (₫)</Label>
                    <Input id="price" type="number" placeholder="89000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục</Label>
                    <Input id="category" placeholder="Combo" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL hình ảnh</Label>
                  <Input id="image" placeholder="/burger-cheese.jpg" />
                </div>
                <Button type="submit" className="w-full">Thêm món</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                <Badge className="absolute right-2 top-2" variant={item.available ? "default" : "secondary"}>
                  {item.available ? "Còn hàng" : "Hết hàng"}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="mb-1 text-lg font-semibold text-foreground">{item.name}</h3>
                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                <p className="mb-3 text-lg font-bold text-primary">{item.price.toLocaleString("vi-VN")}₫</p>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={item.available} onCheckedChange={() => handleToggleAvailability(item.id)} />
                    <span className="text-sm text-muted-foreground">Còn hàng</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
