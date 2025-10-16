import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plane, Battery, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock drones
const initialDrones = [
  {
    id: "D-001",
    model: "DJI Delivery Pro",
    battery: 78,
    capacity: "5kg",
    status: "IDLE",
  },
  {
    id: "D-002",
    model: "DJI Delivery Pro",
    battery: 54,
    capacity: "5kg",
    status: "EN_ROUTE",
    currentOrder: "FD-000123",
  },
  {
    id: "D-003",
    model: "DJI Delivery Max",
    battery: 92,
    capacity: "8kg",
    status: "RETURNING",
  },
  {
    id: "D-004",
    model: "DJI Delivery Pro",
    battery: 100,
    capacity: "5kg",
    status: "IDLE",
  },
]

const statusConfig = {
  IDLE: { label: "Sẵn sàng", color: "bg-success text-success-foreground" },
  EN_ROUTE: { label: "Đang giao hàng", color: "bg-primary text-primary-foreground" },
  RETURNING: { label: "Đang quay về", color: "bg-secondary text-secondary-foreground" },
}

export default function OwnerDronesPage() {
  const [drones] = useState(initialDrones)
  const { toast } = useToast()

  const handleSimulateFlight = (droneId) => {
    toast({
      title: "Mô phỏng chuyến bay",
      description: `Drone ${droneId} đang thực hiện chuyến bay mô phỏng`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Quản lý Drone</h1>
          <p className="text-muted-foreground">Theo dõi trạng thái đội drone giao hàng</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drones.map((drone) => {
            const status = statusConfig[drone.status]
            return (
              <Card key={drone.id}>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                        <Plane className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{drone.id}</h3>
                        <p className="text-sm text-muted-foreground">{drone.model}</p>
                      </div>
                    </div>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>

                  <div className="space-y-4">
                    {/* Battery */}
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Battery className="h-4 w-4" />
                          <span>Pin</span>
                        </div>
                        <span className="font-medium text-foreground">{drone.battery}%</span>
                      </div>
                      <Progress value={drone.battery} className="h-2" />
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>Tải trọng</span>
                      </div>
                      <span className="font-medium text-foreground">{drone.capacity}</span>
                    </div>

                    {/* Current Order */}
                    {drone.currentOrder && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Đơn hàng hiện tại</p>
                        <p className="font-medium text-foreground">{drone.currentOrder}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => handleSimulateFlight(drone.id)}
                      disabled={drone.status !== "IDLE"}
                    >
                      Mô phỏng chuyến bay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
