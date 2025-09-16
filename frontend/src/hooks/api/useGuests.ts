/**
 * React Query hooks for guests API
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query'
import { 
  Guest, 
  GuestCreate, 
  GuestUpdate, 
  GuestListResponse,
  GuestSearchParams,
  RsvpUpdate,
  RsvpResponse,
  RsvpStatus,
  GuestImportResponse,
  RSVPSummary
} from '@/types'
import { guestsService } from '@/lib/api/services'
import { ApiResponse, ApiException } from '@/types/common.types'

// Query keys
export const guestKeys = {
  all: ['guests'] as const,
  lists: () => [...guestKeys.all, 'list'] as const,
  list: (eventId: string, params?: GuestSearchParams) => [...guestKeys.lists(), eventId, params] as const,
  details: () => [...guestKeys.all, 'detail'] as const,
  detail: (id: string) => [...guestKeys.details(), id] as const,
  rsvp: () => [...guestKeys.all, 'rsvp'] as const,
  rsvpByToken: (token: string) => [...guestKeys.rsvp(), token] as const,
  summaries: () => [...guestKeys.all, 'summary'] as const,
  summary: (eventId: string) => [...guestKeys.summaries(), eventId] as const,
}

// Query hooks
export function useGuests(
  eventId: string,
  params?: GuestSearchParams,
  options?: UseQueryOptions<ApiResponse<GuestListResponse>, ApiException>
) {
  return useQuery({
    queryKey: guestKeys.list(eventId, params),
    queryFn: () => guestsService.getGuests(eventId, params),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

export function useGuest(
  id: string,
  options?: UseQueryOptions<ApiResponse<Guest>, ApiException>
) {
  return useQuery({
    queryKey: guestKeys.detail(id),
    queryFn: () => guestsService.getGuest(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useGuestByRsvpToken(
  token: string,
  options?: UseQueryOptions<ApiResponse<Guest>, ApiException>
) {
  return useQuery({
    queryKey: guestKeys.rsvpByToken(token),
    queryFn: () => guestsService.getGuestByRsvpToken(token),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useRSVPSummary(
  eventId: string,
  options?: UseQueryOptions<ApiResponse<RSVPSummary>, ApiException>
) {
  return useQuery({
    queryKey: guestKeys.summary(eventId),
    queryFn: () => guestsService.getRSVPSummary(eventId),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  })
}

// Mutation hooks
export function useCreateGuest(
  options?: UseMutationOptions<ApiResponse<Guest>, ApiException, { eventId: string; data: GuestCreate }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }) => guestsService.createGuest(eventId, data),
    onSuccess: (data, variables) => {
      // Add the new guest to the cache
      queryClient.setQueryData(
        guestKeys.detail(data.data.id),
        data
      )

      // Invalidate guests list for this event
      queryClient.invalidateQueries({ 
        queryKey: guestKeys.list(variables.eventId) 
      })

      // Invalidate RSVP summary
      queryClient.invalidateQueries({
        queryKey: guestKeys.summary(variables.eventId)
      })
    },
    ...options,
  })
}

export function useUpdateGuest(
  options?: UseMutationOptions<ApiResponse<Guest>, ApiException, { id: string; data: GuestUpdate }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => guestsService.updateGuest(id, data),
    onSuccess: (data, variables) => {
      // Update the specific guest cache
      queryClient.setQueryData(
        guestKeys.detail(variables.id),
        data
      )

      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ 
        queryKey: guestKeys.list(data.data.event_id) 
      })

      // Invalidate RSVP summary
      queryClient.invalidateQueries({
        queryKey: guestKeys.summary(data.data.event_id)
      })
    },
    ...options,
  })
}

export function useDeleteGuest(
  options?: UseMutationOptions<void, ApiException, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: guestsService.deleteGuest,
    onSuccess: (_, guestId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: guestKeys.detail(guestId) })
      
      // Invalidate all guest lists (we don't know which event this guest belonged to)
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() })
      
      // Invalidate all RSVP summaries
      queryClient.invalidateQueries({ queryKey: guestKeys.summaries() })
    },
    ...options,
  })
}

export function useDeleteGuests(
  options?: UseMutationOptions<void, ApiException, { eventId: string; guestIds: string[] }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, guestIds }) => guestsService.deleteGuests(eventId, guestIds),
    onSuccess: (_, variables) => {
      // Remove each guest from cache
      variables.guestIds.forEach(guestId => {
        queryClient.removeQueries({ queryKey: guestKeys.detail(guestId) })
      })
      
      // Invalidate guests list for this event
      queryClient.invalidateQueries({ 
        queryKey: guestKeys.list(variables.eventId) 
      })
      
      // Invalidate RSVP summary
      queryClient.invalidateQueries({
        queryKey: guestKeys.summary(variables.eventId)
      })
    },
    ...options,
  })
}

export function useImportGuests(
  options?: UseMutationOptions<ApiResponse<GuestImportResponse>, ApiException, { eventId: string; file: File }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, file }) => guestsService.importGuests(eventId, file),
    onSuccess: (_, variables) => {
      // Invalidate guests list to show imported guests
      queryClient.invalidateQueries({ 
        queryKey: guestKeys.list(variables.eventId) 
      })
      
      // Invalidate RSVP summary
      queryClient.invalidateQueries({
        queryKey: guestKeys.summary(variables.eventId)
      })
    },
    ...options,
  })
}

export function useExportGuests(
  options?: UseMutationOptions<Blob, ApiException, { eventId: string; format: 'csv' | 'xlsx' }>
) {
  return useMutation({
    mutationFn: ({ eventId, format }) => guestsService.exportGuests(eventId, format),
    ...options,
  })
}

export function useUpdateRSVP(
  options?: UseMutationOptions<ApiResponse<RsvpResponse>, ApiException, { token: string; data: RsvpUpdate }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ token, data }) => guestsService.updateRSVP(token, data),
    onSuccess: (data, variables) => {
      // Update guest cache if we can identify the guest
      if (data.data.guest_id) {
        queryClient.invalidateQueries({
          queryKey: guestKeys.detail(data.data.guest_id)
        })
      }

      // Update RSVP token cache
      queryClient.invalidateQueries({
        queryKey: guestKeys.rsvpByToken(variables.token)
      })

      // Invalidate RSVP summary for the event
      if (data.data.event_id) {
        queryClient.invalidateQueries({
          queryKey: guestKeys.summary(data.data.event_id)
        })
        
        // Also invalidate guests list
        queryClient.invalidateQueries({ 
          queryKey: guestKeys.list(data.data.event_id) 
        })
      }
    },
    ...options,
  })
}

export function useSendInvitations(
  options?: UseMutationOptions<void, ApiException, { eventId: string; guestIds?: string[] }>
) {
  return useMutation({
    mutationFn: ({ eventId, guestIds }) => guestsService.sendInvitations(eventId, guestIds),
    ...options,
  })
}

export function useSendReminders(
  options?: UseMutationOptions<void, ApiException, { eventId: string; guestIds?: string[] }>
) {
  return useMutation({
    mutationFn: ({ eventId, guestIds }) => guestsService.sendReminders(eventId, guestIds),
    ...options,
  })
}

// Composite hooks
export function useGuestManagement(eventId: string, params?: GuestSearchParams) {
  const { data: guests, isLoading, error, refetch } = useGuests(eventId, params)
  const { data: summary, isLoading: summaryLoading } = useRSVPSummary(eventId)
  
  const createMutation = useCreateGuest({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to create guest:', error)
    }
  })

  const updateMutation = useUpdateGuest({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to update guest:', error)
    }
  })

  const deleteMutation = useDeleteGuest({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to delete guest:', error)
    }
  })

  const bulkDeleteMutation = useDeleteGuests({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to delete guests:', error)
    }
  })

  const importMutation = useImportGuests({
    onSuccess: (data) => {
      // Optional: Show import results
      console.log('Import completed:', data.data)
    },
    onError: (error) => {
      console.error('Failed to import guests:', error)
    }
  })

  const sendInvitationsMutation = useSendInvitations({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to send invitations:', error)
    }
  })

  // Helper functions
  const getGuestsByStatus = (status: RsvpStatus) => {
    return guests?.data.guests.filter(guest => guest.rsvp_status === status) || []
  }

  const getGuestsWithPlusOnes = () => {
    return guests?.data.guests.filter(guest => guest.plus_one_allowed) || []
  }

  const getConfirmedGuestsCount = () => {
    const confirmed = getGuestsByStatus(RsvpStatus.CONFIRMED)
    return confirmed.reduce((count, guest) => {
      return count + 1 + (guest.plus_one_name ? 1 : 0)
    }, 0)
  }

  return {
    guests: guests?.data.guests || [],
    pagination: guests?.data.pagination,
    summary: summary?.data,
    isLoading: isLoading || summaryLoading,
    error,
    refetch,
    createGuest: createMutation.mutate,
    updateGuest: updateMutation.mutate,
    deleteGuest: deleteMutation.mutate,
    deleteGuests: bulkDeleteMutation.mutate,
    importGuests: importMutation.mutate,
    sendInvitations: sendInvitationsMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending || bulkDeleteMutation.isPending,
    isImporting: importMutation.isPending,
    isSendingInvitations: sendInvitationsMutation.isPending,
    // Helper methods
    getGuestsByStatus,
    getGuestsWithPlusOnes,
    getConfirmedGuestsCount,
  }
}

export function useRSVPForm(token: string) {
  const { data: guest, isLoading, error } = useGuestByRsvpToken(token)
  
  const updateMutation = useUpdateRSVP({
    onSuccess: () => {
      // Optional: Show success message
    },
    onError: (error) => {
      console.error('Failed to update RSVP:', error)
    }
  })

  return {
    guest: guest?.data,
    isLoading,
    error,
    updateRSVP: updateMutation.mutate,
    isSubmitting: updateMutation.isPending,
    submitError: updateMutation.error,
    isSuccess: updateMutation.isSuccess,
  }
}

export function useGuestForm(eventId: string, guestId?: string) {
  const { data: guest } = useGuest(guestId || '', { enabled: !!guestId })
  
  const createMutation = useCreateGuest()
  const updateMutation = useUpdateGuest()

  const submitGuest = (data: GuestCreate | GuestUpdate) => {
    if (guestId) {
      updateMutation.mutate({ id: guestId, data: data as GuestUpdate })
    } else {
      createMutation.mutate({ eventId, data: data as GuestCreate })
    }
  }

  return {
    guest: guest?.data,
    submitGuest,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
  }
}