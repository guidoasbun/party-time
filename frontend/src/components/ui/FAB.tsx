import * as React from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ComponentType<{ className?: string }>
  label?: string
  position?: 'bottom-right' | 'bottom-left'
  size?: 'sm' | 'md' | 'lg'
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({
    className,
    icon: Icon = Plus,
    label = "Create Event",
    position = 'bottom-right',
    size = 'md',
    ...props
  }, ref) => {
    const baseStyles = "fixed z-50 flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 text-white group"

    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6'
    }

    const sizes = {
      sm: 'h-12 w-12',
      md: 'h-14 w-14',
      lg: 'h-16 w-16'
    }

    const iconSizes = {
      sm: 'h-5 w-5',
      md: 'h-6 w-6',
      lg: 'h-7 w-7'
    }

    return (
      <>
        <button
          ref={ref}
          className={cn(
            baseStyles,
            positions[position],
            sizes[size],
            className
          )}
          aria-label={label}
          title={label}
          {...props}
        >
          <Icon className={iconSizes[size]} />
        </button>

        {/* Tooltip */}
        {label && (
          <div
            className={cn(
              "fixed z-40 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
              position === 'bottom-right' ? 'bottom-6' : 'bottom-6',
              position === 'bottom-right' ? 'right-20' : 'left-20'
            )}
            style={{
              transform: position === 'bottom-right' ? 'translateY(50%)' : 'translateY(50%)'
            }}
          >
            {label}
            <div
              className={cn(
                "absolute top-1/2 w-2 h-2 bg-gray-900 transform rotate-45 -translate-y-1/2",
                position === 'bottom-right' ? 'right-[-4px]' : 'left-[-4px]'
              )}
            />
          </div>
        )}
      </>
    )
  }
)

FAB.displayName = "FAB"

export { FAB }