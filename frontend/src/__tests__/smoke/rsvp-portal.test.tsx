/**
 * FR-6: The system shall display an RSVP submission page 5.1.2
 * Smoke tests for RSVP portal functionality
 */

import {
  validateRSVPFormStep,
  shouldShowRSVPStep,
  getVisibleRSVPSteps,
  formatRSVPZodErrors,
  attendanceStepSchema,
  mealPreferencesStepSchema,
  plusOneStepSchema,
  notesStepSchema,
  rsvpFormSchema,
  RSVP_FORM_STEPS,
} from "@/lib/validations/rsvp";
import { RsvpStatus } from "@/types/guest.types";
import { z } from "zod";

describe("RSVP Validation Schemas", () => {
  describe("attendanceStepSchema", () => {
    it("should validate valid attendance status", () => {
      const result = attendanceStepSchema.safeParse({
        rsvp_status: RsvpStatus.ATTENDING,
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing attendance status", () => {
      const result = attendanceStepSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should accept all RSVP status values", () => {
      const statuses = [
        RsvpStatus.ATTENDING,
        RsvpStatus.NOT_ATTENDING,
        RsvpStatus.MAYBE,
        RsvpStatus.PENDING,
      ];

      statuses.forEach((status) => {
        const result = attendanceStepSchema.safeParse({ rsvp_status: status });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("mealPreferencesStepSchema", () => {
    it("should validate meal preference within character limit", () => {
      const result = mealPreferencesStepSchema.safeParse({
        meal_preference: "Vegetarian",
        dietary_restrictions: "No nuts",
      });
      expect(result.success).toBe(true);
    });

    it("should reject meal preference exceeding 100 characters", () => {
      const result = mealPreferencesStepSchema.safeParse({
        meal_preference: "a".repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it("should reject dietary restrictions exceeding 500 characters", () => {
      const result = mealPreferencesStepSchema.safeParse({
        dietary_restrictions: "a".repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it("should accept empty meal preferences", () => {
      const result = mealPreferencesStepSchema.safeParse({
        meal_preference: "",
        dietary_restrictions: "",
      });
      expect(result.success).toBe(true);
    });

    it("should transform null values to undefined", () => {
      const result = mealPreferencesStepSchema.parse({
        meal_preference: null,
        dietary_restrictions: null,
      });
      expect(result.meal_preference).toBeUndefined();
      expect(result.dietary_restrictions).toBeUndefined();
    });
  });

  describe("plusOneStepSchema", () => {
    it("should validate plus-one name", () => {
      const result = plusOneStepSchema.safeParse({
        plus_one_name: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("should reject plus-one name exceeding 200 characters", () => {
      const result = plusOneStepSchema.safeParse({
        plus_one_name: "a".repeat(201),
      });
      expect(result.success).toBe(false);
    });

    it("should accept empty plus-one name", () => {
      const result = plusOneStepSchema.safeParse({
        plus_one_name: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("should transform null values to undefined", () => {
      const result = plusOneStepSchema.parse({ plus_one_name: null });
      expect(result.plus_one_name).toBeUndefined();
    });
  });

  describe("notesStepSchema", () => {
    it("should validate notes within character limit", () => {
      const result = notesStepSchema.safeParse({
        notes: "Looking forward to the event!",
      });
      expect(result.success).toBe(true);
    });

    it("should reject notes exceeding 1000 characters", () => {
      const result = notesStepSchema.safeParse({
        notes: "a".repeat(1001),
      });
      expect(result.success).toBe(false);
    });

    it("should accept empty notes", () => {
      const result = notesStepSchema.safeParse({ notes: "" });
      expect(result.success).toBe(true);
    });

    it("should transform null values to undefined", () => {
      const result = notesStepSchema.parse({ notes: null });
      expect(result.notes).toBeUndefined();
    });
  });

  describe("rsvpFormSchema", () => {
    it("should validate complete valid form data", () => {
      const result = rsvpFormSchema.safeParse({
        rsvp_status: RsvpStatus.ATTENDING,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        plus_one_allowed: true,
        plus_one_name: "Jane Doe",
        meal_preference: "Vegetarian",
        dietary_restrictions: "No nuts",
        notes: "Excited to attend!",
      });
      expect(result.success).toBe(true);
    });

    it("should validate minimal required fields", () => {
      const result = rsvpFormSchema.safeParse({
        rsvp_status: RsvpStatus.ATTENDING,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        plus_one_allowed: false,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const result = rsvpFormSchema.safeParse({
        rsvp_status: RsvpStatus.ATTENDING,
        first_name: "John",
        last_name: "Doe",
        email: "invalid-email",
        plus_one_allowed: false,
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("RSVP Form Step Validation", () => {
  describe("validateRSVPFormStep", () => {
    it("should validate attendance step correctly", () => {
      const validData = { rsvp_status: RsvpStatus.ATTENDING };
      const result = validateRSVPFormStep("attendance", validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return errors for invalid attendance step", () => {
      const invalidData = {};
      const result = validateRSVPFormStep("attendance", invalidData);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it("should validate meal preferences step", () => {
      const validData = {
        meal_preference: "Chicken",
        dietary_restrictions: "No shellfish",
      };
      const result = validateRSVPFormStep("mealPreferences", validData);
      expect(result.isValid).toBe(true);
    });

    it("should validate plus-one step", () => {
      const validData = { plus_one_name: "Jane Doe" };
      const result = validateRSVPFormStep("plusOne", validData);
      expect(result.isValid).toBe(true);
    });

    it("should validate notes step", () => {
      const validData = { notes: "Looking forward!" };
      const result = validateRSVPFormStep("notes", validData);
      expect(result.isValid).toBe(true);
    });
  });

  describe("shouldShowRSVPStep", () => {
    it("should always show non-conditional steps", () => {
      expect(shouldShowRSVPStep("attendance", {})).toBe(true);
      expect(shouldShowRSVPStep("guestDetails", {})).toBe(true);
      expect(shouldShowRSVPStep("mealPreferences", {})).toBe(true);
      expect(shouldShowRSVPStep("notes", {})).toBe(true);
    });

    it("should hide plus-one step when not allowed", () => {
      const data = {
        plus_one_allowed: false,
        rsvp_status: RsvpStatus.ATTENDING,
      };
      expect(shouldShowRSVPStep("plusOne", data)).toBe(false);
    });

    it("should show plus-one step when allowed and attending", () => {
      const data = {
        plus_one_allowed: true,
        rsvp_status: RsvpStatus.ATTENDING,
      };
      expect(shouldShowRSVPStep("plusOne", data)).toBe(true);
    });

    it("should hide plus-one step when not attending", () => {
      const data = {
        plus_one_allowed: true,
        rsvp_status: RsvpStatus.NOT_ATTENDING,
      };
      expect(shouldShowRSVPStep("plusOne", data)).toBe(false);
    });

    it("should hide plus-one step for maybe status", () => {
      const data = {
        plus_one_allowed: true,
        rsvp_status: RsvpStatus.MAYBE,
      };
      expect(shouldShowRSVPStep("plusOne", data)).toBe(false);
    });
  });

  describe("getVisibleRSVPSteps", () => {
    it("should return all steps when plus-one allowed and attending", () => {
      const data = {
        plus_one_allowed: true,
        rsvp_status: RsvpStatus.ATTENDING,
      };
      const steps = getVisibleRSVPSteps(data);
      expect(steps.length).toBe(5);
      expect(steps.map((s) => s.name)).toContain("plusOne");
    });

    it("should exclude plus-one step when not allowed", () => {
      const data = {
        plus_one_allowed: false,
        rsvp_status: RsvpStatus.ATTENDING,
      };
      const steps = getVisibleRSVPSteps(data);
      expect(steps.length).toBe(4);
      expect(steps.map((s) => s.name)).not.toContain("plusOne");
    });

    it("should exclude plus-one step when not attending", () => {
      const data = {
        plus_one_allowed: true,
        rsvp_status: RsvpStatus.NOT_ATTENDING,
      };
      const steps = getVisibleRSVPSteps(data);
      expect(steps.map((s) => s.name)).not.toContain("plusOne");
    });
  });

  describe("formatRSVPZodErrors", () => {
    it("should format Zod errors correctly", () => {
      const schema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
      });

      const result = schema.safeParse({ name: "", email: "invalid" });
      if (!result.success) {
        const formatted = formatRSVPZodErrors(result.error);
        expect(formatted).toHaveProperty("name");
        expect(formatted).toHaveProperty("email");
        expect(formatted.name).toBe("Name is required");
        expect(formatted.email).toBe("Invalid email");
      }
    });

    it("should handle nested field errors", () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(1, "Name required"),
        }),
      });

      const result = schema.safeParse({ user: { name: "" } });
      if (!result.success) {
        const formatted = formatRSVPZodErrors(result.error);
        expect(formatted["user.name"]).toBe("Name required");
      }
    });
  });
});

describe("RSVP Form Step Configuration", () => {
  it("should have correct number of steps", () => {
    expect(RSVP_FORM_STEPS).toHaveLength(5);
  });

  it("should have correct step names", () => {
    const stepNames = RSVP_FORM_STEPS.map((s) => s.name);
    expect(stepNames).toEqual([
      "attendance",
      "guestDetails",
      "mealPreferences",
      "plusOne",
      "notes",
    ]);
  });

  it("should mark only plus-one step as conditional", () => {
    const conditionalSteps = RSVP_FORM_STEPS.filter((s) => s.conditional);
    expect(conditionalSteps).toHaveLength(1);
    expect(conditionalSteps[0].name).toBe("plusOne");
  });

  it("should mark optional steps correctly", () => {
    const optionalSteps = RSVP_FORM_STEPS.filter((s) => s.optional);
    expect(optionalSteps.length).toBeGreaterThan(0);
  });

  it("should have valid schemas for all steps", () => {
    RSVP_FORM_STEPS.forEach((step) => {
      expect(step.schema).toBeDefined();
      expect(typeof step.schema.safeParse).toBe("function");
    });
  });
});

describe("RSVP Form Character Limits", () => {
  it("should enforce meal preference 100 character limit", () => {
    const validResult = mealPreferencesStepSchema.safeParse({
      meal_preference: "a".repeat(100),
    });
    expect(validResult.success).toBe(true);

    const invalidResult = mealPreferencesStepSchema.safeParse({
      meal_preference: "a".repeat(101),
    });
    expect(invalidResult.success).toBe(false);
  });

  it("should enforce dietary restrictions 500 character limit", () => {
    const validResult = mealPreferencesStepSchema.safeParse({
      dietary_restrictions: "a".repeat(500),
    });
    expect(validResult.success).toBe(true);

    const invalidResult = mealPreferencesStepSchema.safeParse({
      dietary_restrictions: "a".repeat(501),
    });
    expect(invalidResult.success).toBe(false);
  });

  it("should enforce plus-one name 200 character limit", () => {
    const validResult = plusOneStepSchema.safeParse({
      plus_one_name: "a".repeat(200),
    });
    expect(validResult.success).toBe(true);

    const invalidResult = plusOneStepSchema.safeParse({
      plus_one_name: "a".repeat(201),
    });
    expect(invalidResult.success).toBe(false);
  });

  it("should enforce notes 1000 character limit", () => {
    const validResult = notesStepSchema.safeParse({
      notes: "a".repeat(1000),
    });
    expect(validResult.success).toBe(true);

    const invalidResult = notesStepSchema.safeParse({
      notes: "a".repeat(1001),
    });
    expect(invalidResult.success).toBe(false);
  });
});

describe("RSVP Form Edge Cases", () => {
  it("should handle empty string values", () => {
    const result = rsvpFormSchema.safeParse({
      rsvp_status: RsvpStatus.ATTENDING,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      plus_one_allowed: false,
      meal_preference: "",
      dietary_restrictions: "",
      plus_one_name: "",
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("should handle null values", () => {
    const result = rsvpFormSchema.safeParse({
      rsvp_status: RsvpStatus.ATTENDING,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      plus_one_allowed: false,
      meal_preference: null,
      dietary_restrictions: null,
      plus_one_name: null,
      notes: null,
    });
    expect(result.success).toBe(true);
  });

  it("should handle undefined values", () => {
    const result = rsvpFormSchema.safeParse({
      rsvp_status: RsvpStatus.ATTENDING,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      plus_one_allowed: false,
      meal_preference: undefined,
      dietary_restrictions: undefined,
      plus_one_name: undefined,
      notes: undefined,
    });
    expect(result.success).toBe(true);
  });

  it("should validate pending status", () => {
    const result = rsvpFormSchema.safeParse({
      rsvp_status: RsvpStatus.PENDING,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      plus_one_allowed: false,
    });
    expect(result.success).toBe(true);
  });
});
