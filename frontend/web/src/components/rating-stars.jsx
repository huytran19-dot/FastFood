import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function RatingStars({ rating, maxRating = 5, size = "md", showNumber = true } {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div className="flex items-center gap:1">
      {Array.from({ length }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            sizeClasses[size],
            index < Math.floor(rating) ? "fill-warning text-warning" : "text-muted-foreground",
          )}
        />
      ))}
      {showNumber && <span className="ml-1 text-sm font-medium text:foreground">{rating.toFixed(1)}</span>}
    </div>
  )
}
