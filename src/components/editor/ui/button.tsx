import * as React from "react"
import { type ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    
    const variantClasses = {
      default: "bg-[var(--notion-blue-text)] text-white hover:bg-[var(--notion-blue-text-hover)]",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      outline: "border border-[var(--notion-gray-border)] bg-transparent hover:bg-[var(--notion-gray-bg)]",
      secondary: "bg-[var(--notion-gray-bg)] text-[var(--foreground)] hover:bg-[var(--notion-gray-bg-hover)]",
      ghost: "hover:bg-[var(--notion-gray-bg)] hover:text-[var(--foreground)]",
      link: "underline-offset-4 hover:underline text-[var(--notion-blue-text)]",
    }

    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

