import React from 'react'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DateTimeStep } from '../DateTimeStep'
import { EventCreateFormData, eventCreateSchema, defaultEventFormValues } from '@/lib/validations/event'

// Test wrapper component
function TestWrapper({ defaultValues = {} }: { defaultValues?: Partial<EventCreateFormData> }) {
  const form = useForm<EventCreateFormData>({
    resolver: zodResolver(eventCreateSchema),
    defaultValues: { ...defaultEventFormValues, ...defaultValues },
    mode: 'onChange',
  })

  return (
    <FormProvider {...form}>
      <DateTimeStep />
    </FormProvider>
  )
}

describe('DateTimeStep', () => {
  beforeEach(() => {
    // Mock the current date to be consistent
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Component Rendering', () => {
    it('renders the date time step', () => {
      render(<TestWrapper />)

      // Check for main sections that should be present
      expect(screen.getByText('Timed event')).toBeInTheDocument()
      expect(screen.getByText(/Start Date.*& Time/)).toBeInTheDocument()
      expect(screen.getByText(/End Date.*& Time.*Optional/)).toBeInTheDocument()
      expect(screen.getByText('Timezone')).toBeInTheDocument()
    })

    it('shows quick date presets', () => {
      render(<TestWrapper />)

      expect(screen.getByText('Quick Dates:')).toBeInTheDocument()
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Tomorrow')).toBeInTheDocument()
      expect(screen.getByText('Next Week')).toBeInTheDocument()
      expect(screen.getByText('Next Month')).toBeInTheDocument()
    })

    it('shows timed event by default', () => {
      render(<TestWrapper />)

      expect(screen.getByText('Timed event')).toBeInTheDocument()
      expect(screen.getByText('Specify exact start and end times')).toBeInTheDocument()
    })
  })

  describe('All-Day Toggle', () => {
    it('shows all-day toggle button', () => {
      render(<TestWrapper />)

      const toggleButton = screen.getByRole('button', { name: 'Timed' })
      expect(toggleButton).toBeInTheDocument()
    })

    it('starts with all-day when default value is set', () => {
      render(<TestWrapper defaultValues={{ all_day: true }} />)

      expect(screen.getByText('All-day event')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'All Day' })).toBeInTheDocument()
    })
  })

  describe('Event Schedule Preview', () => {
    it('hides preview when no start date is set', () => {
      render(<TestWrapper />)

      expect(screen.queryByText('📅 Event Schedule Preview')).not.toBeInTheDocument()
    })

    it('shows date and time section headers', () => {
      render(<TestWrapper defaultValues={{ start_date: '2024-06-15' }} />)

      // Check if the date/time sections are rendered
      expect(screen.getByText(/Start Date.*& Time/)).toBeInTheDocument()
      expect(screen.getByText(/End Date.*& Time.*Optional/)).toBeInTheDocument()
    })

    it('shows all-day indicator for all-day events', () => {
      render(<TestWrapper defaultValues={{
        start_date: '2024-06-15',
        all_day: true
      }} />)

      expect(screen.getByText('⚡ This is an all-day event')).toBeInTheDocument()
    })
  })

  describe('Quick Date Presets', () => {
    it('has today preset', () => {
      render(<TestWrapper />)

      expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('shows today button', () => {
      render(<TestWrapper />)

      const todayButton = screen.getByText('Today')
      expect(todayButton).toBeInTheDocument()
    })
  })

  describe('Help and Tips', () => {
    it('shows helpful tips', () => {
      render(<TestWrapper />)

      expect(screen.getByText('💡 Date & Time Tips:')).toBeInTheDocument()
      expect(screen.getByText(/Consider your guests' availability/)).toBeInTheDocument()
      expect(screen.getByText(/Weekend events typically have better attendance/)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<TestWrapper />)

      expect(screen.getByRole('button', { name: 'Timed' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Tomorrow' })).toBeInTheDocument()
    })
  })

  describe('Timezone Integration', () => {
    it('shows timezone section', () => {
      render(<TestWrapper />)

      expect(screen.getByText('Timezone')).toBeInTheDocument()
      expect(screen.getByText(/We've detected your timezone/)).toBeInTheDocument()
    })
  })
})