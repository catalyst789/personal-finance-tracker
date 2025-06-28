import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  Space,
  Transaction,
  Budget,
  CreateSpaceResponse,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
  PaginatedResponse,
  CreateBudgetRequest,
  ApiResponse,
  RecurringTransaction,
  CreateRecurringTransactionRequest,
  UpdateRecurringTransactionRequest
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add any auth tokens here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Handle unauthorized
        } else if (error.response?.status === 404) {
          // Handle not found
        } else if (error.response?.status >= 500) {
          // Handle server errors
        }
        return Promise.reject(error);
      }
    );
  }

  // Spaces API
  async createSpace(): Promise<CreateSpaceResponse> {
    const response = await this.api.post<ApiResponse<CreateSpaceResponse>>('/spaces');
    return response.data.data!;
  }

  async getSpace(spaceId: string): Promise<Space> {
    const response = await this.api.get<ApiResponse<Space>>(`/spaces/${spaceId}`);
    return response.data.data!;
  }

  // Transactions API
  async getTransactions(
    spaceId: string,
    filters: TransactionFilters = {}
  ): Promise<PaginatedResponse<Transaction> & { stats: import('../types').TransactionStats, categoryStats: any, monthlyStats: any }> {
    const response = await this.api.get<{
      success: boolean;
      data: Transaction[];
      pagination: PaginatedResponse<Transaction>['pagination'];
      stats: import('../types').TransactionStats;
      categoryStats: any;
      monthlyStats: any;
    }>(
      `/spaces/${spaceId}/transactions`,
      { params: filters }
    );
    // The backend returns { success: true, data: [...], pagination: {...}, stats: {...}, categoryStats: [...], monthlyStats: [...] }
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      stats: response.data.stats,
      categoryStats: response.data.categoryStats,
      monthlyStats: response.data.monthlyStats
    };
  }

  async createTransaction(
    spaceId: string,
    transaction: CreateTransactionRequest
  ): Promise<Transaction> {
    const response = await this.api.post<ApiResponse<Transaction>>(
      `/spaces/${spaceId}/transactions`,
      transaction
    );
    return response.data.data!;
  }

  async updateTransaction(
    spaceId: string,
    transactionId: string,
    transaction: UpdateTransactionRequest
  ): Promise<Transaction> {
    const response = await this.api.put<ApiResponse<Transaction>>(
      `/spaces/${spaceId}/transactions/${transactionId}`,
      transaction
    );
    return response.data.data!;
  }

  async deleteTransaction(spaceId: string, transactionId: string): Promise<void> {
    await this.api.delete(`/spaces/${spaceId}/transactions/${transactionId}`);
  }

  // Budgets API
  async getBudget(spaceId: string): Promise<Budget | null> {
    try {
      console.log('[ApiService] getBudget called for spaceId:', spaceId);
      const response = await this.api.get<ApiResponse<Budget>>(`/spaces/${spaceId}/budget`);
      console.log('[ApiService] getBudget response:', response.data);
      console.log('[ApiService] getBudget returning:', response.data.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('[ApiService] getBudget error:', error);
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async setBudget(spaceId: string, budget: CreateBudgetRequest): Promise<Budget> {
    const response = await this.api.post<ApiResponse<Budget>>(
      `/spaces/${spaceId}/budget`,
      budget
    );
    return response.data.data!;
  }

  async updateBudget(spaceId: string, budget: CreateBudgetRequest): Promise<Budget> {
    console.log('[ApiService] updateBudget called with:', { spaceId, budget });
    const response = await this.api.put<ApiResponse<Budget>>(
      `/spaces/${spaceId}/budget`,
      budget
    );
    console.log('[ApiService] updateBudget response:', response.data);
    return response.data.data!;
  }

  async deleteBudget(spaceId: string): Promise<void> {
    await this.api.delete(`/spaces/${spaceId}/budget`);
  }

  // Recurring Transactions API
  async getRecurringTransactions(spaceId: string): Promise<RecurringTransaction[]> {
    console.log('[ApiService] getRecurringTransactions called for spaceId:', spaceId);
    const response = await this.api.get<ApiResponse<RecurringTransaction[]>>(`/spaces/${spaceId}/recurring-transactions`);
    console.log('[ApiService] getRecurringTransactions response:', response.data);
    return response.data.data!;
  }

  async createRecurringTransaction(
    spaceId: string,
    transaction: CreateRecurringTransactionRequest
  ): Promise<RecurringTransaction> {
    console.log('[ApiService] createRecurringTransaction called with:', { spaceId, transaction });
    const response = await this.api.post<ApiResponse<RecurringTransaction>>(
      `/spaces/${spaceId}/recurring-transactions`,
      transaction
    );
    console.log('[ApiService] createRecurringTransaction response:', response.data);
    return response.data.data!;
  }

  async updateRecurringTransaction(
    spaceId: string,
    transactionId: string,
    transaction: UpdateRecurringTransactionRequest
  ): Promise<RecurringTransaction> {
    console.log('[ApiService] updateRecurringTransaction called with:', { spaceId, transactionId, transaction });
    const response = await this.api.put<ApiResponse<RecurringTransaction>>(
      `/spaces/${spaceId}/recurring-transactions/${transactionId}`,
      transaction
    );
    console.log('[ApiService] updateRecurringTransaction response:', response.data);
    return response.data.data!;
  }

  async deleteRecurringTransaction(spaceId: string, transactionId: string): Promise<void> {
    console.log('[ApiService] deleteRecurringTransaction called with:', { spaceId, transactionId });
    await this.api.delete(`/spaces/${spaceId}/recurring-transactions/${transactionId}`);
  }

  async processRecurringTransactions(spaceId: string): Promise<{ processed: number; transactions: any[] }> {
    console.log('[ApiService] processRecurringTransactions called for spaceId:', spaceId);
    const response = await this.api.post<ApiResponse<{ processed: number; transactions: any[] }>>(
      `/spaces/${spaceId}/recurring-transactions/process`
    );
    console.log('[ApiService] processRecurringTransactions response:', response.data);
    return response.data.data!;
  }
}

export const apiService = new ApiService();
export default apiService; 