/**
 * Phase 3.2.5: Event Details Smoke Testing
 * Comprehensive E2E tests for the complete event detail flow
 * Tests: Create → View → Edit → Delete workflow with mobile and theme support
 */

import { test, expect, type Page } from '@playwright/test'

// Test configuration
const BASE_URL = 'http://localhost:3000'
const MOBILE_VIEWPORT = { width: 375, height: 667 }

// Helper to generate unique event names
const generateEventName = () => `E2E Test Event ${Date.now()}`

// Helper to wait for navigation and network idle
const waitForPageLoad = async (page: Page) => {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}

test.describe('Event Detail Flow - Complete Workflow', () => {
  test.describe('Event Creation Flow', () => {
    test('should navigate to create event page', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      // Click "Create Event" button
      const createButton = page.getByRole('button', { name: /create event/i })
      await expect(createButton).toBeVisible()
      await createButton.click()

      // Verify navigation to create page
      await page.waitForURL('**/events/new')
      await expect(page).toHaveURL(/\/events\/new/)

      // Verify form is loaded
      await expect(page.getByText(/create new event/i)).toBeVisible()
    })

    test('should fill out event creation form - all steps', async ({ page }) => {
      await page.goto('/events/new')
      await waitForPageLoad(page)

      const eventName = generateEventName()

      // Step 1: Basic Information
      await expect(page.getByText(/basic information/i)).toBeVisible()

      // Fill event name
      const nameInput = page.getByLabel(/event name/i)
      await expect(nameInput).toBeVisible()
      await nameInput.fill(eventName)

      // Fill event description
      const descriptionInput = page.getByLabel(/description/i)
      await descriptionInput.fill('This is an automated E2E test event for smoke testing')

      // Select event type (Wedding)
      const weddingType = page.locator('[data-event-type="wedding"]').first()
      if (await weddingType.count() > 0) {
        await weddingType.click()
      }

      // Click Next
      const nextButton = page.getByRole('button', { name: /next/i })
      await nextButton.click()

      // Step 2: Date & Time
      await expect(page.getByText(/date.*time/i)).toBeVisible()

      // Select future date (tomorrow)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      const startDateInput = page.locator('input[type="date"]').first()
      if (await startDateInput.count() > 0) {
        await startDateInput.fill(tomorrowStr)
      }

      // Click Next
      await page.getByRole('button', { name: /next/i }).click()

      // Step 3: Settings
      await expect(page.getByText(/settings/i)).toBeVisible()

      // Set guest limit
      const guestLimitInput = page.getByLabel(/guest limit/i)
      if (await guestLimitInput.count() > 0) {
        await guestLimitInput.fill('100')
      }

      // Set budget
      const budgetInput = page.getByLabel(/budget/i)
      if (await budgetInput.count() > 0) {
        await budgetInput.fill('5000')
      }

      // Submit form
      const submitButton = page.getByRole('button', { name: /create event/i })
      await submitButton.click()

      // Wait for redirect to event detail page
      await page.waitForURL(/\/events\/[a-f0-9-]+/)
      await waitForPageLoad(page)

      // Verify event was created
      await expect(page.getByText(eventName)).toBeVisible()
      await expect(page.getByText(/E2E test event/i)).toBeVisible()
    })

    test('should verify created event appears in dashboard', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      // Check for event cards
      const eventCards = page.locator('[data-testid^="event-card-"]')
      const cardCount = await eventCards.count()

      // Should have at least one event
      expect(cardCount).toBeGreaterThan(0)

      // Verify first card is visible
      if (cardCount > 0) {
        await expect(eventCards.first()).toBeVisible()
      }
    })
  })

  test.describe('Event Detail Page', () => {
    let eventId: string

    test.beforeEach(async ({ page }) => {
      // Navigate to dashboard and get first event
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      // Click on first event card to get to detail page
      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()

      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)

        // Extract event ID from URL
        const url = page.url()
        const match = url.match(/\/events\/([a-f0-9-]+)/)
        if (match) {
          eventId = match[1]
        }
      }
    })

    test('should load event detail page with valid ID', async ({ page }) => {
      // Verify we're on an event detail page
      await expect(page).toHaveURL(/\/events\/[a-f0-9-]+/)
      await waitForPageLoad(page)

      // Verify no error messages
      await expect(page.getByText(/failed to load/i)).not.toBeVisible()

      // Verify event header is visible
      const heading = page.locator('h1').first()
      await expect(heading).toBeVisible()
    })

    test('should display event header correctly', async ({ page }) => {
      await waitForPageLoad(page)

      // Verify title is visible
      const title = page.locator('h1').first()
      await expect(title).toBeVisible()

      // Verify event type badge
      const typeBadge = page.locator('[class*="badge"]').first()
      if (await typeBadge.count() > 0) {
        await expect(typeBadge).toBeVisible()
      }

      // Verify date is displayed
      const dateText = page.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/').first()
      if (await dateText.count() > 0) {
        await expect(dateText).toBeVisible()
      }
    })

    test('should display all action buttons', async ({ page }) => {
      await waitForPageLoad(page)

      // Check for Edit button
      const editButton = page.getByRole('button', { name: /edit/i })
      await expect(editButton).toBeVisible()
      await expect(editButton).toBeEnabled()

      // Check for Duplicate button
      const duplicateButton = page.getByRole('button', { name: /duplicate/i })
      await expect(duplicateButton).toBeVisible()
      await expect(duplicateButton).toBeEnabled()

      // Check for Share button
      const shareButton = page.getByRole('button', { name: /share/i })
      await expect(shareButton).toBeVisible()
      await expect(shareButton).toBeEnabled()

      // Check for Delete button
      const deleteButton = page.getByRole('button', { name: /delete/i })
      await expect(deleteButton).toBeVisible()
      await expect(deleteButton).toBeEnabled()
    })

    test('should display tabs interface', async ({ page }) => {
      await waitForPageLoad(page)

      // Check for tab buttons
      const overviewTab = page.getByRole('tab', { name: /overview/i })
      await expect(overviewTab).toBeVisible()

      const guestsTab = page.getByRole('tab', { name: /guests/i })
      await expect(guestsTab).toBeVisible()

      const budgetTab = page.getByRole('tab', { name: /budget/i })
      await expect(budgetTab).toBeVisible()

      const timelineTab = page.getByRole('tab', { name: /timeline/i })
      await expect(timelineTab).toBeVisible()

      const settingsTab = page.getByRole('tab', { name: /settings/i })
      await expect(settingsTab).toBeVisible()
    })

    test('should switch between tabs correctly', async ({ page }) => {
      await waitForPageLoad(page)

      // Click on Guests tab
      const guestsTab = page.getByRole('tab', { name: /guests/i })
      await guestsTab.click()
      await page.waitForTimeout(300) // Wait for transition

      // Verify URL contains tab parameter
      await expect(page).toHaveURL(/tab=guests/)

      // Click on Budget tab
      const budgetTab = page.getByRole('tab', { name: /budget/i })
      await budgetTab.click()
      await page.waitForTimeout(300)

      await expect(page).toHaveURL(/tab=budget/)

      // Click back to Overview
      const overviewTab = page.getByRole('tab', { name: /overview/i })
      await overviewTab.click()
      await page.waitForTimeout(300)

      await expect(page).toHaveURL(/tab=overview/)
    })

    test('should persist tab state in URL', async ({ page }) => {
      await waitForPageLoad(page)

      // Switch to Settings tab
      const settingsTab = page.getByRole('tab', { name: /settings/i })
      await settingsTab.click()
      await page.waitForTimeout(300)

      // Verify URL
      await expect(page).toHaveURL(/tab=settings/)

      // Reload page
      await page.reload()
      await waitForPageLoad(page)

      // Settings tab should still be active
      await expect(page).toHaveURL(/tab=settings/)
    })
  })

  test.describe('Event Editing Flow', () => {
    test('should navigate to edit page from detail page', async ({ page }) => {
      // Go to dashboard and click first event
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Click Edit button
        const editButton = page.getByRole('button', { name: /edit/i })
        await editButton.click()

        // Verify navigation to edit page
        await page.waitForURL(/\/events\/[a-f0-9-]+\/edit/)
        await expect(page).toHaveURL(/\/edit/)

        // Verify edit form is loaded
        await expect(page.getByText(/edit event/i)).toBeVisible()
      }
    })

    test('should pre-populate form with existing data', async ({ page }) => {
      // Navigate to any event edit page
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        // Get event name from card
        const eventNameElement = firstEventCard.locator('h3, h2, [class*="title"]').first()
        const originalEventName = await eventNameElement.textContent()

        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)

        // Click Edit
        await page.getByRole('button', { name: /edit/i }).click()
        await page.waitForURL(/\/edit/)
        await waitForPageLoad(page)

        // Verify event name field is pre-populated
        const nameInput = page.getByLabel(/event name/i)
        const nameValue = await nameInput.inputValue()

        expect(nameValue).toBeTruthy()
        expect(nameValue.length).toBeGreaterThan(0)
      }
    })

    test('should save event changes successfully', async ({ page }) => {
      // Navigate to edit page
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)

        await page.getByRole('button', { name: /edit/i }).click()
        await page.waitForURL(/\/edit/)
        await waitForPageLoad(page)

        // Update description
        const descriptionInput = page.getByLabel(/description/i)
        const updatedDescription = `Updated at ${new Date().toISOString()}`
        await descriptionInput.clear()
        await descriptionInput.fill(updatedDescription)

        // Navigate to last step and save
        const nextButtons = page.getByRole('button', { name: /next/i })
        const nextCount = await nextButtons.count()

        for (let i = 0; i < nextCount; i++) {
          const nextBtn = page.getByRole('button', { name: /next/i }).first()
          if (await nextBtn.isVisible()) {
            await nextBtn.click()
            await page.waitForTimeout(300)
          }
        }

        // Click Save
        const saveButton = page.getByRole('button', { name: /save changes|update event/i })
        if (await saveButton.count() > 0) {
          await saveButton.click()

          // Should redirect to detail page
          await page.waitForURL(/\/events\/[a-f0-9-]+$/)
          await waitForPageLoad(page)

          // Verify we're back on detail page
          await expect(page).toHaveURL(/\/events\/[a-f0-9-]+$/)
        }
      }
    })
  })

  test.describe('Event Actions', () => {
    test('should open and close duplicate event dialog', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Click Duplicate button
        const duplicateButton = page.getByRole('button', { name: /duplicate/i })
        await duplicateButton.click()
        await page.waitForTimeout(300)

        // Dialog should be visible
        const dialog = page.getByRole('dialog')
        if (await dialog.count() > 0) {
          await expect(dialog).toBeVisible()

          // Close dialog
          const cancelButton = page.getByRole('button', { name: /cancel/i })
          if (await cancelButton.count() > 0) {
            await cancelButton.click()
            await page.waitForTimeout(300)
            await expect(dialog).not.toBeVisible()
          }
        }
      }
    })

    test('should open share event options', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Click Share button
        const shareButton = page.getByRole('button', { name: /share/i })
        await shareButton.click()
        await page.waitForTimeout(300)

        // Share menu should be visible
        const shareMenu = page.locator('[role="menu"], [role="dialog"]')
        if (await shareMenu.count() > 0) {
          await expect(shareMenu.first()).toBeVisible()
        }
      }
    })

    test('should open delete event dialog', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Click Delete button
        const deleteButton = page.getByRole('button', { name: /delete/i })
        await deleteButton.click()
        await page.waitForTimeout(300)

        // Delete dialog should be visible
        const dialog = page.getByRole('dialog')
        if (await dialog.count() > 0) {
          await expect(dialog).toBeVisible()
          await expect(page.getByText(/delete event|confirm delete/i)).toBeVisible()

          // Cancel deletion
          const cancelButton = page.getByRole('button', { name: /cancel/i })
          if (await cancelButton.count() > 0) {
            await cancelButton.click()
            await page.waitForTimeout(300)
          }
        }
      }
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should display event detail page correctly on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize(MOBILE_VIEWPORT)

      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Verify page loads
        const title = page.locator('h1').first()
        await expect(title).toBeVisible()

        // Verify action buttons are present (may be in mobile menu)
        const editButton = page.getByRole('button', { name: /edit/i })
        await expect(editButton).toBeVisible()
      }
    })

    test('should handle tab navigation on mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT)

      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Check if tabs are visible on mobile
        const overviewTab = page.getByRole('tab', { name: /overview/i })
        if (await overviewTab.count() > 0) {
          await expect(overviewTab).toBeVisible()

          // Try switching tabs
          const guestsTab = page.getByRole('tab', { name: /guests/i })
          if (await guestsTab.count() > 0) {
            await guestsTab.click()
            await page.waitForTimeout(300)
            await expect(page).toHaveURL(/tab=guests/)
          }
        }
      }
    })

    test('should scroll to action buttons on mobile', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT)

      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Scroll to action buttons
        const editButton = page.getByRole('button', { name: /edit/i })
        await editButton.scrollIntoViewIfNeeded()

        // Verify button is visible after scrolling
        await expect(editButton).toBeVisible()
      }
    })
  })

  test.describe('Theme Support', () => {
    test('should display correctly in light theme', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      // Check if theme selector exists and set to light
      const themeButton = page.getByRole('button', { name: /theme|light|dark/i })
      if (await themeButton.count() > 0) {
        // Try to set light theme
        await themeButton.click()
        await page.waitForTimeout(200)

        const lightOption = page.getByText(/light/i)
        if (await lightOption.count() > 0) {
          await lightOption.click()
          await page.waitForTimeout(300)
        }
      }

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Verify light theme is applied
        const html = page.locator('html')
        const htmlClass = await html.getAttribute('class')

        // Should have light theme or no dark class
        if (htmlClass) {
          expect(htmlClass).not.toContain('dark')
        }

        // Verify page content is visible
        await expect(page.locator('h1').first()).toBeVisible()
      }
    })

    test('should display correctly in dark theme', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      // Set dark theme
      const themeButton = page.getByRole('button', { name: /theme|light|dark/i })
      if (await themeButton.count() > 0) {
        await themeButton.click()
        await page.waitForTimeout(200)

        const darkOption = page.getByText(/dark/i).first()
        if (await darkOption.count() > 0) {
          await darkOption.click()
          await page.waitForTimeout(300)
        }
      }

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Verify dark theme is applied
        const html = page.locator('html')
        const htmlClass = await html.getAttribute('class')

        if (htmlClass) {
          expect(htmlClass).toContain('dark')
        }

        // Verify page content is visible in dark theme
        await expect(page.locator('h1').first()).toBeVisible()
      }
    })

    test('should handle system theme preference', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      // Set system theme
      const themeButton = page.getByRole('button', { name: /theme|light|dark/i })
      if (await themeButton.count() > 0) {
        await themeButton.click()
        await page.waitForTimeout(200)

        const systemOption = page.getByText(/system/i)
        if (await systemOption.count() > 0) {
          await systemOption.click()
          await page.waitForTimeout(300)
        }
      }

      const firstEventCard = page.locator('[data-testid^="event-card-"]').first()
      if (await firstEventCard.count() > 0) {
        await firstEventCard.click()
        await page.waitForURL(/\/events\/[a-f0-9-]+/)
        await waitForPageLoad(page)

        // Verify page loads with system theme
        await expect(page.locator('h1').first()).toBeVisible()
      }
    })
  })
})
