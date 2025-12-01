/**
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 * Dashboard view with stats, progress, recent expenses, and alerts
 */
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
} from "lucide-react";
import {
  formatCurrency,
  formatCompactCurrency,
} from "@/lib/validations/budget";
import type { BudgetCategory, Expense, BudgetSummary } from "@/types";

interface BudgetOverviewProps {
  eventBudgetTotal?: number;
  summary: BudgetSummary | null;
  categories: BudgetCategory[];
  expenses: Expense[];
  isLoading?: boolean;
  onViewCategory?: (categoryId: string) => void;
  onViewExpense?: (expenseId: string) => void;
  className?: string;
}

export function BudgetOverview({
  eventBudgetTotal,
  summary,
  categories,
  expenses,
  isLoading = false,
  onViewCategory,
  onViewExpense,
  className,
}: BudgetOverviewProps) {
  // Calculate derived values
  const totalBudget = summary?.total_budget ?? 0; // Sum of category allocations
  const totalSpent = summary?.total_spent ?? 0;

  // Use event budget target for remaining/utilization, fall back to allocated if not set
  const budgetForCalculations = eventBudgetTotal ?? totalBudget;
  const remaining = budgetForCalculations - totalSpent;
  const utilization = budgetForCalculations > 0 ? (totalSpent / budgetForCalculations) * 100 : 0;

  // Get recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  // Get categories with budget alerts (over or near limit)
  const alertCategories = categories.filter((cat) => {
    const percentUsed =
      cat.allocated_amount > 0
        ? (cat.spent_amount / cat.allocated_amount) * 100
        : 0;
    return percentUsed >= 80;
  });

  // Get category by ID
  const getCategoryById = (categoryId?: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-8 w-32 mt-2" />
                <Skeleton className="h-3 w-20 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Progress Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!summary && categories.length === 0 && expenses.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={PieChart}
          title="No budget data yet"
          description="Start by creating budget categories and adding expenses to track your event spending."
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Target */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Budget Target
              </span>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(eventBudgetTotal ?? 0)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Allocated: {formatCurrency(totalBudget)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Total Spent
              </span>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(totalSpent)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Remaining */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Remaining
              </span>
              <div
                className={cn(
                  "p-2 rounded-full",
                  remaining >= 0
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                )}
              >
                {remaining >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <div className="mt-2">
              <span
                className={cn(
                  "text-2xl font-bold",
                  remaining >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatCurrency(Math.abs(remaining))}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {remaining >= 0 ? "under budget" : "over budget"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Utilization */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Utilization
              </span>
              <div
                className={cn(
                  "p-2 rounded-full",
                  utilization <= 50
                    ? "bg-green-100 dark:bg-green-900/30"
                    : utilization <= 80
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : "bg-red-100 dark:bg-red-900/30"
                )}
              >
                <PieChart
                  className={cn(
                    "w-4 h-4",
                    utilization <= 50
                      ? "text-green-600 dark:text-green-400"
                      : utilization <= 80
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-foreground">
                {utilization.toFixed(1)}%
              </span>
              <Progress
                value={Math.min(utilization, 100)}
                className="mt-2 h-1.5"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Progress and Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Budget by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No categories created yet
              </p>
            ) : (
              <div className="space-y-4">
                {categories.map((category) => {
                  const percentUsed =
                    category.allocated_amount > 0
                      ? (category.spent_amount / category.allocated_amount) *
                        100
                      : 0;
                  const isOverBudget = percentUsed > 100;

                  return (
                    <button
                      key={category.id}
                      onClick={() => onViewCategory?.(category.id)}
                      className="w-full text-left space-y-2 hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-foreground">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatCompactCurrency(category.spent_amount)} /{" "}
                          {formatCompactCurrency(category.allocated_amount)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentUsed, 100)}
                        className={cn(
                          "h-2",
                          isOverBudget && "[&>div]:bg-red-500"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertCategories.length === 0 ? (
              <div className="flex flex-col items-center py-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-sm font-medium text-foreground">
                  All categories within budget
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You&apos;re doing great!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertCategories.map((category) => {
                  const percentUsed =
                    category.allocated_amount > 0
                      ? (category.spent_amount / category.allocated_amount) *
                        100
                      : 0;
                  const isOverBudget = percentUsed > 100;

                  return (
                    <button
                      key={category.id}
                      onClick={() => onViewCategory?.(category.id)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={cn(
                          "p-2 rounded-full flex-shrink-0",
                          isOverBudget
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-yellow-100 dark:bg-yellow-900/30"
                        )}
                      >
                        <AlertTriangle
                          className={cn(
                            "w-4 h-4",
                            isOverBudget
                              ? "text-red-600 dark:text-red-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          )}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {category.name}
                          </span>
                          <Badge
                            variant={isOverBudget ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {percentUsed.toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isOverBudget
                            ? `Over budget by ${formatCurrency(
                                category.spent_amount -
                                  category.allocated_amount
                              )}`
                            : `${formatCurrency(
                                category.allocated_amount -
                                  category.spent_amount
                              )} remaining`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No expenses recorded yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense) => {
                const category = getCategoryById(expense.category_id);
                const formattedDate = new Date(
                  expense.expense_date
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <button
                    key={expense.id}
                    onClick={() => onViewExpense?.(expense.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
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
                        {category && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                            }}
                          >
                            {category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formattedDate}</span>
                        {expense.vendor_name && (
                          <>
                            <span>&bull;</span>
                            <span>{expense.vendor_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={cn(
                          "font-medium",
                          expense.is_paid
                            ? "text-muted-foreground"
                            : "text-foreground"
                        )}
                      >
                        {formatCurrency(expense.amount)}
                      </span>
                      <Badge
                        variant={expense.is_paid ? "default" : "secondary"}
                        className={cn(
                          "text-xs ml-2",
                          expense.is_paid
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        )}
                      >
                        {expense.is_paid ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
