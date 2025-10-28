// FR-6: The system shall display an RSVP submission page.
// 5.1.4: RSVP Customization

"use client";

import * as React from "react";
import {
  Calendar,
  Users,
  Settings as SettingsIcon,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { RSVPSettings as RSVPSettingsType } from "@/types/event.types";
import { MealOptionsBuilder } from "./MealOptionsBuilder";
import { CustomQuestions } from "./CustomQuestions";

interface RSVPSettingsProps {
  value: RSVPSettingsType;
  onChange: (settings: RSVPSettingsType) => void;
  eventStartDate?: string; // For deadline validation
  disabled?: boolean;
  className?: string;
  errors?: {
    rsvp_deadline?: string;
    meal_options?: string;
    custom_questions?: string;
  };
}

// Simple Switch component
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  icon,
  disabled,
}: SwitchProps) {
  const id = React.useId();

  return (
    <div className="flex items-start space-x-3">
      {icon && (
        <div className="flex-shrink-0 mt-1 text-muted-foreground">{icon}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <label
              htmlFor={id}
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              {label}
            </label>
            {description && (
              <div className="text-sm text-muted-foreground mt-1">
                {description}
              </div>
            )}
          </div>
          <button
            type="button"
            role="switch"
            id={id}
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
              "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              checked ? "bg-primary" : "bg-input"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out",
                checked ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export function RSVPSettingsComponent({
  value,
  onChange,
  eventStartDate,
  disabled = false,
  className,
  errors,
}: RSVPSettingsProps) {
  const handleFieldChange = <K extends keyof RSVPSettingsType>(
    field: K,
    fieldValue: RSVPSettingsType[K]
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  // Calculate max deadline date (event start date)
  const maxDeadlineDate = eventStartDate
    ? new Date(eventStartDate).toISOString().split("T")[0]
    : undefined;

  return (
    <div className={cn("space-y-6", className)}>
      {/* RSVP Requirements */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">RSVP Requirements</h3>
          </div>

          <Switch
            checked={value.require_rsvp}
            onCheckedChange={(checked) =>
              handleFieldChange("require_rsvp", checked)
            }
            label="Require RSVP"
            description={
              value.require_rsvp
                ? "Guests must RSVP to confirm attendance"
                : "RSVP is optional for guests"
            }
            disabled={disabled}
          />

          {value.require_rsvp && (
            <div className="pl-8 space-y-4">
              <div>
                <Input
                  type="date"
                  label="RSVP Deadline (optional)"
                  value={value.rsvp_deadline || ""}
                  onChange={(e) =>
                    handleFieldChange(
                      "rsvp_deadline",
                      e.target.value || undefined
                    )
                  }
                  disabled={disabled}
                  error={errors?.rsvp_deadline}
                  max={maxDeadlineDate}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Guests must RSVP before this date
                </p>
              </div>

              {value.rsvp_deadline && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Deadline:</strong>{" "}
                      {new Date(value.rsvp_deadline).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Guest Settings */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Guest Settings</h3>
          </div>

          <Switch
            checked={value.allow_plus_ones}
            onCheckedChange={(checked) =>
              handleFieldChange("allow_plus_ones", checked)
            }
            label="Allow Plus-Ones"
            description={
              value.allow_plus_ones
                ? "Guests can bring a plus-one"
                : "Guests cannot bring additional people"
            }
            disabled={disabled}
          />

          <Switch
            checked={value.dietary_restrictions_enabled}
            onCheckedChange={(checked) =>
              handleFieldChange("dietary_restrictions_enabled", checked)
            }
            label="Collect Dietary Restrictions"
            description={
              value.dietary_restrictions_enabled
                ? "Ask guests about dietary restrictions and allergies"
                : "Skip dietary restrictions question"
            }
            disabled={disabled}
          />
        </div>
      </Card>

      {/* Meal Options */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Meal Options</h3>
            <p className="text-sm text-muted-foreground">
              Let guests choose their preferred meal option
            </p>
          </div>

          <MealOptionsBuilder
            value={value.meal_options || []}
            onChange={(options) =>
              handleFieldChange(
                "meal_options",
                options.length > 0 ? options : undefined
              )
            }
            disabled={disabled}
            error={errors?.meal_options}
          />
        </div>
      </Card>

      {/* Custom Questions */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Custom Questions</h3>
            <p className="text-sm text-muted-foreground">
              Add custom questions for guests to answer when they RSVP
            </p>
          </div>

          <CustomQuestions
            value={value.custom_questions || []}
            onChange={(questions) =>
              handleFieldChange(
                "custom_questions",
                questions.length > 0 ? questions : undefined
              )
            }
            disabled={disabled}
            error={errors?.custom_questions}
          />
        </div>
      </Card>

      {/* Preview Info */}
      <Card className="p-6 bg-accent/50">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">RSVP Form Preview</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">RSVP Required:</span>
              <span className="font-medium">
                {value.require_rsvp ? "Yes" : "No"}
              </span>
            </div>

            {value.require_rsvp && value.rsvp_deadline && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deadline:</span>
                <span className="font-medium">
                  {new Date(value.rsvp_deadline).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plus-Ones:</span>
              <span className="font-medium">
                {value.allow_plus_ones ? "Allowed" : "Not Allowed"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Dietary Restrictions:
              </span>
              <span className="font-medium">
                {value.dietary_restrictions_enabled ? "Yes" : "No"}
              </span>
            </div>

            {value.meal_options && value.meal_options.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Meal Options:</span>
                <span className="font-medium">
                  {value.meal_options.length} options
                </span>
              </div>
            )}

            {value.custom_questions && value.custom_questions.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Custom Questions:</span>
                <span className="font-medium">
                  {value.custom_questions.length} questions
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export { RSVPSettingsComponent as RSVPSettings };
