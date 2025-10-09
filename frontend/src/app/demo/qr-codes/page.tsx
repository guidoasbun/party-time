'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { QRCodeDisplay } from '@/components/guests/QRCodeDisplay'
import { InvitationLinkDisplay } from '@/components/guests/InvitationLinkDisplay'
import { RegenerateTokenDialog } from '@/components/guests/RegenerateTokenDialog'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { useEvents } from '@/hooks/api/useEvents'
import { guestsService } from '@/lib/api/services'
import type { Guest, InvitationLinkData } from '@/types'
import {
  QrCode,
  Link as LinkIcon,
  RefreshCw,
  AlertCircle,
  LogIn,
  Plus,
  Calendar,
  Users,
  Loader2
} from 'lucide-react'

export default function QRCodesDemo() {
  const { status } = useSession()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [loadingGuests, setLoadingGuests] = useState(false)
  const [invitationData, setInvitationData] = useState<InvitationLinkData | null>(null)
  const [loadingInvitation, setLoadingInvitation] = useState(false)
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  // Fetch user's events
  const {
    data: eventsData,
    isLoading: eventsLoading
  } = useEvents({ page: 1, limit: 100 })

  const events = eventsData?.items || []
  const selectedEvent = events.find(e => e.id === selectedEventId)
  const selectedGuest = guests?.find(g => g.id === selectedGuestId)

  // Auto-select first event
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId])

  // Fetch guests when event is selected
  useEffect(() => {
    if (!selectedEventId) return

    const fetchGuests = async () => {
      console.log('[QRCodesDemo] Fetching guests for event:', selectedEventId)
      setLoadingGuests(true)
      setError(null)
      setSelectedGuestId(null)
      setGuests([])

      try {
        const response = await guestsService.getGuests(selectedEventId, { page: 1, limit: 100 })
        console.log('[QRCodesDemo] Received guests response:', response)

        // Handle both array and PaginatedResponse formats
        const guestsList = Array.isArray(response) ? response : response.items
        setGuests(guestsList)
        console.log('[QRCodesDemo] Set guests to:', guestsList)
      } catch (err) {
        setError('Failed to load guests. Please try again.')
        console.error('[QRCodesDemo] Error fetching guests:', err)
      } finally {
        setLoadingGuests(false)
      }
    }

    fetchGuests()
  }, [selectedEventId])

  // Fetch invitation data when guest is selected
  useEffect(() => {
    if (!selectedEventId || !selectedGuestId) {
      setInvitationData(null)
      return
    }

    const fetchInvitationData = async () => {
      setLoadingInvitation(true)
      setError(null)

      try {
        const data = await guestsService.getInvitationLink(selectedEventId, selectedGuestId)
        setInvitationData(data)
      } catch (err) {
        setError('Failed to load invitation data. Please try again.')
        console.error('Error fetching invitation data:', err)
      } finally {
        setLoadingInvitation(false)
      }
    }

    fetchInvitationData()
  }, [selectedEventId, selectedGuestId])

  const handleEventChange = (eventId: string | string[]) => {
    const id = Array.isArray(eventId) ? eventId[0] : eventId
    setSelectedEventId(id)
    setSelectedGuestId(null)
    setInvitationData(null)
  }


  // Event selector options
  const eventOptions = events.map(event => ({
    value: event.id,
    label: `${event.name} (${event.type})`
  }))

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            QR Codes & Invitation Links Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Test the RSVP token system with QR codes, invitation links, and sharing features using your own events and guests.
          </p>
        </div>

        {/* Authentication Warning */}
        {!isAuthenticated && !isLoading && (
          <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Authentication Required
                </h3>
                <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                  The QR code and invitation link endpoints require authentication.
                  Please sign in to test these features.
                </p>
                <Link href="/auth/signin">
                  <Button variant="default" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In to Continue
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isAuthenticated && eventsLoading && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your events...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                  Error
                </h3>
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State - No Events */}
        {isAuthenticated && !eventsLoading && events.length === 0 && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Calendar className="w-16 h-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold text-foreground">No Events Yet</h2>
              <p className="text-muted-foreground max-w-md">
                You don&apos;t have any events yet. Create your first event to start generating QR codes and invitation links for your guests.
              </p>
              <Link href="/events/new">
                <Button variant="default" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Event
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Event Selector */}
        {isAuthenticated && !eventsLoading && events.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Select an Event
              </h2>
              <Link href="/events/new">
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Event
                </Button>
              </Link>
            </div>
            <Select
              options={eventOptions}
              value={selectedEventId || ''}
              onValueChange={handleEventChange}
              placeholder="Choose an event..."
            />
            {selectedEvent && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{selectedEvent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.type} • {new Date(selectedEvent.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedEvent.venue_name && (
                    <p className="text-sm text-muted-foreground">{selectedEvent.venue_name}</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Guest Selection */}
        {selectedEventId && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Users className="w-6 h-6" />
                Select a Guest
                {(guests?.length ?? 0) > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({guests?.length ?? 0} {guests?.length === 1 ? 'guest' : 'guests'})
                  </span>
                )}
              </h2>
              {selectedEvent && (
                <Link href={`/events/${selectedEvent.id}?tab=guests`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Guest
                  </Button>
                </Link>
              )}
            </div>

            {loadingGuests && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {!loadingGuests && (guests?.length ?? 0) === 0 && (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No guests found for this event. Add some guests to generate QR codes and invitation links.
                </p>
                {selectedEvent && (
                  <Link href={`/events/${selectedEvent.id}?tab=guests`}>
                    <Button variant="default" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Guests to {selectedEvent.name}
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {!loadingGuests && (guests?.length ?? 0) > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guests?.map((guest) => (
                  <button
                    key={guest.id}
                    onClick={() => setSelectedGuestId(guest.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedGuestId === guest.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold text-foreground">
                      {guest.first_name} {guest.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">{guest.email}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        guest.rsvp_status === 'attending'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : guest.rsvp_status === 'not_attending'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {guest.rsvp_status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* QR Code & Invitation Display */}
        {selectedEventId && selectedGuestId && selectedGuest && (
          <>
            {loadingInvitation && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading invitation data...</p>
                </div>
              </Card>
            )}

            {!loadingInvitation && invitationData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* QR Code Display */}
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <QrCode className="w-6 h-6" />
                      QR Code
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRegenerateDialog(true)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code to access the RSVP page. Theme-aware and downloadable.
                  </p>
                  <QRCodeDisplay
                    eventId={selectedEventId}
                    guestId={selectedGuestId}
                    guestName={`${selectedGuest.first_name} ${selectedGuest.last_name}`}
                  />
                </Card>

                {/* Invitation Link Display */}
                <Card className="p-6 space-y-4">
                  <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <LinkIcon className="w-6 h-6" />
                    Invitation Link
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Share this invitation via email, SMS, WhatsApp, or social media.
                  </p>
                  <InvitationLinkDisplay
                    invitationData={invitationData}
                  />
                </Card>
              </div>
            )}

            {/* Token Regeneration Dialog */}
            <RegenerateTokenDialog
              isOpen={showRegenerateDialog}
              onClose={() => setShowRegenerateDialog(false)}
              eventId={selectedEventId}
              guestId={selectedGuestId}
              guestName={`${selectedGuest.first_name} ${selectedGuest.last_name}`}
              onSuccess={async () => {
                // Refetch invitation data
                if (selectedEventId && selectedGuestId) {
                  const data = await guestsService.getInvitationLink(selectedEventId, selectedGuestId)
                  setInvitationData(data)
                }
                setShowRegenerateDialog(false)
              }}
            />
          </>
        )}

        {/* Instructions */}
        {isAuthenticated && !selectedGuestId && events.length > 0 && (guests?.length ?? 0) > 0 && (
          <Card className="p-6 bg-muted/30">
            <h2 className="text-xl font-semibold mb-3">How to Use This Demo</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Select an event from the dropdown above</li>
              <li>Choose a guest from the list</li>
              <li>View the generated QR code (try changing size and theme)</li>
              <li>Download the QR code as a PNG file</li>
              <li>Copy the invitation link and test sharing options</li>
              <li>Try regenerating the token to see the confirmation workflow</li>
            </ol>
            <div className="mt-4 p-4 bg-background rounded-lg border border-border">
              <p className="text-sm font-semibold text-foreground mb-1">
                Production Integration:
              </p>
              <p className="text-xs text-muted-foreground">
                In the actual application, these components will be integrated into the Event Detail
                page&apos;s Guests tab. Each guest row will have actions to view/send their QR code
                and invitation link.
              </p>
            </div>
          </Card>
        )}

        {/* API Endpoints Reference */}
        {isAuthenticated && (
          <Card className="p-6 bg-muted/30">
            <h2 className="text-xl font-semibold mb-3">Available API Endpoints</h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="p-3 bg-background rounded border border-border">
                <div className="font-semibold text-green-600 dark:text-green-400">GET</div>
                <div className="text-foreground">/api/v1/events/{'{event_id}'}/guests/{'{guest_id}'}/invitation-link</div>
                <div className="text-xs text-muted-foreground mt-1">Get invitation link data</div>
              </div>
              <div className="p-3 bg-background rounded border border-border">
                <div className="font-semibold text-green-600 dark:text-green-400">GET</div>
                <div className="text-foreground">/api/v1/events/{'{event_id}'}/guests/{'{guest_id}'}/qr-code</div>
                <div className="text-xs text-muted-foreground mt-1">Get QR code image (with size, theme, format params)</div>
              </div>
              <div className="p-3 bg-background rounded border border-border">
                <div className="font-semibold text-blue-600 dark:text-blue-400">POST</div>
                <div className="text-foreground">/api/v1/events/{'{event_id}'}/guests/{'{guest_id}'}/regenerate-token</div>
                <div className="text-xs text-muted-foreground mt-1">Regenerate RSVP token</div>
              </div>
              <div className="p-3 bg-background rounded border border-border">
                <div className="font-semibold text-green-600 dark:text-green-400">GET</div>
                <div className="text-foreground">/api/v1/events/guests/rsvp/{'{rsvp_token}'}/validate</div>
                <div className="text-xs text-muted-foreground mt-1">Validate token (public, no auth)</div>
              </div>
              <div className="p-3 bg-background rounded border border-border">
                <div className="font-semibold text-green-600 dark:text-green-400">GET</div>
                <div className="text-foreground">/api/v1/events/guests/rsvp/{'{rsvp_token}'}/event-details</div>
                <div className="text-xs text-muted-foreground mt-1">Get event details for RSVP (public, no auth)</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
