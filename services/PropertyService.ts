/**
 * Property Service
 * Provides property data with real-time Firebase sync when available
 * Universal support for both web and native platforms
 */

import { Property } from '@/types/property';
import { mockProperties } from '@/data/mockProperties';
import { UniversalFirebaseWrapper } from './firebase/UniversalFirebaseWrapper';
import { UniversalFirestorePropertyRepository } from './repositories/UniversalFirestorePropertyRepository';

export class PropertyService {
  private static firestoreRepo: UniversalFirestorePropertyRepository | null = null;

  /**
   * Initialize Firestore repository if Firebase is available
   */
  static initializeForUser(userId: string) {
    if (UniversalFirebaseWrapper.isAvailable()) {
      this.firestoreRepo = new UniversalFirestorePropertyRepository(userId);
      console.info('☁️  Property Service: Firestore repository initialized');
    } else {
      console.info('📱 Property Service: Using mock data (Firebase not available)');
      this.firestoreRepo = null;
    }
  }

  /**
   * Reset repository (on logout)
   */
  static reset() {
    this.firestoreRepo = null;
  }

  /**
   * Get properties (Firestore if available, otherwise mock data)
   */
  static async getProperties(): Promise<Property[]> {
    if (this.firestoreRepo) {
      try {
        const properties = await this.firestoreRepo.getProperties();
        // If Firestore has properties, use them; otherwise fall back to mock
        return properties.length > 0 ? properties : mockProperties;
      } catch (error) {
        console.error('Error fetching from Firestore, using mock data:', error);
        return mockProperties;
      }
    }
    return mockProperties;
  }

  /**
   * Get property by ID
   */
  static async getPropertyById(propertyId: string): Promise<Property | null> {
    if (this.firestoreRepo) {
      try {
        return await this.firestoreRepo.getPropertyById(propertyId);
      } catch (error) {
        console.error('Error fetching property from Firestore:', error);
      }
    }
    // Fallback to mock data
    return mockProperties.find((p) => p.id === propertyId) || null;
  }

  /**
   * Subscribe to real-time property updates (Live)
   * Returns unsubscribe function
   */
  static subscribeToProperties(callback: (properties: Property[]) => void): () => void {
    if (this.firestoreRepo) {
      console.info('📡 Subscribing to live property updates from Firestore...');
      return this.firestoreRepo.subscribeToProperties((properties: Property[]) => {
        // If Firestore has properties, use them; otherwise fall back to mock
        callback(properties.length > 0 ? properties : mockProperties);
      });
    }

    // If no Firestore, just call callback with mock data once
    console.info('📱 Using mock property data (Firestore not available)');
    callback(mockProperties);
    return () => {}; // No-op unsubscribe
  }

  /**
   * Subscribe to single property updates (Live)
   */
  static subscribeToProperty(propertyId: string, callback: (property: Property | null) => void): () => void {
    if (this.firestoreRepo) {
      console.info(`📡 Subscribing to live updates for property ${propertyId}...`);
      return this.firestoreRepo.subscribeToProperty(propertyId, callback);
    }

    // Fallback to mock data
    const property = mockProperties.find((p) => p.id === propertyId) || null;
    callback(property);
    return () => {}; // No-op unsubscribe
  }

  /**
   * Get user's invested properties
   */
  static async getUserInvestedProperties(): Promise<Property[]> {
    if (this.firestoreRepo) {
      try {
        return await this.firestoreRepo.getUserInvestedProperties();
      } catch (error) {
        console.error('Error fetching user invested properties:', error);
      }
    }
    return [];
  }

  /**
   * Update property funding after investment
   */
  static async updatePropertyFunding(propertyId: string, investmentAmount: number): Promise<void> {
    if (this.firestoreRepo) {
      try {
        await this.firestoreRepo.updatePropertyFunding(propertyId, investmentAmount);
      } catch (error) {
        console.error('Error updating property funding:', error);
        throw error;
      }
    }
  }
}
