export interface CreditCard {
  id: string;
  cardholderName: string;
  cardNumber: string; // Last 4 digits only for security
  expiryMonth: string;
  expiryYear: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover';
  isDefault: boolean;
  createdAt: Date;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountType: 'checking' | 'savings';
  accountNumberLast4: string;
  routingNumber?: string; // US
  iban?: string; // International
  swift?: string; // International
  verificationStatus: 'pending' | 'verified' | 'failed';
  isDefault: boolean;
  createdAt: Date;
}

export type PaymentMethod = CreditCard | BankAccount;

export interface Transaction {
  id: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethodId: string;
  paymentMethodType: 'card' | 'bank';
  date: Date;
  certificateUrl?: string;
  expectedROI?: number;
}

export interface InvestorAgreement {
  id: string;
  version: string;
  content: string;
  acceptedAt?: Date;
  accepted: boolean;
}
