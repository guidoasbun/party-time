import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  value: number
  className?: string
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div
      className={cn("w-full bg-secondary rounded-full h-2", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}