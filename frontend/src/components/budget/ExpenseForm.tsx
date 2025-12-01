/**
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 * Modal form for creating/editing expenses
 */
"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { Loader2 } from "lucide-react";
import { expenseSchema, ExpenseFormValues } from "@/lib/validations/budget";
import type { Expense, BudgetCategory, ExpenseCreate } from "@/types";

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseCreate) => void;
  expense?: Expense | null;
  categories: BudgetCategory[];
  isSubmitting?: boolean;
}

export function ExpenseForm({
  open,
  onClose,
  onSubmit,
  expense,
  categories,
  isSubmitting = false,
}: ExpenseFormProps) {
  const isEditing = !!expense;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      expense_date: new Date().toISOString().split("T")[0],
      vendor_name: "",
      is_paid: false,
      category_id: "",
    },
  });

  // Reset form when modal opens/closes or expense changes
  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          name: expense.name,
          description: expense.description || "",
          amount: expense.amount,
          expense_date: expense.expense_date.split("T")[0],
          vendor_name: expense.vendor_name || "",
          is_paid: expense.is_paid,
          category_id: expense.category_id || "",
        });
      } else {
        reset({
          name: "",
          description: "",
          amount: 0,
          expense_date: new Date().toISOString().split("T")[0],
          vendor_name: "",
          is_paid: false,
          category_id: "",
        });
      }
    }
  }, [open, expense, reset]);

  const handleFormSubmit = (data: ExpenseFormValues) => {
    // Clean up empty strings and convert to ExpenseCreate
    const cleanedData: ExpenseCreate = {
      name: data.name,
      amount: data.amount,
      expense_date: data.expense_date,
      is_paid: data.is_paid,
      description: data.description || undefined,
      vendor_name: data.vendor_name || undefined,
      category_id: data.category_id || undefined,
    };
    onSubmit(cleanedData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Category options for select
  const categoryOptions = [
    { value: "", label: "No category" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Expense" : "Add Expense"}
      size="md"
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
          <Button type="submit" form="expense-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Adding..."}
              </>
            ) : isEditing ? (
              "Update Expense"
            ) : (
              "Add Expense"
            )}
          </Button>
        </div>
      }
    >
      <form
        id="expense-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-4"
      >
        {/* Expense Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Expense Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Venue deposit, Catering service"
            {...register("name")}
            error={errors.name?.message}
          />
        </div>

        {/* Amount and Date in row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...register("amount", {
                  setValueAs: (v) => (v === "" ? 0 : parseFloat(v)),
                })}
                error={errors.amount?.message}
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="expense_date">Date *</Label>
            <Input
              id="expense_date"
              type="date"
              {...register("expense_date")}
              error={errors.expense_date?.message}
            />
          </div>
        </div>

        {/* Category and Vendor in row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Controller
              name="category_id"
              control={control}
              render={({ field }) => (
                <Select
                  options={categoryOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  error={errors.category_id?.message}
                />
              )}
            />
          </div>

          {/* Vendor */}
          <div className="space-y-2">
            <Label htmlFor="vendor_name">Vendor</Label>
            <Input
              id="vendor_name"
              placeholder="Vendor/merchant name"
              {...register("vendor_name")}
              error={errors.vendor_name?.message}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Add any notes or details about this expense..."
            rows={3}
            {...register("description")}
            error={errors.description?.message}
          />
        </div>

        {/* Is Paid Checkbox */}
        <div className="flex items-center gap-3 pt-2">
          <Controller
            name="is_paid"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="is_paid"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="is_paid" className="cursor-pointer font-normal">
            Mark as paid
          </Label>
        </div>
      </form>
    </Modal>
  );
}
