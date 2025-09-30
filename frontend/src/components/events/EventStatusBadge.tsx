import { EventStatus } from '@/types/event.types'
import { cn } from '@/lib/utils'

interface EventStatusBadgeProps {
  status: EventStatus
  className?: string
}

const statusConfig = {
  [EventStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
  },
  [EventStatus.PLANNING]: {
    label: 'Planning',
    className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700'
  },
  [EventStatus.CONFIRMED]: {
    label: 'Confirmed',
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
  },
  [EventStatus.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700'
  },
  [EventStatus.ACTIVE]: {
    label: 'Active',
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
  },
  [EventStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-700'
  },
  [EventStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'
  },
  [EventStatus.POSTPONED]: {
    label: 'Postponed',
    className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700'
  }
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = statusConfig[status]

  // Fallback for unknown status
  if (!config) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
          'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
          className
        )}
      >
        {status}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}