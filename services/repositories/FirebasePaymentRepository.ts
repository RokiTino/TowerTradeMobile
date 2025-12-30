/**
 * Firebase Implementation of Payment Repository
 * Uses Firebase Firestore for cloud-based data persistence
 * Platform-guarded to prevent loading native modules on web
 */

import { Platform } from 'react-native';
import { FirebaseWrapper } from '../firebase/FirebaseWrapper';
import { IPaymentRepository } from './IPaymentRepository';
import { CreditCard, BankAccount, Transaction, InvestorAgreement } from '@/types/payment';

export class FirebasePaymentRepository implements IPaymentRepository {
  private userId: string;
  private firestore: any;

  constructor(userId: string) {
    this.userId = userId;
    // Lazy initialization - only get firestore when needed
    this.firestore = null;
  }

  /**
   * Get Firestore instance (lazy initialization)
   */
  private getFirestore() {
    if (!this.firestore) {
      this.firestore = FirebaseWrapper.getFirestore();
    }
    return this.firestore;
  }

  /**
   * Get Firestore FieldValue for server timestamps
   */
  private getFieldValue() {
    const firestore = this.getFirestore();
    return firestore.constructor.FieldValue || firestore.FieldValue;
  }

  // Helper to get user-specific collection reference
  private getUserCollection(collectionName: string) {
    return this.getFirestore().collection('users').doc(this.userId).collection(collectionName);
  }

  // Credit Cards
  async saveCreditCard(card: CreditCard): Promise<void> {
    try {
      const FieldValue = this.getFieldValue();
      await this.getUserCollection('creditCards').doc(card.id).set({
        ...card,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving credit card to Firebase:', error);
      throw error;
    }
  }

  async getCreditCards(): Promise<CreditCard[]> {
    try {
      const snapshot = await this.getUserCollection('creditCards')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as CreditCard;
      });
    } catch (error) {
      console.error('Error getting credit cards from Firebase:', error);
      return [];
    }
  }

  async deleteCreditCard(cardId: string): Promise<void> {
    try {
      await this.getUserCollection('creditCards').doc(cardId).delete();
    } catch (error) {
      console.error('Error deleting credit card from Firebase:', error);
      throw error;
    }
  }

  // Bank Accounts
  async saveBankAccount(account: BankAccount): Promise<void> {
    try {
      const FieldValue = this.getFieldValue();
      await this.getUserCollection('bankAccounts').doc(account.id).set({
        ...account,
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving bank account to Firebase:', error);
      throw error;
    }
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    try {
      const snapshot = await this.getUserCollection('bankAccounts')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as BankAccount;
      });
    } catch (error) {
      console.error('Error getting bank accounts from Firebase:', error);
      return [];
    }
  }

  async deleteBankAccount(accountId: string): Promise<void> {
    try {
      await this.getUserCollection('bankAccounts').doc(accountId).delete();
    } catch (error) {
      console.error('Error deleting bank account from Firebase:', error);
      throw error;
    }
  }

  // Transactions
  async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      const FieldValue = this.getFieldValue();
      await this.getUserCollection('transactions').doc(transaction.id).set({
        ...transaction,
        date: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving transaction to Firebase:', error);
      throw error;
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    try {
      const snapshot = await this.getUserCollection('transactions')
        .orderBy('date', 'desc')
        .get();

      return snapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: data.date?.toDate() || new Date(),
        } as Transaction;
      });
    } catch (error) {
      console.error('Error getting transactions from Firebase:', error);
      return [];
    }
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const doc = await this.getUserCollection('transactions').doc(transactionId).get();
      if (!doc.exists) return null;

      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data?.date?.toDate() || new Date(),
      } as Transaction;
    } catch (error) {
      console.error('Error getting transaction by ID from Firebase:', error);
      return null;
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    status: Transaction['status']
  ): Promise<void> {
    try {
      const FieldValue = this.getFieldValue();
      await this.getUserCollection('transactions').doc(transactionId).update({
        status,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating transaction status in Firebase:', error);
      throw error;
    }
  }

  // Investor Agreement
  async saveInvestorAgreement(agreement: InvestorAgreement): Promise<void> {
    try {
      const FieldValue = this.getFieldValue();
      await this.getFirestore()
        .collection('users')
        .doc(this.userId)
        .update({
          investorAgreement: {
            ...agreement,
            acceptedAt: FieldValue.serverTimestamp(),
          },
        });
    } catch (error) {
      console.error('Error saving investor agreement to Firebase:', error);
      throw error;
    }
  }

  async getInvestorAgreement(): Promise<InvestorAgreement | null> {
    try {
      const doc = await this.getFirestore().collection('users').doc(this.userId).get();
      const data = doc.data();

      if (!data?.investorAgreement) return null;

      return {
        ...data.investorAgreement,
        acceptedAt: data.investorAgreement.acceptedAt?.toDate(),
      } as InvestorAgreement;
    } catch (error) {
      console.error('Error getting investor agreement from Firebase:', error);
      return null;
    }
  }

  // Utility
  async setDefaultPaymentMethod(id: string, type: 'card' | 'bank'): Promise<void> {
    try {
      const collectionName = type === 'card' ? 'creditCards' : 'bankAccounts';
      const collection = this.getUserCollection(collectionName);

      // Get all documents
      const snapshot = await collection.get();

      // Create batch update
      const batch = this.getFirestore().batch();

      snapshot.docs.forEach((doc: any) => {
        batch.update(doc.ref, {
          isDefault: doc.id === id,
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error setting default payment method in Firebase:', error);
      throw error;
    }
  }
}
