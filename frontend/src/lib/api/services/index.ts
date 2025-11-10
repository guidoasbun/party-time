/**
 * Central export file for all API services
 */

// Export service classes and instances
export { AuthService, authService } from "./auth.service";
export { EventsService, eventsService } from "./events.service";
export { GuestsService, guestsService } from "./guests.service";
export { BudgetService, budgetService } from "./budget.service";
export { EmailsService, emailsService } from "./emails.service";
export { SeatingService, seatingService } from "./seating.service";

// Import individual services for the combined object
import { authService } from "./auth.service";
import { eventsService } from "./events.service";
import { guestsService } from "./guests.service";
import { budgetService } from "./budget.service";
import { emailsService } from "./emails.service";
import { seatingService } from "./seating.service";

// Create a combined services object for easy access
export const services = {
  auth: authService,
  events: eventsService,
  guests: guestsService,
  budget: budgetService,
  emails: emailsService,
  seating: seatingService,
} as const;

// Export individual services as default exports for convenience
export { authService as auth };
export { eventsService as events };
export { guestsService as guests };
export { budgetService as budget };
export { emailsService as emails };
export { seatingService as seating };

// Re-export common types that services use
export type {
  ApiException,
  NetworkException,
  TimeoutException,
} from "../../api-client";
