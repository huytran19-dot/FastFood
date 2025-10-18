import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, ShoppingCart } from "lucide-react"

export function CartDrawer({ items = [], onUpdateQuantity, onRemoveItem, onUpdateNote }) {
  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0)
  const total = items.reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0)

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          {itemCount > 0 ? `Giỏ hàng (${itemCount})` : "Giỏ hàng"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full max-w-md">
        <DrawerHeader>
          <DrawerTitle>Giỏ hàng của bạn</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có món nào trong giỏ.</p>
          )}

          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-lg border p-3">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="h-16 w-16 rounded object-cover"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{(item.price || 0).toLocaleString("vi-VN")}₫</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveItem?.(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <QuantityStepper value={item.quantity || 1} onChange={(q) => onUpdateQuantity?.(item.id, q)} />
                  <span className="text-sm font-medium text-foreground">
                    {((item.price || 0) * (item.quantity || 0)).toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="mt-2">
                  <Textarea
                    placeholder="Ghi chú cho món này"
                    value={item.note || ""}
                    onChange={(e) => onUpdateNote?.(item.id, e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <DrawerFooter>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tổng cộng</span>
            <span className="text-lg font-semibold text-foreground">{total.toLocaleString("vi-VN")}₫</span>
          </div>
          <Button asChild disabled={items.length === 0}>
            <Link to="/checkout">Thanh toán</Link>
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Đóng</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
