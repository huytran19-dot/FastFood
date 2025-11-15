import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * @typedef {'PENDING'|'PAID'|'PREPARING'|'CONFIRMED'|'READY_FOR_DELIVERY'|'DELIVERING'|'WAITING_OTP'|'COMPLETED'|'CANCELLED'|'FAILED'} DroneStatus
 */

const statusConfig = {
  PENDING: { label: "Chờ xác nhận", className: "bg-muted text-muted-foreground" },
  PAID: { label: "Đã thanh toán", className: "bg-blue-500 text-white" },
  CONFIRMED: { label: "Đã xác nhận", className: "bg-green-500 text-white" },
  PREPARING: { label: "Đang chuẩn bị", className: "bg-warning text-warning-foreground" },
  READY_FOR_DELIVERY: { label: "Sẵn sàng giao", className: "bg-secondary text-secondary-foreground" },
  DELIVERING: { label: "Đang bay", className: "bg-primary text-primary-foreground animate-pulse" },
  WAITING_OTP: { label: "Chờ xác nhận OTP", className: "bg-orange-500 text-white animate-pulse" },
  COMPLETED: { label: "Đã giao", className: "bg-success text-success-foreground" },
  CANCELLED: { label: "Đã hủy", className: "bg-destructive text-destructive-foreground" },
  FAILED: { label: "Thất bại", className: "bg-destructive text-destructive-foreground" },
}

export function DroneStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.PENDING
  return (
    <Badge className={cn("font-medium", config.className)} variant="secondary">
      {config.label}
    </Badge>
  )
}
