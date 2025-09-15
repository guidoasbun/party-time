'use client'

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string | string[]
  onValueChange: (value: string | string[]) => void
  placeholder?: string
  multiple?: boolean
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  multiple = false,
  label,
  error,
  disabled = false,
  className
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const selectRef = React.useRef<HTMLDivElement>(null)
  const inputId = React.useId()

  const selectedValues = React.useMemo(() => {
    if (!value) return []
    return Array.isArray(value) ? value : [value]
  }, [value])

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  const selectedLabels = React.useMemo(() => {
    return selectedValues
      .map(val => options.find(opt => opt.value === val)?.label)
      .filter(Boolean)
      .join(", ")
  }, [selectedValues, options])

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue]
      onValueChange(newValues)
    } else {
      onValueChange(optionValue)
      setIsOpen(false)
    }
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false)
      setSearchQuery("")
    } else if (event.key === "Enter" && !isOpen) {
      setIsOpen(true)
    }
  }

  return (
    <div className={cn("relative", className)} ref={selectRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={inputId}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus:ring-destructive",
            isOpen && "ring-2 ring-ring ring-offset-2"
          )}
        >
          <span className={cn(
            "truncate",
            !selectedLabels && "text-muted-foreground"
          )}>
            {selectedLabels || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
            <div className="p-2 border-b border-border">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded border border-input bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="max-h-60 overflow-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionClick(option.value)}
                      className={cn(
                        "w-full flex items-center px-3 py-2 text-sm text-left text-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                    >
                      {multiple && (
                        <div className={cn(
                          "mr-2 h-4 w-4 rounded border border-input flex items-center justify-center bg-background",
                          isSelected && "bg-primary border-primary"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                      )}
                      <span className="truncate">{option.label}</span>
                      {!multiple && isSelected && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}