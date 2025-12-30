/**
 * Storage Utilities - Backward Compatibility Layer
 * This file now delegates to the Service Factory pattern for flexible backend switching
 * All existing code continues to work without changes
 */

import { CreditCard, BankAccount, Transaction, InvestorAgreement } from '@/types/payment';
import { PaymentService } from '@/services/ServiceFactory';

// Credit Cards
export const saveCreditCard = async (card: CreditCard): Promise<void> => {
  return PaymentService.getInstance().saveCreditCard(card);
};

export const getCreditCards = async (): Promise<CreditCard[]> => {
  return PaymentService.getInstance().getCreditCards();
};

export const deleteCreditCard = async (cardId: string): Promise<void> => {
  return PaymentService.getInstance().deleteCreditCard(cardId);
};

// Bank Accounts
export const saveBankAccount = async (account: BankAccount): Promise<void> => {
  return PaymentService.getInstance().saveBankAccount(account);
};

export const getBankAccounts = async (): Promise<BankAccount[]> => {
  return PaymentService.getInstance().getBankAccounts();
};

export const deleteBankAccount = async (accountId: string): Promise<void> => {
  return PaymentService.getInstance().deleteBankAccount(accountId);
};

// Transactions
export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  return PaymentService.getInstance().saveTransaction(transaction);
};

export const getTransactions = async (): Promise<Transaction[]> => {
  return PaymentService.getInstance().getTransactions();
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: Transaction['status']
): Promise<void> => {
  return PaymentService.getInstance().updateTransactionStatus(transactionId, status);
};

// Investor Agreement
export const saveInvestorAgreement = async (agreement: InvestorAgreement): Promise<void> => {
  return PaymentService.getInstance().saveInvestorAgreement(agreement);
};

export const getInvestorAgreement = async (): Promise<InvestorAgreement | null> => {
  return PaymentService.getInstance().getInvestorAgreement();
};

// Utility: Set default payment method
export const setDefaultPaymentMethod = async (
  id: string,
  type: 'card' | 'bank'
): Promise<void> => {
  return PaymentService.getInstance().setDefaultPaymentMethod(id, type);
};
