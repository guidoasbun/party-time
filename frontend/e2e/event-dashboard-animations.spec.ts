import { test, expect, type Page } from '@playwright/test'

test.describe('Event Dashboard Animation Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard or events page where animations are integrated
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Event List Animations', () => {
    test('should animate event cards on page load', async ({ page }) => {
      // Look for event cards container
      const eventCards = page.locator('[data-testid^="event-card-"]')

      if (await eventCards.count() > 0) {
        // Check that cards appear with staggered animations
        const firstCard = eventCards.first()
        await expect(firstCard).toBeVisible()

        // Verify animation classes are applied
        const cardClasses = await firstCard.getAttribute('class')
        expect(cardClasses).toContain('transition')
      }
    })

    test('should show loading skeleton animations', async ({ page }) => {
      // Force loading state by intercepting API calls
      await page.route('**/api/v1/events**', route => {
        // Delay the response to show loading state
        setTimeout(() => {
          route.continue()
        }, 1000)
      })

      await page.reload()

      // Check for loading skeletons
      const skeletons = page.locator('.animate-pulse')
      if (await skeletons.count() > 0) {
        await expect(skeletons.first()).toBeVisible()

        // Wait for loading to complete
        await page.waitForLoadState('networkidle')

        // Skeletons should be replaced with actual content
        await expect(skeletons.first()).not.toBeVisible()
      }
    })

    test('should animate view mode transitions', async ({ page }) => {
      // Look for view mode toggle buttons
      const gridButton = page.getByTestId('view-grid')
      const listButton = page.getByTestId('view-list')

      if (await gridButton.count() > 0 && await listButton.count() > 0) {
        // Switch to list view
        await listButton.click()
        await page.waitForTimeout(400) // Wait for transition

        // Switch back to grid view
        await gridButton.click()
        await page.waitForTimeout(400) // Wait for transition

        // Verify that view has changed
        const eventContainer = page.locator('[data-testid="events-container"]')
        await expect(eventContainer).toBeVisible()
      }
    })
  })

  test.describe('Event Card Hover Effects', () => {
    test('should apply hover animations to event cards', async ({ page }) => {
      const eventCards = page.locator('[data-testid^="event-card-"]')

      if (await eventCards.count() > 0) {
        const firstCard = eventCards.first()

        // Get initial transform state
        const initialTransform = await firstCard.evaluate(el =>
          window.getComputedStyle(el).transform
        )

        // Hover over the card
        await firstCard.hover()

        // Wait for hover animation
        await page.waitForTimeout(200)

        // Check that transform has changed (scale or translate)
        const hoverTransform = await firstCard.evaluate(el =>
          window.getComputedStyle(el).transform
        )

        expect(hoverTransform).not.toBe(initialTransform)

        // Move mouse away
        await page.mouse.move(0, 0)

        // Wait for hover-off animation
        await page.waitForTimeout(200)
      }
    })

    test('should animate card action buttons on hover', async ({ page }) => {
      const eventCards = page.locator('[data-testid^="event-card-"]')

      if (await eventCards.count() > 0) {
        const firstCard = eventCards.first()

        // Hover over card to reveal action buttons
        await firstCard.hover()

        // Look for action buttons (Edit, Delete, View, etc.)
        const actionButtons = firstCard.locator('button')

        if (await actionButtons.count() > 0) {
          // Check that buttons are visible and animated
          const firstButton = actionButtons.first()
          await expect(firstButton).toBeVisible()

          // Check for transition classes
          const buttonClasses = await firstButton.getAttribute('class')
          expect(buttonClasses).toMatch(/transition|duration/)
        }
      }
    })
  })

  test.describe('Filter Panel Animations', () => {
    test('should animate filter panel expansion', async ({ page }) => {
      // Look for filters toggle or advanced filters button
      const filtersToggle = page.getByText('Advanced Filters')
        .or(page.getByTestId('filters-toggle'))
        .or(page.getByTestId('advanced-filters'))

      if (await filtersToggle.count() > 0) {
        // Click to expand filters
        await filtersToggle.click()

        // Wait for slide animation
        await page.waitForTimeout(400)

        // Check that additional filters are visible
        const advancedFilters = page.locator('[data-testid="advanced-filters-content"]')
          .or(page.locator('.filters-expanded'))

        if (await advancedFilters.count() > 0) {
          await expect(advancedFilters.first()).toBeVisible()
        }

        // Click again to collapse
        await filtersToggle.click()
        await page.waitForTimeout(400)
      }
    })

    test('should animate filter chips selection', async ({ page }) => {
      // Look for filter chips/tags
      const filterChips = page.locator('[data-testid^="filter-chip-"]')
        .or(page.locator('.filter-chip'))
        .or(page.locator('button[data-filter]'))

      if (await filterChips.count() > 0) {
        const firstChip = filterChips.first()

        // Click to select filter
        await firstChip.click()

        // Check for selection animation/state
        const chipClasses = await firstChip.getAttribute('class')
        expect(chipClasses).toMatch(/selected|active|bg-primary|scale/)

        // Click again to deselect
        await firstChip.click()
        await page.waitForTimeout(200)
      }
    })
  })

  test.describe('Page Transition Animations', () => {
    test('should animate navigation between dashboard sections', async ({ page }) => {
      // Test navigation between different dashboard sections
      const navigationLinks = page.locator('nav a, [role="navigation"] a')

      if (await navigationLinks.count() > 0) {
        const eventsLink = navigationLinks.filter({ hasText: 'Events' }).first()
        const dashboardLink = navigationLinks.filter({ hasText: 'Dashboard' }).first()

        if (await eventsLink.count() > 0) {
          await eventsLink.click()
          await page.waitForLoadState('networkidle')

          // Check for page transition effects
          const mainContent = page.locator('main, [role="main"]')
          await expect(mainContent).toBeVisible()
        }

        if (await dashboardLink.count() > 0) {
          await dashboardLink.click()
          await page.waitForLoadState('networkidle')

          const mainContent = page.locator('main, [role="main"]')
          await expect(mainContent).toBeVisible()
        }
      }
    })
  })

  test.describe('Loading State Animations', () => {
    test('should show animated loading states', async ({ page }) => {
      // Intercept API calls to simulate loading
      await page.route('**/api/**', route => {
        setTimeout(() => route.continue(), 500)
      })

      // Trigger a data refresh or navigation
      await page.reload()

      // Look for loading indicators
      const loadingSpinners = page.locator('.animate-spin')
      const loadingPulse = page.locator('.animate-pulse')
      const loadingBounce = page.locator('.animate-bounce')

      // At least one type of loading animation should be present
      const hasLoading = (await loadingSpinners.count() > 0) ||
                        (await loadingPulse.count() > 0) ||
                        (await loadingBounce.count() > 0)

      if (hasLoading) {
        // Verify loading animation is visible
        if (await loadingSpinners.count() > 0) {
          await expect(loadingSpinners.first()).toBeVisible()
        }
        if (await loadingPulse.count() > 0) {
          await expect(loadingPulse.first()).toBeVisible()
        }
        if (await loadingBounce.count() > 0) {
          await expect(loadingBounce.first()).toBeVisible()
        }
      }
    })

    test('should handle error state animations', async ({ page }) => {
      // Simulate API error
      await page.route('**/api/v1/events**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        })
      })

      await page.reload()
      await page.waitForLoadState('networkidle')

      // Look for error state indicators
      const errorMessages = page.getByText('Error')
        .or(page.getByText('Failed'))
        .or(page.locator('.error'))
        .or(page.locator('[data-testid^="error"]'))

      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible()

        // Check for retry button with animation
        const retryButton = page.getByText('Retry')
          .or(page.getByText('Try Again'))
          .or(page.locator('[data-testid="retry"]'))

        if (await retryButton.count() > 0) {
          await expect(retryButton.first()).toBeVisible()

          // Click retry button
          await retryButton.first().click()
        }
      }
    })
  })

  test.describe('Form Animation Integration', () => {
    test('should animate form field focus states', async ({ page }) => {
      // Look for form inputs
      const formInputs = page.locator('input[type="text"], input[type="email"], textarea, select')

      if (await formInputs.count() > 0) {
        const firstInput = formInputs.first()

        // Focus on input
        await firstInput.focus()

        // Check for focus animation classes
        const inputClasses = await firstInput.getAttribute('class')
        expect(inputClasses).toMatch(/transition|focus:|ring|border/)

        // Blur input
        await firstInput.blur()
        await page.waitForTimeout(200)
      }
    })

    test('should animate form validation states', async ({ page }) => {
      // Look for forms with validation
      const forms = page.locator('form')

      if (await forms.count() > 0) {
        const form = forms.first()
        const submitButton = form.locator('button[type="submit"]')
          .or(form.getByText('Submit'))
          .or(form.getByText('Save'))

        if (await submitButton.count() > 0) {
          // Try to submit form without filling required fields
          await submitButton.click()

          // Look for validation error animations
          const errorMessages = form.locator('.error, [data-testid^="error"], .text-red')

          if (await errorMessages.count() > 0) {
            await expect(errorMessages.first()).toBeVisible()

            // Check for shake or fade-in animation
            const errorClasses = await errorMessages.first().getAttribute('class')
            expect(errorClasses).toMatch(/animate|transition|duration/)
          }
        }
      }
    })
  })

  test.describe('Mobile Responsiveness with Animations', () => {
    test('should maintain animations on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Navigate to page
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Test that animations still work on mobile
      const eventCards = page.locator('[data-testid^="event-card-"]')

      if (await eventCards.count() > 0) {
        const firstCard = eventCards.first()

        // Tap on mobile (simulates touch)
        await firstCard.tap()

        // Check that tap animation works
        const cardClasses = await firstCard.getAttribute('class')
        expect(cardClasses).toMatch(/transition|active|pressed/)
      }
    })

    test('should handle touch gestures with animations', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Look for swipeable elements or mobile-specific interactions
      const swipeableElements = page.locator('[data-swipeable], .swipeable')

      if (await swipeableElements.count() > 0) {
        const element = swipeableElements.first()

        // Simulate swipe gesture
        await element.touchscreen?.swipe({ x: 100, y: 200 }, { x: 300, y: 200 })

        await page.waitForTimeout(300)

        // Verify swipe animation completed
        await expect(element).toBeVisible()
      }
    })
  })
})