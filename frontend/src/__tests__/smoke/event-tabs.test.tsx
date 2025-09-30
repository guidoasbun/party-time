/**
 * Smoke tests for Event Tabs Interface (Phase 3.2.2)
 * Tests basic functionality: tab switching, URL persistence, data display
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { EventTabs } from '@/components/events/EventTabs'
import type { Event, EventType, EventStatus } from '@/types'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn()
}))

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn()
}

const mockSearchParams = {
  get: jest.fn(),
  toString: jest.fn(() => '')
}

describe('EventTabs - Smoke Tests', () => {
  const mockEvent: Event = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Summer Wedding',
    description: 'A beautiful summer wedding celebration',
    type: 'wedding' as EventType,
    status: 'planning' as EventStatus,
    start_date: '2025-07-15T14:00:00Z',
    end_date: '2025-07-15T22:00:00Z',
    location: 'Central Park',
    venue_name: 'The Pavilion',
    venue_address: '123 Park Ave, New York, NY 10001',
    max_guests: 150,
    budget_total: 25000,
    is_public: false,
    planner_id: '123e4567-e89b-12d3-a456-426614174001',
    guest_count: 120,
    confirmed_guests: 85,
    total_expenses: 15000,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  })

  describe('Basic Rendering', () => {
    test('renders all tab buttons', () => {
      render(<EventTabs event={mockEvent} />)

      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /guests/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /budget/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /timeline/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument()
    })

    test('displays guest count badge', () => {
      render(<EventTabs event={mockEvent} />)

      const guestsTab = screen.getByRole('tab', { name: /guests/i })
      expect(guestsTab).toHaveTextContent('120')
    })

    test('displays budget badge', () => {
      render(<EventTabs event={mockEvent} />)

      const budgetTab = screen.getByRole('tab', { name: /budget/i })
      expect(budgetTab).toHaveTextContent('$25k')
    })

    test('renders overview tab content by default', () => {
      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText('Event Details')).toBeInTheDocument()
      expect(screen.getByText(mockEvent.description as string)).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    test('switches to guests tab when clicked', () => {
      render(<EventTabs event={mockEvent} />)

      const guestsTab = screen.getByRole('tab', { name: /guests/i })
      fireEvent.click(guestsTab)

      expect(screen.getByText('Guest Management')).toBeInTheDocument()
      expect(screen.getByText(/current guest count/i)).toBeInTheDocument()
    })

    test('switches to budget tab when clicked', () => {
      render(<EventTabs event={mockEvent} />)

      const budgetTab = screen.getByRole('tab', { name: /budget/i })
      fireEvent.click(budgetTab)

      expect(screen.getByText('Budget Tracking')).toBeInTheDocument()
      expect(screen.getByText('Total Budget')).toBeInTheDocument()
    })

    test('switches to timeline tab when clicked', () => {
      render(<EventTabs event={mockEvent} />)

      const timelineTab = screen.getByRole('tab', { name: /timeline/i })
      fireEvent.click(timelineTab)

      expect(screen.getByText('Event Timeline')).toBeInTheDocument()
    })

    test('switches to settings tab when clicked', () => {
      render(<EventTabs event={mockEvent} />)

      const settingsTab = screen.getByRole('tab', { name: /settings/i })
      fireEvent.click(settingsTab)

      expect(screen.getByText('Event Settings')).toBeInTheDocument()
    })

    test('updates URL when tab is clicked', () => {
      render(<EventTabs event={mockEvent} />)

      const budgetTab = screen.getByRole('tab', { name: /budget/i })
      fireEvent.click(budgetTab)

      expect(mockRouter.push).toHaveBeenCalledWith('?tab=budget', { scroll: false })
    })
  })

  describe('URL Persistence', () => {
    test('loads guests tab from URL parameter', () => {
      mockSearchParams.get.mockReturnValue('guests')

      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText('Guest Management')).toBeInTheDocument()
    })

    test('loads budget tab from URL parameter', () => {
      mockSearchParams.get.mockReturnValue('budget')

      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText('Budget Tracking')).toBeInTheDocument()
    })

    test('defaults to overview for invalid tab parameter', () => {
      mockSearchParams.get.mockReturnValue('invalid-tab')

      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText('Event Details')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    test('moves to next tab with ArrowRight', () => {
      render(<EventTabs event={mockEvent} />)

      const overviewTab = screen.getByRole('tab', { name: /overview/i })
      overviewTab.focus()
      fireEvent.keyDown(overviewTab, { key: 'ArrowRight' })

      expect(mockRouter.push).toHaveBeenCalledWith('?tab=guests', { scroll: false })
    })

    test('moves to previous tab with ArrowLeft', () => {
      mockSearchParams.get.mockReturnValue('guests')

      render(<EventTabs event={mockEvent} />)

      const guestsTab = screen.getByRole('tab', { name: /guests/i })
      guestsTab.focus()
      fireEvent.keyDown(guestsTab, { key: 'ArrowLeft' })

      expect(mockRouter.push).toHaveBeenCalledWith('?tab=overview', { scroll: false })
    })

    test('activates tab with Enter key', () => {
      render(<EventTabs event={mockEvent} />)

      const budgetTab = screen.getByRole('tab', { name: /budget/i })
      fireEvent.keyDown(budgetTab, { key: 'Enter' })

      expect(mockRouter.push).toHaveBeenCalledWith('?tab=budget', { scroll: false })
    })

    test('activates tab with Space key', () => {
      render(<EventTabs event={mockEvent} />)

      const timelineTab = screen.getByRole('tab', { name: /timeline/i })
      fireEvent.keyDown(timelineTab, { key: ' ' })

      expect(mockRouter.push).toHaveBeenCalledWith('?tab=timeline', { scroll: false })
    })
  })

  describe('Overview Tab Content', () => {
    test('displays event description', () => {
      mockSearchParams.get.mockReturnValue('overview')
      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText(mockEvent.description as string)).toBeInTheDocument()
    })

    test('displays start date', () => {
      mockSearchParams.get.mockReturnValue('overview')
      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText(/start date/i)).toBeInTheDocument()
      const dates = screen.getAllByText(/july/i)
      expect(dates.length).toBeGreaterThanOrEqual(1)
    })

    test('displays venue information', () => {
      mockSearchParams.get.mockReturnValue('overview')
      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText(mockEvent.venue_name as string)).toBeInTheDocument()
      expect(screen.getByText(mockEvent.venue_address as string)).toBeInTheDocument()
    })

    test('displays privacy setting', () => {
      mockSearchParams.get.mockReturnValue('overview')
      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText('Private Event')).toBeInTheDocument()
    })

    test('displays guest limit', () => {
      mockSearchParams.get.mockReturnValue('overview')
      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText(/120 \/ 150 guests/i)).toBeInTheDocument()
    })
  })

  describe('Budget Tab Content', () => {
    test('displays total budget', () => {
      mockSearchParams.get.mockReturnValue('budget')

      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText('$25,000')).toBeInTheDocument()
    })

    test('displays spent amount', () => {
      mockSearchParams.get.mockReturnValue('budget')

      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText('$15,000')).toBeInTheDocument()
    })

    test('calculates remaining budget correctly', () => {
      mockSearchParams.get.mockReturnValue('budget')

      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText('$10,000')).toBeInTheDocument()
    })

    test('displays budget percentage', () => {
      mockSearchParams.get.mockReturnValue('budget')

      render(<EventTabs event={mockEvent} />)

      expect(screen.getByText(/60%/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    test('tabs have proper ARIA attributes', () => {
      mockSearchParams.get.mockReturnValue(null)
      render(<EventTabs event={mockEvent} />)

      const overviewTab = screen.getByRole('tab', { name: /overview/i })
      expect(overviewTab).toHaveAttribute('aria-selected', 'true')
      expect(overviewTab).toHaveAttribute('aria-controls', 'overview-panel')

      const guestsTab = screen.getByRole('tab', { name: /guests/i })
      expect(guestsTab).toHaveAttribute('aria-selected', 'false')
    })

    test('tab panel has proper ARIA attributes', () => {
      mockSearchParams.get.mockReturnValue(null)
      render(<EventTabs event={mockEvent} />)

      const tabPanel = screen.getByRole('tabpanel')
      expect(tabPanel).toHaveAttribute('id', 'overview-panel')
      expect(tabPanel).toHaveAttribute('aria-labelledby', 'overview-tab')
    })

    test('inactive tabs have tabindex -1', () => {
      mockSearchParams.get.mockReturnValue(null)
      render(<EventTabs event={mockEvent} />)

      const guestsTab = screen.getByRole('tab', { name: /guests/i })
      expect(guestsTab).toHaveAttribute('tabindex', '-1')
    })

    test('active tab has tabindex 0', () => {
      mockSearchParams.get.mockReturnValue(null)
      render(<EventTabs event={mockEvent} />)

      const overviewTab = screen.getByRole('tab', { name: /overview/i })
      expect(overviewTab).toHaveAttribute('tabindex', '0')
    })
  })
})
