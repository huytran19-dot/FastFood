import { Star, Clock, Plane } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

export function RestaurantCard({
  id,
  name,
  image,
  rating,
  deliveryTime,
  address,
  droneEnabled = true,
}) {
  return (
    <Link to={`/restaurant/${id}`}>
      <Card className="group overflow-hidden transition-all hover:lg">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {droneEnabled && (
            <Badge className="absolute right-2 top-2 bg-secondary text-secondary-foreground">
              <Plane className="mr-1 h-3 w-3" />
              Drone
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground">{name}</h3>
          <p className="mb-3 line-clamp-1 text-sm text-muted-foreground">{address}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-warning">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-medium text-foreground">{rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{deliveryTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
