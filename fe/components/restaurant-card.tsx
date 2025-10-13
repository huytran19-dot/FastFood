import { Star, Clock, Plane } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface RestaurantCardProps {
  id: string
  name: string
  image: string
  rating: number
  deliveryTime: string
  address: string
  droneEnabled?: boolean
}

export function RestaurantCard({
  id,
  name,
  image,
  rating,
  deliveryTime,
  address,
  droneEnabled = true,
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {droneEnabled && (
            <Badge className="absolute right-2 top-2 bg-secondary text-secondary-foreground">
              <Plane className="mr-1 h-3 w-3" />
              Drone
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground line-clamp-1">{name}</h3>
          <p className="mb-3 text-sm text-muted-foreground line-clamp-1">{address}</p>
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
