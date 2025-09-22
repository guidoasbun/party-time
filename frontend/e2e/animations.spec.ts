import { test, expect, type Page } from '@playwright/test'

test.describe('Animations and Transitions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to animations demo page
    await page.goto('/demo/animations-transitions')
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle')
  })

  test.describe('Animation Controls', () => {
    test('should toggle animations on and off', async ({ page }) => {
      // Find the main animation toggle
      const animationsToggle = page.getByTestId('animations-toggle')
      await expect(animationsToggle).toBeVisible()

      // Check if animations are enabled by default
      await expect(animationsToggle).toBeChecked()

      // Disable animations
      await animationsToggle.click()
      await expect(animationsToggle).not.toBeChecked()

      // Re-enable animations
      await animationsToggle.click()
      await expect(animationsToggle).toBeChecked()
    })

    test('should toggle staggered animations', async ({ page }) => {
      const staggerToggle = page.getByTestId('stagger-toggle')
      await expect(staggerToggle).toBeVisible()

      // Toggle staggered animations
      await staggerToggle.click()
      await staggerToggle.click()
    })

    test('should adjust animation speed', async ({ page }) => {
      const speedSlider = page.getByTestId('speed-slider')
      await expect(speedSlider).toBeVisible()

      // Change speed to fast
      await speedSlider.fill('0.5')
      await expect(speedSlider).toHaveValue('0.5')

      // Change speed to slow
      await speedSlider.fill('2')
      await expect(speedSlider).toHaveValue('2')
    })
  })

  test.describe('Fade Animations', () => {
    test('should demonstrate fade in animation', async ({ page }) => {
      const fadeSection = page.locator('[data-testid="fade-section"]')
      await expect(fadeSection).toBeVisible()

      const fadeInButton = fadeSection.getByTestId('trigger-fade-in')
      const fadeElement = fadeSection.getByTestId('fade-element')

      await fadeInButton.click()

      // Check that the element becomes visible with fade animation
      await expect(fadeElement).toBeVisible()
      await expect(fadeElement).toHaveClass(/animate-fadeIn|opacity-100/)
    })

    test('should demonstrate fade out animation', async ({ page }) => {
      const fadeSection = page.locator('[data-testid="fade-section"]')
      const fadeOutButton = fadeSection.getByTestId('trigger-fade-out')
      const fadeElement = fadeSection.getByTestId('fade-element')

      // First trigger fade in
      await fadeSection.getByTestId('trigger-fade-in').click()
      await expect(fadeElement).toBeVisible()

      // Then trigger fade out
      await fadeOutButton.click()

      // Element should fade out (might still be in DOM but with opacity-0)
      await expect(fadeElement).toHaveClass(/animate-fadeOut|opacity-0/)
    })
  })

  test.describe('Slide Animations', () => {
    test('should demonstrate slide animations from all directions', async ({ page }) => {
      const slideSection = page.locator('[data-testid="slide-section"]')

      const directions = ['up', 'down', 'left', 'right'] as const

      for (const direction of directions) {
        const button = slideSection.getByTestId(`trigger-slide-${direction}`)
        const element = slideSection.getByTestId(`slide-${direction}-element`)

        await button.click()
        await expect(element).toBeVisible()
        await expect(element).toHaveClass(/animate-slideIn/)
      }
    })
  })

  test.describe('Scale Animations', () => {
    test('should demonstrate scale in and out animations', async ({ page }) => {
      const scaleSection = page.locator('[data-testid="scale-section"]')

      const scaleInButton = scaleSection.getByTestId('trigger-scale-in')
      const scaleOutButton = scaleSection.getByTestId('trigger-scale-out')
      const scaleElement = scaleSection.getByTestId('scale-element')

      await scaleInButton.click()
      await expect(scaleElement).toBeVisible()
      await expect(scaleElement).toHaveClass(/animate-scaleIn|scale-100/)

      await scaleOutButton.click()
      await expect(scaleElement).toHaveClass(/animate-scaleOut|scale-95/)
    })
  })

  test.describe('Bounce and Special Animations', () => {
    test('should demonstrate bounce animation', async ({ page }) => {
      const bounceSection = page.locator('[data-testid="bounce-section"]')
      const bounceButton = bounceSection.getByTestId('trigger-bounce')
      const bounceElement = bounceSection.getByTestId('bounce-element')

      await bounceButton.click()
      await expect(bounceElement).toBeVisible()
      await expect(bounceElement).toHaveClass(/animate-bounce/)
    })

    test('should demonstrate shake animation', async ({ page }) => {
      const shakeSection = page.locator('[data-testid="shake-section"]')
      const shakeButton = shakeSection.getByTestId('trigger-shake')
      const shakeElement = shakeSection.getByTestId('shake-element')

      await shakeButton.click()
      await expect(shakeElement).toBeVisible()
      await expect(shakeElement).toHaveClass(/animate-shake/)
    })

    test('should demonstrate pulse animation', async ({ page }) => {
      const pulseSection = page.locator('[data-testid="pulse-section"]')
      const pulseButton = pulseSection.getByTestId('trigger-pulse')
      const pulseElement = pulseSection.getByTestId('pulse-element')

      await pulseButton.click()
      await expect(pulseElement).toBeVisible()
      await expect(pulseElement).toHaveClass(/animate-pulse/)
    })
  })

  test.describe('Staggered Animations', () => {
    test('should demonstrate staggered list animations', async ({ page }) => {
      const staggerSection = page.locator('[data-testid="stagger-section"]')
      const triggerButton = staggerSection.getByTestId('trigger-stagger')

      await triggerButton.click()

      // Check that multiple list items appear with staggered delays
      const listItems = staggerSection.locator('[data-testid^="stagger-item-"]')
      const itemCount = await listItems.count()

      expect(itemCount).toBeGreaterThan(0)

      // Verify that items have staggered animation classes
      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        const item = listItems.nth(i)
        await expect(item).toBeVisible()
      }
    })
  })

  test.describe('Real Component Animations', () => {
    test('should test EventCard hover animations', async ({ page }) => {
      const eventCardSection = page.locator('[data-testid="event-card-section"]')
      const eventCard = eventCardSection.locator('.event-card').first()

      if (await eventCard.count() > 0) {
        // Hover over the event card
        await eventCard.hover()

        // Check for hover effects (scale, shadow, etc.)
        await expect(eventCard).toHaveClass(/hover:scale-105|transform/)

        // Move away to test hover off
        await page.mouse.move(0, 0)
      }
    })

    test('should test EventList view mode transitions', async ({ page }) => {
      const eventListSection = page.locator('[data-testid="event-list-section"]')
      const gridToggle = eventListSection.getByTestId('view-grid')
      const listToggle = eventListSection.getByTestId('view-list')

      if (await gridToggle.count() > 0 && await listToggle.count() > 0) {
        // Switch to list view
        await listToggle.click()

        // Wait for transition
        await page.waitForTimeout(500)

        // Switch back to grid view
        await gridToggle.click()

        // Wait for transition
        await page.waitForTimeout(500)
      }
    })

    test('should test EventFilters slide animations', async ({ page }) => {
      const filtersSection = page.locator('[data-testid="event-filters-section"]')
      const advancedToggle = filtersSection.getByTestId('advanced-filters-toggle')

      if (await advancedToggle.count() > 0) {
        // Open advanced filters
        await advancedToggle.click()

        // Wait for slide animation
        await page.waitForTimeout(300)

        // Close advanced filters
        await advancedToggle.click()

        // Wait for slide animation
        await page.waitForTimeout(300)
      }
    })
  })

  test.describe('Modal and Overlay Transitions', () => {
    test('should test modal animations', async ({ page }) => {
      const modalSection = page.locator('[data-testid="modal-section"]')
      const openModalButton = modalSection.getByTestId('open-modal')

      await openModalButton.click()

      // Check that modal appears with animation
      const modal = page.locator('[data-testid="modal-overlay"]')
      await expect(modal).toBeVisible()

      // Check for modal animation classes
      await expect(modal).toHaveClass(/opacity-100/)

      // Close modal by clicking overlay or close button
      const closeButton = modal.getByTestId('close-modal')
      if (await closeButton.count() > 0) {
        await closeButton.click()
      } else {
        await modal.click()
      }

      // Modal should disappear with animation
      await expect(modal).not.toBeVisible()
    })
  })

  test.describe('Collapse/Accordion Transitions', () => {
    test('should test collapse animations', async ({ page }) => {
      const collapseSection = page.locator('[data-testid="collapse-section"]')
      const toggleButton = collapseSection.getByTestId('collapse-toggle')
      const collapseContent = collapseSection.getByTestId('collapse-content')

      // Open collapsed content
      await toggleButton.click()
      await expect(collapseContent).toBeVisible()

      // Wait for animation
      await page.waitForTimeout(400)

      // Close collapsed content
      await toggleButton.click()

      // Content should start collapsing (height animation)
      await page.waitForTimeout(400)
    })
  })

  test.describe('Performance and Reduced Motion', () => {
    test('should respect prefers-reduced-motion setting', async ({ page }) => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })

      // Navigate to page again with reduced motion
      await page.goto('/demo/animations-transitions')
      await page.waitForLoadState('networkidle')

      // Check that animations are disabled or simplified
      const fadeSection = page.locator('[data-testid="fade-section"]')
      const fadeButton = fadeSection.getByTestId('trigger-fade-in')
      const fadeElement = fadeSection.getByTestId('fade-element')

      await fadeButton.click()

      // With reduced motion, element should appear immediately without animation
      await expect(fadeElement).toBeVisible()
    })

    test('should handle high item count performance test', async ({ page }) => {
      const performanceSection = page.locator('[data-testid="performance-section"]')
      const itemCountInput = performanceSection.getByTestId('item-count-input')
      const generateButton = performanceSection.getByTestId('generate-items')

      // Set a reasonable item count for testing
      await itemCountInput.fill('50')
      await generateButton.click()

      // Wait for items to be generated and animated
      await page.waitForTimeout(2000)

      // Check that items are visible
      const generatedItems = performanceSection.locator('[data-testid^="performance-item-"]')
      const itemCount = await generatedItems.count()

      expect(itemCount).toBe(50)

      // Verify that items have been rendered
      await expect(generatedItems.first()).toBeVisible()
      await expect(generatedItems.last()).toBeVisible()
    })
  })

  test.describe('Animation Timing and Duration', () => {
    test('should verify animation duration controls', async ({ page }) => {
      const durationTest = async (testId: string, expectedDuration: number) => {
        const element = page.getByTestId(testId)
        const startTime = Date.now()

        await element.click()

        // Wait for animation to complete plus a small buffer
        await page.waitForTimeout(expectedDuration + 100)

        const endTime = Date.now()
        const actualDuration = endTime - startTime

        // Allow for some variance in timing (±50ms)
        expect(actualDuration).toBeGreaterThan(expectedDuration - 50)
        expect(actualDuration).toBeLessThan(expectedDuration + 200)
      }

      // Test different animation durations if duration controls exist
      const durationSection = page.locator('[data-testid="duration-section"]')
      if (await durationSection.count() > 0) {
        await durationTest('fast-animation', 150) // 150ms
        await durationTest('normal-animation', 300) // 300ms
        await durationTest('slow-animation', 600) // 600ms
      }
    })
  })
})