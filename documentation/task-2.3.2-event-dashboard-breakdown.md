# Task 2.3.2: Event List/Dashboard Page - Implementation Breakdown

## Overview
Implement a comprehensive event dashboard that displays user's events in both list and grid formats, provides filtering and search capabilities, shows key statistics, and enables quick actions for event management.

## Phase 1: API Integration & Data Layer (2-3 days)

### Task 1.1: Event API Service Layer ✅ COMPLETED
**File**: `frontend/src/hooks/api/useEvents.ts`
- [x] Create `useEventsQuery` hook with React Query
- [x] Implement `useCreateEvent` mutation
- [x] Add `useUpdateEvent` mutation  
- [x] Create `useDeleteEvent` mutation
- [x] Implement pagination with `useInfiniteQuery`
- [x] Add search/filter parameters to API calls
- [x] Remove `@ts-nocheck` and fix all TypeScript errors
- [x] Add proper error handling with `ApiException` type
- [x] Implement optimistic updates for mutations
- [x] Add composite hooks (`useEventManagement`, `useEventsOverview`, `useEventForm`)

**TypeScript Implementation:** ✅
- ✅ Uses `PaginatedResponse<EventSummary>` for list data
- ✅ Imports all types from `@/types/event.types`
- ✅ Proper error handling with `ApiException` type
- ✅ Correctly typed pagination parameters with `useInfiniteQuery`
- ✅ Added missing `EventListResponse` and `EventStatsResponse` types

### Task 1.2: Event Statistics API ✅ COMPLETED
**File**: `frontend/src/hooks/api/useEventStats.ts`
- [x] Create `useEventStats` hook for dashboard metrics
- [x] Implement `useRecentActivity` for activity feed
- [x] Add `useUpcomingEvents` for quick overview
- [x] Create `useDashboardStats` with transformed data format
- [x] Add `useDashboardData` composite hook for complete dashboard data
- [x] Implement `useEventMetrics` for performance indicators
- [x] Add `useEventTrends` for growth analytics
- [x] Proper query key management and stale time configuration

**Types Implemented:** ✅
```typescript
interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalGuests: number;
  avgRsvpRate: number;
  totalBudget: number;
}
```
- ✅ Added to `frontend/src/types/event.types.ts`
- ✅ Used in `useDashboardStats` hook with data transformation
- ✅ Includes mock avgRsvpRate calculation for demo purposes

### Task 1.3: Event Service Functions ✅ ALREADY IMPLEMENTED
**File**: `frontend/src/lib/api/services/events.service.ts`
- [x] Base API functions for events already exist
- [x] Search and filtering logic implemented
- [x] Date range filtering available
- [x] Event status filtering implemented
- [x] Sorting functionality (date, name, status, guests) available

**Note**: The service layer was already well-implemented. The hooks now properly integrate with these existing services with correct TypeScript typing.

---

## ✅ Phase 1: API Integration & Data Layer - COMPLETED!

**Status**: ✅ **COMPLETED** (December 2024)

### Implementation Summary:
- **Duration**: 1 day (faster than estimated 2-3 days)
- **Files Modified**: 4 files updated/created
- **Build Status**: ✅ Successfully compiles with no TypeScript errors
- **Coverage**: All required hooks and types implemented

### Key Achievements:
1. **Complete TypeScript Safety** - Removed all `@ts-nocheck` and fixed type issues
2. **React Query Integration** - Proper query management with caching and error handling
3. **Infinite Pagination** - Implemented `useInfiniteQuery` for smooth list scrolling
4. **Optimistic Updates** - Enhanced UX with immediate UI updates
5. **Comprehensive Hooks** - Dashboard statistics, recent activity, and performance metrics
6. **Proper Error Handling** - Consistent `ApiException` error management

### Ready for Phase 2:
The API layer is now ready to support dashboard components with:
- ✅ Typed event CRUD operations
- ✅ Paginated event lists with search/filtering
- ✅ Dashboard statistics and metrics
- ✅ Recent activity feeds
- ✅ Performance-optimized queries with proper caching

---

## ✅ Phase 2: Core Components - COMPLETED!

**Status**: ✅ **COMPLETED** (December 2024)

### Implementation Summary:
- **Duration**: 2 days (faster than estimated 3-4 days)
- **Tasks Completed**: 3 of 4 tasks completed (EventCard, EventList, EventFilters)
- **Files Created**: 7 new components + 3 demo pages
- **Build Status**: ✅ Successfully compiles with no TypeScript errors
- **Coverage**: All core filtering and display functionality implemented

### Key Achievements:
1. **Complete Event Display System** - EventCard and EventList with grid/list views
2. **Comprehensive Filtering** - 7 filter types with visual feedback and state persistence
3. **Advanced UI Components** - Reusable Input, Select, Chip, DatePicker components
4. **Calendar Integration** - Interactive date picker with month navigation
5. **State Management** - localStorage persistence and URL synchronization
6. **Production Ready** - Suspense boundaries for SSG compatibility

### Ready for Integration:
The component system is now ready for dashboard integration with:
- ✅ Complete event card and list display components
- ✅ Advanced filtering with all major criteria (search, type, status, date, location, budget, guests)
- ✅ Visual feedback and responsive design
- ✅ Demo pages for testing and validation
- ✅ TypeScript safety throughout

**Remaining**: Task 2.4 (Dashboard Statistics Cards) - will be addressed during Phase 3 Dashboard Layout integration

---

## Phase 2: Core Components (3-4 days)

### Task 2.1: Event Card Component ✅ COMPLETED
**File**: `frontend/src/components/events/EventCard.tsx`
- [x] Display event basic info (name, date, type, status)
- [x] Show guest count and RSVP status
- [x] Add budget progress indicator
- [x] Include venue information
- [x] Add status badge with proper styling
- [x] Implement quick action buttons (Edit, Delete, View)
- [x] Add hover effects and responsive design

**Implementation Summary:** ✅
- ✅ **EventCard Component**: Complete with TypeScript interface exactly as specified
- ✅ **EventStatusBadge Component**: Color-coded status badges for all event statuses
- ✅ **Budget Progress Indicator**: Visual progress bars with color changes (green/yellow/red)
- ✅ **Responsive Design**: Both grid and list view modes implemented
- ✅ **Interactive Elements**: Hover effects, action buttons with icons
- ✅ **Dependencies Added**: `lucide-react` for icons, `date-fns` for formatting
- ✅ **Demo Pages Created**: 
  - `/demo/event-cards` - Comprehensive demo with 6 sample events
  - `/test-events` - Simple test page
- ✅ **Authentication Bypass**: Demo routes accessible without login for development
- ✅ **Build Status**: Successfully compiles with no TypeScript errors

**Props Interface:**
```typescript
interface EventCardProps {
  event: EventSummary;
  onEdit: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onView: (eventId: string) => void;
  viewMode?: 'grid' | 'list';
}
```

### Task 2.2: Event List Container ✅ COMPLETED
**File**: `frontend/src/components/events/EventList.tsx`
- [x] Implement grid/list view toggle
- [x] Add empty state component
- [x] Implement loading skeleton
- [x] Add pagination controls
- [x] Handle infinite scroll for large datasets
- [x] Add bulk selection functionality

**Implementation Summary:** ✅
- ✅ **EventList Component**: Complete with comprehensive TypeScript interfaces and all required features
- ✅ **Grid/List View Toggle**: Seamless switching between card layout and compact list layout
- ✅ **Empty State Component**: Party-themed empty state with helpful messaging and create event CTA
- ✅ **Loading Skeleton**: Animated placeholders matching both grid and list view modes
- ✅ **Pagination Controls**: Traditional page-based navigation with next/previous and page numbers
- ✅ **Infinite Scroll**: Intersection Observer implementation for seamless loading of large datasets
- ✅ **Bulk Selection**: Checkbox selection with bulk action bar (select all, delete, cancel)
- ✅ **Supporting Components**: ViewToggle, PaginationControls, BulkSelectionBar, EventEmptyState, EventListSkeleton
- ✅ **Demo Page Created**: `/demo/event-list` - Comprehensive testing page with all scenarios
- ✅ **Authentication Bypass**: Demo routes accessible without login for development
- ✅ **Build Status**: Successfully compiles with no TypeScript errors
- ✅ **Hydration Issues Resolved**: Fixed SSR/CSR date formatting inconsistencies

**Props Interface:**
```typescript
interface EventListProps {
  events: EventSummary[]
  onEdit: (eventId: string) => void
  onDelete: (eventId: string) => void
  onView: (eventId: string) => void
  onBulkDelete?: (eventIds: string[]) => void
  onCreateEvent?: () => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  isLoading?: boolean
  error?: string | null
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  enableInfiniteScroll?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  enableBulkSelection?: boolean
  emptyStateTitle?: string
  emptyStateMessage?: string
  className?: string
}
```

**Key Features Working:**
- **✅ View Mode Toggle**: Interactive buttons with Grid/List icons
- **✅ Bulk Selection**: Checkboxes appear when enabled, bulk action bar with count and actions
- **✅ Empty State**: Beautiful party icon with "No events found" message and create button
- **✅ Loading States**: Skeleton components with proper animations for both view modes
- **✅ Pagination**: Page controls with proper navigation and event count display
- **✅ Infinite Scroll**: Automatic loading trigger with loading indicators
- **✅ Error Handling**: Error state display with retry messaging
- **✅ Responsive Design**: Works on mobile and desktop with proper spacing
- **✅ Integration**: Uses existing EventCard component and event type system

**Files Created:**
- `frontend/src/components/events/EventList.tsx` - Main container component
- `frontend/src/app/demo/event-list/page.tsx` - Comprehensive demo and testing page

### Task 2.3: Event Filters Component ✅ COMPLETED
**File**: `frontend/src/components/events/EventFilters.tsx`
- [x] Create search input with debouncing
- [x] Add event type filter dropdown
- [x] Implement status filter chips
- [x] Add date range picker with calendar popup
- [x] Create location/venue filter
- [x] Add budget range filter (min/max)
- [x] Add guest count range filter
- [x] Add clear filters button
- [x] Save filter preferences to localStorage
- [x] Add URL parameter synchronization
- [x] Implement quick date filters (Today, This Week, etc.)

**Implementation Summary:** ✅
- ✅ **Complete Filtering System**: Comprehensive event filtering with 7 filter types
- ✅ **TypeScript Safety**: Full type safety with `EventFilters` interface and strict typing
- ✅ **UI Components Created**: Input, Select, Chip, DatePicker components with consistent styling
- ✅ **Advanced Features**: Debounced search (500ms), localStorage persistence, URL sync
- ✅ **Calendar Integration**: Calendar popup with month/year navigation and date selection
- ✅ **Visual Feedback**: Explicit color coding (blue/white) for all selection states
- ✅ **Responsive Design**: Both compact and full layouts with mobile optimization
- ✅ **Demo Page Created**: `/demo/event-filters` - Interactive testing page with live filtering
- ✅ **Build Compatibility**: Suspense boundary for SSG compatibility, Vercel deployment ready
- ✅ **Hook Integration**: `useEventFilters` with optimistic updates and state management

**Filter State Type:** ✅
```typescript
interface EventFilters {
  search: string;
  types: EventType[];
  statuses: EventStatus[];
  date_range: { start?: string; end?: string };
  location: string;
  budget_range: { min?: number; max?: number };
  guest_count_range: { min?: number; max?: number };
}
```

**Components Created:**
- `frontend/src/components/ui/Input.tsx` - Base input with icons and validation
- `frontend/src/components/ui/Select.tsx` - Multi-select dropdown with search
- `frontend/src/components/ui/Chip.tsx` - Toggle-able filter chips
- `frontend/src/components/ui/DatePicker.tsx` - Date picker with calendar popup and quick filters
- `frontend/src/components/events/EventFilters.tsx` - Main filters component
- `frontend/src/hooks/useEventFilters.ts` - Filter state management hook
- `frontend/src/app/demo/event-filters/page.tsx` - Comprehensive demo and testing page

**Key Features Working:**
- **✅ Search Filter**: Debounced text search across event names, venues, and planners
- **✅ Type Filter**: Multi-select dropdown for event types (Wedding, Birthday, Conference, etc.)
- **✅ Status Filter**: Interactive chips for event statuses (Draft, Planning, Confirmed, etc.)
- **✅ Date Range**: Date pickers with calendar popup and quick filters (Today, This Week, etc.)
- **✅ Location Filter**: Text search for venue names and locations
- **✅ Budget Range**: Min/max numeric inputs for budget filtering
- **✅ Guest Count**: Min/max numeric inputs for guest count filtering
- **✅ Clear Filters**: Reset all filters with single action
- **✅ State Persistence**: localStorage and URL parameter synchronization
- **✅ Live Filtering**: Real-time results with sample event data
- **✅ Visual States**: Clear selection feedback with blue/white color scheme
- **✅ SSG Compatibility**: Suspense boundary for production builds

### Task 2.4: Dashboard Statistics Cards
**File**: `frontend/src/components/dashboard/StatsCards.tsx`
- [ ] Create metric cards (Total Events, Upcoming, Guests, Budget)
- [ ] Add percentage changes and trends
- [ ] Implement responsive grid layout
- [ ] Add loading states for each card
- [ ] Include icons for each metric

## Phase 3: Dashboard Layout & Navigation (2 days)

### Task 3.1: Main Dashboard Layout
**File**: `frontend/src/app/dashboard/page.tsx`
- [ ] Replace current auth-focused dashboard
- [ ] Add header with greeting and user info
- [ ] Implement sidebar navigation (if needed)
- [ ] Create responsive layout grid
- [ ] Add create event FAB/button

### Task 3.2: Dashboard Sections
**File**: `frontend/src/components/dashboard/DashboardSections.tsx`
- [ ] Quick Stats section
- [ ] Recent Activity feed
- [ ] Upcoming Events widget
- [ ] Quick Actions panel
- [ ] Recent Events section

### Task 3.3: Navigation Updates
**File**: `frontend/src/components/layout/Navigation.tsx` (create if needed)
- [ ] Add dashboard navigation
- [ ] Include breadcrumb navigation
- [ ] Add active state indicators

## Phase 4: State Management & UX (2 days)

### Task 4.1: View Preferences Hook
**File**: `frontend/src/hooks/useViewPreferences.ts`
- [ ] Manage view mode (grid/list) persistence
- [ ] Handle filter state persistence
- [ ] Add sorting preferences
- [ ] Implement items per page preference

### Task 4.2: Event Action Hooks
**File**: `frontend/src/hooks/useEventActions.ts`
- [ ] Create optimistic updates for event operations
- [ ] Implement confirmation dialogs for delete
- [ ] Add toast notifications for actions
- [ ] Handle bulk operations

### Task 4.3: Search & Filter Logic
**File**: `frontend/src/hooks/useEventFilters.ts`
- [ ] Debounced search implementation
- [ ] Filter combination logic
- [ ] URL parameter synchronization
- [ ] Filter validation and sanitization

## Phase 5: Comprehensive Testing Implementation (2-3 days)

**⚠️ IMPORTANT**: Execute this phase **AFTER** completing Phases 1-4 and Phase 6 (Styling & Polish)

### Prerequisites
- ✅ All implementation phases complete (1-4, 6)
- ✅ Features working in manual testing
- ✅ No TypeScript errors or build issues
- ✅ Components stable and not under active development

### Phase 5.1: Test Infrastructure Setup (Day 1, Morning)

#### Task 5.1.1: Mock Data Setup
**File**: `frontend/__tests__/mocks/eventData.ts`
```typescript
// Mock data factories
export const createMockEvent = (overrides?: Partial<Event>): Event
export const createMockEventSummary = (overrides?: Partial<EventSummary>): EventSummary
export const createMockEventStats = (overrides?: Partial<EventStats>): EventStats
export const createMockDashboardStats = (overrides?: Partial<DashboardStats>): DashboardStats

// Mock data collections
export const mockEvents: EventSummary[]
export const mockEventStats: EventStats
export const mockDashboardData: DashboardStats
export const mockRecentActivity: EventActivity[]
```

#### Task 5.1.2: MSW API Handlers
**File**: `frontend/__tests__/mocks/eventHandlers.ts`
```typescript
// Event CRUD endpoints
http.get('/api/v1/events')                    // List with pagination/filters
http.get('/api/v1/events/:id')                // Single event
http.post('/api/v1/events')                   // Create event
http.patch('/api/v1/events/:id')              // Update event  
http.delete('/api/v1/events/:id')             // Delete event

// Event operations
http.post('/api/v1/events/:id/duplicate')     // Duplicate event
http.post('/api/v1/events/:id/archive')       // Archive event

// Statistics endpoints
http.get('/api/v1/events/stats')              // Dashboard stats
http.get('/api/v1/events/:id/analytics')      // Event analytics
http.get('/api/v1/events/recent')             // Recent events
http.get('/api/v1/events/upcoming')           // Upcoming events
```

#### Task 5.1.3: Test Utilities
**File**: `frontend/__tests__/eventTestUtils.ts`
```typescript
export const renderEventHook = (hook: Function, options?: RenderHookOptions)
export const waitForEventQuery = (queryKey: string)
export const setupEventScenarios = (scenarios: TestScenario[])
export const expectOptimisticUpdate = (queryClient: QueryClient, queryKey: string[])
```

### Phase 5.2: Hook Unit Tests (Day 1, Afternoon)

#### Task 5.2.1: API Hooks Tests
**File**: `frontend/src/hooks/api/__tests__/useEvents.test.tsx`
- [ ] **Query Hooks Testing**
  - `useEvents` with filters, pagination, error states
  - `useInfiniteEvents` with infinite scroll scenarios
  - `useEvent` single event fetching and caching
  - `useEventAnalytics` data transformation

- [ ] **Mutation Hooks Testing**
  - `useCreateEvent` with optimistic updates and rollback
  - `useUpdateEvent` with cache invalidation patterns
  - `useDeleteEvent` with proper cleanup
  - `useDuplicateEvent` and `useArchiveEvent` operations

- [ ] **Composite Hooks Testing**
  - `useEventManagement` complete event management
  - `useEventsOverview` dashboard overview functionality
  - `useEventForm` form submission and validation

#### Task 5.2.2: Statistics Hooks Tests
**File**: `frontend/src/hooks/api/__tests__/useEventStats.test.tsx`
- [ ] `useEventStats` basic statistics fetching
- [ ] `useDashboardStats` data transformation logic
- [ ] `useRecentActivity` activity feed generation
- [ ] `useUpcomingEvents` filtering and sorting
- [ ] `useDashboardData` complete dashboard data composition
- [ ] `useEventMetrics` calculation accuracy
- [ ] `useEventTrends` trend analysis logic

### Phase 5.3: Component Unit Tests (Day 2, Morning)

#### Task 5.3.1: Core Component Tests
- [ ] **EventCard.test.tsx**
  - Event data rendering (name, date, status, etc.)
  - Action button functionality (edit, delete, view)
  - Status badge display logic
  - Responsive behavior and accessibility

- [ ] **EventList.test.tsx**
  - Grid vs list view modes
  - Pagination controls
  - Loading and empty states
  - Bulk selection functionality

- [ ] **EventFilters.test.tsx**
  - Search input with debouncing
  - Filter dropdown interactions
  - Date range picker functionality
  - Clear filters behavior

#### Task 5.3.2: Dashboard Component Tests
- [ ] **StatsCards.test.tsx**
  - Metric display and formatting
  - Loading skeleton states
  - Percentage changes and trends
  - Error state handling

- [ ] **DashboardSections.test.tsx**
  - Section rendering and data display
  - Quick actions functionality
  - Navigation integration

### Phase 5.4: State Management Tests (Day 2, Afternoon)

#### Task 5.4.1: Custom Hook Tests
- [ ] **useViewPreferences.test.tsx**
  - View mode persistence (grid/list)
  - Filter state persistence
  - LocalStorage integration

- [ ] **useEventFilters.test.tsx**
  - Filter combination logic
  - URL parameter synchronization
  - Debounced search implementation

- [ ] **useEventActions.test.tsx**
  - Optimistic updates behavior
  - Confirmation dialog handling
  - Toast notification triggers

### Phase 5.5: Integration Tests (Day 3, Morning)

#### Task 5.5.1: Complete Workflow Tests
**File**: `frontend/src/__tests__/integration/event-dashboard-integration.test.tsx`
- [ ] **Complete CRUD Flow**
  - Create → View → Edit → Delete event workflow
  - Data consistency across operations
  - Cache updates and invalidation

- [ ] **Search and Filter Integration**
  - Combined filter scenarios
  - Search with filter combinations
  - URL state management

- [ ] **Dashboard Data Flow**
  - Stats update after event changes
  - Real-time data synchronization
  - Multi-user scenario simulation

### Phase 5.6: Error Handling & Edge Cases (Day 3, Afternoon)

#### Task 5.6.1: Error Scenario Tests
**File**: `frontend/src/__tests__/errors/event-error-scenarios.test.tsx`
- [ ] **Network Errors**
  - 500 Internal Server Error handling
  - 503 Service Unavailable scenarios
  - Timeout and retry logic

- [ ] **Validation Errors**
  - 400 Bad Request responses
  - Form validation error display
  - Field-specific error handling

- [ ] **Authentication Errors**
  - 401 Unauthorized scenarios
  - Token expiration handling
  - Redirect to login behavior

- [ ] **Edge Cases**
  - Empty data states
  - Very large datasets
  - Rapid user interactions
  - Concurrent modifications

### Test File Structure
```
frontend/
├── __tests__/
│   ├── mocks/
│   │   ├── eventData.ts           ← NEW: Mock event data
│   │   ├── eventHandlers.ts       ← NEW: MSW event handlers  
│   │   └── handlers.ts            ← UPDATE: Include event handlers
│   ├── eventTestUtils.ts          ← NEW: Event-specific test utilities
│   └── errors/
│       └── event-error-scenarios.test.tsx  ← NEW: Error tests
├── src/
│   ├── hooks/
│   │   └── api/
│   │       └── __tests__/
│   │           ├── useEvents.test.tsx       ← NEW: Events hook tests
│   │           └── useEventStats.test.tsx   ← NEW: Stats hook tests
│   ├── components/
│   │   ├── events/
│   │   │   └── __tests__/
│   │   │       ├── EventCard.test.tsx       ← NEW: Event card tests
│   │   │       ├── EventList.test.tsx       ← NEW: Event list tests
│   │   │       └── EventFilters.test.tsx    ← NEW: Filter tests
│   │   └── dashboard/
│   │       └── __tests__/
│   │           └── StatsCards.test.tsx      ← NEW: Stats tests
│   └── __tests__/
│       └── integration/
│           └── event-dashboard-integration.test.tsx  ← NEW: Integration tests
```

### Success Criteria & Goals
- [ ] **Coverage**: 90%+ test coverage for hooks and components
- [ ] **Performance**: Test suite runs in under 15 seconds
- [ ] **Reliability**: All tests pass consistently (no flaky tests)
- [ ] **Error Coverage**: All error scenarios tested and handled
- [ ] **Integration**: Complete user workflows tested end-to-end
- [ ] **Accessibility**: ARIA labels and keyboard navigation tested
- [ ] **Responsive**: Mobile and desktop scenarios covered

### Testing Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test files
npm test useEvents.test.tsx

# Run integration tests only
npm test integration/

# Run in watch mode during development
npm run test:watch
```

### Estimated Timeline: 2-3 Days
- **Day 1**: Infrastructure setup (morning) + Hook tests (afternoon)
- **Day 2**: Component tests (morning) + State management tests (afternoon)  
- **Day 3**: Integration tests (morning) + Error scenarios (afternoon)

## Phase 6: Styling & Polish (1 day)

### Task 6.1: Responsive Design
- [ ] Mobile-first responsive breakpoints
- [ ] Touch-friendly interactions
- [ ] Proper spacing and typography
- [ ] Dark mode compatibility

### Task 6.2: Loading & Error States
- [ ] Skeleton loading components
- [ ] Error boundary implementation
- [ ] Retry mechanisms for failed requests
- [ ] Empty state illustrations/messages

### Task 6.3: Animations & Transitions
- [ ] Smooth view mode transitions
- [ ] Card hover animations
- [ ] Filter panel slide transitions
- [ ] Loading state animations

## Technical Requirements

### TypeScript Strict Mode
- All components must have proper TypeScript interfaces
- No `any` types allowed
- Strict null checks enabled
- Proper generic typing for API responses

### Performance Considerations
- Implement `React.memo` for EventCard
- Use `useMemo` for expensive filter calculations
- Implement virtual scrolling for large lists
- Lazy load images in event cards

### Accessibility Requirements
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

### Testing Coverage
- Minimum 90% test coverage for components
- Integration tests for all user flows
- E2E tests for critical paths
- Performance testing for large datasets

## File Structure
```
frontend/src/
├── app/dashboard/
│   └── page.tsx (main dashboard page)
├── components/
│   ├── dashboard/
│   │   ├── StatsCards.tsx
│   │   └── DashboardSections.tsx
│   └── events/
│       ├── EventCard.tsx
│       ├── EventList.tsx
│       ├── EventFilters.tsx
│       └── __tests__/
├── hooks/
│   ├── api/
│   │   ├── useEvents.ts
│   │   └── useEventStats.ts
│   ├── useEventActions.ts
│   ├── useEventFilters.ts
│   └── useViewPreferences.ts
└── lib/api/
    └── eventService.ts
```

## Success Criteria
- [ ] Dashboard loads event data efficiently
- [ ] Filtering and search work smoothly
- [ ] All CRUD operations function correctly
- [ ] Responsive design works on all devices
- [ ] Full test coverage achieved
- [ ] No TypeScript errors or warnings
- [ ] Performance meets target metrics (< 2s initial load)