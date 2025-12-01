/**
 * Zod validation schemas for budget management
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 */

import { z } from "zod";

// ============ Budget Category Schemas ============

export const budgetCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name must be 100 characters or less"),
  allocated_amount: z
    .number({ message: "Amount must be a number" })
    .min(0, "Amount cannot be negative"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color (e.g., #3B82F6)")
    .optional()
    .or(z.literal("")),
});

export type BudgetCategoryFormValues = z.infer<typeof budgetCategorySchema>;

export const budgetCategoryUpdateSchema = budgetCategorySchema.partial();

export type BudgetCategoryUpdateFormValues = z.infer<
  typeof budgetCategoryUpdateSchema
>;

// ============ Expense Schemas ============

export const expenseSchema = z.object({
  name: z
    .string()
    .min(1, "Expense name is required")
    .max(255, "Expense name must be 255 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
  amount: z
    .number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
  expense_date: z.string().min(1, "Expense date is required"),
  vendor_name: z
    .string()
    .max(255, "Vendor name must be 255 characters or less")
    .optional()
    .or(z.literal("")),
  is_paid: z.boolean(),
  category_id: z.string().uuid("Invalid category").optional().or(z.literal("")),
  receipt_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const expenseUpdateSchema = expenseSchema.partial();

export type ExpenseUpdateFormValues = z.infer<typeof expenseUpdateSchema>;

// ============ Helper Functions ============

/**
 * Parse form amount string to number
 */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number as currency string
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format number as compact currency (e.g., $10k, $1.2M)
 */
export function formatCompactCurrency(
  amount: number,
  currency = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

// ============ Color Presets for Categories ============

export const CATEGORY_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Red", value: "#EF4444" },
  { name: "Green", value: "#10B981" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Gray", value: "#6B7280" },
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number]["value"];
