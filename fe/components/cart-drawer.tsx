"use client"

import { ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { QuantityStepper } from "@/components/quantity-stepper"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  note?: string
}

interface CartDrawerProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onUpdateNote: (id: string, note: string) => void
}

export function CartDrawer({ items, onUpdateQuantity, onRemoveItem, onUpdateNote }: CartDrawerProps) {
  const [open, setOpen] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 15000
  const total = subtotal + deliveryFee

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground">
              {items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Giỏ hàng của bạn</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Giỏ hàng trống</h3>
            <p className="mb-4 text-sm text-muted-foreground">Thêm món ăn yêu thích vào giỏ hàng</p>
            <Button onClick={() => setOpen(false)}>Khám phá món ngon</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-lg border border-border p-3">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-foreground">{item.name}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 -mt-1"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold text-primary">{item.price.toLocaleString("vi-VN")}₫</p>
                      <div className="mt-2">
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(quantity) => onUpdateQuantity(item.id, quantity)}
                        />
                      </div>
                      <Textarea
                        placeholder="Ghi chú (không bắt buộc)"
                        className="mt-2 h-16 text-sm"
                        value={item.note || ""}
                        onChange={(e) => onUpdateNote(item.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium">{subtotal.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí giao hàng</span>
                  <span className="font-medium">{deliveryFee.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-bold text-primary">{total.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
              <Button className="mt-4 w-full" size="lg" asChild>
                <Link href="/checkout">Thanh toán</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
