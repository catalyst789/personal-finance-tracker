import { supabase } from './database';
import { 
  Transaction, 
  CreateTransactionRequest, 
  UpdateTransactionRequest, 
  TransactionFilters, 
  PaginatedResponse,
  PaginationParams 
} from '../types';

export class TransactionModel {
  /**
   * Create a new transaction
   */
  static async createTransaction(
    spaceId: string, 
    transactionData: CreateTransactionRequest
  ): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          space_id: spaceId,
          ...transactionData
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Transaction creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transactions with pagination and filters
   */
  static async getTransactions(
    spaceId: string, 
    filters: TransactionFilters = {}
  ): Promise<PaginatedResponse<Transaction> & { stats: any, categoryStats: any, monthlyStats: any }> {
    console.log(`[TransactionModel] Getting transactions for spaceId: ${spaceId} with filters:`, filters);
    try {
      const { page = 1, limit = 10, type, category, start_date, end_date, search } = filters;
      const offset = (page - 1) * limit;

      console.log(`[TransactionModel] Building query with pagination - page: ${page}, limit: ${limit}, offset: ${offset}`);

      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('space_id', spaceId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (type) {
        console.log(`[TransactionModel] Applying type filter: ${type}`);
        query = query.eq('type', type);
      }

      if (category) {
        console.log(`[TransactionModel] Applying category filter: ${category}`);
        query = query.eq('category', category);
      }

      if (start_date) {
        console.log(`[TransactionModel] Applying start_date filter: ${start_date}`);
        query = query.gte('date', start_date);
      }

      if (end_date) {
        console.log(`[TransactionModel] Applying end_date filter: ${end_date}`);
        query = query.lte('date', end_date);
      }

      if (search) {
        console.log(`[TransactionModel] Applying search filter: ${search}`);
        query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      console.log(`[TransactionModel] Executing Supabase query...`);
      const { data, error, count } = await query;

      console.log(`[TransactionModel] Supabase response - data count:`, data?.length);
      console.log(`[TransactionModel] Supabase response - error:`, error);
      console.log(`[TransactionModel] Supabase response - count:`, count);

      if (error) {
        console.error(`[TransactionModel] Supabase error in getTransactions:`, error);
        throw new Error(`Failed to get transactions: ${error.message}`);
      }

      const total = count || 0;
      const total_pages = Math.ceil(total / limit);

      // Fetch overall stats (not paginated)
      const stats = await this.getTransactionStats(spaceId);
      const categoryStats = await this.getSpendingByCategory(spaceId);
      const monthlyStats = await this.getMonthlyStats(spaceId);

      const result = {
        data: data || [],
        pagination: {
          page,
          limit,
          total,
          total_pages,
          has_next: page < total_pages,
          has_prev: page > 1
        },
        stats,
        categoryStats,
        monthlyStats
      };

      console.log(`[TransactionModel] Successfully retrieved transactions. Total: ${total}, Pages: ${total_pages}`);
      return result;
    } catch (error) {
      console.error(`[TransactionModel] Exception in getTransactions:`, error);
      throw new Error(`Failed to retrieve transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(spaceId: string, transactionId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('space_id', spaceId)
        .eq('id', transactionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Transaction not found
        }
        throw new Error(`Failed to get transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to retrieve transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update transaction
   */
  static async updateTransaction(
    spaceId: string, 
    transactionId: string, 
    updateData: UpdateTransactionRequest
  ): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('space_id', spaceId)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Transaction not found');
        }
        throw new Error(`Failed to update transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Transaction update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete transaction
   */
  static async deleteTransaction(spaceId: string, transactionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('space_id', spaceId)
        .eq('id', transactionId);

      if (error) {
        throw new Error(`Failed to delete transaction: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Transaction deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction statistics for a space
   */
  static async getTransactionStats(spaceId: string): Promise<{
    total_income: number;
    total_expenses: number;
    net_amount: number;
    transaction_count: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('space_id', spaceId);

      if (error) {
        throw new Error(`Failed to get transaction stats: ${error.message}`);
      }

      const stats = {
        total_income: 0,
        total_expenses: 0,
        net_amount: 0,
        transaction_count: data?.length || 0
      };

      data?.forEach(transaction => {
        if (transaction.type === 'income') {
          stats.total_income += transaction.amount;
        } else {
          stats.total_expenses += transaction.amount;
        }
      });

      stats.net_amount = stats.total_income - stats.total_expenses;

      return stats;
    } catch (error) {
      throw new Error(`Failed to get transaction statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get spending by category
   */
  static async getSpendingByCategory(spaceId: string): Promise<Array<{
    category: string;
    total: number;
    count: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('category, amount, type')
        .eq('space_id', spaceId)
        .eq('type', 'expense');

      if (error) {
        throw new Error(`Failed to get spending by category: ${error.message}`);
      }

      const categoryMap = new Map<string, { total: number; count: number }>();

      data?.forEach(transaction => {
        const existing = categoryMap.get(transaction.category) || { total: 0, count: 0 };
        categoryMap.set(transaction.category, {
          total: existing.total + transaction.amount,
          count: existing.count + 1
        });
      });

      return Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        ...stats
      }));
    } catch (error) {
      throw new Error(`Failed to get spending by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get monthly income and expenses grouped by month and year
   */
  static async getMonthlyStats(spaceId: string): Promise<Array<{ month: string; year: number; income: number; expenses: number }>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('date, amount, type')
        .eq('space_id', spaceId);

      if (error) {
        throw new Error(`Failed to get monthly stats: ${error.message}`);
      }

      const monthlyMap = new Map<string, { month: string; year: number; income: number; expenses: number }>();

      data?.forEach((transaction: any) => {
        const d = new Date(transaction.date);
        const month = d.toLocaleString('en-US', { month: 'short' });
        const year = d.getFullYear();
        const key = `${year}-${month}`;
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, { month, year, income: 0, expenses: 0 });
        }
        const entry = monthlyMap.get(key)!;
        if (transaction.type === 'income') {
          entry.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          entry.expenses += transaction.amount;
        }
      });

      // Sort by year then month
      return Array.from(monthlyMap.values()).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return new Date(`${a.month} 1, 2000`).getMonth() - new Date(`${b.month} 1, 2000`).getMonth();
      });
    } catch (error) {
      throw new Error(`Failed to get monthly stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 