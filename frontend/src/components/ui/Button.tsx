import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none touch-manipulation"

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
      outline: "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
      ghost: "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80"
    }

    const sizes = {
      sm: "h-9 min-h-[36px] px-3 text-sm",
      md: "h-10 min-h-[44px] py-2 px-4 text-sm",
      lg: "h-11 min-h-[48px] px-8 text-base"
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }