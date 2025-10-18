import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function QuantityStepper({ value, onChange, min = 1, max = 99 }) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-transparent"
        onClick={handleDecrease}
        disabled={value <= min}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-medium">{value}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 bg-transparent"
        onClick={handleIncrease}
        disabled={value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
