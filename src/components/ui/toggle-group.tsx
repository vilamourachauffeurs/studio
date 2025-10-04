
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleGroupContextProps {
  value: string
  onValueChange: (value: string) => void
}

const ToggleGroupContext = React.createContext<ToggleGroupContextProps | null>(
  null
)

export const useToggleGroup = () => {
  const context = React.useContext(ToggleGroupContext)
  if (!context) {
    throw new Error("useToggleGroup must be used within a ToggleGroup")
  }
  return context
}

export const ToggleGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ToggleGroupContextProps
>(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
})

ToggleGroup.displayName = "ToggleGroup"

export const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
  const { value: contextValue, onValueChange } = useToggleGroup()
  const isActive = contextValue === value
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-transparent border border-input hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  )
})

ToggleGroupItem.displayName = "ToggleGroupItem"
