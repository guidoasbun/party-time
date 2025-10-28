// FR-6: The system shall display an RSVP submission page.
// 5.1.4: RSVP Customization

"use client";

import * as React from "react";
import { X, Plus, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MealOptionsBuilderProps {
  value: string[];
  onChange: (options: string[]) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const COMMON_MEAL_OPTIONS = [
  "Chicken",
  "Beef",
  "Fish",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Halal",
  "Kosher",
];

export function MealOptionsBuilder({
  value = [],
  onChange,
  error,
  disabled = false,
  className,
}: MealOptionsBuilderProps) {
  const [newOption, setNewOption] = React.useState("");
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleAddOption = () => {
    const trimmedOption = newOption.trim();
    if (!trimmedOption) return;

    if (value.includes(trimmedOption)) {
      return; // Duplicate
    }

    if (value.length >= 10) {
      return; // Max limit reached
    }

    onChange([...value, trimmedOption]);
    setNewOption("");
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = value.filter((_, i) => i !== index);
    onChange(newOptions);
  };

  const handleAddCommonOption = (option: string) => {
    if (value.includes(option)) return;
    if (value.length >= 10) return;
    onChange([...value, option]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOptions = [...value];
    const draggedOption = newOptions[draggedIndex];
    newOptions.splice(draggedIndex, 1);
    newOptions.splice(index, 0, draggedOption);

    onChange(newOptions);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const availableCommonOptions = COMMON_MEAL_OPTIONS.filter(
    (opt) => !value.includes(opt)
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Meal Options {value.length > 0 && `(${value.length}/10)`}
        </label>

        {/* Current Options */}
        {value.length > 0 && (
          <Card className="p-3 mb-3">
            <div className="space-y-2">
              {value.map((option, index) => (
                <div
                  key={index}
                  draggable={!disabled}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md border border-border bg-background",
                    !disabled && "cursor-move hover:bg-accent",
                    draggedIndex === index && "opacity-50"
                  )}
                >
                  {!disabled && (
                    <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="flex-1 text-sm">{option}</span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                      aria-label={`Remove ${option}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Add New Option */}
        {!disabled && value.length < 10 && (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter meal option..."
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              maxLength={100}
              error={error}
            />
            <Button
              type="button"
              onClick={handleAddOption}
              disabled={disabled || !newOption.trim()}
              variant="outline"
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        )}

        {value.length >= 10 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            Maximum of 10 meal options reached
          </p>
        )}
      </div>

      {/* Common Options */}
      {!disabled && availableCommonOptions.length > 0 && value.length < 10 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Common meal options:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableCommonOptions.slice(0, 6).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleAddCommonOption(option)}
                className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent hover:border-primary transition-colors"
              >
                + {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && value.length === 0 && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Drag to reorder. Maximum 10 options. Guests will select from these meal
        preferences when they RSVP.
      </p>
    </div>
  );
}
