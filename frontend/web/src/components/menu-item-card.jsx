import { Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function MenuItemCard({ id, name, description, price, image, onAddToCart }) {
  return (
    <Card className="group overflow-hidden transition-all">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="mb-1 line-clamp-1 text-base font-semibold text-foreground">{name}</h3>
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{description}</p>
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
