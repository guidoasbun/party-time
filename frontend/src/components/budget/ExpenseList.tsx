/**
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 * Displays table/list of expenses with filtering and CRUD
 */
"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ExpenseRow, ExpenseRowCompact } from "./ExpenseRow";
import { ExpenseForm } from "./ExpenseForm";
import { Plus, Search, Receipt, Filter, ArrowUpDown } from "lucide-react";
import { formatCurrency } from "@/lib/validations/budget";
import { useToast } from "@/hooks/useToast";
import type {
  Expense,
  BudgetCategory,
  ExpenseCreate,
  ExpenseUpdate,
} from "@/types";

type SortField = "expense_date" | "amount" | "name";
type SortOrder = "asc" | "desc";
type PaidFilter = "all" | "paid" | "unpaid";

interface ExpenseListProps {
  expenses: Expense[];
  categories: BudgetCategory[];
  isLoading?: boolean;
  onCreateExpense: (data: ExpenseCreate) => Promise<void>;
  onUpdateExpense: (expenseId: string, data: ExpenseUpdate) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  className?: string;
}

export function ExpenseList({
  expenses,
  categories,
  isLoading = false,
  onCreateExpense,
  onUpdateExpense,
  onDeleteExpense,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
  className,
}: ExpenseListProps) {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [paidFilter, setPaidFilter] = useState<PaidFilter>("all");
  const [sortField, setSortField] = useState<SortField>("expense_date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.vendor_name?.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      if (categoryFilter === "uncategorized") {
        result = result.filter((e) => !e.category_id);
      } else {
        result = result.filter((e) => e.category_id === categoryFilter);
      }
    }

    // Paid filter
    if (paidFilter === "paid") {
      result = result.filter((e) => e.is_paid);
    } else if (paidFilter === "unpaid") {
      result = result.filter((e) => !e.is_paid);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "expense_date":
          comparison =
            new Date(a.expense_date).getTime() -
            new Date(b.expense_date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [expenses, searchQuery, categoryFilter, paidFilter, sortField, sortOrder]);

  // Calculate totals for filtered expenses
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const paidTotal = filteredExpenses
    .filter((e) => e.is_paid)
    .reduce((sum, e) => sum + e.amount, 0);
  const unpaidTotal = filteredExpenses
    .filter((e) => !e.is_paid)
    .reduce((sum, e) => sum + e.amount, 0);

  // Get category by ID
  const getCategoryById = (categoryId?: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  // Category filter options
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "uncategorized", label: "Uncategorized" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  // Paid filter options
  const paidOptions = [
    { value: "all", label: "All Status" },
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
  ];

  // Handlers
  const handleOpenCreate = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (data: ExpenseCreate) => {
    try {
      if (editingExpense) {
        await onUpdateExpense(editingExpense.id, data);
        toast({
          title: "Expense updated",
          description: `"${data.name}" has been updated successfully.`,
        });
      } else {
        await onCreateExpense(data);
        toast({
          title: "Expense added",
          description: `"${data.name}" has been added to your budget.`,
        });
      }
      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: editingExpense
          ? "Failed to update expense. Please try again."
          : "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (expenseId: string) => {
    setDeletingExpenseId(expenseId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingExpenseId) return;
    try {
      await onDeleteExpense(deletingExpenseId);
      toast({
        title: "Expense deleted",
        description: "The expense has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setDeletingExpenseId(null);
    }
  };

  const handleTogglePaid = async (expenseId: string, isPaid: boolean) => {
    try {
      await onUpdateExpense(expenseId, { is_paid: isPaid });
      toast({
        title: isPaid ? "Marked as paid" : "Marked as unpaid",
        description: `Expense has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update expense status.",
        variant: "destructive",
      });
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-b border-border"
              >
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state (no expenses at all)
  if (expenses.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description="Start tracking your event spending by adding your first expense."
          primaryAction={{
            label: "Add Expense",
            onClick: handleOpenCreate,
            icon: Plus,
          }}
        />

        <ExpenseForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          expense={editingExpense}
          categories={categories}
          isSubmitting={isCreating || isUpdating}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Expenses</h3>
          <p className="text-sm text-muted-foreground">
            {filteredExpenses.length} expense
            {filteredExpenses.length !== 1 ? "s" : ""} &bull;{" "}
            <span className="font-medium">{formatCurrency(filteredTotal)}</span>{" "}
            total
            {unpaidTotal > 0 && (
              <>
                {" "}
                &bull;{" "}
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {formatCurrency(unpaidTotal)} unpaid
                </span>
              </>
            )}
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          options={categoryOptions}
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as string)}
          className="w-full sm:w-48"
        />
        <Select
          options={paidOptions}
          value={paidFilter}
          onValueChange={(v) => setPaidFilter(v as PaidFilter)}
          className="w-full sm:w-36"
        />
      </div>

      {/* Empty filtered state */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <EmptyState
              icon={Filter}
              title="No matching expenses"
              description="Try adjusting your search or filters to find what you're looking for."
              primaryAction={{
                label: "Clear Filters",
                onClick: () => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                  setPaidFilter("all");
                },
              }}
            />
          </CardContent>
        </Card>
      ) : (
        /* Expense table */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">
                    Paid
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("name")}
                  >
                    <span className="flex items-center gap-1">
                      Name
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("amount")}
                  >
                    <span className="flex items-center gap-1">
                      Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort("expense_date")}
                  >
                    <span className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    category={getCategoryById(expense.category_id)}
                    onEdit={handleOpenEdit}
                    onDelete={handleDeleteClick}
                    onTogglePaid={handleTogglePaid}
                    isDeleting={deletingExpenseId === expense.id && isDeleting}
                    isUpdating={isUpdating}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Expense form modal */}
      <ExpenseForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        expense={editingExpense}
        categories={categories}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
