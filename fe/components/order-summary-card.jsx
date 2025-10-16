import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DroneStatusBadge } from "@/components/drone-status-badge"
import { Link } from "react-router-dom"

export function OrderSummaryCard({
  id,
  date,
  restaurant,
  restaurantImage,
  total,
  status,
  itemCount,
}) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
            <img src={restaurantImage || "/placeholder.svg"} alt={restaurant} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-1 flex-col">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-semibold text-foreground">{restaurant}</h3>
              <p className="text-sm text-muted-foreground">{date}</p>
            </div>
            <DroneStatusBadge status={status} />
            <p className="mb-2 text-sm text-muted-foreground">
              {itemCount} món • Mã: {id}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">{total.toLocaleString("vi-VN")}₫</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/orders/${id}`}>Chi tiết</Link>
                </Button>
                {status === "COMPLETED" && (
                  <Button size="sm" asChild>
                    <Link to={`/orders/${id}/review`}>Đánh giá</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
