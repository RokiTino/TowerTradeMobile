import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditCard, BankAccount, Transaction, InvestorAgreement } from '@/types/payment';

const STORAGE_KEYS = {
  CREDIT_CARDS: '@towertrade:credit_cards',
  BANK_ACCOUNTS: '@towertrade:bank_accounts',
  TRANSACTIONS: '@towertrade:transactions',
  INVESTOR_AGREEMENT: '@towertrade:investor_agreement',
  INVESTMENTS: '@towertrade:investments',
};

// Credit Cards
export const saveCreditCard = async (card: CreditCard): Promise<void> => {
  try {
    const existingCards = await getCreditCards();
    const updatedCards = [...existingCards, card];
    await AsyncStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(updatedCards));
  } catch (error) {
    console.error('Error saving credit card:', error);
    throw error;
  }
};

export const getCreditCards = async (): Promise<CreditCard[]> => {
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
};

export const deleteCreditCard = async (cardId: string): Promise<void> => {
  try {
    const cards = await getCreditCards();
    const updatedCards = cards.filter((card) => card.id !== cardId);
    await AsyncStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(updatedCards));
  } catch (error) {
    console.error('Error deleting credit card:', error);
    throw error;
  }
};

// Bank Accounts
export const saveBankAccount = async (account: BankAccount): Promise<void> => {
  try {
    const existingAccounts = await getBankAccounts();
    const updatedAccounts = [...existingAccounts, account];
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(updatedAccounts));
  } catch (error) {
    console.error('Error saving bank account:', error);
    throw error;
  }
};

export const getBankAccounts = async (): Promise<BankAccount[]> => {
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
};

export const deleteBankAccount = async (accountId: string): Promise<void> => {
  try {
    const accounts = await getBankAccounts();
    const updatedAccounts = accounts.filter((account) => account.id !== accountId);
    await AsyncStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(updatedAccounts));
  } catch (error) {
    console.error('Error deleting bank account:', error);
    throw error;
  }
};

// Transactions
export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    const existingTransactions = await getTransactions();
    const updatedTransactions = [transaction, ...existingTransactions];
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
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
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: Transaction['status']
): Promise<void> => {
  try {
    const transactions = await getTransactions();
    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === transactionId ? { ...transaction, status } : transaction
    );
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

// Investor Agreement
export const saveInvestorAgreement = async (agreement: InvestorAgreement): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.INVESTOR_AGREEMENT, JSON.stringify(agreement));
  } catch (error) {
    console.error('Error saving investor agreement:', error);
    throw error;
  }
};

export const getInvestorAgreement = async (): Promise<InvestorAgreement | null> => {
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
};

// Utility: Set default payment method
export const setDefaultPaymentMethod = async (
  id: string,
  type: 'card' | 'bank'
): Promise<void> => {
  try {
    if (type === 'card') {
      const cards = await getCreditCards();
      const updatedCards = cards.map((card) => ({
        ...card,
        isDefault: card.id === id,
      }));
      await AsyncStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(updatedCards));
    } else {
      const accounts = await getBankAccounts();
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
};
