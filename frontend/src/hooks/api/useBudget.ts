/**
 * React Query hooks for budget API
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query'
import { 
  BudgetCategory, 
  BudgetCategoryCreate, 
  BudgetCategoryUpdate,
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  EventType,
  PaginatedResponse
} from '@/types'
import { budgetService } from '@/lib/api/services'
import { ApiResponse } from '@/types/common.types'
import { ApiException } from '@/lib/api-client'

// Temporary types for missing interfaces
type CategorySearchParams = Record<string, unknown>
type ExpenseSearchParams = Record<string, unknown>
type BudgetAnalytics = Record<string, unknown>
type BudgetCategoryListResponse = BudgetCategory[]
type ExpenseListResponse = Expense[]

// Query keys
export const budgetKeys = {
  all: ['budget'] as const,
  categories: () => [...budgetKeys.all, 'categories'] as const,
  categoriesList: (eventId: string, params?: CategorySearchParams) => [...budgetKeys.categories(), eventId, params] as const,
  categoryDetail: (id: string) => [...budgetKeys.categories(), id] as const,
  expenses: () => [...budgetKeys.all, 'expenses'] as const,
  expensesList: (eventId: string, params?: ExpenseSearchParams) => [...budgetKeys.expenses(), eventId, params] as const,
  expenseDetail: (id: string) => [...budgetKeys.expenses(), id] as const,
  analytics: () => [...budgetKeys.all, 'analytics'] as const,
  eventAnalytics: (eventId: string) => [...budgetKeys.analytics(), eventId] as const,
}

// Category Query hooks
export function useBudgetCategories(
  eventId: string,
  _params?: CategorySearchParams,
  options?: UseQueryOptions<any, any>
) {
  return useQuery({
    queryKey: budgetKeys.categoriesList(eventId, _params),
    queryFn: () => budgetService.getBudgetCategories(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useBudgetCategory(
  eventId: string,
  categoryId: string,
  options?: UseQueryOptions<any, any>
) {
  return useQuery({
    queryKey: budgetKeys.categoryDetail(categoryId),
    queryFn: () => budgetService.getBudgetCategory(eventId, categoryId),
    enabled: !!(eventId && categoryId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// Expense Query hooks
export function useExpenses(
  eventId: string,
  params?: ExpenseSearchParams,
  options?: UseQueryOptions<any, any>
) {
  return useQuery({
    queryKey: budgetKeys.expensesList(eventId, params),
    queryFn: () => budgetService.getExpenses(eventId, params),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

export function useExpense(
  eventId: string,
  expenseId: string,
  options?: UseQueryOptions<any, any>
) {
  return useQuery({
    queryKey: budgetKeys.expenseDetail(expenseId),
    queryFn: () => budgetService.getExpense(eventId, expenseId),
    enabled: !!(eventId && expenseId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useBudgetAnalytics(
  eventId: string,
  options?: UseQueryOptions<any, any>
) {
  return useQuery({
    queryKey: budgetKeys.eventAnalytics(eventId),
    queryFn: () => budgetService.getBudgetAnalytics(eventId),
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  })
}

// Category Mutation hooks
export function useCreateBudgetCategory(
  options?: UseMutationOptions<any, any, { eventId: string; data: BudgetCategoryCreate }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }) => budgetService.createBudgetCategory(eventId, data),
    onSuccess: (data, variables) => {
      // Add the new category to the cache
      queryClient.setQueryData(
        budgetKeys.categoryDetail(data.id),
        data
      )

      // Invalidate categories list for this event
      queryClient.invalidateQueries({ 
        queryKey: budgetKeys.categoriesList(variables.eventId) 
      })

      // Invalidate analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.eventAnalytics(variables.eventId)
      })
    },
    ...options,
  })
}

export function useUpdateBudgetCategory(
  options?: UseMutationOptions<any, any, { eventId: string; categoryId: string; data: BudgetCategoryUpdate }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, categoryId, data }) => budgetService.updateBudgetCategory(eventId, categoryId, data),
    onSuccess: (data, variables) => {
      // Update the specific category cache
      queryClient.setQueryData(
        budgetKeys.categoryDetail(variables.categoryId),
        data
      )

      // Invalidate categories list to reflect changes
      queryClient.invalidateQueries({ 
        queryKey: budgetKeys.categoriesList(variables.eventId) 
      })

      // Invalidate analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.eventAnalytics(variables.eventId)
      })
    },
    ...options,
  })
}

export function useDeleteBudgetCategory(
  options?: UseMutationOptions<any, any, { eventId: string; categoryId: string }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, categoryId }) => budgetService.deleteBudgetCategory(eventId, categoryId),
    onSuccess: (_, categoryId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: budgetKeys.categoryDetail(categoryId) })
      
      // Invalidate all category lists
      queryClient.invalidateQueries({ queryKey: budgetKeys.categories() })
      
      // Invalidate all analytics
      queryClient.invalidateQueries({ queryKey: budgetKeys.analytics() })
    },
    ...options,
  })
}

// Expense Mutation hooks
export function useCreateExpense(
  options?: UseMutationOptions<any, any,ApiResponse<Expense>, ApiException, { eventId: string; data: ExpenseCreate }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }) => budgetService.createExpense(eventId, data),
    onSuccess: (data, variables) => {
      // Add the new expense to the cache
      queryClient.setQueryData(
        budgetKeys.expenseDetail(data.data.id),
        data
      )

      // Invalidate expenses list for this event
      queryClient.invalidateQueries({ 
        queryKey: budgetKeys.expensesList(variables.eventId) 
      })

      // Invalidate categories list (spent amounts changed)
      queryClient.invalidateQueries({ 
        queryKey: budgetKeys.categoriesList(variables.eventId) 
      })

      // Invalidate analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.eventAnalytics(variables.eventId)
      })

      // If the expense has a category, invalidate that category's cache
      if (data.data.category_id) {
        queryClient.invalidateQueries({
          queryKey: budgetKeys.categoryDetail(data.data.category_id)
        })
      }
    },
    ...options,
  })
}

export function useUpdateExpense(
  options?: UseMutationOptions<any, any,ApiResponse<Expense>, ApiException, { id: string; data: ExpenseUpdate }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, expenseId, data }) => budgetService.updateExpense(eventId, expenseId, data),
    onSuccess: (data, variables) => {
      // Update the specific expense cache
      queryClient.setQueryData(
        budgetKeys.expenseDetail(variables.expenseId),
        data
      )

      // Invalidate expenses list to reflect changes
      queryClient.invalidateQueries({ 
        queryKey: budgetKeys.expensesList(variables.eventId) 
      })

      // Invalidate categories list (spent amounts may have changed)
      queryClient.invalidateQueries({ 
        queryKey: budgetKeys.categoriesList(variables.eventId) 
      })

      // Invalidate analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.eventAnalytics(variables.eventId)
      })

      // If the expense has a category, invalidate that category's cache
      if (data.data.category_id) {
        queryClient.invalidateQueries({
          queryKey: budgetKeys.categoryDetail(data.data.category_id)
        })
      }
    },
    ...options,
  })
}

export function useDeleteExpense(
  options?: UseMutationOptions<any, any,void, ApiException, string>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: budgetService.deleteExpense,
    onSuccess: (_, expenseId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: budgetKeys.expenseDetail(expenseId) })
      
      // Invalidate all expense lists
      queryClient.invalidateQueries({ queryKey: budgetKeys.expenses() })
      
      // Invalidate all category lists (spent amounts changed)
      queryClient.invalidateQueries({ queryKey: budgetKeys.categories() })
      
      // Invalidate all analytics
      queryClient.invalidateQueries({ queryKey: budgetKeys.analytics() })
    },
    ...options,
  })
}

export function useCreateDefaultCategories(
  options?: UseMutationOptions<any, any,ApiResponse<BudgetCategory[]>, ApiException, { eventId: string; eventType: EventType }>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, eventType }) => budgetService.createDefaultCategories(eventId, eventType),
    onSuccess: (data, variables) => {
      // Add each new category to the cache
      data.data.forEach(category => {
        queryClient.setQueryData(
          budgetKeys.categoryDetail(category.id),
          { data: category }
        )
      })

      // Invalidate categories list for this event
      queryClient.invalidateQueries({ 
        queryKey: budgetKeys.categoriesList(variables.eventId) 
      })

      // Invalidate analytics
      queryClient.invalidateQueries({
        queryKey: budgetKeys.eventAnalytics(variables.eventId)
      })
    },
    ...options,
  })
}

// Composite hooks
export function useBudgetManagement(eventId: string) {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useBudgetCategories(eventId)
  const { data: expenses, isLoading: expensesLoading } = useExpenses(eventId)
  const { data: analytics, isLoading: analyticsLoading } = useBudgetAnalytics(eventId)
  
  const createCategoryMutation = useCreateBudgetCategory({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to create category:', error)
    }
  })

  const createExpenseMutation = useCreateExpense({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to create expense:', error)
    }
  })

  const createDefaultCategoriesMutation = useCreateDefaultCategories({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to create default categories:', error)
    }
  })

  // Helper functions
  const getTotalBudget = () => {
    return categories?.data.categories.reduce((total, category) => total + category.allocated_amount, 0) || 0
  }

  const getTotalSpent = () => {
    return categories?.data.categories.reduce((total, category) => total + category.spent_amount, 0) || 0
  }

  const getRemainingBudget = () => {
    return getTotalBudget() - getTotalSpent()
  }

  const getBudgetUtilization = () => {
    const total = getTotalBudget()
    const spent = getTotalSpent()
    return total > 0 ? Math.round((spent / total) * 100) : 0
  }

  const getCategoriesOverBudget = () => {
    return categories?.data.categories.filter(category => category.spent_amount > category.allocated_amount) || []
  }

  const getExpensesByCategory = (categoryId: string) => {
    return expenses?.data.expenses.filter(expense => expense.category_id === categoryId) || []
  }

  const getUnpaidExpenses = () => {
    return expenses?.data.expenses.filter(expense => !expense.is_paid) || []
  }

  const getPaidExpenses = () => {
    return expenses?.data.expenses.filter(expense => expense.is_paid) || []
  }

  return {
    categories: categories?.data.categories || [],
    expenses: expenses?.data.expenses || [],
    analytics: analytics?.data,
    categoriesPagination: categories?.data.pagination,
    expensesPagination: expenses?.data.pagination,
    isLoading: categoriesLoading || expensesLoading || analyticsLoading,
    error: categoriesError,
    createCategory: createCategoryMutation.mutate,
    createExpense: createExpenseMutation.mutate,
    createDefaultCategories: createDefaultCategoriesMutation.mutate,
    isCreatingCategory: createCategoryMutation.isPending,
    isCreatingExpense: createExpenseMutation.isPending,
    isCreatingDefaults: createDefaultCategoriesMutation.isPending,
    // Helper methods
    getTotalBudget,
    getTotalSpent,
    getRemainingBudget,
    getBudgetUtilization,
    getCategoriesOverBudget,
    getExpensesByCategory,
    getUnpaidExpenses,
    getPaidExpenses,
  }
}

export function useCategoryManagement(categoryId: string) {
  const { data: category, isLoading, error } = useBudgetCategory(categoryId)
  
  const updateMutation = useUpdateBudgetCategory({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to update category:', error)
    }
  })

  const deleteMutation = useDeleteBudgetCategory({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to delete category:', error)
    }
  })

  return {
    category: category?.data,
    isLoading,
    error,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export function useExpenseManagement(expenseId: string) {
  const { data: expense, isLoading, error } = useExpense(expenseId)
  
  const updateMutation = useUpdateExpense({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to update expense:', error)
    }
  })

  const deleteMutation = useDeleteExpense({
    onSuccess: () => {
      // Optional: Show success toast
    },
    onError: (error) => {
      console.error('Failed to delete expense:', error)
    }
  })

  return {
    expense: expense?.data,
    isLoading,
    error,
    updateExpense: updateMutation.mutate,
    deleteExpense: deleteMutation.mutate,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

// Form helpers
export function useBudgetCategoryForm(eventId: string, categoryId?: string) {
  const { data: category } = useBudgetCategory(categoryId || '', { enabled: !!categoryId })
  
  const createMutation = useCreateBudgetCategory()
  const updateMutation = useUpdateBudgetCategory()

  const submitCategory = (data: BudgetCategoryCreate | BudgetCategoryUpdate) => {
    if (categoryId) {
      updateMutation.mutate({ id: categoryId, data: data as BudgetCategoryUpdate })
    } else {
      createMutation.mutate({ eventId, data: data as BudgetCategoryCreate })
    }
  }

  return {
    category: category?.data,
    submitCategory,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
  }
}

export function useExpenseForm(eventId: string, expenseId?: string) {
  const { data: expense } = useExpense(expenseId || '', { enabled: !!expenseId })
  
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()

  const submitExpense = (data: ExpenseCreate | ExpenseUpdate) => {
    if (expenseId) {
      updateMutation.mutate({ id: expenseId, data: data as ExpenseUpdate })
    } else {
      createMutation.mutate({ eventId, data: data as ExpenseCreate })
    }
  }

  return {
    expense: expense?.data,
    submitExpense,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    error: createMutation.error || updateMutation.error,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
  }
}