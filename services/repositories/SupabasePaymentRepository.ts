/**
 * Supabase Payment Repository
 * Handles payment transactions and investment records
 */

import { SupabaseService } from '../supabase/SupabaseClient';

export interface PaymentTransaction {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
}

export class SupabasePaymentRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Record a payment transaction
   */
  async recordPayment(
    propertyId: string,
    amount: number,
    paymentMethod: string
  ): Promise<PaymentTransaction> {
    try {
      const client = SupabaseService.getClient();

      const transaction = {
        user_id: this.userId,
        property_id: propertyId,
        amount: amount,
        payment_method: paymentMethod,
        status: 'completed',
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };

      const { data, error } = await client
        .from('payments')
        .insert(transaction)
        .select()
        .single();

      if (error) {
        console.error('Error recording payment:', error);
        throw error;
      }

      console.info(`✅ Payment recorded: $${amount} for property ${propertyId}`);

      return this.mapSupabasePayment(data);
    } catch (error) {
      console.error('Exception recording payment:', error);
      throw error;
    }
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(): Promise<PaymentTransaction[]> {
    try {
      const client = SupabaseService.getClient();

      const { data, error } = await client
        .from('payments')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        return [];
      }

      return (data || []).map((item) => this.mapSupabasePayment(item));
    } catch (error) {
      console.error('Exception fetching payments:', error);
      return [];
    }
  }

  /**
   * Get payments for a specific property
   */
  async getPropertyPayments(propertyId: string): Promise<PaymentTransaction[]> {
    try {
      const client = SupabaseService.getClient();

      const { data, error } = await client
        .from('payments')
        .select('*')
        .eq('property_id', propertyId)
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching property payments:', error);
        return [];
      }

      return (data || []).map((item) => this.mapSupabasePayment(item));
    } catch (error) {
      console.error('Exception fetching property payments:', error);
      return [];
    }
  }

  /**
   * Get total invested amount by user
   */
  async getTotalInvested(): Promise<number> {
    try {
      const client = SupabaseService.getClient();

      const { data, error } = await client
        .from('payments')
        .select('amount')
        .eq('user_id', this.userId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching total invested:', error);
        return 0;
      }

      const total = (data || []).reduce((sum, payment) => sum + payment.amount, 0);
      return total;
    } catch (error) {
      console.error('Exception calculating total invested:', error);
      return 0;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: 'pending' | 'completed' | 'failed'
  ): Promise<void> {
    try {
      const client = SupabaseService.getClient();

      const updates: any = {
        status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await client
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .eq('user_id', this.userId);

      if (error) {
        console.error('Error updating payment status:', error);
        throw error;
      }

      console.info(`✅ Payment ${paymentId} status updated to ${status}`);
    } catch (error) {
      console.error('Exception updating payment status:', error);
      throw error;
    }
  }

  /**
   * Map Supabase payment to PaymentTransaction
   */
  private mapSupabasePayment(data: any): PaymentTransaction {
    return {
      id: data.id,
      userId: data.user_id,
      propertyId: data.property_id,
      amount: data.amount,
      status: data.status,
      paymentMethod: data.payment_method,
      createdAt: data.created_at,
      completedAt: data.completed_at,
    };
  }
}
