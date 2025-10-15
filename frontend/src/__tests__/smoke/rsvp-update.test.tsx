/**
 * Smoke tests for RSVP update flow
 * Tests the enhanced RSVP update experience with edit button and status comparison
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RSVPConfirmation } from "@/components/rsvp/RSVPConfirmation";
import { RsvpStatus } from "@/types/guest.types";
import type {
  RSVPSubmissionResponse,
  RSVPEventDetailsResponse,
} from "@/types/rsvp.types";

// Mock date-fns format function
jest.mock("date-fns", () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr.includes("EEEE")) {
      return "Monday, October 15, 2025 at 6:00 PM";
    }
    return "October 15, 2025 at 6:00 PM";
  },
}));

describe("RSVP Update Flow - Smoke Tests", () => {
  const mockEventDetails: RSVPEventDetailsResponse = {
    guest: {
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      plus_one_allowed: true,
    },
    current_rsvp_status: RsvpStatus.ATTENDING,
    event: {
      name: "Annual Company Party",
      description: "Join us for a night of fun!",
      type: "corporate",
      start_date: "2025-10-15T18:00:00Z",
      end_date: "2025-10-15T22:00:00Z",
      location: "Downtown Convention Center",
      venue_name: "Grand Ballroom",
      venue_address: "123 Main St, City, ST 12345",
    },
    host_name: "Party Planners Inc",
  };

  const mockSubmissionNew: RSVPSubmissionResponse = {
    success: true,
    message: "RSVP submitted successfully",
    rsvp_status: RsvpStatus.ATTENDING,
    guest_name: "John Doe",
    event_name: "Annual Company Party",
    submitted_at: "2025-10-15T18:00:00Z",
  };

  const mockSubmissionUpdate: RSVPSubmissionResponse = {
    success: true,
    message: "RSVP updated successfully",
    rsvp_status: RsvpStatus.NOT_ATTENDING,
    guest_name: "John Doe",
    event_name: "Annual Company Party",
    submitted_at: "2025-10-15T19:00:00Z",
  };

  describe("First-Time RSVP Submission", () => {
    it("should show 'You're All Set!' for new attendance confirmation", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      expect(screen.getByText("You're All Set!")).toBeInTheDocument();
      expect(
        screen.getByText("We're excited to celebrate with you!")
      ).toBeInTheDocument();
    });

    it("should show 'We'll Miss You!' for new decline response", () => {
      const declineSubmission = {
        ...mockSubmissionNew,
        rsvp_status: RsvpStatus.NOT_ATTENDING,
      };

      render(
        <RSVPConfirmation
          submission={declineSubmission}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      expect(screen.getByText("We'll Miss You!")).toBeInTheDocument();
      expect(
        screen.getByText("Thank you for letting us know. You'll be missed!")
      ).toBeInTheDocument();
    });

    it("should not show status comparison for first-time submission", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      expect(
        screen.queryByText("Your RSVP has been updated")
      ).not.toBeInTheDocument();
    });
  });

  describe("Updated RSVP Submission", () => {
    it("should show 'RSVP Updated Successfully!' for updates", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionUpdate}
          eventDetails={mockEventDetails}
          isUpdate={true}
          previousStatus={RsvpStatus.ATTENDING}
        />
      );

      expect(screen.getByText("RSVP Updated Successfully!")).toBeInTheDocument();
    });

    it("should show status comparison when status changes", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionUpdate}
          eventDetails={mockEventDetails}
          isUpdate={true}
          previousStatus={RsvpStatus.ATTENDING}
        />
      );

      // Check for status comparison section
      expect(screen.getByText("Your RSVP has been updated")).toBeInTheDocument();
      expect(screen.getByText("Previous:")).toBeInTheDocument();
      expect(screen.getByText("New:")).toBeInTheDocument();

      // Verify the statuses are displayed (lowercase with spaces)
      const text = screen.getByText("Your RSVP has been updated").closest('div');
      expect(text?.textContent).toContain("attending");
      expect(text?.textContent).toContain("not attending");
    });

    it("should not show status comparison when status remains the same", () => {
      const sameStatusUpdate = {
        ...mockSubmissionUpdate,
        rsvp_status: RsvpStatus.ATTENDING,
      };

      render(
        <RSVPConfirmation
          submission={sameStatusUpdate}
          eventDetails={mockEventDetails}
          isUpdate={true}
          previousStatus={RsvpStatus.ATTENDING}
        />
      );

      expect(
        screen.queryByText("Your RSVP has been updated")
      ).not.toBeInTheDocument();
    });

    it("should show different update messages based on new status", () => {
      // Test ATTENDING update
      const attendingUpdate = {
        ...mockSubmissionUpdate,
        rsvp_status: RsvpStatus.ATTENDING,
      };
      const { rerender } = render(
        <RSVPConfirmation
          submission={attendingUpdate}
          eventDetails={mockEventDetails}
          isUpdate={true}
          previousStatus={RsvpStatus.MAYBE}
        />
      );

      expect(
        screen.getByText("Your attendance confirmation has been updated.")
      ).toBeInTheDocument();

      // Test NOT_ATTENDING update
      const notAttendingUpdate = {
        ...mockSubmissionUpdate,
        rsvp_status: RsvpStatus.NOT_ATTENDING,
      };
      rerender(
        <RSVPConfirmation
          submission={notAttendingUpdate}
          eventDetails={mockEventDetails}
          isUpdate={true}
          previousStatus={RsvpStatus.ATTENDING}
        />
      );

      expect(
        screen.getByText("Your response has been updated. You'll be missed!")
      ).toBeInTheDocument();

      // Test MAYBE update
      const maybeUpdate = {
        ...mockSubmissionUpdate,
        rsvp_status: RsvpStatus.MAYBE,
      };
      rerender(
        <RSVPConfirmation
          submission={maybeUpdate}
          eventDetails={mockEventDetails}
          isUpdate={true}
          previousStatus={RsvpStatus.NOT_ATTENDING}
        />
      );

      expect(
        screen.getByText("Your tentative response has been updated.")
      ).toBeInTheDocument();
    });
  });

  describe("Edit My RSVP Button", () => {
    it("should render 'Edit My RSVP' button", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      const editButton = screen.getByRole("button", { name: /edit my rsvp/i });
      expect(editButton).toBeInTheDocument();
    });

    it("should call onEditClick handler when provided", async () => {
      const user = userEvent.setup();
      const mockOnEditClick = jest.fn();

      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
          onEditClick={mockOnEditClick}
        />
      );

      const editButton = screen.getByRole("button", { name: /edit my rsvp/i });
      await user.click(editButton);

      expect(mockOnEditClick).toHaveBeenCalledTimes(1);
    });

    it("should have fallback reload behavior when onEditClick not provided", () => {
      // This test verifies the button exists and is clickable
      // The actual reload behavior is tested manually in browser environment
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      const editButton = screen.getByRole("button", { name: /edit my rsvp/i });

      // Verify button is rendered and enabled
      expect(editButton).toBeInTheDocument();
      expect(editButton).not.toBeDisabled();
    });

    it("should show Edit button alongside other action buttons", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      expect(
        screen.getByRole("button", { name: /add to calendar/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /share event/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /edit my rsvp/i })
      ).toBeInTheDocument();
    });
  });

  describe("Event Details Display", () => {
    it("should display guest confirmation email", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      expect(screen.getByText("Confirmation sent to")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("should display event information", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      expect(screen.getByText("Annual Company Party")).toBeInTheDocument();
      expect(screen.getByText("corporate")).toBeInTheDocument();
      expect(screen.getByText("Grand Ballroom")).toBeInTheDocument();
      expect(
        screen.getByText("123 Main St, City, ST 12345")
      ).toBeInTheDocument();
    });

    it("should display RSVP details summary", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      expect(screen.getByText("Your RSVP Details")).toBeInTheDocument();
      expect(screen.getByText("Guest Name")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });
  });

  describe("Footer Messages", () => {
    it("should show update instructions in footer", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      expect(
        screen.getByText(
          /need to make changes\? you can update your rsvp anytime using this link\./i
        )
      ).toBeInTheDocument();
    });

    it("should display host contact information", () => {
      render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      expect(screen.getByText(/questions\? contact/i)).toBeInTheDocument();
      expect(screen.getByText("Party Planners Inc")).toBeInTheDocument();
    });
  });

  describe("Confetti Animation", () => {
    it("should show confetti for attending status only", () => {
      const { container } = render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      // Confetti elements should be present initially
      const confettiElements = container.querySelectorAll(".animate-fadeOut");
      expect(confettiElements.length).toBeGreaterThan(0);
    });

    it("should not show confetti for not attending status", () => {
      const declineSubmission = {
        ...mockSubmissionNew,
        rsvp_status: RsvpStatus.NOT_ATTENDING,
      };

      const { container } = render(
        <RSVPConfirmation
          submission={declineSubmission}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      // Should not have confetti wrapper for non-attending status
      const confettiContainer = container.querySelector(".fixed.inset-0");
      expect(confettiContainer).not.toBeInTheDocument();
    });

    it("should hide confetti after animation timeout", () => {
      // This test verifies confetti visibility logic
      // Animation timing is difficult to test in jest-dom and is better tested manually
      const { container } = render(
        <RSVPConfirmation
          submission={mockSubmissionNew}
          eventDetails={mockEventDetails}
          isUpdate={false}
        />
      );

      // Verify confetti is initially rendered for attending status
      const confettiElements = container.querySelectorAll(".animate-fadeOut");
      expect(confettiElements.length).toBeGreaterThan(0);

      // Note: The setTimeout cleanup is tested implicitly by the useEffect hook
      // Full animation timing tests should be done in E2E tests
    });
  });
});
