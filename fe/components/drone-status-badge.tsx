import { Badge } from "@/components/ui/badge"
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

interface DroneStatusBadgeProps {
  status: OrderStatus
}

const statusConfig = {
  PENDING: { label: "Chờ xác nhận", className: "bg-muted text-muted-foreground" },
  PAID: { label: "Đã thanh toán", className: "bg-blue-500 text-white" },
  PREPARING: { label: "Đang chuẩn bị", className: "bg-warning text-warning-foreground" },
  READY_FOR_DELIVERY: { label: "Sẵn sàng giao", className: "bg-secondary text-secondary-foreground" },
  DELIVERING: { label: "Đang bay", className: "bg-primary text-primary-foreground animate-pulse" },
  COMPLETED: { label: "Đã giao", className: "bg-success text-success-foreground" },
  CANCELLED: { label: "Đã hủy", className: "bg-destructive text-destructive-foreground" },
  FAILED: { label: "Thất bại", className: "bg-destructive text-destructive-foreground" },
}

export function DroneStatusBadge({ status }: DroneStatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Badge className={cn("font-medium", config.className)} variant="secondary">
      {config.label}
    </Badge>
  )
}
