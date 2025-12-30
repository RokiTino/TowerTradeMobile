/**
 * Firebase Implementation of Payment Repository
 * Uses Firebase Firestore for cloud-based data persistence
 */

import firestore from '@react-native-firebase/firestore';
import { IPaymentRepository } from './IPaymentRepository';
import { CreditCard, BankAccount, Transaction, InvestorAgreement } from '@/types/payment';

export class FirebasePaymentRepository implements IPaymentRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Helper to get user-specific collection reference
  private getUserCollection(collectionName: string) {
    return firestore().collection('users').doc(this.userId).collection(collectionName);
  }

  // Credit Cards
  async saveCreditCard(card: CreditCard): Promise<void> {
    try {
      await this.getUserCollection('creditCards').doc(card.id).set({
        ...card,
        createdAt: firestore.FieldValue.serverTimestamp(),
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

      return snapshot.docs.map((doc) => {
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
      await this.getUserCollection('bankAccounts').doc(account.id).set({
        ...account,
        createdAt: firestore.FieldValue.serverTimestamp(),
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

      return snapshot.docs.map((doc) => {
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
      await this.getUserCollection('transactions').doc(transaction.id).set({
        ...transaction,
        date: firestore.FieldValue.serverTimestamp(),
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

      return snapshot.docs.map((doc) => {
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
      await this.getUserCollection('transactions').doc(transactionId).update({
        status,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating transaction status in Firebase:', error);
      throw error;
    }
  }

  // Investor Agreement
  async saveInvestorAgreement(agreement: InvestorAgreement): Promise<void> {
    try {
      await firestore()
        .collection('users')
        .doc(this.userId)
        .update({
          investorAgreement: {
            ...agreement,
            acceptedAt: firestore.FieldValue.serverTimestamp(),
          },
        });
    } catch (error) {
      console.error('Error saving investor agreement to Firebase:', error);
      throw error;
    }
  }

  async getInvestorAgreement(): Promise<InvestorAgreement | null> {
    try {
      const doc = await firestore().collection('users').doc(this.userId).get();
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
      const batch = firestore().batch();

      snapshot.docs.forEach((doc) => {
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
