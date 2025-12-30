/**
 * Payment Repository Interface
 * Defines the contract for payment data operations across different backends
 */

import { CreditCard, BankAccount, Transaction, InvestorAgreement } from '@/types/payment';

export interface IPaymentRepository {
  // Credit Cards
  saveCreditCard(card: CreditCard): Promise<void>;
  getCreditCards(): Promise<CreditCard[]>;
  deleteCreditCard(cardId: string): Promise<void>;

  // Bank Accounts
  saveBankAccount(account: BankAccount): Promise<void>;
  getBankAccounts(): Promise<BankAccount[]>;
  deleteBankAccount(accountId: string): Promise<void>;

  // Transactions
  saveTransaction(transaction: Transaction): Promise<void>;
  getTransactions(): Promise<Transaction[]>;
  getTransactionById(transactionId: string): Promise<Transaction | null>;
  updateTransactionStatus(transactionId: string, status: Transaction['status']): Promise<void>;

  // Investor Agreement
  saveInvestorAgreement(agreement: InvestorAgreement): Promise<void>;
  getInvestorAgreement(): Promise<InvestorAgreement | null>;

  // Payment Method Utilities
  setDefaultPaymentMethod(id: string, type: 'card' | 'bank'): Promise<void>;
}
