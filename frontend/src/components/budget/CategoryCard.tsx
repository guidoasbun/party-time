/**
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 * Displays a budget category with progress bar and actions
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Pencil, Trash2, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/validations/budget";
import type { BudgetCategory } from "@/types";

interface CategoryCardProps {
  category: BudgetCategory;
  onEdit: (category: BudgetCategory) => void;
  onDelete: (categoryId: string) => void;
  onViewExpenses?: (categoryId: string) => void;
  isDeleting?: boolean;
  className?: string;
}

export function CategoryCard({
  category,
  onEdit,
  onDelete,
  onViewExpenses,
  isDeleting = false,
  className,
}: CategoryCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate utilization percentage
  const utilization =
    category.allocated_amount > 0
      ? Math.round((category.spent_amount / category.allocated_amount) * 100)
      : 0;

  // Determine status based on utilization
  const getStatus = () => {
    if (utilization >= 100) return "critical";
    if (utilization >= 90) return "warning";
    if (utilization >= 75) return "caution";
    return "good";
  };

  const status = getStatus();

  // Get progress bar color based on status
  const getProgressColor = () => {
    switch (status) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-amber-500";
      case "caution":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  // Get status badge variant
  const getStatusBadge = () => {
    if (status === "critical") {
      return (
        <Badge variant="destructive" className="text-xs">
          Over Budget
        </Badge>
      );
    }
    if (status === "warning") {
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        >
          Near Limit
        </Badge>
      );
    }
    return null;
  };

  const handleDelete = () => {
    onDelete(category.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          {/* Header: Name + Color indicator + Status badge */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* Color indicator */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color || "#6B7280" }}
              />
              <h3 className="font-semibold text-foreground truncate">
                {category.name}
              </h3>
            </div>
            {getStatusBadge()}
          </div>

          {/* Amounts */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Allocated</span>
              <span className="font-medium text-foreground">
                {formatCurrency(category.allocated_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spent</span>
              <span
                className={cn(
                  "font-medium",
                  status === "critical"
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
                )}
              >
                {formatCurrency(category.spent_amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span
                className={cn(
                  "font-medium",
                  category.remaining_amount < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                )}
              >
                {formatCurrency(category.remaining_amount)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{utilization}% used</span>
              <span>
                {category.expense_count} expense
                {category.expense_count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  getProgressColor()
                )}
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            {onViewExpenses && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewExpenses(category.id)}
                className="flex-1 text-xs"
              >
                <Receipt className="w-3.5 h-3.5 mr-1" />
                Expenses
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              className="text-xs"
            >
              <Pencil className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${category.name}"? This will remove the category but keep all expenses (they will become uncategorized).`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}
