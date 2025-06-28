import { supabase } from './database';
import { Space, CreateSpaceResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SpaceModel {
  /**
   * Create a new space with a unique space_id
   */
  static async createSpace(): Promise<CreateSpaceResponse> {
    try {
      const spaceId = uuidv4();
      
      console.log(`[SpaceModel] Creating space with ID: ${spaceId}`);
      
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          space_id: spaceId
        })
        .select()
        .single();

      if (error) {
        console.error(`[SpaceModel] Supabase error in createSpace:`, error);
        throw new Error(`Failed to create space: ${error.message}`);
      }

      console.log(`[SpaceModel] Successfully created space:`, data);

      return {
        space_id: data.space_id,
        message: 'Space created successfully'
      };
    } catch (error) {
      console.error(`[SpaceModel] Exception in createSpace:`, error);
      throw new Error(`Space creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get space by space_id
   */
  static async getSpaceById(spaceId: string): Promise<Space | null> {
    try {
      console.log(`[SpaceModel] Getting space by ID: ${spaceId}`);
      
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('space_id', spaceId)
        .single();

      console.log(`[SpaceModel] Supabase response - data:`, data);
      console.log(`[SpaceModel] Supabase response - error:`, error);

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`[SpaceModel] Space not found for ID: ${spaceId}`);
          return null; // Space not found
        }
        throw new Error(`Failed to get space: ${error.message}`);
      }

      console.log(`[SpaceModel] Successfully retrieved space:`, data);
      return data;
    } catch (error) {
      console.error(`[SpaceModel] Exception in getSpaceById:`, error);
      throw new Error(`Failed to retrieve space: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if space exists
   */
  static async spaceExists(spaceId: string): Promise<boolean> {
    try {
      const space = await this.getSpaceById(spaceId);
      return space !== null;
    } catch (error) {
      console.error(`[SpaceModel] Exception in spaceExists:`, error);
      return false;
    }
  }

  /**
   * Delete space and all associated data
   */
  static async deleteSpace(spaceId: string): Promise<void> {
    try {
      console.log(`[SpaceModel] Deleting space with ID: ${spaceId}`);
      
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('space_id', spaceId);

      if (error) {
        console.error(`[SpaceModel] Supabase error in deleteSpace:`, error);
        throw new Error(`Failed to delete space: ${error.message}`);
      }

      console.log(`[SpaceModel] Successfully deleted space with ID: ${spaceId}`);
    } catch (error) {
      console.error(`[SpaceModel] Exception in deleteSpace:`, error);
      throw new Error(`Failed to delete space: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 