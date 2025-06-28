export interface Space {
  id: string;
  space_id: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  space_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  date: string;
  is_recurring: boolean;
  recurrence_frequency?: 'weekly' | 'monthly' | 'yearly';
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  space_id: string;
  monthly_budget: number;
  created_at: string;
  updated_at: string;
}

export interface RecurringTransaction {
  id: string;
  space_id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  next_due_date: string;
  is_active: boolean;
  last_processed?: string;
  created_at: string;
  updated_at: string;
  source?: 'dedicated' | 'regular_transaction';
}

export interface CreateSpaceRequest {
  // No body required for space creation
}

export interface CreateSpaceResponse {
  space_id: string;
  message: string;
}

export interface CreateTransactionRequest {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  date: string;
  is_recurring?: boolean;
  recurrence_frequency?: 'weekly' | 'monthly' | 'yearly';
}

export interface UpdateTransactionRequest {
  type?: 'income' | 'expense';
  amount?: number;
  category?: string;
  subcategory?: string;
  description?: string;
  date?: string;
  is_recurring?: boolean;
  recurrence_frequency?: 'weekly' | 'monthly' | 'yearly';
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense';
  category?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface CreateBudgetRequest {
  monthly_budget: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface CreateRecurringTransactionRequest {
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
}

export interface UpdateRecurringTransactionRequest {
  name?: string;
  type?: 'income' | 'expense';
  amount?: number;
  category?: string;
  subcategory?: string;
  description?: string;
  frequency?: 'weekly' | 'monthly' | 'yearly';
  start_date?: string;
  next_due_date?: string;
  is_active?: boolean;
  last_processed?: string;
} 