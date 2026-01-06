/**
 * Service Factory
 * Creates and manages repository instances based on backend configuration
 * Uses Supabase for cloud sync (universal across web and native)
 */

import { IPaymentRepository } from './repositories/IPaymentRepository';
import { LocalPaymentRepository } from './repositories/LocalPaymentRepository';
import { getAppConfig } from '@/config/app.config';
import { SupabaseService } from './supabase/SupabaseClient';

/**
 * Payment Service Factory
 * Returns the appropriate payment repository based on configuration
 */
export class PaymentService {
  private static instance: IPaymentRepository | null = null;

  static getInstance(userId?: string): IPaymentRepository {
    if (this.instance) {
      return this.instance;
    }

    const config = getAppConfig();

    switch (config.backendType) {
      case 'supabase':
        if (!userId) {
          console.warn('Supabase backend requires userId, falling back to local storage');
          this.instance = new LocalPaymentRepository();
        } else if (!SupabaseService.isInitialized()) {
          console.warn('Supabase not initialized, falling back to local storage');
          this.instance = new LocalPaymentRepository();
        } else {
          // Import Supabase payment repository
          const { SupabasePaymentRepository } = require('./repositories/SupabasePaymentRepository');
          this.instance = new SupabasePaymentRepository(userId);
        }
        break;

      case 'local':
      default:
        this.instance = new LocalPaymentRepository();
        break;
    }

    // Ensure we always return a valid instance
    if (!this.instance) {
      this.instance = new LocalPaymentRepository();
    }

    return this.instance;
  }

  /**
   * Reset the singleton instance
   * Useful for switching backends or user logout
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Switch to Supabase backend
   */
  static switchToSupabase(userId: string): IPaymentRepository {
    if (!SupabaseService.isInitialized()) {
      console.warn('⚠️  Supabase not initialized, using Local storage');
      this.instance = new LocalPaymentRepository();
    } else {
      const { SupabasePaymentRepository } = require('./repositories/SupabasePaymentRepository');
      this.instance = new SupabasePaymentRepository(userId);
    }

    // Ensure we always return a valid instance
    if (!this.instance) {
      this.instance = new LocalPaymentRepository();
    }

    return this.instance;
  }

  /**
   * Switch to Local backend
   */
  static switchToLocal(): IPaymentRepository {
    this.instance = new LocalPaymentRepository();
    return this.instance;
  }
}

/**
 * Convenience functions for backward compatibility
 * These match the old storage.ts API
 */

export const paymentService = {
  // Credit Cards
  saveCreditCard: (card: any) => PaymentService.getInstance().saveCreditCard(card),
  getCreditCards: () => PaymentService.getInstance().getCreditCards(),
  deleteCreditCard: (cardId: string) => PaymentService.getInstance().deleteCreditCard(cardId),

  // Bank Accounts
  saveBankAccount: (account: any) => PaymentService.getInstance().saveBankAccount(account),
  getBankAccounts: () => PaymentService.getInstance().getBankAccounts(),
  deleteBankAccount: (accountId: string) => PaymentService.getInstance().deleteBankAccount(accountId),

  // Transactions
  saveTransaction: (transaction: any) => PaymentService.getInstance().saveTransaction(transaction),
  getTransactions: () => PaymentService.getInstance().getTransactions(),
  updateTransactionStatus: (id: string, status: any) =>
    PaymentService.getInstance().updateTransactionStatus(id, status),

  // Investor Agreement
  saveInvestorAgreement: (agreement: any) =>
    PaymentService.getInstance().saveInvestorAgreement(agreement),
  getInvestorAgreement: () => PaymentService.getInstance().getInvestorAgreement(),

  // Utility
  setDefaultPaymentMethod: (id: string, type: 'card' | 'bank') =>
    PaymentService.getInstance().setDefaultPaymentMethod(id, type),
};
