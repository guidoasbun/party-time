/**
 * VenueCard Component Tests
 * Phase 8.1: Comprehensive Testing Backfill
 *
 * Tests for the venue card component including:
 * - Display: name, address, rating, price level, open/closed status
 * - Photo handling with placeholder fallback
 * - Click interactions (onClick, select, save/bookmark)
 * - Compare functionality with 4-venue limit
 * - Skeleton loader
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VenueCard, VenueCardSkeleton } from '@/components/venues/VenueCard'
import {
  createMockVenueSearchResult,
  createMinimalVenueSearchResult,
  createUnratedVenue,
  createClosedVenue,
} from '../../../../__tests__/mocks/venueData'

describe('VenueCard', () => {
  const defaultVenue = createMockVenueSearchResult()

  describe('Display - Basic Information', () => {
    it('renders venue name', () => {
      render(<VenueCard venue={defaultVenue} />)

      expect(screen.getByText('Grand Ballroom')).toBeInTheDocument()
    })

    it('renders venue address', () => {
      render(<VenueCard venue={defaultVenue} />)

      expect(
        screen.getByText('123 Main Street, Downtown, City 12345')
      ).toBeInTheDocument()
    })

    it('renders venue type badge', () => {
      const venue = createMockVenueSearchResult({
        types: ['event_venue', 'restaurant'],
      })
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('Event Venue')).toBeInTheDocument()
    })

    it('does not render type badge when no types', () => {
      const venue = createMockVenueSearchResult({ types: [] })
      render(<VenueCard venue={venue} />)

      // Should not find any badge elements
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('Display - Rating', () => {
    it('renders rating with star icon', () => {
      const venue = createMockVenueSearchResult({ rating: 4.5 })
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('4.5')).toBeInTheDocument()
    })

    it('renders rating count in parentheses', () => {
      const venue = createMockVenueSearchResult({
        rating: 4.5,
        user_ratings_total: 250,
      })
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('(250)')).toBeInTheDocument()
    })

    it('formats large rating counts with commas', () => {
      const venue = createMockVenueSearchResult({
        rating: 4.5,
        user_ratings_total: 1500,
      })
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('(1,500)')).toBeInTheDocument()
    })

    it('does not render rating section when rating is undefined', () => {
      const venue = createUnratedVenue()
      render(<VenueCard venue={venue} />)

      // Rating number should not be present
      expect(screen.queryByText(/^\d\.\d$/)).not.toBeInTheDocument()
    })
  })

  describe('Display - Price Level', () => {
    it('renders price level for budget venues', () => {
      const venue = createMockVenueSearchResult({ price_level: 1 })
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('$')).toBeInTheDocument()
    })

    it('renders price level for moderate venues', () => {
      const venue = createMockVenueSearchResult({ price_level: 2 })
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('$$')).toBeInTheDocument()
    })

    it('renders price level for expensive venues', () => {
      const venue = createMockVenueSearchResult({ price_level: 3 })
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('$$$')).toBeInTheDocument()
    })

    it('renders price level for very expensive venues', () => {
      const venue = createMockVenueSearchResult({ price_level: 4 })
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('$$$$')).toBeInTheDocument()
    })

    it('does not render price level when undefined', () => {
      const venue = createMockVenueSearchResult({ price_level: undefined })
      render(<VenueCard venue={venue} />)

      expect(screen.queryByText(/^\$+$/)).not.toBeInTheDocument()
    })
  })

  describe('Display - Open/Closed Status', () => {
    it('renders "Open" status when open_now is true', () => {
      const venue = createMockVenueSearchResult({ open_now: true })
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('Open')).toBeInTheDocument()
    })

    it('renders "Closed" status when open_now is false', () => {
      const venue = createClosedVenue()
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('Closed')).toBeInTheDocument()
    })

    it('does not render status when open_now is undefined', () => {
      const venue = createMockVenueSearchResult({ open_now: undefined })
      render(<VenueCard venue={venue} />)

      expect(screen.queryByText('Open')).not.toBeInTheDocument()
      expect(screen.queryByText('Closed')).not.toBeInTheDocument()
    })
  })

  describe('Photo Handling', () => {
    it('renders venue photo when photo_url is provided', () => {
      const venue = createMockVenueSearchResult({
        photo_url: 'https://example.com/venue-photo.jpg',
      })
      render(<VenueCard venue={venue} />)

      const image = screen.getByRole('img', { name: 'Grand Ballroom' })
      expect(image).toBeInTheDocument()
    })

    it('renders placeholder when photo_url is not provided', () => {
      const venue = createMinimalVenueSearchResult()
      render(<VenueCard venue={venue} />)

      // Should not have an img element
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('Click Interactions - onClick', () => {
    it('calls onClick handler when card is clicked', async () => {
      const user = userEvent.setup()
      const onClick = jest.fn()
      const venue = createMockVenueSearchResult()

      render(<VenueCard venue={venue} onClick={onClick} />)

      // Click on the card (find by venue name's parent)
      const card = screen.getByText('Grand Ballroom').closest('div[class*="cursor-pointer"]')
      if (card) {
        await user.click(card)
      }

      expect(onClick).toHaveBeenCalledWith(venue)
    })

    it('does not throw when onClick is not provided', async () => {
      const user = userEvent.setup()
      const venue = createMockVenueSearchResult()

      render(<VenueCard venue={venue} />)

      // Should not throw when clicking
      const card = screen.getByText('Grand Ballroom').closest('div[class*="cursor-pointer"]')
      if (card) {
        await expect(user.click(card)).resolves.not.toThrow()
      }
    })
  })

  describe('Click Interactions - Select Button', () => {
    it('renders select button when onSelect is provided', () => {
      const venue = createMockVenueSearchResult()
      const onSelect = jest.fn()

      render(<VenueCard venue={venue} onSelect={onSelect} />)

      expect(screen.getByRole('button', { name: /Select/i })).toBeInTheDocument()
    })

    it('does not render select button when onSelect is not provided', () => {
      const venue = createMockVenueSearchResult()

      render(<VenueCard venue={venue} />)

      expect(screen.queryByRole('button', { name: /Select/i })).not.toBeInTheDocument()
    })

    it('calls onSelect when select button is clicked', async () => {
      const user = userEvent.setup()
      const venue = createMockVenueSearchResult()
      const onSelect = jest.fn()

      render(<VenueCard venue={venue} onSelect={onSelect} />)

      await user.click(screen.getByRole('button', { name: /Select/i }))

      expect(onSelect).toHaveBeenCalledWith(venue)
    })

    it('shows "Selected" text when selected prop is true', () => {
      const venue = createMockVenueSearchResult()
      const onSelect = jest.fn()

      render(<VenueCard venue={venue} onSelect={onSelect} selected={true} />)

      expect(screen.getByRole('button', { name: /Selected/i })).toBeInTheDocument()
    })

    it('applies selected styling when selected prop is true', () => {
      const venue = createMockVenueSearchResult()
      const onSelect = jest.fn()

      const { container } = render(
        <VenueCard venue={venue} onSelect={onSelect} selected={true} />
      )

      // Should have ring styling on the card
      const card = container.querySelector('[class*="ring-2"]')
      expect(card).toBeInTheDocument()
    })

    it('select click does not trigger onClick', async () => {
      const user = userEvent.setup()
      const venue = createMockVenueSearchResult()
      const onClick = jest.fn()
      const onSelect = jest.fn()

      render(<VenueCard venue={venue} onClick={onClick} onSelect={onSelect} />)

      await user.click(screen.getByRole('button', { name: /Select/i }))

      // onSelect should be called, but onClick should NOT be called
      expect(onSelect).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('Save/Bookmark Functionality', () => {
    it('renders save button when onToggleSave is provided', () => {
      const venue = createMockVenueSearchResult()
      const onToggleSave = jest.fn()

      render(<VenueCard venue={venue} onToggleSave={onToggleSave} />)

      expect(screen.getByTitle('Save venue')).toBeInTheDocument()
    })

    it('does not render save button when onToggleSave is not provided', () => {
      const venue = createMockVenueSearchResult()

      render(<VenueCard venue={venue} />)

      expect(screen.queryByTitle('Save venue')).not.toBeInTheDocument()
    })

    it('calls onToggleSave when save button is clicked', async () => {
      const user = userEvent.setup()
      const venue = createMockVenueSearchResult()
      const onToggleSave = jest.fn()

      render(<VenueCard venue={venue} onToggleSave={onToggleSave} />)

      await user.click(screen.getByTitle('Save venue'))

      expect(onToggleSave).toHaveBeenCalledWith(venue)
    })

    it('shows "Remove from saved" title when isSaved is true', () => {
      const venue = createMockVenueSearchResult()
      const onToggleSave = jest.fn()

      render(<VenueCard venue={venue} onToggleSave={onToggleSave} isSaved={true} />)

      expect(screen.getByTitle('Remove from saved')).toBeInTheDocument()
    })

    it('save click does not trigger onClick', async () => {
      const user = userEvent.setup()
      const venue = createMockVenueSearchResult()
      const onClick = jest.fn()
      const onToggleSave = jest.fn()

      render(<VenueCard venue={venue} onClick={onClick} onToggleSave={onToggleSave} />)

      await user.click(screen.getByTitle('Save venue'))

      expect(onToggleSave).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('Compare Functionality', () => {
    it('renders compare button when onToggleCompare is provided', () => {
      const venue = createMockVenueSearchResult()
      const onToggleCompare = jest.fn()

      render(<VenueCard venue={venue} onToggleCompare={onToggleCompare} />)

      expect(screen.getByTitle('Add to comparison')).toBeInTheDocument()
    })

    it('does not render compare button when onToggleCompare is not provided', () => {
      const venue = createMockVenueSearchResult()

      render(<VenueCard venue={venue} />)

      expect(screen.queryByTitle('Add to comparison')).not.toBeInTheDocument()
    })

    it('calls onToggleCompare when compare button is clicked', async () => {
      const user = userEvent.setup()
      const venue = createMockVenueSearchResult()
      const onToggleCompare = jest.fn()

      render(<VenueCard venue={venue} onToggleCompare={onToggleCompare} />)

      await user.click(screen.getByTitle('Add to comparison'))

      expect(onToggleCompare).toHaveBeenCalledWith(venue)
    })

    it('shows "Remove from comparison" title when isInCompare is true', () => {
      const venue = createMockVenueSearchResult()
      const onToggleCompare = jest.fn()

      render(
        <VenueCard venue={venue} onToggleCompare={onToggleCompare} isInCompare={true} />
      )

      expect(screen.getByTitle('Remove from comparison')).toBeInTheDocument()
    })

    it('disables compare button when canAddToCompare is false', () => {
      const venue = createMockVenueSearchResult()
      const onToggleCompare = jest.fn()

      render(
        <VenueCard
          venue={venue}
          onToggleCompare={onToggleCompare}
          isInCompare={false}
          canAddToCompare={false}
        />
      )

      const compareButton = screen.getByTitle('Maximum 4 venues can be compared')
      expect(compareButton).toBeDisabled()
    })

    it('still allows removal when canAddToCompare is false but isInCompare is true', () => {
      const venue = createMockVenueSearchResult()
      const onToggleCompare = jest.fn()

      render(
        <VenueCard
          venue={venue}
          onToggleCompare={onToggleCompare}
          isInCompare={true}
          canAddToCompare={false}
        />
      )

      const compareButton = screen.getByTitle('Remove from comparison')
      expect(compareButton).not.toBeDisabled()
    })

    it('compare click does not trigger onClick', async () => {
      const user = userEvent.setup()
      const venue = createMockVenueSearchResult()
      const onClick = jest.fn()
      const onToggleCompare = jest.fn()

      render(
        <VenueCard venue={venue} onClick={onClick} onToggleCompare={onToggleCompare} />
      )

      await user.click(screen.getByTitle('Add to comparison'))

      expect(onToggleCompare).toHaveBeenCalledTimes(1)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('applies custom className', () => {
      const venue = createMockVenueSearchResult()
      const { container } = render(
        <VenueCard venue={venue} className="custom-test-class" />
      )

      const card = container.firstChild
      expect(card).toHaveClass('custom-test-class')
    })
  })

  describe('Edge Cases', () => {
    it('handles minimal venue data', () => {
      const venue = createMinimalVenueSearchResult()
      render(<VenueCard venue={venue} />)

      expect(screen.getByText('Basic Venue')).toBeInTheDocument()
      expect(screen.getByText('456 Simple Street')).toBeInTheDocument()
    })

    it('handles venue with very long name', () => {
      const venue = createMockVenueSearchResult({
        name: 'This Is A Very Long Venue Name That Should Be Truncated With Ellipsis',
      })
      render(<VenueCard venue={venue} />)

      // The name should still be in the document
      expect(
        screen.getByText(
          'This Is A Very Long Venue Name That Should Be Truncated With Ellipsis'
        )
      ).toBeInTheDocument()
    })

    it('handles venue with null price_level', () => {
      const venue = createMockVenueSearchResult({ price_level: null as unknown as number })
      render(<VenueCard venue={venue} />)

      expect(screen.queryByText(/^\$+$/)).not.toBeInTheDocument()
    })
  })
})

describe('VenueCardSkeleton', () => {
  it('renders skeleton loader', () => {
    const { container } = render(<VenueCardSkeleton />)

    // Check for animated elements
    const animatedElements = container.querySelectorAll('.animate-pulse')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('has correct structure with photo placeholder', () => {
    const { container } = render(<VenueCardSkeleton />)

    // Should have the photo skeleton (32px x 32px placeholder)
    const photoSkeleton = container.querySelector('.h-32.w-32')
    expect(photoSkeleton).toBeInTheDocument()
  })

  it('has text placeholders', () => {
    const { container } = render(<VenueCardSkeleton />)

    // Should have multiple skeleton text bars
    const skeletonBars = container.querySelectorAll('.rounded.bg-muted')
    expect(skeletonBars.length).toBeGreaterThan(2)
  })
})
