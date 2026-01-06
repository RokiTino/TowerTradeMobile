/**
 * Property Service
 * Provides property data with real-time Supabase sync when available
 * Universal support for both web and native platforms
 */

import { Property } from '@/types/property';
import { mockProperties } from '@/data/mockProperties';
import { SupabaseService } from './supabase/SupabaseClient';
import { SupabasePropertyRepository } from './repositories/SupabasePropertyRepository';

export class PropertyService {
  private static supabaseRepo: SupabasePropertyRepository | null = null;

  /**
   * Initialize Supabase repository if Supabase is available
   */
  static initializeForUser(userId: string) {
    if (SupabaseService.isInitialized()) {
      this.supabaseRepo = new SupabasePropertyRepository(userId);
      console.info('☁️  Property Service: Supabase repository initialized');
    } else {
      console.info('📱 Property Service: Using mock data (Supabase not available)');
      this.supabaseRepo = null;
    }
  }

  /**
   * Reset repository (on logout)
   */
  static reset() {
    if (this.supabaseRepo) {
      this.supabaseRepo.destroy();
    }
    this.supabaseRepo = null;
  }

  /**
   * Get properties (Supabase if available, otherwise mock data)
   */
  static async getProperties(): Promise<Property[]> {
    if (this.supabaseRepo) {
      try {
        const properties = await this.supabaseRepo.getProperties();
        // If Supabase has properties, use them; otherwise fall back to mock
        return properties.length > 0 ? properties : mockProperties;
      } catch (error) {
        console.error('Error fetching from Supabase, using mock data:', error);
        return mockProperties;
      }
    }
    return mockProperties;
  }

  /**
   * Get property by ID
   */
  static async getPropertyById(propertyId: string): Promise<Property | null> {
    if (this.supabaseRepo) {
      try {
        return await this.supabaseRepo.getPropertyById(propertyId);
      } catch (error) {
        console.error('Error fetching property from Supabase:', error);
      }
    }
    // Fallback to mock data
    return mockProperties.find((p) => p.id === propertyId) || null;
  }

  /**
   * Subscribe to real-time property updates (Supabase Realtime)
   * Returns unsubscribe function
   */
  static subscribeToProperties(callback: (properties: Property[]) => void): () => void {
    if (this.supabaseRepo) {
      console.info('📡 Subscribing to live property updates from Supabase Realtime...');
      return this.supabaseRepo.subscribeToProperties((properties: Property[]) => {
        // If Supabase has properties, use them; otherwise fall back to mock
        callback(properties.length > 0 ? properties : mockProperties);
      });
    }

    // If no Supabase, just call callback with mock data once
    console.info('📱 Using mock property data (Supabase not available)');
    callback(mockProperties);
    return () => {}; // No-op unsubscribe
  }

  /**
   * Subscribe to single property updates (Supabase Realtime)
   */
  static subscribeToProperty(propertyId: string, callback: (property: Property | null) => void): () => void {
    if (this.supabaseRepo) {
      console.info(`📡 Subscribing to live updates for property ${propertyId} via Supabase Realtime...`);
      return this.supabaseRepo.subscribeToProperty(propertyId, callback);
    }

    // Fallback to mock data
    const property = mockProperties.find((p) => p.id === propertyId) || null;
    callback(property);
    return () => {}; // No-op unsubscribe
  }

  /**
   * Get user's invested properties
   */
  static async getUserInvestedProperties(): Promise<Property[]> {
    if (this.supabaseRepo) {
      try {
        return await this.supabaseRepo.getUserInvestedProperties();
      } catch (error) {
        console.error('Error fetching user invested properties:', error);
      }
    }
    return [];
  }

  /**
   * Update property funding after investment
   */
  static async updatePropertyFunding(propertyId: string, investmentAmount: number): Promise<void> {
    if (this.supabaseRepo) {
      try {
        await this.supabaseRepo.updatePropertyFunding(propertyId, investmentAmount);
        await this.supabaseRepo.recordInvestment(propertyId, investmentAmount);
      } catch (error) {
        console.error('Error updating property funding:', error);
        throw error;
      }
    }
  }
}
