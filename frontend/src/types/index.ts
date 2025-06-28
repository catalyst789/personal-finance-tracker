// API Types (matching backend)
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

// API Request/Response Types
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

// Redux State Types
export interface AppState {
  spaces: SpaceState;
  transactions: TransactionState;
  budgets: BudgetState;
  ui: UIState;
}

export interface SpaceState {
  currentSpaceId: string | null;
  loading: boolean;
  error: string | null;
}

export interface TransactionState {
  transactions: Transaction[];
  pagination: PaginatedResponse<Transaction>['pagination'] | null;
  filters: TransactionFilters;
  loading: boolean;
  error: string | null;
  selectedTransaction: Transaction | null;
}

export interface BudgetState {
  budget: Budget | null;
  loading: boolean;
  error: string | null;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Form Types
export interface TransactionFormData {
  type: 'income' | 'expense';
  amount: string;
  category: string;
  subcategory: string;
  description: string;
  date: string;
  is_recurring: boolean;
  recurrence_frequency: 'weekly' | 'monthly' | 'yearly' | '';
}

export interface BudgetFormData {
  monthly_budget: string;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface SpendingByCategory {
  category: string;
  total: number;
  count: number;
}

export interface TransactionStats {
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transaction_count: number;
}

// Route Types
export interface RouteParams {
  spaceId?: string;
}

// Component Props Types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  pagination: PaginatedResponse<Transaction>['pagination'] | null;
  onPageChange: (page: number) => void;
}

export interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: CreateTransactionRequest) => void;
  onCancel: () => void;
  loading: boolean;
}

export interface ChartProps {
  data: ChartData[];
  title: string;
  type: 'pie' | 'bar' | 'line' | 'area';
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