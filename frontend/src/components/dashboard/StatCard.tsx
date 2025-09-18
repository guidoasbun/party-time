'use client'

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  previousValue?: number
  icon: LucideIcon
  prefix?: string
  suffix?: string
  loading?: boolean
  className?: string
}

interface StatCardSkeletonProps {
  className?: string
}

function StatCardSkeleton({ className }: StatCardSkeletonProps) {
  return (
    <div className={cn(
      "bg-card rounded-lg border border-border p-6 shadow-sm",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-24"></div>
          <div className="h-8 bg-muted-foreground/20 rounded animate-pulse w-16"></div>
          <div className="h-4 bg-muted-foreground/20 rounded animate-pulse w-20"></div>
        </div>
        <div className="h-10 w-10 bg-muted-foreground/20 rounded-lg animate-pulse"></div>
      </div>
    </div>
  )
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function formatPercentageChange(percentage: number): string {
  const abs = Math.abs(percentage)
  if (abs === 0) return '0%'
  if (abs < 0.1) return '<0.1%'
  return `${abs.toFixed(1)}%`
}

export function StatCard({
  title,
  value,
  previousValue,
  icon: Icon,
  prefix = '',
  suffix = '',
  loading = false,
  className
}: StatCardProps) {
  if (loading) {
    return <StatCardSkeleton className={className} />
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value
  const hasComparison = previousValue !== undefined && !isNaN(previousValue)

  let percentageChange = 0
  let isPositive = false
  let isNegative = false

  if (hasComparison) {
    percentageChange = calculatePercentageChange(numericValue, previousValue)
    isPositive = percentageChange > 0
    isNegative = percentageChange < 0
  }

  const formattedValue = typeof value === 'number'
    ? value.toLocaleString()
    : value

  return (
    <div className={cn(
      "bg-card rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <p className="text-2xl font-bold text-card-foreground">
            {prefix}{formattedValue}{suffix}
          </p>

          {hasComparison && (
            <div className="flex items-center gap-1">
              {isPositive && (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    +{formatPercentageChange(percentageChange)}
                  </span>
                </>
              )}

              {isNegative && (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">
                    -{formatPercentageChange(percentageChange)}
                  </span>
                </>
              )}

              {!isPositive && !isNegative && (
                <span className="text-sm font-medium text-muted-foreground">
                  {formatPercentageChange(percentageChange)}
                </span>
              )}

              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>

        <div className={cn(
          "rounded-lg p-3",
          "bg-primary/10 text-primary"
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export { StatCardSkeleton }