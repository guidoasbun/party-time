/**
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 * Tab content for budget management within event details
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { BudgetOverview } from "./BudgetOverview";
import { CategoryList } from "./CategoryList";
import { ExpenseList } from "./ExpenseList";
import { useBudgetManagement } from "@/hooks/api/useBudget";
import { useToast } from "@/hooks/useToast";
import {
  LayoutDashboard,
  FolderOpen,
  Receipt,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type {
  ExpenseCreate,
  ExpenseUpdate,
  BudgetCategoryCreate,
} from "@/types";

interface BudgetTabProps {
  eventId: string;
  eventBudgetTotal?: number;
  className?: string;
}

type TabValue = "overview" | "categories" | "expenses";

export function BudgetTab({ eventId, eventBudgetTotal, className }: BudgetTabProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  // Fetch all budget data
  const {
    categories,
    expenses,
    summary,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    createExpense,
    updateExpense,
    deleteExpense,
    isCreatingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    isCreatingExpense,
    isUpdatingExpense,
    isDeletingExpense,
  } = useBudgetManagement(eventId);

  // Handle category creation
  const handleCreateCategory = async (
    data: Omit<BudgetCategoryCreate, "event_id">
  ) => {
    try {
      await createCategory(data);
    } catch (error) {
      throw error;
    }
  };

  // Handle category update
  const handleUpdateCategory = async (
    categoryId: string,
    data: Partial<BudgetCategoryCreate>
  ) => {
    try {
      await updateCategory(categoryId, data);
    } catch (error) {
      throw error;
    }
  };

  // Handle category delete
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
    } catch (error) {
      throw error;
    }
  };

  // Handle expense creation
  const handleCreateExpense = async (data: ExpenseCreate) => {
    try {
      await createExpense(data);
    } catch (error) {
      throw error;
    }
  };

  // Handle expense update
  const handleUpdateExpense = async (
    expenseId: string,
    data: ExpenseUpdate
  ) => {
    try {
      await updateExpense(expenseId, data);
    } catch (error) {
      throw error;
    }
  };

  // Handle expense delete
  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
    } catch (error) {
      throw error;
    }
  };

  // Handle viewing category from overview
  const handleViewCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setActiveTab("expenses");
  };

  // Handle viewing expense from overview
  const handleViewExpense = (expenseId: string) => {
    setActiveTab("expenses");
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">
          Loading budget data...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="mt-2 text-sm text-destructive">
          Failed to load budget data
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Expenses</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <BudgetOverview
            eventBudgetTotal={eventBudgetTotal}
            summary={summary ?? null}
            categories={categories}
            expenses={expenses}
            onViewCategory={handleViewCategory}
            onViewExpense={handleViewExpense}
          />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="mt-6">
          <CategoryList
            categories={categories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onViewExpenses={handleViewCategory}
            isCreating={isCreatingCategory}
            isUpdating={isUpdatingCategory}
            isDeleting={isDeletingCategory}
          />
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="mt-6">
          <ExpenseList
            expenses={expenses}
            categories={categories}
            onCreateExpense={handleCreateExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            isCreating={isCreatingExpense}
            isUpdating={isUpdatingExpense}
            isDeleting={isDeletingExpense}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
