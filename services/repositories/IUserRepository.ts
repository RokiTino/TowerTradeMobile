/**
 * User Repository Interface
 * Defines the contract for user data operations across different backends
 */

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  kycVerified: boolean;
  totalInvested: number;
  portfolioValue: number;
}

export interface IUserRepository {
  // User Management
  getUserById(userId: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<void>;

  // User Stats
  updateUserStats(userId: string, totalInvested: number, portfolioValue: number): Promise<void>;

  // KYC
  updateKYCStatus(userId: string, verified: boolean): Promise<void>;
}
