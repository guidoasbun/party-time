# CHANGELOG

This file documents the detailed completion history of each development phase for the Party-Time application.

---

## Phase 8.2: UI Polish & Mobile Optimization (December 5, 2025)

Complete UI/UX improvements with loading skeletons, tooltips, keyboard shortcuts, success animations, and mobile navigation.

### Features Implemented

1. **Toast Notifications**: Fixed dark mode colors, proper bottom-right stacking
2. **Loading Skeletons**: `DashboardSkeleton`, `EventsPageSkeleton`, `GuestListSkeleton`, `EventCardSkeleton`, `StatCardSkeleton`
3. **Tooltips**: Reusable `Tooltip`, `HelpTooltip`, `TooltipIconButton` with portal rendering
4. **Keyboard Shortcuts**: Global shortcuts (⌘/, ⌘N, G D, G E) with help modal
5. **Success Animations**: CSS-based `Confetti`, `SuccessCheckmark`, `SuccessFeedback`
6. **Mobile Navigation**: Fixed bottom nav with Home, Events, Create (+), Guests, More
7. **Media Query Hooks**: `useMediaQuery`, `useBreakpoints`, `usePrefersReducedMotion`

### Files Created
- `frontend/src/hooks/useMediaQuery.ts` - Responsive breakpoint detection hooks
- `frontend/src/components/ui/LoadingStates.tsx` - Page and component loading skeletons
- `frontend/src/components/ui/Tooltip.tsx` - Tooltip with portal rendering and positioning
- `frontend/src/components/ui/Confetti.tsx` - CSS-based success animations
- `frontend/src/contexts/KeyboardShortcutsContext.tsx` - Global keyboard shortcuts provider
- `frontend/src/components/layout/MobileBottomNav.tsx` - Mobile bottom navigation bar

### Files Modified
- `frontend/src/components/ui/Toast.tsx` - Dark mode colors, bottom-right positioning fix
- `frontend/src/app/globals.css` - Confetti/checkmark animation keyframes
- `frontend/src/app/layout.tsx` - KeyboardShortcutsProvider wrapper
- `frontend/src/app/dashboard/layout.tsx` - MobileBottomNav integration
- `frontend/src/app/events/layout.tsx` - MobileBottomNav integration
- `frontend/src/app/dashboard/page.tsx` - DashboardSkeleton loading state
- `frontend/src/app/events/page.tsx` - EventsPageSkeleton loading state

### Statistics
- 6 new files created (~1,500 lines)
- 7 files modified
- Build verification: ✅ Successful (28 routes, no TypeScript errors)

---

## Phase 8.1: Comprehensive Testing Backfill (December 4, 2025)

Complete testing infrastructure with integration tests, component tests, and mock data factories.

### Frontend Tests Created
- `critical-workflows.test.tsx` - Event detail pages, guest management, RSVP flows, seating charts, budget, venues
- `error-handling.test.tsx` - API errors, auth errors, form submission errors, error boundaries
- `BudgetOverview.test.tsx` - Stats cards, loading states, category progress, alerts, expenses
- `VenueCard.test.tsx` - Display, interactions, save/compare functionality, skeleton

### Frontend Mock Data Factories
- `budgetData.ts` - Budget category, expense, summary, analytics factories
- `venueData.ts` - Venue search, details, event venue, saved venue factories
- `seatingData.ts` - Seating chart, table layout, seat assignment factories

### Backend Tests Created
- `test_complete_flows.py` - Event lifecycle, guest management, RSVP system, email system, seating charts, budget tracking, API error handling (7 test classes)

### Bug Fixes
- Fixed Vitest syntax in `guest-list.test.tsx` (converted `vi.mock`/`vi.fn` to Jest `jest.mock`/`jest.fn`)
- Fixed unused import lint warnings in test files

### Statistics
- 8 new test files created
- 1 test file fixed (Vitest → Jest migration)
- 1,182 tests passing
- Build verification successful

---

## Phase 7.2.1: Basic Budget Management (December 1, 2025)

Complete budget tracking UI with BudgetTab container (3 sub-tabs: Overview, Categories, Expenses).

### Features
- BudgetOverview displays 4 stats cards (Budget Target, Total Spent, Remaining, Utilization %)
- Category progress bars with color-coded alerts (>=80% = warning, >100% = over budget)
- Recent expenses list
- Shows both event's `budget_total` and sum of category allocations
- CategoryList/CategoryCard/CategoryForm for CRUD operations with color picker
- ExpenseList/ExpenseRow/ExpenseForm for expense management
- Zod validation schemas with `formatCurrency` and `formatCompactCurrency` helpers
- React Query hooks with `useBudgetManagement` composite hook

### Bug Fix
- Remaining and Utilization now calculate against `eventBudgetTotal` instead of allocated amount

### Statistics
- 12 frontend files created (~2,500 lines)
- Production build successful

---

## Phase 7.1.1: Google Places API Integration (November 30, 2025)

Complete venue search system with Google Places API (New) integration.

### Backend
- `venue_service.py` with Redis caching (1-hour TTL for search, 24-hour for details)
- 9 API endpoints in `venues.py` for venue search and event venue management
- 18 Pydantic schemas in `venue.py`
- EventVenue SQLAlchemy model

### Frontend
- TypeScript types, API service (`venue.service.ts`)
- React Query hooks (`useVenueSearch`, `useEventVenues`)
- Venue components (VenueSearch, VenueCard, VenueDetails, EventVenueList)
- VenuesTab integrated into event detail pages

### Testing
- Comprehensive Postman test suite (24 requests, ~110 assertions)

### Bug Fixes
- Swagger UI CSP headers
- Photo attribution parsing (Google returns objects not strings)
- Review time format (ISO string not integer)
- Route ordering (reorder before {venue_id})
- Place ID format handling

### Statistics
- 5 backend files created
- 9 frontend files created
- 3 Postman files created
- ~2,500+ lines of code

---

## Phase 6.3.1-6.3.12: Seating Chart Integration (November 2025)

### Phase 6.3.12: Polish & Performance (November 30)
- SeatingEditorSkeleton component (~130 lines)
- FeatureTooltips for first-time user onboarding
- ErrorBoundary wrapper for graceful error handling
- SaveIndicator enhanced with success animation
- GuestSidebar with isLoading prop and skeleton items

### Phase 6.3.11: History & Keyboard Shortcuts (November 30)
- Fixed help dialog shortcut from `Shift+?` to just `?`
- Added `Cmd/Ctrl+Y` as alternative redo shortcut
- 4 venue operation history types added
- Venue layout operations tracked in history with undo/redo

### Phase 6.3.10: Mobile & Responsive Find My Seat (November 30)
- Mobile detection with 768px breakpoint
- Conditional rendering: Mobile shows MobileSeatingView, Desktop shows SeatingEditorLayout
- Integrated `useTheme` hook for theme-aware mobile view

### Phase 6.3.9: Export & Sharing with Venue (November 30)
- `prepareCanvasForExport()` helper for selective visibility
- Export respects `includeFloorPlan` and `includeSpecialAreas` options
- CSV export enhanced with "Meal Preference" column
- PrintView updated with venue summary section

### Phase 6.3.8: Smart Seating & Auto-Assignment (November 29)
- AutoAssignDialog component (~450 lines) with 3 strategies
- Backend persistence via `create_seat_assignments_bulk()`
- Smart algorithm groups families, keeps plus-ones together

### Phase 6.3.7: Full Venue Layout Integration (November 29)
- Circular shape option for special areas
- Canvas drag/resize persistence bug fix
- Floor plan position/scale persistence

### Phase 6.3.6: Table Management Features (November 29)
- Delete/Backspace keyboard shortcut
- Toast notifications for template/duplicate/delete/clear
- Fixed duplicate keyboard handler bug

### Phase 6.3.5: Drag-and-Drop Assignment (November 29)
- Full drag-and-drop guest assignment from sidebar to canvas
- Fixed backend bug with seat_assignments stripped from API response
- Added `inline` prop to sidebar components

### Phase 6.3.4: Guest Integration (November 26)
- GuestSidebar displays dietary restrictions and plus-one names
- Plus-one headcount feature in UnseatedGuestsIndicator
- SeatingStatsCards displays 5th "Total Headcount" card

### Phase 6.3.3: Connect Data Layer (November 19)
- Database persistence for seating chart editor
- Fixed critical debounce timer race condition
- Optimistic updates with proper state management

### Phase 6.3.2: Full Seating Editor Page (November 18)
- Complete editor at `/events/[id]/seating/edit`
- Three-column responsive layout
- 23 seating components integrated

### Phase 6.3.1: Seating Tab Integration
- SeatingStatsCards component (180 lines)
- SeatingOverview component (250 lines)
- Navigation ready for edit page

---

## Phase 6.2.1-6.2.5: Advanced Seating Features (November 2025)

### Phase 6.2.5: Seating Chart Polish
- Undo/redo functionality
- Keyboard shortcuts (Cmd/Ctrl+Z, Delete, Escape, ?)
- Autosave with 30-second debounce
- Help tooltips and onboarding

### Phase 6.2.4: Mobile & Tablet Views
- FindMySeat.tsx component (~250 lines)
- ResponsiveToolbar.tsx component (~200 lines)
- MobileSeatingView.tsx component (~180 lines)
- Pinch-to-zoom touch gesture support

### Phase 6.2.3: Export and Sharing Features
- PDF export with jsPDF integration
- High-resolution image export (PNG, JPEG, SVG)
- Print-optimized view with table assignment cards
- CSV export with sortable columns
- Shareable link generation

### Phase 6.2.2: Venue Layout Integration
- Floor plan upload (drag-and-drop, base64, 5MB max)
- 10 special area types with visual indicators
- SpecialAreas and VenueLayout components
- Layered rendering in SeatingCanvas

### Phase 6.2.1: Smart Seating Suggestions
- guest_matching.py utility module (321 lines)
- Weighted compatibility scoring
- Plus-one pairing constraint
- 36 backend unit tests

---

## Phase 6.1.1-6.1.5: Seating Chart Backend & Canvas (November 2025)

### Phase 6.1.5: Guest Assignment System
- GuestSidebar (407 lines), SeatAssignmentPanel (378 lines)
- UnseatedGuestsIndicator (202 lines)
- Full drag-and-drop integration

### Phase 6.1.4: Table Management Interface
- TableToolbar (270 lines), TableProperties (419 lines)
- TableTemplates (386 lines) with 5 presets
- Auto-incrementing table numbering

### Phase 6.1.3: Fabric.js Canvas Setup
- Canvas rendering with zoom (0.1x-5.0x), pan, drag-and-drop
- Four table shapes with theme-aware colors
- Grid snapping, rotation/resize handles
- CanvasControls UI component

### Phase 6.1.2: Seating Chart API Endpoints (November 3)
- 14 API endpoints for seating chart management
- Auto-assignment algorithms (fill_tables, distribute)
- Comprehensive Postman test suite (22 requests)

### Backend Files Created
- crud_seating.py (427 lines, 23 functions)
- seating_service.py (343 lines)
- seating.py (605 lines, 14 endpoints)

### Phase 6.1.1: Seating Chart Data Models
- SeatingChart, TableLayout, SeatAssignment models
- 15 Pydantic schemas
- TypeScript types (40+ interfaces)

---

## Phase 5.2.1-5.2.4: Email Integration (October 2025)

### Phase 5.2.4: Automated Email Flows
- Instant RSVP confirmations
- Scheduled reminder emails (7/3/1 days before deadline)
- Post-event thank you emails
- ReminderService with 3 scheduling methods
- Celery Beat configuration with 3 periodic tasks
- CAN-SPAM compliant unsubscribe system

### Phase 5.2.3: Email Campaign Interface (October 30)
- Bulk invitation sending from guest management page
- EmailCampaignService (351 lines)
- ConfirmSendInvitationsModal (161 lines)
- 5 Pydantic schemas

### Phase 5.2.2: Email Templates (October 28)
- 4 production-ready HTML templates (invitation, confirmation, reminder, thank_you)
- Plain text fallbacks
- 11 template helper functions
- Template preview endpoint

### Phase 5.2.1: Email Service Setup (October)
- AWS SES integration with Celery + Redis
- EmailLog model with delivery tracking
- 7 admin API endpoints
- Jinja2 templates with theme-aware colors
- Rate limiting (10 emails/minute)

### Backend Files Created
- email_service.py (315 lines)
- celery_app.py (68 lines)
- email_tasks.py (270 lines)
- email_log.py (79 lines)
- emails.py (369 lines)

---

## Phase 5.1.1-5.1.4: RSVP System (October 2025)

### Phase 5.1.4: RSVP Customization
- Custom questions (up to 5, text/select/yes-no types)
- Meal options (up to 10 with drag-and-drop reordering)
- RSVP deadline with validation
- PostgreSQL JSONB columns for flexible storage

### Phase 5.1.3: RSVP Management Dashboard
- 4 quick stats cards
- RSVPChart integration
- Recent Responses Timeline
- RSVP Deadline Countdown
- Auto-refresh every 60 seconds

### Phase 5.1.2: Public RSVP Frontend Portal
- Multi-step RSVP form (5 steps)
- Animated buttons with auto-advance
- Celebration confirmation page with confetti
- 47/47 smoke tests passing

### Phase 5.1.1: Public RSVP Backend (October)
- 5 public endpoints (no auth required)
- Rate limiting (10 req/min validation, 5 req/min submission)
- 8-character uppercase alphanumeric tokens
- IP address and timestamp tracking

### Backend Files Created
- rsvp.py schemas
- rate_limit.py middleware
- rsvp.py endpoints (5 endpoints)
- rsvp_service.py

---

## Phase 4.1-4.2: Guest Management (October 2025)

### Phase 4.2.4: Guest Analytics Dashboard
- 7 statistics cards
- Pure CSS donut chart for RSVP breakdown
- Dietary restrictions summary
- CSV export with filtering

### Phase 4.2.3: CSV Import Wizard
- 4-step wizard (Upload, Column Mapping, Preview, Import)
- Drag-and-drop file upload
- Duplicate detection display

### Phase 4.2.2: Guest Forms & Modals
- Add/Edit Guest modals
- Guest Details drawer
- Quick Add inline form
- 25 smoke tests passing

### Phase 4.2.1: Guest List Interface
- Data table with sorting
- Inline editing
- Search bar with debouncing
- RSVP status filters
- Bulk selection and operations

### Phase 4.1.3: CSV Import Backend
- Smart CSV parsing with pandas
- 7+ column naming conventions
- Duplicate detection
- Handles 1000+ guests

### Phase 4.1.2: RSVP Token System
- 8-character tokens with validation
- Invitation link generator
- QR code generation

### Phase 4.1.1: Guest API Endpoints
- Complete CRUD operations
- Search, filtering, sorting
- Bulk operations

---

## Phase 3.1-3.2: Event Forms & Detail Pages (September-October 2025)

### Phase 3.2.6: Events List Page
- Full-page layout with advanced filtering
- Grid/list view toggle
- Sort options and pagination
- 15 smoke tests passing

### Phase 3.2.5: Event Detail Smoke Testing
- Comprehensive E2E and unit test coverage
- Mobile and theme support

### Phase 3.2.4: Event Actions & Dialogs
- Delete/duplicate/share/status change dialogs

### Phase 3.2.3: Event Editing System
- Form pre-population
- Optimistic updates
- Unsaved changes warning

### Phase 3.2.2: Event Tabs Interface
- 5 tabs (Overview, Guests, Budget, Timeline, Settings)
- URL persistence
- Keyboard navigation

### Phase 3.1.5: Form Integration Testing
- 12 comprehensive integration tests

### Phase 3.1.4: Settings & Submission Step
- Privacy controls, guest limits
- Budget planning, event status

### Phase 3.1.3: Date & Time Step
- Date/time pickers with date-fns
- IANA timezone selector
- All-day toggle, quick date presets

### Phase 3.1.2: Basic Information Step
- Event name/description fields
- Visual event type selector (13 types)

### Phase 3.1.1: Form Infrastructure Setup
- Zod validation schemas
- Multi-step form structure
- React Hook Form integration
- localStorage persistence

---

## Infrastructure Setup (September 2025)

### Completed
- Docker environment
- PostgreSQL database
- MCP servers configuration
- AWS Cognito integration
- NextAuth.js setup
- Protected routes
- Event Backend API (complete CRUD)
- Event Dashboard components
- 340+ tests passing
- React Query integration
