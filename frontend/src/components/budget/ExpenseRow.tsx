/**
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 * Table row for displaying an expense with actions
 */
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { formatCurrency } from "@/lib/validations/budget";
import type { Expense, BudgetCategory } from "@/types";

interface ExpenseRowProps {
  expense: Expense;
  category?: BudgetCategory;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
  onTogglePaid: (expenseId: string, isPaid: boolean) => void;
  isDeleting?: boolean;
  isUpdating?: boolean;
  className?: string;
}

export function ExpenseRow({
  expense,
  category,
  onEdit,
  onDelete,
  onTogglePaid,
  isDeleting = false,
  isUpdating = false,
  className,
}: ExpenseRowProps) {
  const formattedDate = new Date(expense.expense_date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <tr
      className={cn(
        "border-b border-border hover:bg-muted/50 transition-colors",
        className
      )}
    >
      {/* Paid Status Checkbox */}
      <td className="px-4 py-3">
        <Checkbox
          checked={expense.is_paid}
          onCheckedChange={(checked) =>
            onTogglePaid(expense.id, checked as boolean)
          }
          disabled={isUpdating}
          aria-label={expense.is_paid ? "Mark as unpaid" : "Mark as paid"}
        />
      </td>

      {/* Expense Name */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span
            className={cn(
              "font-medium",
              expense.is_paid
                ? "text-muted-foreground line-through"
                : "text-foreground"
            )}
          >
            {expense.name}
          </span>
          {expense.description && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {expense.description}
            </span>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        {category ? (
          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
              borderColor: category.color,
            }}
          >
            {category.name}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Uncategorized</span>
        )}
      </td>

      {/* Amount */}
      <td className="px-4 py-3">
        <span
          className={cn(
            "font-medium",
            expense.is_paid ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {formatCurrency(expense.amount)}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formattedDate}
      </td>

      {/* Vendor */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {expense.vendor_name || "-"}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <Badge
          variant={expense.is_paid ? "default" : "secondary"}
          className={cn(
            "text-xs",
            expense.is_paid
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          )}
        >
          {expense.is_paid ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Paid
            </>
          ) : (
            <>
              <X className="w-3 h-3 mr-1" />
              Unpaid
            </>
          )}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(expense)}
            className="h-8 w-8 p-0"
            title="Edit expense"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(expense.id)}
            disabled={isDeleting}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
            title="Delete expense"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Compact version for mobile/overview
export function ExpenseRowCompact({
  expense,
  category,
  onEdit,
  onDelete,
  onTogglePaid,
  isUpdating = false,
}: ExpenseRowProps) {
  const formattedDate = new Date(expense.expense_date).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className="flex items-center gap-3 p-3 border-b border-border hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={expense.is_paid}
        onCheckedChange={(checked) =>
          onTogglePaid(expense.id, checked as boolean)
        }
        disabled={isUpdating}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium truncate",
              expense.is_paid && "line-through text-muted-foreground"
            )}
          >
            {expense.name}
          </span>
          {category && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formattedDate}</span>
          {expense.vendor_name && (
            <>
              <span>&bull;</span>
              <span className="truncate">{expense.vendor_name}</span>
            </>
          )}
        </div>
      </div>

      <div className="text-right">
        <span
          className={cn(
            "font-medium",
            expense.is_paid && "text-muted-foreground"
          )}
        >
          {formatCurrency(expense.amount)}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(expense)}
          className="h-8 w-8 p-0"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(expense.id)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
