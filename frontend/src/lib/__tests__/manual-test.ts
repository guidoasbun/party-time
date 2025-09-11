/**
 * Manual testing script for Phase 2.3.1 API Integration
 * Run this to manually test all services and types
 */

import { authService, eventsService, guestsService, budgetService } from '@/lib/api/services'
import { 
  EventType, 
  EventStatus, 
  RsvpStatus,
  EventCreate,
  GuestCreate,
  BudgetCategoryCreate,
  ExpenseCreate
} from '@/types'

/**
 * Manual test runner - logs results to console
 */
export class ManualTestRunner {
  private results: Array<{ test: string; success: boolean; error?: string }> = []

  async runAllTests() {
    console.log('🧪 Starting Phase 2.3.1 Manual Tests...\n')

    await this.testTypeSystem()
    await this.testAuthService()
    await this.testEventsService()
    await this.testGuestsService()
    await this.testBudgetService()
    
    this.printResults()
  }

  private async testTypeSystem() {
    console.log('📝 Testing Type System...')

    try {
      // Test enum values
      this.assert('EventType enum', EventType.WEDDING === 'wedding')
      this.assert('EventStatus enum', EventStatus.DRAFT === 'draft')
      this.assert('RsvpStatus enum', RsvpStatus.CONFIRMED === 'confirmed')

      // Test interface compliance
      const validEvent: EventCreate = {
        name: 'Test Wedding',
        type: EventType.WEDDING,
        start_date: new Date().toISOString(),
        is_public: false
      }
      this.assert('EventCreate interface', validEvent.name === 'Test Wedding')

      const validGuest: GuestCreate = {
        email: 'guest@test.com',
        first_name: 'John',
        last_name: 'Doe',
        plus_one_allowed: false
      }
      this.assert('GuestCreate interface', validGuest.email === 'guest@test.com')

      console.log('✅ Type System tests completed\n')
    } catch (error) {
      this.recordError('Type System', error)
    }
  }

  private async testAuthService() {
    console.log('🔐 Testing Auth Service...')

    try {
      // Test validation methods
      const passwordValidation = authService.validatePassword('TestPass123!')
      this.assert('Password validation - valid', passwordValidation.isValid === true)

      const weakPasswordValidation = authService.validatePassword('123')
      this.assert('Password validation - weak', weakPasswordValidation.isValid === false)

      const emailValidation = authService.validateEmail('test@example.com')
      this.assert('Email validation - valid', emailValidation === true)

      const invalidEmailValidation = authService.validateEmail('invalid-email')
      this.assert('Email validation - invalid', invalidEmailValidation === false)

      // Test password generation
      const generatedPassword = authService.generateSecurePassword(12)
      this.assert('Password generation length', generatedPassword.length === 12)
      this.assert('Password generation has uppercase', /[A-Z]/.test(generatedPassword))
      this.assert('Password generation has lowercase', /[a-z]/.test(generatedPassword))
      this.assert('Password generation has number', /\d/.test(generatedPassword))

      console.log('✅ Auth Service tests completed\n')
    } catch (error) {
      this.recordError('Auth Service', error)
    }
  }

  private async testEventsService() {
    console.log('📅 Testing Events Service...')

    try {
      // Test validation
      const validEventData: EventCreate = {
        name: 'Test Event',
        type: EventType.BIRTHDAY,
        start_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        is_public: false
      }

      const validation = eventsService.validateEventData(validEventData)
      this.assert('Event validation - valid data', validation.isValid === true)

      const invalidEventData = {
        name: '',
        type: EventType.WEDDING,
        start_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        is_public: false
      }

      const invalidValidation = eventsService.validateEventData(invalidEventData)
      this.assert('Event validation - invalid data', invalidValidation.isValid === false)

      // Test helper methods
      const statusColor = eventsService.getEventStatusColor('confirmed')
      this.assert('Status color helper', typeof statusColor === 'string')

      const typeIcon = eventsService.getEventTypeIcon('wedding')
      this.assert('Type icon helper', typeof typeIcon === 'string')

      console.log('✅ Events Service tests completed\n')
    } catch (error) {
      this.recordError('Events Service', error)
    }
  }

  private async testGuestsService() {
    console.log('👥 Testing Guests Service...')

    try {
      // Test validation
      const validGuestData: GuestCreate = {
        email: 'guest@example.com',
        first_name: 'John',
        last_name: 'Doe',
        plus_one_allowed: true
      }

      const validation = guestsService.validateGuestData(validGuestData)
      this.assert('Guest validation - valid data', validation.isValid === true)

      const invalidGuestData = {
        email: 'invalid-email',
        first_name: '',
        last_name: 'Doe',
        plus_one_allowed: false
      }

      const invalidValidation = guestsService.validateGuestData(invalidGuestData)
      this.assert('Guest validation - invalid data', invalidValidation.isValid === false)

      // Test RSVP summary
      const mockGuests = [
        { rsvp_status: RsvpStatus.CONFIRMED, plus_one_name: 'Jane' },
        { rsvp_status: RsvpStatus.PENDING },
        { rsvp_status: RsvpStatus.DECLINED }
      ] as Array<{rsvp_status: RsvpStatus; plus_one_name?: string}>

      const summary = guestsService.generateRSVPSummary(mockGuests)
      this.assert('RSVP summary total', summary.total === 3)
      this.assert('RSVP summary confirmed', summary.confirmed === 1)
      this.assert('RSVP summary pending', summary.pending === 1)

      // Test helper methods
      const statusColor = guestsService.getGuestStatusColor(RsvpStatus.CONFIRMED)
      this.assert('Guest status color', typeof statusColor === 'string')

      const statusLabel = guestsService.getGuestStatusLabel(RsvpStatus.CONFIRMED)
      this.assert('Guest status label', statusLabel === 'Confirmed')

      console.log('✅ Guests Service tests completed\n')
    } catch (error) {
      this.recordError('Guests Service', error)
    }
  }

  private async testBudgetService() {
    console.log('💰 Testing Budget Service...')

    try {
      // Test validation
      const validCategoryData: BudgetCategoryCreate = {
        name: 'Venue',
        allocated_amount: 5000,
        color: '#3B82F6'
      }

      const categoryValidation = budgetService.validateCategoryData(validCategoryData)
      this.assert('Category validation - valid data', categoryValidation.isValid === true)

      const validExpenseData: ExpenseCreate = {
        name: 'Venue Booking',
        amount: 5000,
        expense_date: '2024-01-15',
        is_paid: false
      }

      const expenseValidation = budgetService.validateExpenseData(validExpenseData)
      this.assert('Expense validation - valid data', expenseValidation.isValid === true)

      // Test analytics helpers
      const utilization = budgetService.calculateBudgetUtilization(10000, 7500)
      this.assert('Budget utilization calculation', utilization === 75)

      const categoryUtilization = budgetService.calculateCategoryUtilization(1000, 800)
      this.assert('Category utilization percentage', categoryUtilization.percentage === 80)
      this.assert('Category utilization status', categoryUtilization.status === 'warning')

      // Test default categories
      const weddingCategories = budgetService.getDefaultCategories('wedding')
      this.assert('Wedding default categories count', weddingCategories.length === 8)
      this.assert('Wedding venue category', weddingCategories[0].name === 'Venue')

      // Test currency formatting
      const formatted = budgetService.formatCurrency(1234.56)
      this.assert('Currency formatting', formatted.includes('1,234.56'))

      console.log('✅ Budget Service tests completed\n')
    } catch (error) {
      this.recordError('Budget Service', error)
    }
  }

  private assert(testName: string, condition: boolean) {
    this.results.push({
      test: testName,
      success: condition,
      error: condition ? undefined : 'Assertion failed'
    })
  }

  private recordError(testSuite: string, error: Error | unknown) {
    console.error(`❌ ${testSuite} failed:`, error)
    this.results.push({
      test: testSuite,
      success: false,
      error: error.message || String(error)
    })
  }

  private printResults() {
    console.log('\n📊 Test Results Summary:')
    console.log('========================')

    const passed = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length
    const total = this.results.length

    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📝 Total: ${total}`)
    console.log(`📈 Success Rate: ${Math.round((passed / total) * 100)}%\n`)

    if (failed > 0) {
      console.log('Failed Tests:')
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  ❌ ${r.test}: ${r.error}`)
        })
    }

    console.log('\n🎉 Phase 2.3.1 Manual Testing Complete!')
  }
}

// Export for use in browser console or Node.js
export const runManualTests = () => {
  const runner = new ManualTestRunner()
  return runner.runAllTests()
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  console.log('Run manual tests by calling: runManualTests()')
}