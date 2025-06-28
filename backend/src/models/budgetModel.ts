import { supabase } from './database';
import { Budget, CreateBudgetRequest } from '../types';

export class BudgetModel {
  /**
   * Get budget for a space
   */
  static async getBudget(spaceId: string): Promise<Budget | null> {
    console.log(`[BudgetModel] Getting budget for spaceId: ${spaceId}`);
    try {
      console.log(`[BudgetModel] Executing Supabase query for spaceId: ${spaceId}`);
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('space_id', spaceId)
        .single();

      console.log(`[BudgetModel] Supabase response - data:`, data);
      console.log(`[BudgetModel] Supabase response - error:`, error);

      if (error) {
        console.log(`[BudgetModel] Supabase error encountered:`, error);
        if (error.code === 'PGRST116') {
          console.log(`[BudgetModel] Budget not found for spaceId: ${spaceId}`);
          return null; // Budget not found
        }
        throw new Error(`Failed to get budget: ${error.message}`);
      }
      console.log(`[BudgetModel] Successfully retrieved budget:`, data);
      return data;
    } catch (error) {
      console.error(`[BudgetModel] Exception in getBudget:`, error);
      throw new Error(`Failed to retrieve budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set or update budget for a space
   */
  static async setBudget(spaceId: string, budgetData: CreateBudgetRequest): Promise<Budget> {
    console.log(`[BudgetModel] Setting budget for spaceId: ${spaceId} with data:`, budgetData);
    try {
      // Upsert (insert or update)
      const { data, error } = await supabase
        .from('budgets')
        .upsert({
          space_id: spaceId,
          monthly_budget: budgetData.monthly_budget
        }, { onConflict: 'space_id' })
        .select()
        .single();

      if (error) {
        console.error(`[BudgetModel] Supabase error in setBudget:`, error);
        throw new Error(`Failed to set budget: ${error.message}`);
      }
      console.log(`[BudgetModel] Successfully set budget:`, data);
      return data;
    } catch (error) {
      console.error(`[BudgetModel] Exception in setBudget:`, error);
      throw new Error(`Failed to set budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete budget for a space
   */
  static async deleteBudget(spaceId: string): Promise<void> {
    console.log(`[BudgetModel] Deleting budget for spaceId: ${spaceId}`);
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('space_id', spaceId);
      if (error) {
        console.error(`[BudgetModel] Supabase error in deleteBudget:`, error);
        throw new Error(`Failed to delete budget: ${error.message}`);
      }
      console.log(`[BudgetModel] Successfully deleted budget for spaceId: ${spaceId}`);
    } catch (error) {
      console.error(`[BudgetModel] Exception in deleteBudget:`, error);
      throw new Error(`Failed to delete budget: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 