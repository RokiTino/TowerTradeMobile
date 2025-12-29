/**
 * Property Repository Interface
 * Defines the contract for property data operations across different backends
 */

import { Property } from '@/types/property';

export interface IPropertyRepository {
  // Properties
  getAllProperties(): Promise<Property[]>;
  getPropertyById(propertyId: string): Promise<Property | null>;
  searchProperties(query: string): Promise<Property[]>;
  getPropertiesByType(type: string): Promise<Property[]>;

  // Investments (User's portfolio)
  getUserInvestments(userId: string): Promise<Property[]>;
  addUserInvestment(userId: string, propertyId: string, amount: number): Promise<void>;

  // Property Updates (for admin/future features)
  updateProperty(property: Property): Promise<void>;
  updatePropertyFunding(propertyId: string, newAmount: number): Promise<void>;
}
