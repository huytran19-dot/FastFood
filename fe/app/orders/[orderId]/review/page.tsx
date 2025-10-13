"use client"

import type React from "react"

import { useState } from "react"
import { ChevronLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ReviewPage() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({
        title: "Vui lòng chọn số sao",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Cảm ơn đánh giá của bạn!",
      description: "Đánh giá đã được gửi thành công",
    })
    router.push("/orders")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/orders">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Đánh giá đơn hàng</h1>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Trải nghiệm của bạn thế nào?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground">Chọn số sao</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "h-12 w-12 transition-colors",
                            star <= (hoveredRating || rating) ? "fill-warning text-warning" : "text-muted-foreground",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm font-medium text-foreground">
                      {rating === 1 && "Rất tệ"}
                      {rating === 2 && "Tệ"}
                      {rating === 3 && "Bình thường"}
                      {rating === 4 && "Tốt"}
                      {rating === 5 && "Tuyệt vời"}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="comment" className="mb-2 block text-sm font-medium text-foreground">
                    Nhận xét của bạn
                  </label>
                  <Textarea
                    id="comment"
                    placeholder="Chia sẻ trải nghiệm của bạn về món ăn và dịch vụ giao hàng..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Gửi đánh giá
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
