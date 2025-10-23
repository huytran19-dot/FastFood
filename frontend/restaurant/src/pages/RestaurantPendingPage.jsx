import { Clock, Store, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function RestaurantPendingPage() {
  const { restaurant, user } = useAuth()

  const isPending = restaurant?.review_status === 'PENDING'
  const isRejected = restaurant?.review_status === 'REJECTED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className={`flex h-20 w-20 items-center justify-center rounded-full ${
                isPending ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                {isPending ? (
                  <Clock className={`h-10 w-10 text-yellow-600`} />
                ) : (
                  <XCircle className={`h-10 w-10 text-red-600`} />
                )}
              </div>
            </div>
            
            <CardTitle className="text-2xl">
              {isPending ? 'Nhà Hàng Đang Chờ Duyệt' : 'Nhà Hàng Bị Từ Chối'}
            </CardTitle>
            
            <CardDescription className="text-base mt-2">
              {isPending 
                ? 'Nhà hàng của bạn đang được xem xét bởi quản trị viên'
                : 'Nhà hàng của bạn đã bị từ chối'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Restaurant Info */}
            {restaurant && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {restaurant.image_url ? (
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <Store className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                    <p className="text-sm text-muted-foreground">{restaurant.address}, {restaurant.city}</p>
                    <div className="mt-2">
                      <Badge variant={isPending ? "secondary" : "destructive"}>
                        {isPending ? 'Chờ duyệt' : 'Bị từ chối'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason */}
                {isRejected && restaurant.rejection_reason && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive text-sm">Lý do từ chối:</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {restaurant.rejection_reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status Message */}
            <div className="space-y-3">
              {isPending ? (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Đơn đăng ký của bạn đã được gửi thành công
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Quản trị viên sẽ xem xét trong vòng 24-48 giờ
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Store className="h-5 w-5 text-primary mt-0.5" />
                    <p className="text-sm text-muted-foreground">
                      Bạn sẽ nhận được thông báo qua email khi có kết quả
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Vui lòng kiểm tra lý do từ chối và liên hệ với chúng tôi để biết thêm chi tiết
                  </p>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="font-medium text-sm mb-2">Cần hỗ trợ?</p>
              <p className="text-sm text-muted-foreground">
                Email: <a href="mailto:support@fastfood.com" className="text-primary hover:underline">support@fastfood.com</a>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Hotline: <a href="tel:1900xxxx" className="text-primary hover:underline">1900 xxxx</a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.reload()}
              >
                Làm mới trang
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>FastFood Drone Delivery System</p>
        </div>
      </div>
    </div>
  )
}
