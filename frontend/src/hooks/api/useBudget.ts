/**
 * React Query hooks for budget API
 * Phase 7.2.1: Basic Budget Management
 * FR-9: The system shall display a budget tracking interface.
 * Phase 7.2.1: Basic Budget Management
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  BudgetCategory,
  BudgetCategoryCreate,
  BudgetCategoryUpdate,
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  BudgetSummary,
  BudgetAnalytics,
  ExpenseSearchParams,
  PaginatedResponse,
} from "@/types";
import { budgetService } from "@/lib/api/services";
import { ApiException } from "@/lib/api-client";

// Query keys for cache management
export const budgetKeys = {
  all: ["budget"] as const,
  categories: () => [...budgetKeys.all, "categories"] as const,
  categoriesList: (eventId: string, params?: ExpenseSearchParams) =>
    [...budgetKeys.categories(), eventId, params] as const,
  categoryDetail: (eventId: string, categoryId: string) =>
    [...budgetKeys.categories(), eventId, categoryId] as const,
  expenses: () => [...budgetKeys.all, "expenses"] as const,
  expensesList: (eventId: string, params?: ExpenseSearchParams) =>
    [...budgetKeys.expenses(), eventId, params] as const,
  expenseDetail: (eventId: string, expenseId: string) =>
    [...budgetKeys.expenses(), eventId, expenseId] as const,
  summary: (eventId: string) =>
    [...budgetKeys.all, "summary", eventId] as const,
  analytics: (eventId: string) =>
    [...budgetKeys.all, "analytics", eventId] as const,
};

// ============ Category Query Hooks ============

export function useBudgetCategories(
  eventId: string,
  options?: Omit<
    UseQueryOptions<BudgetCategory[], ApiException>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<BudgetCategory[], ApiException>({
    queryKey: budgetKeys.categoriesList(eventId),
    queryFn: () => budgetService.getBudgetCategories(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useBudgetCategory(
  eventId: string,
  categoryId: string,
  options?: Omit<
    UseQueryOptions<BudgetCategory, ApiException>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<BudgetCategory, ApiException>({
    queryKey: budgetKeys.categoryDetail(eventId, categoryId),
    queryFn: () => budgetService.getBudgetCategory(eventId, categoryId),
    enabled: !!(eventId && categoryId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============ Expense Query Hooks ============

export function useExpenses(
  eventId: string,
  params?: ExpenseSearchParams,
  options?: Omit<
    UseQueryOptions<Expense[], ApiException>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<Expense[], ApiException>({
    queryKey: budgetKeys.expensesList(eventId, params),
    queryFn: () => budgetService.getExpensesArray(eventId, params),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

export function useExpense(
  eventId: string,
  expenseId: string,
  options?: Omit<UseQueryOptions<Expense, ApiException>, "queryKey" | "queryFn">
) {
  return useQuery<Expense, ApiException>({
    queryKey: budgetKeys.expenseDetail(eventId, expenseId),
    queryFn: () => budgetService.getExpense(eventId, expenseId),
    enabled: !!(eventId && expenseId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// ============ Summary & Analytics Hooks ============

export function useBudgetSummary(
  eventId: string,
  options?: Omit<
    UseQueryOptions<BudgetSummary, ApiException>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<BudgetSummary, ApiException>({
    queryKey: budgetKeys.summary(eventId),
    queryFn: () => budgetService.getBudgetSummary(eventId),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
}

export function useBudgetAnalytics(
  eventId: string,
  options?: Omit<
    UseQueryOptions<BudgetAnalytics, ApiException>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<BudgetAnalytics, ApiException>({
    queryKey: budgetKeys.analytics(eventId),
    queryFn: () => budgetService.getBudgetAnalytics(eventId),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

// ============ Category Mutation Hooks ============

interface CreateCategoryVariables {
  eventId: string;
  data: Omit<BudgetCategoryCreate, "event_id">;
}

export function useCreateBudgetCategory(
  options?: UseMutationOptions<
    BudgetCategory,
    ApiException,
    CreateCategoryVariables
  >
) {
  const queryClient = useQueryClient();

  return useMutation<BudgetCategory, ApiException, CreateCategoryVariables>({
    mutationFn: ({ eventId, data }) =>
      budgetService.createBudgetCategory(eventId, {
        ...data,
        event_id: eventId,
      }),
    onSuccess: (data, variables) => {
      // Add the new category to the cache
      queryClient.setQueryData(
        budgetKeys.categoryDetail(variables.eventId, data.id),
        data
      );
      // Invalidate categories list for this event
      queryClient.invalidateQueries({
        queryKey: budgetKeys.categoriesList(variables.eventId),
      });
      // Invalidate summary and analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.summary(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.analytics(variables.eventId),
      });
    },
    ...options,
  });
}

interface UpdateCategoryVariables {
  eventId: string;
  categoryId: string;
  data: BudgetCategoryUpdate;
}

export function useUpdateBudgetCategory(
  options?: UseMutationOptions<
    BudgetCategory,
    ApiException,
    UpdateCategoryVariables
  >
) {
  const queryClient = useQueryClient();

  return useMutation<BudgetCategory, ApiException, UpdateCategoryVariables>({
    mutationFn: ({ eventId, categoryId, data }) =>
      budgetService.updateBudgetCategory(eventId, categoryId, data),
    onSuccess: (data, variables) => {
      // Update the specific category cache
      queryClient.setQueryData(
        budgetKeys.categoryDetail(variables.eventId, variables.categoryId),
        data
      );
      // Invalidate categories list
      queryClient.invalidateQueries({
        queryKey: budgetKeys.categoriesList(variables.eventId),
      });
      // Invalidate summary and analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.summary(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.analytics(variables.eventId),
      });
    },
    ...options,
  });
}

interface DeleteCategoryVariables {
  eventId: string;
  categoryId: string;
}

export function useDeleteBudgetCategory(
  options?: UseMutationOptions<
    { message: string },
    ApiException,
    DeleteCategoryVariables
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    ApiException,
    DeleteCategoryVariables
  >({
    mutationFn: ({ eventId, categoryId }) =>
      budgetService.deleteBudgetCategory(eventId, categoryId),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: budgetKeys.categoryDetail(
          variables.eventId,
          variables.categoryId
        ),
      });
      // Invalidate all category lists
      queryClient.invalidateQueries({ queryKey: budgetKeys.categories() });
      // Invalidate summary and analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.summary(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.analytics(variables.eventId),
      });
    },
    ...options,
  });
}

// ============ Expense Mutation Hooks ============

interface CreateExpenseVariables {
  eventId: string;
  data: ExpenseCreate;
}

export function useCreateExpense(
  options?: UseMutationOptions<Expense, ApiException, CreateExpenseVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<Expense, ApiException, CreateExpenseVariables>({
    mutationFn: ({ eventId, data }) =>
      budgetService.createExpense(eventId, data),
    onSuccess: (data, variables) => {
      // Add the new expense to the cache
      queryClient.setQueryData(
        budgetKeys.expenseDetail(variables.eventId, data.id),
        data
      );
      // Invalidate expenses list for this event
      queryClient.invalidateQueries({
        queryKey: budgetKeys.expensesList(variables.eventId),
      });
      // Invalidate categories list (spent amounts changed)
      queryClient.invalidateQueries({
        queryKey: budgetKeys.categoriesList(variables.eventId),
      });
      // Invalidate summary and analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.summary(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.analytics(variables.eventId),
      });
    },
    ...options,
  });
}

interface UpdateExpenseVariables {
  eventId: string;
  expenseId: string;
  data: ExpenseUpdate;
}

export function useUpdateExpense(
  options?: UseMutationOptions<Expense, ApiException, UpdateExpenseVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<Expense, ApiException, UpdateExpenseVariables>({
    mutationFn: ({ eventId, expenseId, data }) =>
      budgetService.updateExpense(eventId, expenseId, data),
    onSuccess: (data, variables) => {
      // Update the specific expense cache
      queryClient.setQueryData(
        budgetKeys.expenseDetail(variables.eventId, variables.expenseId),
        data
      );
      // Invalidate expenses list
      queryClient.invalidateQueries({
        queryKey: budgetKeys.expensesList(variables.eventId),
      });
      // Invalidate categories list (spent amounts may have changed)
      queryClient.invalidateQueries({
        queryKey: budgetKeys.categoriesList(variables.eventId),
      });
      // Invalidate summary and analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.summary(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.analytics(variables.eventId),
      });
    },
    ...options,
  });
}

interface DeleteExpenseVariables {
  eventId: string;
  expenseId: string;
}

export function useDeleteExpense(
  options?: UseMutationOptions<
    { message: string },
    ApiException,
    DeleteExpenseVariables
  >
) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiException, DeleteExpenseVariables>(
    {
      mutationFn: ({ eventId, expenseId }) =>
        budgetService.deleteExpense(eventId, expenseId),
      onSuccess: (_, variables) => {
        // Remove from cache
        queryClient.removeQueries({
          queryKey: budgetKeys.expenseDetail(
            variables.eventId,
            variables.expenseId
          ),
        });
        // Invalidate all expense lists
        queryClient.invalidateQueries({ queryKey: budgetKeys.expenses() });
        // Invalidate all category lists (spent amounts changed)
        queryClient.invalidateQueries({ queryKey: budgetKeys.categories() });
        // Invalidate summary and analytics
        queryClient.invalidateQueries({
          queryKey: budgetKeys.summary(variables.eventId),
        });
        queryClient.invalidateQueries({
          queryKey: budgetKeys.analytics(variables.eventId),
        });
      },
      ...options,
    }
  );
}

// ============ Mark Expense as Paid Hook ============

interface MarkExpensePaidVariables {
  eventId: string;
  expenseId: string;
}

export function useMarkExpenseAsPaid(
  options?: UseMutationOptions<Expense, ApiException, MarkExpensePaidVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<Expense, ApiException, MarkExpensePaidVariables>({
    mutationFn: ({ eventId, expenseId }) =>
      budgetService.markExpenseAsPaid(eventId, expenseId),
    onSuccess: (data, variables) => {
      // Update the specific expense cache
      queryClient.setQueryData(
        budgetKeys.expenseDetail(variables.eventId, variables.expenseId),
        data
      );
      // Invalidate expenses list
      queryClient.invalidateQueries({
        queryKey: budgetKeys.expensesList(variables.eventId),
      });
    },
    ...options,
  });
}

// ============ Composite Hook for Budget Management ============

export function useBudgetManagement(eventId: string) {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useBudgetCategories(eventId);

  const { data: expenses = [], isLoading: expensesLoading } =
    useExpenses(eventId);

  const { data: summary, isLoading: summaryLoading } =
    useBudgetSummary(eventId);

  const createCategoryMutation = useCreateBudgetCategory();
  const updateCategoryMutation = useUpdateBudgetCategory();
  const deleteCategoryMutation = useDeleteBudgetCategory();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  // Calculate totals from categories
  const getTotalBudget = () => {
    return categories.reduce(
      (total, category) => total + category.allocated_amount,
      0
    );
  };

  const getTotalSpent = () => {
    return categories.reduce(
      (total, category) => total + category.spent_amount,
      0
    );
  };

  const getRemainingBudget = () => {
    return getTotalBudget() - getTotalSpent();
  };

  const getBudgetUtilization = () => {
    const total = getTotalBudget();
    const spent = getTotalSpent();
    return total > 0 ? Math.round((spent / total) * 100) : 0;
  };

  const getCategoriesOverBudget = () => {
    return categories.filter(
      (category) => category.spent_amount > category.allocated_amount
    );
  };

  const getExpensesByCategory = (categoryId: string) => {
    return expenses.filter((expense) => expense.category_id === categoryId);
  };

  const getUnpaidExpenses = () => {
    return expenses.filter((expense) => !expense.is_paid);
  };

  const getPaidExpenses = () => {
    return expenses.filter((expense) => expense.is_paid);
  };

  return {
    // Data
    categories,
    expenses,
    summary,

    // Loading states
    isLoading: categoriesLoading || expensesLoading || summaryLoading,
    categoriesLoading,
    expensesLoading,
    summaryLoading,

    // Errors
    error: categoriesError,

    // Category mutations
    createCategory: (data: Omit<BudgetCategoryCreate, "event_id">) =>
      createCategoryMutation.mutateAsync({ eventId, data }),
    updateCategory: (categoryId: string, data: BudgetCategoryUpdate) =>
      updateCategoryMutation.mutateAsync({ eventId, categoryId, data }),
    deleteCategory: (categoryId: string) =>
      deleteCategoryMutation.mutateAsync({ eventId, categoryId }),

    // Expense mutations
    createExpense: (data: ExpenseCreate) =>
      createExpenseMutation.mutateAsync({ eventId, data }),
    updateExpense: (expenseId: string, data: ExpenseUpdate) =>
      updateExpenseMutation.mutateAsync({ eventId, expenseId, data }),
    deleteExpense: (expenseId: string) =>
      deleteExpenseMutation.mutateAsync({ eventId, expenseId }),

    // Mutation loading states
    isCreatingCategory: createCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,
    isCreatingExpense: createExpenseMutation.isPending,
    isUpdatingExpense: updateExpenseMutation.isPending,
    isDeletingExpense: deleteExpenseMutation.isPending,

    // Helper methods
    getTotalBudget,
    getTotalSpent,
    getRemainingBudget,
    getBudgetUtilization,
    getCategoriesOverBudget,
    getExpensesByCategory,
    getUnpaidExpenses,
    getPaidExpenses,
  };
}
