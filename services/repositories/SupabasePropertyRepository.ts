/**
 * Supabase Property Repository
 * Handles property data with real-time Supabase sync
 * Provides live funding updates and property management
 */

import { SupabaseService } from '../supabase/SupabaseClient';
import { Property } from '@/types/property';
import { RealtimeChannel } from '@supabase/supabase-js';

export class SupabasePropertyRepository {
  private userId: string;
  private subscriptions: RealtimeChannel[] = [];

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Get all properties
   */
  async getProperties(): Promise<Property[]> {
    try {
      const client = SupabaseService.getClient();

      const { data, error } = await client
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        return [];
      }

      return this.mapSupabaseProperties(data || []);
    } catch (error) {
      console.error('Exception fetching properties:', error);
      return [];
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(propertyId: string): Promise<Property | null> {
    try {
      const client = SupabaseService.getClient();

      const { data, error } = await client
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Error fetching property:', error);
        return null;
      }

      return this.mapSupabaseProperty(data);
    } catch (error) {
      console.error('Exception fetching property:', error);
      return null;
    }
  }

  /**
   * Subscribe to real-time property updates
   * Supabase Realtime for live funding progress
   */
  subscribeToProperties(callback: (properties: Property[]) => void): () => void {
    try {
      const client = SupabaseService.getClient();

      // Initial fetch
      this.getProperties().then(callback);

      // Subscribe to real-time updates
      const channel = client
        .channel('properties-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'properties',
          },
          (payload) => {
            console.info('🔄 Realtime property update:', payload);
            // Refetch all properties on any change
            this.getProperties().then(callback);
          }
        )
        .subscribe();

      this.subscriptions.push(channel);

      console.info('✅ Subscribed to property updates');

      // Return unsubscribe function
      return () => {
        channel.unsubscribe();
        this.subscriptions = this.subscriptions.filter((sub) => sub !== channel);
        console.info('🔕 Unsubscribed from property updates');
      };
    } catch (error) {
      console.error('Error subscribing to properties:', error);
      return () => {};
    }
  }

  /**
   * Subscribe to single property updates
   */
  subscribeToProperty(propertyId: string, callback: (property: Property | null) => void): () => void {
    try {
      const client = SupabaseService.getClient();

      // Initial fetch
      this.getPropertyById(propertyId).then(callback);

      // Subscribe to real-time updates for this property
      const channel = client
        .channel(`property-${propertyId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'properties',
            filter: `id=eq.${propertyId}`,
          },
          (payload) => {
            console.info(`🔄 Realtime update for property ${propertyId}:`, payload);
            // Refetch property on change
            this.getPropertyById(propertyId).then(callback);
          }
        )
        .subscribe();

      this.subscriptions.push(channel);

      console.info(`✅ Subscribed to property ${propertyId} updates`);

      // Return unsubscribe function
      return () => {
        channel.unsubscribe();
        this.subscriptions = this.subscriptions.filter((sub) => sub !== channel);
        console.info(`🔕 Unsubscribed from property ${propertyId} updates`);
      };
    } catch (error) {
      console.error(`Error subscribing to property ${propertyId}:`, error);
      return () => {};
    }
  }

  /**
   * Get properties the user has invested in
   */
  async getUserInvestedProperties(): Promise<Property[]> {
    try {
      const client = SupabaseService.getClient();

      // Query investments table for this user
      const { data: investments, error: investError } = await client
        .from('investments')
        .select('property_id')
        .eq('user_id', this.userId);

      if (investError) {
        console.error('Error fetching user investments:', investError);
        return [];
      }

      if (!investments || investments.length === 0) {
        return [];
      }

      // Get property IDs
      const propertyIds = investments.map((inv) => inv.property_id);

      // Fetch properties
      const { data: properties, error: propError } = await client
        .from('properties')
        .select('*')
        .in('id', propertyIds);

      if (propError) {
        console.error('Error fetching invested properties:', propError);
        return [];
      }

      return this.mapSupabaseProperties(properties || []);
    } catch (error) {
      console.error('Exception fetching user invested properties:', error);
      return [];
    }
  }

  /**
   * Update property funding after investment
   */
  async updatePropertyFunding(propertyId: string, investmentAmount: number): Promise<void> {
    try {
      const client = SupabaseService.getClient();

      // Get current property
      const property = await this.getPropertyById(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      const newRaisedAmount = property.raisedAmount + investmentAmount;

      // Update property
      const { error } = await client
        .from('properties')
        .update({
          raised_amount: newRaisedAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (error) {
        console.error('Error updating property funding:', error);
        throw error;
      }

      console.info(`✅ Updated property ${propertyId} funding: +$${investmentAmount}`);
    } catch (error) {
      console.error('Exception updating property funding:', error);
      throw error;
    }
  }

  /**
   * Record investment transaction
   */
  async recordInvestment(propertyId: string, amount: number): Promise<void> {
    try {
      const client = SupabaseService.getClient();

      const { error } = await client.from('investments').insert({
        user_id: this.userId,
        property_id: propertyId,
        amount: amount,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error recording investment:', error);
        throw error;
      }

      console.info(`✅ Recorded investment: $${amount} in property ${propertyId}`);
    } catch (error) {
      console.error('Exception recording investment:', error);
      throw error;
    }
  }

  /**
   * Map Supabase property data to Property type
   */
  private mapSupabaseProperty(data: any): Property {
    return {
      id: data.id,
      name: data.name || data.title,
      description: data.description || '',
      imageUrl: data.image_url || (data.images && data.images[0]) || '',
      goalAmount: data.goal_amount || data.target_amount || 0,
      raisedAmount: data.raised_amount || data.funded_amount || 0,
      location: data.location || '',
      type: data.property_type || data.type || 'Residential',
      expectedROI: data.expected_roi || data.roi || 0,
      minimumInvestment: data.minimum_investment || data.min_investment || 0,
      aiInsight: data.ai_insight || undefined,
    };
  }

  /**
   * Map array of Supabase properties
   */
  private mapSupabaseProperties(data: any[]): Property[] {
    return data.map((item) => this.mapSupabaseProperty(item));
  }

  /**
   * Clean up all subscriptions
   */
  destroy() {
    this.subscriptions.forEach((channel) => {
      channel.unsubscribe();
    });
    this.subscriptions = [];
    console.info('🧹 Cleaned up all property subscriptions');
  }
}
