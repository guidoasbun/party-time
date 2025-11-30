/**
 * AutoAssignDialog Component
 *
 * FR-21: The system shall provide an interactive seating chart interface.
 * Phase 6.3.8: Smart Seating & Auto-Assignment
 *
 * Modal dialog for auto-assigning guests to tables with strategy selection
 * and smart preferences configuration.
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Wand2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Users,
  Table2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { seatingService } from "@/lib/api/services/seating.service";
import type { Guest } from "@/types/guest.types";
import type {
  SmartAssignPreferences,
  SmartAssignResponse,
  SuggestionScore,
} from "@/types/seating.types";
import { cn } from "@/lib/utils";

// ============================================================================
// Type Definitions
// ============================================================================

type AssignStrategy = "fill_tables" | "distribute" | "smart";

interface AutoAssignDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  chartId: string;
  unseatedGuests: Guest[];
  totalCapacity: number;
  seatedCount: number;
  onAssignComplete: () => void;
}

// ============================================================================
// Helper Components
// ============================================================================

interface StrategyOptionProps {
  value: AssignStrategy;
  selected: boolean;
  onSelect: (value: AssignStrategy) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function StrategyOption({
  value,
  selected,
  onSelect,
  title,
  description,
  icon,
}: StrategyOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-accent/50"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5",
          selected ? "border-primary bg-primary" : "border-muted-foreground"
        )}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="font-medium text-foreground">{title}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </button>
  );
}

interface PreferenceToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  badge?: string;
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
  badge,
}: PreferenceToggleProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 py-2 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div
          className={cn(
            "w-9 h-5 rounded-full transition-colors",
            "peer-focus:ring-2 peer-focus:ring-primary/50",
            checked ? "bg-primary" : "bg-muted-foreground/30"
          )}
        />
        <div
          className={cn(
            "absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
            checked && "translate-x-4"
          )}
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

function WeightSlider({ label, value, onChange, disabled }: WeightSliderProps) {
  const percentage = Math.round(value * 100);

  return (
    <div className={cn("space-y-1", disabled && "opacity-50")}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">
          {percentage}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        disabled={disabled}
        className={cn(
          "w-full h-2 rounded-full appearance-none cursor-pointer",
          "bg-muted-foreground/20",
          "[&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
          "[&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
          "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary",
          "[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer",
          disabled && "cursor-not-allowed"
        )}
      />
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    low: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        styles[confidence]
      )}
    >
      {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
    </span>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AutoAssignDialog({
  open,
  onClose,
  eventId,
  chartId,
  unseatedGuests,
  totalCapacity,
  seatedCount,
  onAssignComplete,
}: AutoAssignDialogProps) {
  // State
  const [strategy, setStrategy] = useState<AssignStrategy>("smart");
  const [preferences, setPreferences] = useState<SmartAssignPreferences>(() =>
    seatingService.loadSmartPreferences(eventId)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SmartAssignResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Computed values
  const availableCapacity = totalCapacity - seatedCount;
  const guestCount = unseatedGuests.length;
  const hasCapacity = availableCapacity >= guestCount;

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setResult(null);
      setError(null);
      setPreferences(seatingService.loadSmartPreferences(eventId));
    }
  }, [open, eventId]);

  // Update preference
  const updatePreference = useCallback(
    <K extends keyof SmartAssignPreferences>(
      key: K,
      value: SmartAssignPreferences[K]
    ) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // Handle auto-assign
  const handleAssign = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Save preferences for future use
      if (strategy === "smart") {
        seatingService.saveSmartPreferences(preferences, eventId);
      }

      // Make API call - use smartAssignGuests for smart strategy, autoAssignGuests for others
      if (strategy === "smart") {
        const response = await seatingService.smartAssignGuests(eventId, chartId, {
          seating_chart_id: chartId,
          guest_ids: unseatedGuests.map((g) => g.id),
          strategy: "smart",
          preferences: preferences,
        });
        setResult(response);
      } else {
        // For fill_tables and distribute, use autoAssignGuests and construct a compatible result
        await seatingService.autoAssignGuests(eventId, chartId, {
          seating_chart_id: chartId,
          guest_ids: unseatedGuests.map((g) => g.id),
          strategy: strategy,
        });
        // Create a simplified result for non-smart strategies
        setResult({
          seating_chart_id: chartId,
          strategy: strategy,
          total_guests: guestCount,
          already_assigned: 0,
          newly_assigned: guestCount,
          total_capacity: totalCapacity,
          remaining_capacity: availableCapacity - guestCount,
          assignments: [],
          suggestions: [],
          statistics: {
            avg_confidence_score: 0,
            confidence_distribution: { high: 0, medium: 0, low: 0 },
            dietary_groups_formed: 0,
            families_seated_together: 0,
            plus_ones_paired: 0,
            organization_clusters: 0,
            total_suggestions: 0,
          },
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to auto-assign guests"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle close with result
  const handleDone = () => {
    onAssignComplete();
    onClose();
  };

  // Render results view
  if (result) {
    const { statistics, suggestions } = result;
    const avgConfidence = statistics?.avg_confidence_score
      ? Math.round(statistics.avg_confidence_score * 100)
      : 0;

    return (
      <Modal
        open={open}
        onClose={handleDone}
        title="Auto-Assign Results"
        size="lg"
        closeOnClickOutside={false}
        closeOnEscape={true}
        footer={
          <div className="flex justify-end">
            <Button variant="default" onClick={handleDone}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Done
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                  Successfully Assigned {result.newly_assigned} Guests
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {strategy === "smart"
                    ? `Smart algorithm achieved ${avgConfidence}% average confidence score.`
                    : `Guests have been assigned using the ${strategy.replace("_", " ")} strategy.`}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {result.newly_assigned}
                </div>
                <div className="text-xs text-muted-foreground">
                  Guests Assigned
                </div>
              </div>
              {strategy === "smart" && (
                <>
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {avgConfidence}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg Confidence
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {statistics.plus_ones_paired}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Plus-Ones Paired
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {statistics.families_seated_together}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Families Together
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Confidence Distribution */}
          {strategy === "smart" && statistics?.confidence_distribution && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Confidence Distribution
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ConfidenceBadge confidence="high" />
                  <span className="text-sm text-muted-foreground">
                    {statistics.confidence_distribution.high}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ConfidenceBadge confidence="medium" />
                  <span className="text-sm text-muted-foreground">
                    {statistics.confidence_distribution.medium}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ConfidenceBadge confidence="low" />
                  <span className="text-sm text-muted-foreground">
                    {statistics.confidence_distribution.low}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Stats */}
          {strategy === "smart" && statistics && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">
                  Dietary Groups Formed
                </span>
                <span className="font-medium text-foreground">
                  {statistics.dietary_groups_formed}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">
                  Organization Clusters
                </span>
                <span className="font-medium text-foreground">
                  {statistics.organization_clusters}
                </span>
              </div>
            </div>
          )}

          {/* Assignment List */}
          {suggestions && suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Assignments ({suggestions.length})
              </h4>
              <div className="border border-border rounded-lg max-h-[200px] overflow-y-auto">
                <div className="divide-y divide-border">
                  {suggestions.map((suggestion: SuggestionScore) => (
                    <div
                      key={suggestion.guest_id}
                      className="p-3 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">
                            {suggestion.guest_name}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {suggestion.table_number} (Seat{" "}
                            {suggestion.seat_number})
                          </span>
                        </div>
                        {strategy === "smart" && (
                          <ConfidenceBadge confidence={suggestion.confidence} />
                        )}
                      </div>
                      {strategy === "smart" &&
                        suggestion.reasoning &&
                        suggestion.reasoning.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {suggestion.reasoning.join(", ")}
                          </p>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  // Render configuration view
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Auto-Assign Guests"
      size="lg"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      footer={
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {guestCount} guest{guestCount !== 1 ? "s" : ""} to assign
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleAssign}
              disabled={isLoading || guestCount === 0 || !hasCapacity}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Auto-Assign {guestCount} Guest{guestCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-900 dark:text-red-100">
                  Assignment Failed
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Strategy Selection */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
            Assignment Strategy
          </h4>
          <div className="space-y-2">
            <StrategyOption
              value="fill_tables"
              selected={strategy === "fill_tables"}
              onSelect={setStrategy}
              title="Fill Tables"
              description="Fill each table to capacity before moving to the next"
              icon={<Table2 className="h-4 w-4" />}
            />
            <StrategyOption
              value="distribute"
              selected={strategy === "distribute"}
              onSelect={setStrategy}
              title="Distribute Evenly"
              description="Spread guests evenly across all tables"
              icon={<Users className="h-4 w-4" />}
            />
            <StrategyOption
              value="smart"
              selected={strategy === "smart"}
              onSelect={setStrategy}
              title="Smart Assignment"
              description="Use intelligent matching based on dietary needs, families, and organizations"
              icon={<Sparkles className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Smart Preferences */}
        {strategy === "smart" && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-foreground mb-4">
              Smart Preferences
            </h4>

            <div className="space-y-1">
              <PreferenceToggle
                label="Keep plus-ones together"
                description="Always seat guests with their plus-ones at the same table"
                checked={preferences.keep_plus_ones_together}
                onChange={(v) => updatePreference("keep_plus_ones_together", v)}
                badge="Recommended"
              />

              <PreferenceToggle
                label="Group families"
                description="Seat guests with the same last name together"
                checked={preferences.group_families}
                onChange={(v) => updatePreference("group_families", v)}
              />

              <PreferenceToggle
                label="Group by organization"
                description="Cluster guests from the same company (by email domain)"
                checked={preferences.group_by_organization}
                onChange={(v) => updatePreference("group_by_organization", v)}
              />

              <PreferenceToggle
                label="Prioritize dietary restrictions"
                description="Group guests with similar dietary needs"
                checked={preferences.prioritize_dietary}
                onChange={(v) => updatePreference("prioritize_dietary", v)}
              />

              <PreferenceToggle
                label="Cluster meal preferences"
                description="Seat guests with the same meal choice together"
                checked={preferences.cluster_meal_preferences}
                onChange={(v) => updatePreference("cluster_meal_preferences", v)}
              />

              <PreferenceToggle
                label="Balance tables evenly"
                description="Try to fill all tables to similar levels"
                checked={preferences.balance_tables}
                onChange={(v) => updatePreference("balance_tables", v)}
              />
            </div>

            {/* Advanced Weights */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-primary mt-4 hover:underline"
            >
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {showAdvanced ? "Hide" : "Show"} weight adjustments
            </button>

            {showAdvanced && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <WeightSlider
                  label="Dietary weight"
                  value={preferences.weight_dietary}
                  onChange={(v) => updatePreference("weight_dietary", v)}
                  disabled={!preferences.prioritize_dietary}
                />
                <WeightSlider
                  label="Organization weight"
                  value={preferences.weight_organization}
                  onChange={(v) => updatePreference("weight_organization", v)}
                  disabled={!preferences.group_by_organization}
                />
                <WeightSlider
                  label="Family weight"
                  value={preferences.weight_family}
                  onChange={(v) => updatePreference("weight_family", v)}
                  disabled={!preferences.group_families}
                />
                <WeightSlider
                  label="Meal preference weight"
                  value={preferences.weight_meal}
                  onChange={(v) => updatePreference("weight_meal", v)}
                  disabled={!preferences.cluster_meal_preferences}
                />
              </div>
            )}
          </div>
        )}

        {/* Capacity Summary */}
        <div
          className={cn(
            "rounded-lg p-4 border",
            hasCapacity
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          )}
        >
          <div className="flex items-start gap-3">
            {hasCapacity ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-sm font-medium",
                    hasCapacity
                      ? "text-green-900 dark:text-green-100"
                      : "text-red-900 dark:text-red-100"
                  )}
                >
                  {hasCapacity
                    ? "Sufficient capacity"
                    : "Insufficient capacity"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div
                  className={cn(
                    hasCapacity
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  )}
                >
                  <span className="font-medium">{guestCount}</span> unseated
                  guest{guestCount !== 1 ? "s" : ""}
                </div>
                <div
                  className={cn(
                    hasCapacity
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  )}
                >
                  <span className="font-medium">{availableCapacity}</span>{" "}
                  available seat{availableCapacity !== 1 ? "s" : ""}
                </div>
              </div>
              {!hasCapacity && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  Add more tables or increase table capacity to seat all guests.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
