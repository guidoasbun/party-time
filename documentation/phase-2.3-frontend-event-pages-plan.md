# Phase 2.3: Frontend Event Pages Development Plan

## Overview
Build complete event management frontend pages that integrate with the backend API endpoints completed in Phase 2.2. This includes event creation, listing, editing, and detailed views with proper state management using React Query and TypeScript.

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS v4
- **Testing**: Jest with React Testing Library
- **Date Handling**: date-fns

---

## Phase 2.3.1: API Integration & Type Definitions
**Duration**: 1-1.5 hours  
**Priority**: HIGH  
**Dependencies**: Backend API running

### Tasks:
- [x] Create TypeScript type definitions for events
- [x] Implement event API client functions
- [x] Create React Query hooks for event operations
- [x] Set up error handling utilities

### Files to Create:
```typescript
// frontend/src/types/event.ts
export enum EventType {
  WEDDING = 'wedding',
  BIRTHDAY = 'birthday',
  CORPORATE = 'corporate',
  CONFERENCE = 'conference',
  PARTY = 'party',
  OTHER = 'other'
}

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Event {
  id: string
  name: string
  description?: string
  type: EventType
  status: EventStatus
  start_date: string
  end_date?: string
  location?: string
  venue_name?: string
  venue_address?: string
  venue_google_place_id?: string
  max_guests?: number
  budget_total?: number
  is_public: boolean
  planner_id: string
  created_at: string
  updated_at: string
  // Computed fields
  guest_count?: number
  confirmed_guests?: number
  total_expenses?: number
}

export interface EventCreate {
  name: string
  description?: string
  type: EventType
  start_date: string
  end_date?: string
  location?: string
  venue_name?: string
  venue_address?: string
  venue_google_place_id?: string
  max_guests?: number
  budget_total?: number
  is_public?: boolean
  status?: EventStatus
}

export interface EventUpdate extends Partial<EventCreate> {}

export interface EventFilters {
  search?: string
  type?: EventType
  status?: EventStatus
  start_date_from?: string
  start_date_to?: string
}

export interface EventStats {
  event_id: string
  guest_stats: {
    total_invited: number
    total_attending: number
    response_rate: number
  }
  budget_stats: {
    total_budget: number
    total_spent: number
    remaining: number
    categories: Array<{
      name: string
      allocated: number
      spent: number
    }>
  }
}
```

```typescript
// frontend/src/lib/api/events.ts
import { api } from '@/lib/api-client'
import type { Event, EventCreate, EventUpdate, EventFilters, EventStats } from '@/types/event'

export const eventsApi = {
  // Get all events for current user
  getEvents: async (filters?: EventFilters): Promise<Event[]> => {
    return api.get('/api/v1/events', filters)
  },

  // Get single event by ID
  getEvent: async (id: string, includeRelations = false): Promise<Event> => {
    return api.get(`/api/v1/events/${id}`, { include_relations: includeRelations })
  },

  // Create new event
  createEvent: async (data: EventCreate): Promise<Event> => {
    return api.post('/api/v1/events', data)
  },

  // Update event
  updateEvent: async (id: string, data: EventUpdate): Promise<Event> => {
    return api.put(`/api/v1/events/${id}`, data)
  },

  // Update event status
  updateEventStatus: async (id: string, status: EventStatus): Promise<Event> => {
    return api.patch(`/api/v1/events/${id}/status`, { status })
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    return api.delete(`/api/v1/events/${id}`)
  },

  // Get event statistics
  getEventStats: async (id: string): Promise<EventStats> => {
    return api.get(`/api/v1/events/${id}/stats`)
  },

  // Search events
  searchEvents: async (params: {
    search_term?: string
    type?: EventType
    status?: EventStatus
    start_date_from?: string
    start_date_to?: string
    skip?: number
    limit?: number
  }): Promise<Event[]> => {
    return api.get('/api/v1/events/search', params)
  },
}
```

```typescript
// frontend/src/hooks/useEvents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { Event, EventCreate, EventUpdate, EventFilters } from '@/types/event'
import { useToast } from '@/hooks/useToast'

// Query keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: EventFilters) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  stats: (id: string) => [...eventKeys.all, 'stats', id] as const,
}

// Fetch all events
export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventsApi.getEvents(filters),
  })
}

// Fetch single event
export function useEvent(id: string, includeRelations = false) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.getEvent(id, includeRelations),
    enabled: !!id,
  })
}

// Create event mutation
export function useCreateEvent() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: EventCreate) => eventsApi.createEvent(data),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      showToast('Event created successfully!', 'success')
      return newEvent
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || 'Failed to create event', 'error')
    },
  })
}

// Update event mutation
export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventUpdate }) => 
      eventsApi.updateEvent(id, data),
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(updatedEvent.id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      showToast('Event updated successfully!', 'success')
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || 'Failed to update event', 'error')
    },
  })
}

// Delete event mutation
export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: string) => eventsApi.deleteEvent(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      queryClient.removeQueries({ queryKey: eventKeys.detail(deletedId) })
      showToast('Event deleted successfully!', 'success')
    },
    onError: (error: any) => {
      showToast(error.response?.data?.detail || 'Failed to delete event', 'error')
    },
  })
}

// Get event statistics
export function useEventStats(id: string) {
  return useQuery({
    queryKey: eventKeys.stats(id),
    queryFn: () => eventsApi.getEventStats(id),
    enabled: !!id,
  })
}
```

### Testing:
```typescript
// frontend/src/hooks/__tests__/useEvents.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEvents, useCreateEvent } from '../useEvents'
import { eventsApi } from '@/lib/api/events'

jest.mock('@/lib/api/events')

describe('useEvents', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
  })

  it('should fetch events', async () => {
    const mockEvents = [{ id: '1', name: 'Test Event' }]
    ;(eventsApi.getEvents as jest.Mock).mockResolvedValue(mockEvents)

    const { result } = renderHook(() => useEvents(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockEvents)
  })
})
```

---

## Phase 2.3.2: Event List/Dashboard Page
**Duration**: 1.5-2 hours  
**Priority**: HIGH  
**Dependencies**: Phase 2.3.1 completed

### Tasks:
- [ ] Create events list page with grid/list view
- [ ] Implement search and filtering
- [ ] Add event cards with key information
- [ ] Create empty state component
- [ ] Add loading skeletons
- [ ] Implement responsive design

### Files to Create:
```typescript
// frontend/src/app/events/page.tsx
// frontend/src/components/events/EventCard.tsx
// frontend/src/components/events/EventFilters.tsx
// frontend/src/components/events/EventEmptyState.tsx
// frontend/src/components/events/EventListSkeleton.tsx
```

### Key Features:
- Toggle between grid and list views
- Real-time search filtering
- Filter by type, status, date range
- Sort by date, name, or status
- Pagination or infinite scroll
- Quick actions on each card

---

## Phase 2.3.3: Event Creation Form
**Duration**: 2-2.5 hours  
**Priority**: HIGH  
**Dependencies**: Phase 2.3.1 completed

### Tasks:
- [ ] Create multi-step form component
- [ ] Implement form validation with Zod
- [ ] Add date/time pickers
- [ ] Create form step indicators
- [ ] Add save as draft functionality
- [ ] Implement form persistence (localStorage)
- [ ] Add success redirect

### Files to Create:
```typescript
// frontend/src/app/events/new/page.tsx
// frontend/src/components/events/EventForm/index.tsx
// frontend/src/components/events/EventForm/BasicInfoStep.tsx
// frontend/src/components/events/EventForm/DateTimeStep.tsx
// frontend/src/components/events/EventForm/LocationStep.tsx
// frontend/src/components/events/EventForm/SettingsStep.tsx
// frontend/src/lib/validations/event.ts (Zod schemas)
```

### Form Schema:
```typescript
// frontend/src/lib/validations/event.ts
import { z } from 'zod'
import { EventType, EventStatus } from '@/types/event'

export const eventFormSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(255),
  description: z.string().optional(),
  type: z.nativeEnum(EventType),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  end_date: z.string().optional().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    { message: 'Invalid date format' }
  ),
  location: z.string().optional(),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  max_guests: z.number().int().positive().optional(),
  budget_total: z.number().positive().optional(),
  is_public: z.boolean().default(false),
  status: z.nativeEnum(EventStatus).default(EventStatus.DRAFT),
}).refine(
  (data) => {
    if (data.end_date && data.start_date) {
      return new Date(data.end_date) >= new Date(data.start_date)
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
)

export type EventFormData = z.infer<typeof eventFormSchema>
```

---

## Phase 2.3.4: Event Detail Page
**Duration**: 1.5-2 hours  
**Priority**: HIGH  
**Dependencies**: Phase 2.3.1 completed

### Tasks:
- [ ] Create event detail layout
- [ ] Add statistics cards
- [ ] Implement tabbed interface
- [ ] Add action buttons
- [ ] Create breadcrumb navigation
- [ ] Add loading and error states
- [ ] Implement status change functionality

### Files to Create:
```typescript
// frontend/src/app/events/[id]/page.tsx
// frontend/src/components/events/EventDetailHeader.tsx
// frontend/src/components/events/EventStatsCards.tsx
// frontend/src/components/events/EventTabs.tsx
// frontend/src/components/events/EventActions.tsx
```

### Tab Structure:
1. **Overview**: All event details
2. **Guests**: Placeholder for Phase 3
3. **Budget**: Basic budget overview
4. **Timeline**: Event schedule (if applicable)
5. **Settings**: Edit/delete actions

---

## Phase 2.3.5: Event Edit & Delete
**Duration**: 1-1.5 hours  
**Priority**: MEDIUM  
**Dependencies**: Phase 2.3.3 completed

### Tasks:
- [ ] Create edit page reusing EventForm
- [ ] Pre-populate form with existing data
- [ ] Add delete confirmation dialog
- [ ] Implement optimistic updates
- [ ] Add version conflict handling
- [ ] Create success/error handling

### Files to Create:
```typescript
// frontend/src/app/events/[id]/edit/page.tsx
// frontend/src/components/events/DeleteEventDialog.tsx
// frontend/src/components/events/EventStatusDialog.tsx
```

---

## Phase 2.3.6: UI Components & Utilities
**Duration**: 1-1.5 hours  
**Priority**: MEDIUM  
**Dependencies**: None

### Tasks:
- [ ] Create reusable event components
- [ ] Add status and type badges
- [ ] Create date formatting utilities
- [ ] Add icon mappings for event types
- [ ] Implement color schemes for statuses

### Files to Create:
```typescript
// frontend/src/components/events/EventStatusBadge.tsx
// frontend/src/components/events/EventTypeBadge.tsx
// frontend/src/components/events/EventDateDisplay.tsx
// frontend/src/lib/utils/event-helpers.ts
// frontend/src/lib/utils/date-helpers.ts
```

### Utility Functions:
```typescript
// frontend/src/lib/utils/event-helpers.ts
import { EventType, EventStatus } from '@/types/event'

export const eventTypeConfig = {
  [EventType.WEDDING]: {
    label: 'Wedding',
    icon: '💒',
    color: 'pink',
  },
  [EventType.BIRTHDAY]: {
    label: 'Birthday',
    icon: '🎂',
    color: 'purple',
  },
  [EventType.CORPORATE]: {
    label: 'Corporate',
    icon: '🏢',
    color: 'blue',
  },
  // ... etc
}

export const eventStatusConfig = {
  [EventStatus.DRAFT]: {
    label: 'Draft',
    color: 'gray',
  },
  [EventStatus.PUBLISHED]: {
    label: 'Published',
    color: 'green',
  },
  // ... etc
}

export function getDaysUntilEvent(startDate: string): number {
  const start = new Date(startDate)
  const today = new Date()
  const diffTime = start.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
```

---

## Phase 2.3.7: Testing
**Duration**: 1.5-2 hours  
**Priority**: HIGH  
**Dependencies**: All previous phases

### Tasks:
- [ ] Write unit tests for hooks
- [ ] Test form validations
- [ ] Test API error handling
- [ ] Write component tests
- [ ] Test user flows (create, edit, delete)
- [ ] Test responsive design

### Test Coverage:
```typescript
// frontend/src/__tests__/events/event-creation.test.tsx
// frontend/src/__tests__/events/event-list.test.tsx
// frontend/src/__tests__/events/event-detail.test.tsx
// frontend/src/__tests__/events/event-edit.test.tsx
// frontend/src/__tests__/events/event-delete.test.tsx
```

---

## Phase 2.3.8: Polish & Optimization
**Duration**: 1 hour  
**Priority**: LOW  
**Dependencies**: All previous phases

### Tasks:
- [ ] Add animations and transitions
- [ ] Optimize bundle size
- [ ] Add meta tags for SEO
- [ ] Implement image optimization (if applicable)
- [ ] Add keyboard shortcuts
- [ ] Improve accessibility (ARIA labels)
- [ ] Add error boundaries

---

## Success Criteria Checklist

### Functionality
- [ ] Users can view all their events
- [ ] Users can create new events with validation
- [ ] Multi-step form works smoothly
- [ ] Users can view detailed event information
- [ ] Users can edit existing events
- [ ] Users can delete events with confirmation
- [ ] Search functionality works
- [ ] Filtering by type/status/date works
- [ ] Status changes work correctly

### User Experience
- [ ] Loading states display properly
- [ ] Error messages are clear and helpful
- [ ] Success feedback is provided
- [ ] Forms persist data on navigation
- [ ] Mobile responsive design works
- [ ] Empty states guide users
- [ ] Navigation is intuitive

### Technical
- [ ] TypeScript types are correct
- [ ] No TypeScript errors
- [ ] API integration works
- [ ] React Query caching works
- [ ] Optimistic updates work
- [ ] Tests pass
- [ ] No console errors

---

## Total Estimated Time: 12-15 hours

### Recommended Development Order:
1. **Day 1** (4-5 hours):
   - Phase 2.3.1: API Integration & Types
   - Phase 2.3.2: Event List Page (partial)

2. **Day 2** (4-5 hours):
   - Phase 2.3.2: Event List Page (complete)
   - Phase 2.3.3: Event Creation Form

3. **Day 3** (4-5 hours):
   - Phase 2.3.4: Event Detail Page
   - Phase 2.3.5: Edit & Delete
   - Phase 2.3.6: UI Components

4. **Day 4** (2-3 hours):
   - Phase 2.3.7: Testing
   - Phase 2.3.8: Polish

---

## Next Steps After Completion
1. **Phase 3.1**: Guest Backend API
2. **Phase 3.2**: Guest Management UI
3. **Phase 3.3**: CSV Import System
4. **Phase 4**: RSVP System Implementation

---

## Notes & Considerations

### Performance
- Implement pagination or infinite scroll for large event lists
- Use React.memo for expensive components
- Optimize re-renders with proper React Query configuration
- Consider virtual scrolling for very long lists

### Security
- Validate all form inputs on frontend
- Sanitize user-generated content
- Implement proper CORS handling
- Never expose sensitive data in URLs

### Accessibility
- Ensure all interactive elements are keyboard accessible
- Add proper ARIA labels
- Test with screen readers
- Maintain proper heading hierarchy
- Ensure sufficient color contrast

### State Management
- Use React Query for server state
- Use React Hook Form for form state
- Use URL params for filter state (for shareability)
- Consider Zustand for complex client state if needed

---

*Last Updated: [Current Date]*
*Phase Status: Planning Complete - Ready for Implementation*