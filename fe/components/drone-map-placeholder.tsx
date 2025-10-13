"use client"

import { useEffect, useState } from "react"
import { MapPin, Plane } from "lucide-react"

interface DroneMapPlaceholderProps {
  status: string
}

export function DroneMapPlaceholder({ status }: DroneMapPlaceholderProps) {
  const [dronePosition, setDronePosition] = useState(0)

  useEffect(() => {
    if (status === "DELIVERING") {
      const interval = setInterval(() => {
        setDronePosition((prev) => {
          if (prev >= 100) return 0
          return prev + 1
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [status])

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-border bg-muted/30">
      {/* Map Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid h-full w-full grid-cols-8 grid-rows-8">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="border border-border" />
          ))}
        </div>
      </div>

      {/* Route Line */}
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(var(--secondary))" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M 50 200 Q 150 50, 350 150"
          stroke="url(#routeGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="8 4"
        />
      </svg>

      {/* Start Point (Restaurant) */}
      <div className="absolute bottom-8 left-12 flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <MapPin className="h-5 w-5" />
        </div>
        <span className="mt-2 text-xs font-medium text-foreground">Nhà hàng</span>
      </div>

      {/* End Point (Customer) */}
      <div className="absolute right-12 top-1/3 flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg">
          <MapPin className="h-5 w-5" />
        </div>
        <span className="mt-2 text-xs font-medium text-foreground">Bạn</span>
      </div>

      {/* Drone */}
      {status === "DELIVERING" && (
        <div
          className="absolute transition-all duration-100"
          style={{
            left: `${50 + (dronePosition / 100) * 250}px`,
            top: `${200 - Math.sin((dronePosition / 100) * Math.PI) * 100}px`,
          }}
        >
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-xl animate-bounce">
              <Plane className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-1 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-primary/20 blur-md" />
          </div>
        </div>
      )}

      {/* Status Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm">
        {status === "DELIVERING" ? "Drone đang bay đến..." : "Đang chuẩn bị giao hàng"}
      </div>
    </div>
  )
}
