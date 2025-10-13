import { Check, Clock, ChefHat, Package, Plane, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PREPARING"
  | "READY_FOR_DELIVERY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"

interface OrderTimelineProps {
  currentStatus: OrderStatus
}

const statusSteps = [
  { status: "PENDING", label: "Chờ xác nhận", icon: Clock },
  { status: "PAID", label: "Đã thanh toán", icon: Check },
  { status: "PREPARING", label: "Đang chuẩn bị", icon: ChefHat },
  { status: "READY_FOR_DELIVERY", label: "Sẵn sàng giao", icon: Package },
  { status: "DELIVERING", label: "Đang giao hàng", icon: Plane },
  { status: "COMPLETED", label: "Hoàn thành", icon: CheckCircle2 },
]

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const currentIndex = statusSteps.findIndex((step) => step.status === currentStatus)
  const isCancelled = currentStatus === "CANCELLED"
  const isFailed = currentStatus === "FAILED"

  if (isCancelled || isFailed) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive bg-destructive/10 p-4">
        <XCircle className="h-6 w-6 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">{isCancelled ? "Đơn hàng đã hủy" : "Đơn hàng thất bại"}</p>
          <p className="text-sm text-muted-foreground">
            {isCancelled ? "Đơn hàng đã được hủy bởi người dùng" : "Có lỗi xảy ra trong quá trình xử lý"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {statusSteps.map((step, index) => {
        const Icon = step.icon
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        const isLast = index === statusSteps.length - 1

        return (
          <div key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              {!isLast && (
                <div className={cn("h-12 w-0.5 transition-colors", isCompleted ? "bg-primary" : "bg-border")} />
              )}
            </div>
            <div className="flex-1 pb-8">
              <p
                className={cn(
                  "font-medium transition-colors",
                  isCompleted ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {isCurrent && <p className="mt-1 text-sm text-primary">Đang xử lý...</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
