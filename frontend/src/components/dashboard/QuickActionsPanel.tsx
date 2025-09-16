'use client'

import * as React from 'react'
import {
  Plus,
  UserPlus,
  Calendar,
  Download,
  Settings,
  BarChart3,
  Mail,
  FileText,
  ArrowRight,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionsPanelProps {
  className?: string
  onCreateEvent?: () => void
  onImportGuests?: () => void
  onViewCalendar?: () => void
  onExportData?: () => void
  onSendInvitations?: () => void
  onViewReports?: () => void
  onManageSettings?: () => void
}

interface ActionButtonProps {
  icon: React.ElementType
  title: string
  description: string
  onClick?: () => void
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal'
  featured?: boolean
}

function ActionButton({
  icon: Icon,
  title,
  description,
  onClick,
  color = 'blue',
  featured = false
}: ActionButtonProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 group-hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 group-hover:bg-green-100',
    purple: 'text-purple-600 bg-purple-50 group-hover:bg-purple-100',
    orange: 'text-orange-600 bg-orange-50 group-hover:bg-orange-100',
    red: 'text-red-600 bg-red-50 group-hover:bg-red-100',
    teal: 'text-teal-600 bg-teal-50 group-hover:bg-teal-100'
  }

  const borderColors = {
    blue: 'group-hover:border-blue-200',
    green: 'group-hover:border-green-200',
    purple: 'group-hover:border-purple-200',
    orange: 'group-hover:border-orange-200',
    red: 'group-hover:border-red-200',
    teal: 'group-hover:border-teal-200'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative p-4 text-left border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 w-full',
        featured ? 'ring-2 ring-blue-500 ring-opacity-20' : '',
        borderColors[color]
      )}
    >
      <div className="flex items-start space-x-3">
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
          colorClasses[color]
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {title}
            </h3>
            {featured && (
              <div className="flex items-center space-x-1 text-xs text-blue-600 font-medium">
                <Zap className="w-3 h-3" />
                <span>Popular</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-2" />
      </div>

      {featured && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}
    </button>
  )
}

function QuickActionsGrid({
  onCreateEvent,
  onImportGuests,
  onViewCalendar,
  onExportData,
  onSendInvitations,
  onViewReports
}: Omit<QuickActionsPanelProps, 'className' | 'onManageSettings'>) {
  const actions = [
    {
      icon: Plus,
      title: 'Create New Event',
      description: 'Start planning your next celebration',
      onClick: onCreateEvent,
      color: 'blue' as const,
      featured: true
    },
    {
      icon: UserPlus,
      title: 'Import Guests',
      description: 'Upload CSV file or add guests manually',
      onClick: onImportGuests,
      color: 'green' as const,
      featured: false
    },
    {
      icon: Calendar,
      title: 'View Calendar',
      description: 'See all events in calendar view',
      onClick: onViewCalendar,
      color: 'purple' as const,
      featured: false
    },
    {
      icon: Mail,
      title: 'Send Invitations',
      description: 'Email invites to your guests',
      onClick: onSendInvitations,
      color: 'orange' as const,
      featured: false
    },
    {
      icon: BarChart3,
      title: 'View Reports',
      description: 'Analytics and event insights',
      onClick: onViewReports,
      color: 'teal' as const,
      featured: false
    },
    {
      icon: Download,
      title: 'Export Data',
      description: 'Download events and guest lists',
      onClick: onExportData,
      color: 'red' as const,
      featured: false
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action, index) => (
        <ActionButton key={index} {...action} />
      ))}
    </div>
  )
}

function RecentActions() {
  // This would typically come from a hook tracking user actions
  const recentActions = [
    {
      action: 'Created "Sarah\'s Birthday Party"',
      time: '2 minutes ago',
      icon: Plus
    },
    {
      action: 'Imported 25 guests',
      time: '1 hour ago',
      icon: UserPlus
    },
    {
      action: 'Sent 50 invitations',
      time: '3 hours ago',
      icon: Mail
    }
  ]

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-2 mb-3">
        <FileText className="w-4 h-4 text-gray-500" />
        <h4 className="text-sm font-medium text-gray-700">Recent Actions</h4>
      </div>
      <div className="space-y-2">
        {recentActions.map((item, index) => (
          <div key={index} className="flex items-center space-x-3 text-sm">
            <item.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-gray-700">{item.action}</span>
              <span className="text-gray-500 ml-2">{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function QuickActionsPanel({
  className,
  onCreateEvent,
  onImportGuests,
  onViewCalendar,
  onExportData,
  onSendInvitations,
  onViewReports,
  onManageSettings
}: QuickActionsPanelProps) {
  const handleCreateEvent = () => {
    onCreateEvent?.()
  }

  const handleImportGuests = () => {
    // TODO: Open import modal or navigate to import page
    onImportGuests?.()
    console.log('Import guests clicked')
  }

  const handleViewCalendar = () => {
    // TODO: Navigate to calendar view
    onViewCalendar?.()
    console.log('View calendar clicked')
  }

  const handleExportData = () => {
    // TODO: Open export modal
    onExportData?.()
    console.log('Export data clicked')
  }

  const handleSendInvitations = () => {
    // TODO: Open invitation sending modal
    onSendInvitations?.()
    console.log('Send invitations clicked')
  }

  const handleViewReports = () => {
    // TODO: Navigate to reports page
    onViewReports?.()
    console.log('View reports clicked')
  }

  const handleManageSettings = () => {
    // TODO: Navigate to settings page
    onManageSettings?.()
    console.log('Manage settings clicked')
  }

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-sm border border-gray-200',
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Common tasks to help you manage your events efficiently
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Quick Actions Grid */}
        <QuickActionsGrid
          onCreateEvent={handleCreateEvent}
          onImportGuests={handleImportGuests}
          onViewCalendar={handleViewCalendar}
          onExportData={handleExportData}
          onSendInvitations={handleSendInvitations}
          onViewReports={handleViewReports}
        />

        {/* Recent Actions */}
        <RecentActions />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Need help? Check our guides
          </span>
          <button
            onClick={handleManageSettings}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}