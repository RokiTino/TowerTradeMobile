/**
 * Local Storage Implementation of Payment Repository
 * Uses AsyncStorage for offline-first data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPaymentRepository } from './IPaymentRepository';
import { CreditCard, BankAccount, Transaction, InvestorAgreement } from '@/types/payment';

const STORAGE_KEYS = {
  CREDIT_CARDS: '@towertrade:credit_cards',
  BANK_ACCOUNTS: '@towertrade:bank_accounts',
  TRANSACTIONS: '@towertrade:transactions',
  INVESTOR_AGREEMENT: '@towertrade:investor_agreement',
};

export class LocalPaymentRepository implements IPaymentRepository {
  // Credit Cards
  async saveCreditCard(card: CreditCard): Promise<void> {
    try {
      const existingCards = await this.getCreditCards();
      const updatedCards = [...existingCards, card];
      await AsyncStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Error saving credit card:', error);
      throw error;
    }
  }

  async getCreditCards(): Promise<CreditCard[]> {
    try {
      const cardsJson = await AsyncStorage.getItem(STORAGE_KEYS.CREDIT_CARDS);
      if (!cardsJson) return [];
      const cards = JSON.parse(cardsJson);
      return cards.map((card: any) => ({
        ...card,
        createdAt: new Date(card.createdAt),
      }));
    } catch (error) {
      console.error('Error getting credit cards:', error);
      return [];
    }
  }

  async deleteCreditCard(cardId: string): Promise<void> {
    try {
      const cards = await this.getCreditCards();
      const updatedCards = cards.filter((card) => card.id !== cardId);
      await AsyncStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(updatedCards));
    } catch (error) {
      console.error('Error deleting credit card:', error);
      throw error;
    }
  }

  // Bank Accounts
  async saveBankAccount(account: BankAccount): Promise<void> {
    try {
      const existingAccounts = await this.getBankAccounts();
      const updatedAccounts = [...existingAccounts, account];
      await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(updatedAccounts));
    } catch (error) {
      console.error('Error saving bank account:', error);
      throw error;
    }
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    try {
      const accountsJson = await AsyncStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
      if (!accountsJson) return [];
      const accounts = JSON.parse(accountsJson);
      return accounts.map((account: any) => ({
        ...account,
        createdAt: new Date(account.createdAt),
      }));
    } catch (error) {
      console.error('Error getting bank accounts:', error);
      return [];
    }
  }

  async deleteBankAccount(accountId: string): Promise<void> {
    try {
      const accounts = await this.getBankAccounts();
      const updatedAccounts = accounts.filter((account) => account.id !== accountId);
      await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(updatedAccounts));
    } catch (error) {
      console.error('Error deleting bank account:', error);
      throw error;
    }
  }

  // Transactions
  async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      const existingTransactions = await this.getTransactions();
      const updatedTransactions = [transaction, ...existingTransactions];
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const transactionsJson = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!transactionsJson) return [];
      const transactions = JSON.parse(transactionsJson);
      return transactions.map((transaction: any) => ({
        ...transaction,
        date: new Date(transaction.date),
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const transactions = await this.getTransactions();
      return transactions.find(t => t.id === transactionId) || null;
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      return null;
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    status: Transaction['status']
  ): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === transactionId ? { ...transaction, status } : transaction
      );
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  // Investor Agreement
  async saveInvestorAgreement(agreement: InvestorAgreement): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INVESTOR_AGREEMENT, JSON.stringify(agreement));
    } catch (error) {
      console.error('Error saving investor agreement:', error);
      throw error;
    }
  }

  async getInvestorAgreement(): Promise<InvestorAgreement | null> {
    try {
      const agreementJson = await AsyncStorage.getItem(STORAGE_KEYS.INVESTOR_AGREEMENT);
      if (!agreementJson) return null;
      const agreement = JSON.parse(agreementJson);
      return {
        ...agreement,
        acceptedAt: agreement.acceptedAt ? new Date(agreement.acceptedAt) : undefined,
      };
    } catch (error) {
      console.error('Error getting investor agreement:', error);
      return null;
    }
  }

  // Utility
  async setDefaultPaymentMethod(id: string, type: 'card' | 'bank'): Promise<void> {
    try {
      if (type === 'card') {
        const cards = await this.getCreditCards();
        const updatedCards = cards.map((card) => ({
          ...card,
          isDefault: card.id === id,
        }));
        await AsyncStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(updatedCards));
      } else {
        const accounts = await this.getBankAccounts();
        const updatedAccounts = accounts.map((account) => ({
          ...account,
          isDefault: account.id === id,
        }));
        await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(updatedAccounts));
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }
}
