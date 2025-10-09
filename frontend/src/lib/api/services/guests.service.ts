/**
 * Guests service module
 */

import { api, withRetry } from '@/lib/api-client'
import { getSession } from 'next-auth/react'
import {
  Guest,
  GuestCreate,
  GuestUpdate,
  GuestSummary,
  GuestBulkCreate,
  GuestBulkUpdate,
  GuestSearchParams,
  GuestStats,
  GuestRSVPUpdate,
  GuestImportResult,
  RsvpStatus,
  PaginatedResponse,
  UUID,
  API_ENDPOINTS,
  InvitationLinkData,
  TokenValidationResult,
  RSVPEventDetails,
  QRCodeOptions
} from '@/types'

/**
 * Guests service class with typed methods
 */
export class GuestsService {
  /**
   * Get all guests for an event
   */
  async getGuests(eventId: UUID, params?: GuestSearchParams): Promise<PaginatedResponse<Guest>> {
    return api.get<PaginatedResponse<Guest>>(
      API_ENDPOINTS.GUESTS.LIST(eventId),
      params,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get a single guest by ID
   */
  async getGuest(eventId: UUID, guestId: UUID): Promise<Guest> {
    return api.get<Guest>(
      API_ENDPOINTS.GUESTS.GET(eventId, guestId),
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Create a new guest
   */
  async createGuest(eventId: UUID, data: GuestCreate): Promise<Guest> {
    return api.post<Guest, GuestCreate>(
      API_ENDPOINTS.GUESTS.CREATE(eventId),
      data
    )
  }

  /**
   * Update an existing guest
   */
  async updateGuest(eventId: UUID, guestId: UUID, data: GuestUpdate): Promise<Guest> {
    return api.patch<Guest, GuestUpdate>(
      API_ENDPOINTS.GUESTS.UPDATE(eventId, guestId),
      data
    )
  }

  /**
   * Delete a guest
   */
  async deleteGuest(eventId: UUID, guestId: UUID): Promise<{ message: string }> {
    return api.delete<{ message: string }>(
      API_ENDPOINTS.GUESTS.DELETE(eventId, guestId)
    )
  }

  /**
   * Bulk create guests
   */
  async bulkCreateGuests(eventId: UUID, data: GuestBulkCreate): Promise<{
    created_count: number
    errors: Array<{ index: number; error: string }>
    guests: GuestSummary[]
  }> {
    return api.post<{
      created_count: number
      errors: Array<{ index: number; error: string }>
      guests: GuestSummary[]
    }, GuestBulkCreate>(
      API_ENDPOINTS.GUESTS.BULK_CREATE(eventId),
      data
    )
  }

  /**
   * Bulk update guests RSVP status
   */
  async bulkUpdateGuestsStatus(
    eventId: UUID,
    guestIds: UUID[],
    rsvpStatus: RsvpStatus
  ): Promise<{
    message: string
    updated_count: number
    new_status: string
  }> {
    return api.patch<{
      message: string
      updated_count: number
      new_status: string
    }, { guest_ids: UUID[]; rsvp_status: RsvpStatus }>(
      API_ENDPOINTS.GUESTS.BULK_UPDATE(eventId),
      { guest_ids: guestIds, rsvp_status: rsvpStatus }
    )
  }

  /**
   * Bulk delete guests
   */
  async bulkDeleteGuests(eventId: UUID, guestIds: UUID[]): Promise<{
    message: string
    deleted_count: number
  }> {
    return api.post<{
      message: string
      deleted_count: number
    }, { guest_ids: UUID[] }>(
      API_ENDPOINTS.GUESTS.BULK_DELETE(eventId),
      { guest_ids: guestIds }
    )
  }

  /**
   * Get guest statistics for an event
   */
  async getGuestStats(eventId: UUID): Promise<GuestStats> {
    return api.get<GuestStats>(
      `${API_ENDPOINTS.GUESTS.LIST(eventId)}/stats`,
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Import guests from CSV/Excel file
   */
  async importGuests(
    eventId: UUID,
    file: File,
    options: {
      mapping: Record<string, string>
      send_invitations: boolean
    },
    onProgress?: (progress: number) => void
  ): Promise<GuestImportResult> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mapping', JSON.stringify(options.mapping))
    formData.append('send_invitations', options.send_invitations.toString())

    return api.upload<GuestImportResult>(
      `${API_ENDPOINTS.GUESTS.LIST(eventId)}/import`,
      file,
      onProgress
    )
  }

  /**
   * Export guests to CSV/Excel
   */
  async exportGuests(
    eventId: UUID,
    format: 'csv' | 'excel',
    options?: {
      include_fields?: string[]
      filter?: GuestSearchParams
    }
  ): Promise<void> {
    const _params = {
      format,
      ...options?.filter,
      include_fields: options?.include_fields?.join(',')
    }

    return api.download(
      `${API_ENDPOINTS.GUESTS.LIST(eventId)}/export`,
      `guests-${eventId}.${format}`,
      {
        requestId: `export-guests-${eventId}-${format}`
      }
    )
  }

  /**
   * Send invitations to guests
   */
  async sendInvitations(
    eventId: UUID,
    guestIds: UUID[],
    options?: {
      template_id?: UUID
      custom_message?: string
      send_immediately?: boolean
      scheduled_at?: string
    }
  ): Promise<{
    sent_count: number
    failed_count: number
    errors: Array<{ guest_id: UUID; error: string }>
  }> {
    return api.post<{
      sent_count: number
      failed_count: number
      errors: Array<{ guest_id: UUID; error: string }>
    }, {
      guest_ids: UUID[]
      template_id?: UUID
      custom_message?: string
      send_immediately?: boolean
      scheduled_at?: string
    }>(
      `${API_ENDPOINTS.GUESTS.LIST(eventId)}/invitations`,
      {
        guest_ids: guestIds,
        ...options
      }
    )
  }

  /**
   * Send reminders to guests
   */
  async sendReminders(
    eventId: UUID,
    guestIds: UUID[],
    message?: string
  ): Promise<{
    sent_count: number
    failed_count: number
    errors: Array<{ guest_id: UUID; error: string }>
  }> {
    return api.post<{
      sent_count: number
      failed_count: number
      errors: Array<{ guest_id: UUID; error: string }>
    }, {
      guest_ids: UUID[]
      message?: string
    }>(
      `${API_ENDPOINTS.GUESTS.LIST(eventId)}/reminders`,
      {
        guest_ids: guestIds,
        message
      }
    )
  }

  /**
   * RSVP response (public endpoint)
   */
  async respondToRSVP(token: string, data: GuestRSVPUpdate): Promise<{
    message: string
    guest: GuestSummary
    event_name: string
  }> {
    return api.post<{
      message: string
      guest: GuestSummary
      event_name: string
    }, GuestRSVPUpdate>(
      API_ENDPOINTS.GUESTS.RSVP(token),
      data
    )
  }

  /**
   * Get RSVP details (public endpoint)
   */
  async getRSVPDetails(token: string): Promise<{
    guest: {
      first_name: string
      last_name: string
      email: string
      plus_one_allowed: boolean
      plus_one_name?: string
      dietary_restrictions?: string
    }
    event: {
      name: string
      description?: string
      start_date: string
      end_date?: string
      venue_name?: string
      venue_address?: string
    }
    rsvp_deadline?: string
    custom_message?: string
  }> {
    return api.get<{
      guest: {
        first_name: string
        last_name: string
        email: string
        plus_one_allowed: boolean
        plus_one_name?: string
        dietary_restrictions?: string
      }
      event: {
        name: string
        description?: string
        start_date: string
        end_date?: string
        venue_name?: string
        venue_address?: string
      }
      rsvp_deadline?: string
      custom_message?: string
    }>(
      `${API_ENDPOINTS.GUESTS.RSVP(token)}/details`,
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Search guests by name, email, or phone
   */
  async searchGuests(
    eventId: UUID,
    query: string,
    limit: number = 10
  ): Promise<Guest[]> {
    return api.get<Guest[]>(
      API_ENDPOINTS.GUESTS.SEARCH(eventId),
      { q: query, limit },
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get guests by RSVP status
   */
  async getGuestsByStatus(eventId: UUID, status: RsvpStatus): Promise<Guest[]> {
    const response = await api.get<PaginatedResponse<Guest>>(
      API_ENDPOINTS.GUESTS.LIST(eventId),
      { rsvp_status: [status] },
      withRetry({ attempts: 2 })
    )
    return response.items
  }

  /**
   * Get guests with dietary restrictions
   */
  async getGuestsWithDietaryRestrictions(eventId: UUID): Promise<Guest[]> {
    const response = await api.get<PaginatedResponse<Guest>>(
      API_ENDPOINTS.GUESTS.LIST(eventId),
      { has_dietary_restrictions: true },
      withRetry({ attempts: 2 })
    )
    return response.items
  }

  /**
   * Get guests with plus ones
   */
  async getGuestsWithPlusOnes(eventId: UUID): Promise<Guest[]> {
    const response = await api.get<PaginatedResponse<Guest>>(
      API_ENDPOINTS.GUESTS.LIST(eventId),
      { plus_one_allowed: true },
      withRetry({ attempts: 2 })
    )
    return response.items
  }

  /**
   * Validate guest data
   */
  validateGuestData(data: GuestCreate | GuestUpdate): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Email validation
    if ('email' in data && data.email !== undefined) {
      if (!data.email || data.email.trim().length === 0) {
        errors.push('Email is required')
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format')
      }
    }

    // Name validation
    if ('first_name' in data && data.first_name !== undefined) {
      if (!data.first_name || data.first_name.trim().length === 0) {
        errors.push('First name is required')
      } else if (data.first_name.length > 100) {
        errors.push('First name must be 100 characters or less')
      }
    }

    if ('last_name' in data && data.last_name !== undefined) {
      if (!data.last_name || data.last_name.trim().length === 0) {
        errors.push('Last name is required')
      } else if (data.last_name.length > 100) {
        errors.push('Last name must be 100 characters or less')
      }
    }

    // Phone validation (optional)
    if ('phone' in data && data.phone !== undefined && data.phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/
      if (!phoneRegex.test(data.phone)) {
        errors.push('Invalid phone number format')
      }
    }

    // Plus one validation
    if ('plus_one_name' in data && data.plus_one_name !== undefined) {
      if (data.plus_one_name && data.plus_one_name.length > 200) {
        errors.push('Plus one name must be 200 characters or less')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Parse CSV data for guest import
   */
  parseCsvData(csvText: string, mapping: Record<string, string>): GuestCreate[] {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const guests: GuestCreate[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length < 2) continue // Skip empty lines

      const guest: Partial<GuestCreate> = {}

      // Map CSV columns to guest fields
      Object.entries(mapping).forEach(([guestField, csvColumn]) => {
        const columnIndex = headers.indexOf(csvColumn)
        if (columnIndex >= 0 && values[columnIndex]) {
          const value = values[columnIndex]
          
          switch (guestField) {
            case 'plus_one_allowed':
              guest[guestField] = value.toLowerCase() === 'true' || value === '1'
              break
            default:
              // @ts-expect-error - Dynamic field assignment
              guest[guestField] = value
          }
        }
      })

      // Validate required fields
      if (guest.email && guest.first_name && guest.last_name) {
        guests.push(guest as GuestCreate)
      }
    }

    return guests
  }

  /**
   * Generate RSVP summary
   */
  generateRSVPSummary(guests: Guest[]): {
    total: number
    attending: number
    not_attending: number
    pending: number
    maybe: number
    responseRate: number
    plusOnesConfirmed: number
  } {
    const total = guests.length
    const attending = guests.filter(g => g.rsvp_status === RsvpStatus.ATTENDING).length
    const not_attending = guests.filter(g => g.rsvp_status === RsvpStatus.NOT_ATTENDING).length
    const pending = guests.filter(g => g.rsvp_status === RsvpStatus.PENDING).length
    const maybe = guests.filter(g => g.rsvp_status === RsvpStatus.MAYBE).length
    const responded = attending + not_attending + maybe
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0
    const plusOnesConfirmed = guests.filter(g =>
      g.rsvp_status === RsvpStatus.ATTENDING && g.plus_one_name
    ).length

    return {
      total,
      attending,
      not_attending,
      pending,
      maybe,
      responseRate,
      plusOnesConfirmed
    }
  }

  /**
   * Get guest status color
   */
  getGuestStatusColor(status: RsvpStatus): string {
    const statusColors: Record<RsvpStatus, string> = {
      [RsvpStatus.ATTENDING]: '#10B981',  // green
      [RsvpStatus.NOT_ATTENDING]: '#EF4444',   // red
      [RsvpStatus.PENDING]: '#F59E0B',    // amber
      [RsvpStatus.MAYBE]: '#3B82F6'   // blue
    }
    return statusColors[status] || '#6B7280'
  }

  /**
   * Get guest status label
   */
  getGuestStatusLabel(status: RsvpStatus): string {
    const statusLabels: Record<RsvpStatus, string> = {
      [RsvpStatus.ATTENDING]: 'Attending',
      [RsvpStatus.NOT_ATTENDING]: 'Not Attending',
      [RsvpStatus.PENDING]: 'Pending',
      [RsvpStatus.MAYBE]: 'Maybe'
    }
    return statusLabels[status] || 'Unknown'
  }

  /**
   * RSVP Token Management Methods
   */

  /**
   * Get invitation link and sharing info for a guest
   */
  async getInvitationLink(eventId: UUID, guestId: UUID): Promise<InvitationLinkData> {
    return api.get<InvitationLinkData>(
      `${API_ENDPOINTS.GUESTS.LIST(eventId)}/${guestId}/invitation-link`,
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get QR code for guest RSVP link
   */
  async getQRCode(
    eventId: UUID,
    guestId: UUID,
    options?: QRCodeOptions
  ): Promise<Blob> {
    const params: Record<string, string> = {
      box_size: String(options?.box_size || 10),
      border: String(options?.border || 4),
      theme: options?.theme || 'light',
      format: options?.format || 'png'
    }

    // Get session for authentication
    const session = await getSession()
    const headers: Record<string, string> = {}

    if (session?.idToken) {
      headers['Authorization'] = `Bearer ${session.idToken}`
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/events/${eventId}/guests/${guestId}/qr-code?${new URLSearchParams(params)}`,
      {
        method: 'GET',
        headers
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch QR code')
    }

    return response.blob()
  }

  /**
   * Get QR code as base64 data URI
   */
  async getQRCodeBase64(
    eventId: UUID,
    guestId: UUID,
    options?: QRCodeOptions
  ): Promise<string> {
    const params = {
      box_size: options?.box_size || 10,
      border: options?.border || 4,
      theme: options?.theme || 'light',
      format: 'base64'
    }

    const response = await api.get<{ qr_code: string }>(
      `${API_ENDPOINTS.GUESTS.LIST(eventId)}/${guestId}/qr-code`,
      params,
      withRetry({ attempts: 2 })
    )

    return response.qr_code
  }

  /**
   * Regenerate RSVP token for a guest
   */
  async regenerateToken(eventId: UUID, guestId: UUID): Promise<Guest> {
    return api.post<Guest, never>(
      `${API_ENDPOINTS.GUESTS.LIST(eventId)}/${guestId}/regenerate-token`,
      undefined as never
    )
  }

  /**
   * Validate RSVP token (public endpoint)
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    return api.get<TokenValidationResult>(
      `/api/v1/events/guests/rsvp/${token}/validate`,
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Get event details for RSVP page (public endpoint)
   */
  async getEventDetailsForRSVP(token: string): Promise<RSVPEventDetails> {
    return api.get<RSVPEventDetails>(
      `/api/v1/events/guests/rsvp/${token}/event-details`,
      undefined,
      withRetry({ attempts: 2 })
    )
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textArea)
        return success
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  /**
   * Download QR code as file
   */
  async downloadQRCode(
    eventId: UUID,
    guestId: UUID,
    guestName: string,
    options?: QRCodeOptions
  ): Promise<void> {
    try {
      const blob = await this.getQRCode(eventId, guestId, options)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `rsvp-qr-${guestName.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download QR code:', error)
      throw error
    }
  }

  /**
   * Open sharing dialog for invitation
   */
  openShareDialog(
    platform: string,
    sharingUrl: string
  ): void {
    const width = 600
    const height = 400
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    window.open(
      sharingUrl,
      'share',
      `width=${width},height=${height},left=${left},top=${top}`
    )
  }
}

// Create singleton instance
export const guestsService = new GuestsService()

// Export default instance
export default guestsService