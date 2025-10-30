/**
 * InvitationStats Component
 *
 * FR-7: The system shall send email invitations
 * 5.2.3: Email Campaign Interface
 *
 * Dashboard displaying invitation delivery statistics and tracking.
 */

'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { emailsService } from '@/lib/api/services';
import { UUID } from '@/types';

interface InvitationStatsProps {
  eventId: UUID;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * InvitationStats - Dashboard for invitation delivery tracking
 */
export function InvitationStats({
  eventId,
  autoRefresh = true,
  refreshInterval = 60000, // 60 seconds
}: InvitationStatsProps) {
  // Fetch invitation stats
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['invitation-stats', eventId],
    queryFn: () => emailsService.getInvitationStats(eventId),
    staleTime: 30000, // 30 seconds
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refetch]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <ErrorMessage message="Failed to load invitation statistics" />
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      label: 'Total Sent',
      value: stats.total_invitations,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      label: 'Delivered',
      value: stats.delivered,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      label: 'Pending',
      value: stats.pending,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    {
      label: 'Failed',
      value: stats.failed + stats.bounced,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
    },
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Invitation Delivery Status
          </h3>
          {autoRefresh && (
            <Badge variant="default">
              Auto-refresh: {refreshInterval / 1000}s
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4`}
            >
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {stat.label}
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Rate */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Delivery Rate
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {stats.delivery_rate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats.delivery_rate}%` }}
            />
          </div>
        </div>

        {/* Additional Details */}
        {(stats.bounced > 0 || stats.complained > 0) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Issues
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {stats.bounced > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <span className="text-sm text-orange-900 dark:text-orange-100">
                    Bounced
                  </span>
                  <Badge variant="outline">
                    {stats.bounced}
                  </Badge>
                </div>
              )}
              {stats.complained > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <span className="text-sm text-red-900 dark:text-red-100">
                    Spam Complaints
                  </span>
                  <Badge variant="destructive">
                    {stats.complained}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Data State */}
        {stats.total_invitations === 0 && (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No invitations sent yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Send your first invitation to see delivery statistics here.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
