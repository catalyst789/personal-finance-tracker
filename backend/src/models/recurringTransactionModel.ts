import { supabase } from './database';
import { 
  RecurringTransaction, 
  CreateRecurringTransactionRequest, 
  UpdateRecurringTransactionRequest 
} from '../types';
import { addWeeks, addMonths, addYears, format } from 'date-fns';

export class RecurringTransactionModel {
  /**
   * Calculate next due date based on frequency
   */
  private static calculateNextDueDate(startDate: string, frequency: string, lastProcessed?: string): string {
    const baseDate = lastProcessed ? new Date(lastProcessed) : new Date(startDate);
    
    switch (frequency) {
      case 'weekly':
        return format(addWeeks(baseDate, 1), 'yyyy-MM-dd');
      case 'monthly':
        return format(addMonths(baseDate, 1), 'yyyy-MM-dd');
      case 'yearly':
        return format(addYears(baseDate, 1), 'yyyy-MM-dd');
      default:
        return format(addMonths(baseDate, 1), 'yyyy-MM-dd');
    }
  }

  /**
   * Get all recurring transactions for a space
   */
  static async getRecurringTransactions(spaceId: string): Promise<RecurringTransaction[]> {
    console.log(`[RecurringTransactionModel] Getting recurring transactions for spaceId: ${spaceId}`);
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('space_id', spaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`[RecurringTransactionModel] Supabase error in getRecurringTransactions:`, error);
        throw new Error(`Failed to get recurring transactions: ${error.message}`);
      }

      console.log(`[RecurringTransactionModel] Successfully retrieved ${data?.length || 0} recurring transactions`);
      return data || [];
    } catch (error) {
      console.error(`[RecurringTransactionModel] Exception in getRecurringTransactions:`, error);
      throw new Error(`Failed to retrieve recurring transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new recurring transaction
   */
  static async createRecurringTransaction(
    spaceId: string, 
    transactionData: CreateRecurringTransactionRequest
  ): Promise<RecurringTransaction> {
    console.log(`[RecurringTransactionModel] Creating recurring transaction for spaceId: ${spaceId} with data:`, transactionData);
    try {
      const nextDueDate = this.calculateNextDueDate(transactionData.start_date, transactionData.frequency);
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          space_id: spaceId,
          name: transactionData.name,
          type: transactionData.type,
          amount: transactionData.amount,
          category: transactionData.category,
          subcategory: transactionData.subcategory,
          description: transactionData.description,
          frequency: transactionData.frequency,
          start_date: transactionData.start_date,
          next_due_date: nextDueDate,
          is_active: true,
          source: 'dedicated',
        })
        .select()
        .single();

      if (error) {
        console.error(`[RecurringTransactionModel] Supabase error in createRecurringTransaction:`, error);
        throw new Error(`Failed to create recurring transaction: ${error.message}`);
      }

      console.log(`[RecurringTransactionModel] Successfully created recurring transaction:`, data);
      return data;
    } catch (error) {
      console.error(`[RecurringTransactionModel] Exception in createRecurringTransaction:`, error);
      throw new Error(`Failed to create recurring transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a recurring transaction
   */
  static async updateRecurringTransaction(
    spaceId: string,
    transactionId: string,
    updateData: UpdateRecurringTransactionRequest
  ): Promise<RecurringTransaction> {
    console.log(`[RecurringTransactionModel] Updating recurring transaction ${transactionId} for spaceId: ${spaceId} with data:`, updateData);
    try {
      // If start_date or frequency is being updated, recalculate next_due_date
      if (updateData.start_date || updateData.frequency) {
        const current = await this.getRecurringTransactionById(spaceId, transactionId);
        if (current) {
          const newStartDate = updateData.start_date || current.start_date;
          const newFrequency = updateData.frequency || current.frequency;
          updateData.next_due_date = this.calculateNextDueDate(newStartDate, newFrequency, current.last_processed);
        }
      }

      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(updateData)
        .eq('space_id', spaceId)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Recurring transaction not found');
        }
        console.error(`[RecurringTransactionModel] Supabase error in updateRecurringTransaction:`, error);
        throw new Error(`Failed to update recurring transaction: ${error.message}`);
      }

      console.log(`[RecurringTransactionModel] Successfully updated recurring transaction:`, data);
      return data;
    } catch (error) {
      console.error(`[RecurringTransactionModel] Exception in updateRecurringTransaction:`, error);
      throw new Error(`Failed to update recurring transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a recurring transaction
   */
  static async deleteRecurringTransaction(spaceId: string, transactionId: string): Promise<void> {
    console.log(`[RecurringTransactionModel] Deleting recurring transaction ${transactionId} for spaceId: ${spaceId}`);
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('space_id', spaceId)
        .eq('id', transactionId);

      if (error) {
        console.error(`[RecurringTransactionModel] Supabase error in deleteRecurringTransaction:`, error);
        throw new Error(`Failed to delete recurring transaction: ${error.message}`);
      }

      console.log(`[RecurringTransactionModel] Successfully deleted recurring transaction ${transactionId}`);
    } catch (error) {
      console.error(`[RecurringTransactionModel] Exception in deleteRecurringTransaction:`, error);
      throw new Error(`Failed to delete recurring transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recurring transaction by ID
   */
  static async getRecurringTransactionById(spaceId: string, transactionId: string): Promise<RecurringTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('space_id', spaceId)
        .eq('id', transactionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Recurring transaction not found
        }
        throw new Error(`Failed to get recurring transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to retrieve recurring transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process due recurring transactions
   */
  static async processDueRecurringTransactions(spaceId: string): Promise<RecurringTransaction[]> {
    console.log(`[RecurringTransactionModel] Processing due recurring transactions for spaceId: ${spaceId}`);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Get all due recurring transactions
      const { data: dueTransactions, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('space_id', spaceId)
        .eq('is_active', true)
        .lte('next_due_date', today);

      if (error) {
        console.error(`[RecurringTransactionModel] Supabase error in processDueRecurringTransactions:`, error);
        throw new Error(`Failed to get due recurring transactions: ${error.message}`);
      }

      console.log(`[RecurringTransactionModel] Found ${dueTransactions?.length || 0} due recurring transactions`);
      return dueTransactions || [];
    } catch (error) {
      console.error(`[RecurringTransactionModel] Exception in processDueRecurringTransactions:`, error);
      throw new Error(`Failed to process due recurring transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update next due date after processing
   */
  static async updateNextDueDate(transactionId: string, lastProcessed: string, frequency: string): Promise<void> {
    try {
      const nextDueDate = this.calculateNextDueDate(lastProcessed, frequency);
      
      const { error } = await supabase
        .from('recurring_transactions')
        .update({
          last_processed: lastProcessed,
          next_due_date: nextDueDate,
        })
        .eq('id', transactionId);

      if (error) {
        throw new Error(`Failed to update next due date: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to update next due date: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new recurring transaction from a regular transaction
   */
  static async createRecurringTransactionFromRegular(
    spaceId: string, 
    transactionId: string,
    transactionData: CreateRecurringTransactionRequest
  ): Promise<RecurringTransaction> {
    console.log(`[RecurringTransactionModel] Creating recurring transaction from regular transaction ${transactionId} for spaceId: ${spaceId} with data:`, transactionData);
    try {
      const nextDueDate = this.calculateNextDueDate(transactionData.start_date, transactionData.frequency);
      
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          id: `regular-${transactionId}`, // Special ID format for regular transactions
          space_id: spaceId,
          name: transactionData.name,
          type: transactionData.type,
          amount: transactionData.amount,
          category: transactionData.category,
          subcategory: transactionData.subcategory,
          description: transactionData.description,
          frequency: transactionData.frequency,
          start_date: transactionData.start_date,
          next_due_date: nextDueDate,
          is_active: true,
          source: 'regular_transaction', // Special source for regular transactions
        })
        .select()
        .single();

      if (error) {
        console.error(`[RecurringTransactionModel] Supabase error in createRecurringTransactionFromRegular:`, error);
        throw new Error(`Failed to create recurring transaction from regular: ${error.message}`);
      }

      console.log(`[RecurringTransactionModel] Successfully created recurring transaction from regular:`, data);
      return data;
    } catch (error) {
      console.error(`[RecurringTransactionModel] Exception in createRecurringTransactionFromRegular:`, error);
      throw new Error(`Failed to create recurring transaction from regular: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 