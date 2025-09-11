/**
 * Central export file for all API services
 */

// Export service classes and instances
export { AuthService, authService } from './auth.service'
export { EventsService, eventsService } from './events.service'
export { GuestsService, guestsService } from './guests.service'
export { BudgetService, budgetService } from './budget.service'

// Import individual services for the combined object
import { authService } from './auth.service'
import { eventsService } from './events.service'
import { guestsService } from './guests.service'
import { budgetService } from './budget.service'

// Create a combined services object for easy access
export const services = {
  auth: authService,
  events: eventsService,
  guests: guestsService,
  budget: budgetService
} as const

// Export individual services as default exports for convenience
export { authService as auth }
export { eventsService as events }
export { guestsService as guests }
export { budgetService as budget }

// Re-export common types that services use
export type {
  ApiException,
  NetworkException,
  TimeoutException
} from '../../api-client'