import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChipProps {
  children: React.ReactNode
  selected?: boolean
  onToggle?: () => void
  onRemove?: () => void
  variant?: "default" | "status" | "filter"
  size?: "sm" | "md"
  disabled?: boolean
  className?: string
}

export function Chip({
  children,
  selected = false,
  onToggle,
  onRemove,
  variant = "default",
  size = "md",
  disabled = false,
  className
}: ChipProps) {
  const baseStyles = "inline-flex items-center gap-1 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  const variants = {
    default: cn(
      "border",
      selected
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
        : "bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground"
    ),
    status: cn(
      "border-2",
      selected
        ? "bg-blue-600 text-white border-blue-600 shadow-md font-semibold"
        : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800"
    ),
    filter: cn(
      "border",
      selected
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
        : "bg-background text-muted-foreground border-muted hover:border-input hover:text-foreground"
    )
  }

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm"
  }

  const handleClick = () => {
    if (disabled) return
    onToggle?.()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    onRemove?.()
  }

  const isClickable = !disabled && (onToggle || onRemove)

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isClickable && "cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onToggle ? handleClick : undefined}
      role={onToggle ? "button" : undefined}
      tabIndex={onToggle && !disabled ? 0 : undefined}
      onKeyDown={onToggle ? (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      } : undefined}
    >
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className={cn(
            "inline-flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10",
            size === "sm" ? "h-3 w-3" : "h-4 w-4",
            disabled && "pointer-events-none"
          )}
          aria-label="Remove"
        >
          <X className={cn(size === "sm" ? "h-2 w-2" : "h-3 w-3")} />
        </button>
      )}
    </span>
  )
}

interface ChipGroupProps {
  children: React.ReactNode
  className?: string
}

export function ChipGroup({ children, className }: ChipGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {children}
    </div>
  )
}