/**
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 * Displays grid of budget categories with add/edit/delete functionality
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryCard } from "./CategoryCard";
import { CategoryForm } from "./CategoryForm";
import { Plus, FolderOpen } from "lucide-react";
import { formatCurrency } from "@/lib/validations/budget";
import { useToast } from "@/hooks/useToast";
import type { BudgetCategory, BudgetCategoryCreate } from "@/types";

interface CategoryListProps {
  categories: BudgetCategory[];
  isLoading?: boolean;
  onCreateCategory: (
    data: Omit<BudgetCategoryCreate, "event_id">
  ) => Promise<void>;
  onUpdateCategory: (
    categoryId: string,
    data: Partial<BudgetCategoryCreate>
  ) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onViewExpenses?: (categoryId: string) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  className?: string;
}

export function CategoryList({
  categories,
  isLoading = false,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onViewExpenses,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
  className,
}: CategoryListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(
    null
  );
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );
  const { toast } = useToast();

  // Calculate totals
  const totalAllocated = categories.reduce(
    (sum, cat) => sum + cat.allocated_amount,
    0
  );
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent_amount, 0);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: BudgetCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (data: Omit<BudgetCategoryCreate, "event_id">) => {
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, data);
        toast({
          title: "Category updated",
          description: `"${data.name}" has been updated successfully.`,
        });
      } else {
        await onCreateCategory(data);
        toast({
          title: "Category created",
          description: `"${data.name}" has been added to your budget.`,
        });
      }
      handleCloseForm();
    } catch (error) {
      toast({
        title: "Error",
        description: editingCategory
          ? "Failed to update category. Please try again."
          : "Failed to create category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (categoryId: string) => {
    setDeletingCategoryId(categoryId);
    try {
      await onDeleteCategory(categoryId);
      toast({
        title: "Category deleted",
        description: "The category has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingCategoryId(null);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-3" />
                <Skeleton className="h-2 w-full mb-3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={FolderOpen}
          title="No budget categories"
          description="Create categories to organize your event expenses and track spending."
          primaryAction={{
            label: "Add Category",
            onClick: handleOpenCreate,
            icon: Plus,
          }}
        />

        <CategoryForm
          open={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          category={editingCategory}
          isSubmitting={isCreating || isUpdating}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with totals and add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            Budget Categories
          </h3>
          <p className="text-sm text-muted-foreground">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}{" "}
            &bull;{" "}
            <span className="font-medium">
              {formatCurrency(totalAllocated)}
            </span>{" "}
            allocated &bull;{" "}
            <span className="font-medium">{formatCurrency(totalSpent)}</span>{" "}
            spent
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onViewExpenses={onViewExpenses}
            isDeleting={deletingCategoryId === category.id && isDeleting}
          />
        ))}
      </div>

      {/* Category form modal */}
      <CategoryForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        category={editingCategory}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
