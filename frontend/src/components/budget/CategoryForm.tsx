/**
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 * Modal form for creating/editing budget categories
 */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2 } from "lucide-react";
import {
  budgetCategorySchema,
  BudgetCategoryFormValues,
  CATEGORY_COLORS,
  parseAmount,
} from "@/lib/validations/budget";
import { cn } from "@/lib/utils";
import type { BudgetCategory } from "@/types";

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetCategoryFormValues) => void;
  category?: BudgetCategory | null;
  isSubmitting?: boolean;
}

export function CategoryForm({
  open,
  onClose,
  onSubmit,
  category,
  isSubmitting = false,
}: CategoryFormProps) {
  const isEditing = !!category;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BudgetCategoryFormValues>({
    resolver: zodResolver(budgetCategorySchema),
    defaultValues: {
      name: "",
      allocated_amount: 0,
      color: CATEGORY_COLORS[0].value,
    },
  });

  const selectedColor = watch("color");

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name,
          allocated_amount: category.allocated_amount,
          color: category.color || CATEGORY_COLORS[0].value,
        });
      } else {
        reset({
          name: "",
          allocated_amount: 0,
          color: CATEGORY_COLORS[0].value,
        });
      }
    }
  }, [open, category, reset]);

  const handleFormSubmit = (data: BudgetCategoryFormValues) => {
    // Clean up empty color string
    const cleanedData = {
      ...data,
      color: data.color || undefined,
    };
    onSubmit(cleanedData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Category" : "Add Category"}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Category"
            ) : (
              "Create Category"
            )}
          </Button>
        </div>
      }
    >
      <form
        id="category-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        {/* Category Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Venue, Catering, Photography"
            {...register("name")}
            error={errors.name?.message}
          />
        </div>

        {/* Allocated Amount */}
        <div className="space-y-2">
          <Label htmlFor="allocated_amount">Budget Allocation *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="allocated_amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="pl-7"
              {...register("allocated_amount", {
                setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
              })}
              error={errors.allocated_amount?.message}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            The maximum amount budgeted for this category
          </p>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <Label>Category Color</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setValue("color", color.value)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  selectedColor === color.value
                    ? "border-foreground scale-110 ring-2 ring-offset-2 ring-offset-background ring-primary"
                    : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
          {errors.color && (
            <p className="text-sm text-destructive">{errors.color.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
