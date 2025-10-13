"use client"

import { Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface MenuItemCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  onAddToCart: (item: { id: string; name: string; price: number; image: string }) => void
}

export function MenuItemCard({ id, name, description, price, image, onAddToCart }: MenuItemCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="mb-1 text-base font-semibold text-foreground line-clamp-1">{name}</h3>
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{price.toLocaleString("vi-VN")}₫</span>
          <Button size="sm" onClick={() => onAddToCart({ id, name, price, image })} className="gap-1">
            <Plus className="h-4 w-4" />
            Thêm
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
