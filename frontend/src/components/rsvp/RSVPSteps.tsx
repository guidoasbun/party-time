/**
 * FR-6: The system shall display an RSVP submission page 5.1.2
 * Individual step components for RSVP multi-step form
 */

"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Check, X, HelpCircle, User, Utensils, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RsvpStatus } from "@/types/guest.types";
import type { RSVPFormData } from "@/lib/validations/rsvp";

// ============================================================
// Step 1: Attendance Selection
// ============================================================

interface AttendanceStepProps {
  onNext: () => void;
}

export function AttendanceStep({ onNext }: AttendanceStepProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<RSVPFormData>();

  const rsvp_status = watch("rsvp_status");

  const handleSelection = (status: RsvpStatus) => {
    setValue("rsvp_status", status, { shouldValidate: true });
    // Auto-advance after selection with slight delay for animation
    setTimeout(() => {
      onNext();
    }, 400);
  };

  return (
    <div className="space-y-6 animate-slideInUp">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Will you attend?</h2>
        <p className="text-muted-foreground">
          Please let us know if you can make it
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attending */}
        <button
          type="button"
          onClick={() => handleSelection(RsvpStatus.ATTENDING)}
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            "hover:shadow-lg hover:scale-105 active:scale-95",
            "flex flex-col items-center gap-3 min-h-[160px]",
            rsvp_status === RsvpStatus.ATTENDING
              ? "border-green-500 bg-green-50 dark:bg-green-950/30 animate-bounceIn"
              : "border-border hover:border-green-300 dark:hover:border-green-700"
          )}
          aria-pressed={rsvp_status === RsvpStatus.ATTENDING}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
              rsvp_status === RsvpStatus.ATTENDING
                ? "bg-green-500 text-white animate-scaleIn"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Check className="w-8 h-8" />
          </div>
          <span className="text-lg font-semibold">Yes, I&apos;ll be there!</span>
          <span className="text-sm text-muted-foreground text-center">
            Can&apos;t wait to celebrate with you
          </span>
        </button>

        {/* Not Attending */}
        <button
          type="button"
          onClick={() => handleSelection(RsvpStatus.NOT_ATTENDING)}
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            "hover:shadow-lg hover:scale-105 active:scale-95",
            "flex flex-col items-center gap-3 min-h-[160px]",
            rsvp_status === RsvpStatus.NOT_ATTENDING
              ? "border-red-500 bg-red-50 dark:bg-red-950/30 animate-bounceIn"
              : "border-border hover:border-red-300 dark:hover:border-red-700"
          )}
          aria-pressed={rsvp_status === RsvpStatus.NOT_ATTENDING}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
              rsvp_status === RsvpStatus.NOT_ATTENDING
                ? "bg-red-500 text-white animate-scaleIn"
                : "bg-muted text-muted-foreground"
            )}
          >
            <X className="w-8 h-8" />
          </div>
          <span className="text-lg font-semibold">Sorry, can&apos;t make it</span>
          <span className="text-sm text-muted-foreground text-center">
            Will be there in spirit
          </span>
        </button>

        {/* Maybe */}
        <button
          type="button"
          onClick={() => handleSelection(RsvpStatus.MAYBE)}
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            "hover:shadow-lg hover:scale-105 active:scale-95",
            "flex flex-col items-center gap-3 min-h-[160px]",
            rsvp_status === RsvpStatus.MAYBE
              ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 animate-bounceIn"
              : "border-border hover:border-amber-300 dark:hover:border-amber-700"
          )}
          aria-pressed={rsvp_status === RsvpStatus.MAYBE}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
              rsvp_status === RsvpStatus.MAYBE
                ? "bg-amber-500 text-white animate-scaleIn"
                : "bg-muted text-muted-foreground"
            )}
          >
            <HelpCircle className="w-8 h-8" />
          </div>
          <span className="text-lg font-semibold">Not sure yet</span>
          <span className="text-sm text-muted-foreground text-center">
            Need to check my schedule
          </span>
        </button>
      </div>

      {errors.rsvp_status && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center mt-4">
          {errors.rsvp_status.message}
        </p>
      )}
    </div>
  );
}

// ============================================================
// Step 2: Guest Details Confirmation
// ============================================================

export function GuestDetailsStep() {
  const { watch } = useFormContext<RSVPFormData>();

  const first_name = watch("first_name");
  const last_name = watch("last_name");
  const email = watch("email");

  return (
    <div className="space-y-6 animate-slideInRight">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Confirm Your Details</h2>
        <p className="text-muted-foreground">
          Please verify your information is correct
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="text-lg font-semibold">
              {first_name} {last_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Email Address</p>
            <p className="text-lg font-semibold break-all">{email}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        If this information is incorrect, please contact the event host
      </p>
    </div>
  );
}

// ============================================================
// Step 3: Meal Preferences & Dietary Restrictions
// ============================================================

export function MealPreferencesStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RSVPFormData>();

  const meal_preference = watch("meal_preference");
  const dietary_restrictions = watch("dietary_restrictions");

  return (
    <div className="space-y-6 animate-slideInRight">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Meal Preferences</h2>
        <p className="text-muted-foreground">
          Help us accommodate your dietary needs
        </p>
      </div>

      <div className="space-y-5">
        {/* Meal Preference */}
        <div>
          <label
            htmlFor="meal_preference"
            className="flex items-center gap-2 text-sm font-medium mb-2"
          >
            <Utensils className="w-4 h-4" />
            Meal Choice (Optional)
          </label>
          <Input
            id="meal_preference"
            {...register("meal_preference")}
            placeholder="e.g., Chicken, Vegetarian, Fish"
            maxLength={100}
            aria-invalid={!!errors.meal_preference}
            aria-describedby={
              errors.meal_preference ? "meal_preference-error" : undefined
            }
          />
          <div className="flex justify-between items-center mt-1">
            {errors.meal_preference && (
              <p
                id="meal_preference-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {errors.meal_preference.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {meal_preference?.length || 0}/100
            </p>
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label
            htmlFor="dietary_restrictions"
            className="flex items-center gap-2 text-sm font-medium mb-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Dietary Restrictions (Optional)
          </label>
          <textarea
            id="dietary_restrictions"
            {...register("dietary_restrictions")}
            placeholder="e.g., Vegetarian, Vegan, Gluten-free, Nut allergy, Kosher, Halal"
            maxLength={500}
            rows={4}
            className={cn(
              "w-full px-3 py-2 rounded-md border border-input",
              "bg-background text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-none",
              errors.dietary_restrictions && "border-red-500"
            )}
            aria-invalid={!!errors.dietary_restrictions}
            aria-describedby={
              errors.dietary_restrictions
                ? "dietary_restrictions-error"
                : undefined
            }
          />
          <div className="flex justify-between items-center mt-1">
            {errors.dietary_restrictions && (
              <p
                id="dietary_restrictions-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {errors.dietary_restrictions.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {dietary_restrictions?.length || 0}/500
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p className="font-medium mb-1">Please note:</p>
        <p>
          Let us know about any allergies, dietary restrictions, or preferences
          so we can accommodate you properly.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Step 4: Plus-One Information
// ============================================================

export function PlusOneStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RSVPFormData>();

  const plus_one_name = watch("plus_one_name");

  return (
    <div className="space-y-6 animate-slideInRight">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Your Plus-One</h2>
        <p className="text-muted-foreground">
          You&apos;re invited to bring a guest!
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="plus_one_name"
            className="flex items-center gap-2 text-sm font-medium mb-2"
          >
            <User className="w-4 h-4" />
            Guest Name
          </label>
          <Input
            id="plus_one_name"
            {...register("plus_one_name")}
            placeholder="Enter your guest's full name"
            maxLength={200}
            aria-invalid={!!errors.plus_one_name}
            aria-describedby={
              errors.plus_one_name ? "plus_one_name-error" : undefined
            }
          />
          <div className="flex justify-between items-center mt-1">
            {errors.plus_one_name && (
              <p
                id="plus_one_name-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {errors.plus_one_name.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {plus_one_name?.length || 0}/200
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium mb-1">Optional:</p>
          <p>
            You can leave this blank if you&apos;re not bringing a guest. You
            can always update this later.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Step 5: Additional Notes & Song Requests
// ============================================================

export function NotesStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RSVPFormData>();

  const notes = watch("notes");

  return (
    <div className="space-y-6 animate-slideInRight">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Additional Information</h2>
        <p className="text-muted-foreground">
          Any special requests or song suggestions?
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="notes"
            className="flex items-center gap-2 text-sm font-medium mb-2"
          >
            <Music className="w-4 h-4" />
            Notes & Song Requests (Optional)
          </label>
          <textarea
            id="notes"
            {...register("notes")}
            placeholder="Any special requests, accessibility needs, or song suggestions for the event?"
            maxLength={1000}
            rows={6}
            className={cn(
              "w-full px-3 py-2 rounded-md border border-input",
              "bg-background text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-none",
              errors.notes && "border-red-500"
            )}
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? "notes-error" : undefined}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.notes && (
              <p
                id="notes-error"
                className="text-sm text-red-600 dark:text-red-400"
              >
                {errors.notes.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {notes?.length || 0}/1000
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">Suggestions:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Special accessibility requirements</li>
            <li>Song requests for the DJ/playlist</li>
            <li>Seating preferences</li>
            <li>Messages for the host</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
