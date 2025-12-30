/**
 * Property Service
 * Provides property data with real-time Firebase sync when available
 */

import { Property } from '@/types/property';
import { FirebasePropertyRepository } from './repositories/FirebasePropertyRepository';
import { mockProperties } from '@/data/mockProperties';
import { AuthService } from './auth/AuthService';

export class PropertyService {
  private static firebaseRepo: FirebasePropertyRepository | null = null;

  /**
   * Initialize Firebase repository if user is authenticated
   */
  static initializeForUser(userId: string) {
    this.firebaseRepo = new FirebasePropertyRepository(userId);
  }

  /**
   * Reset repository (on logout)
   */
  static reset() {
    this.firebaseRepo = null;
  }

  /**
   * Get properties (Firebase if available, otherwise mock data)
   */
  static async getProperties(): Promise<Property[]> {
    if (this.firebaseRepo) {
      try {
        const properties = await this.firebaseRepo.getProperties();
        // If Firebase has properties, use them; otherwise fall back to mock
        return properties.length > 0 ? properties : mockProperties;
      } catch (error) {
        console.error('Error fetching from Firebase, using mock data:', error);
        return mockProperties;
      }
    }
    return mockProperties;
  }

  /**
   * Get property by ID
   */
  static async getPropertyById(propertyId: string): Promise<Property | null> {
    if (this.firebaseRepo) {
      try {
        return await this.firebaseRepo.getPropertyById(propertyId);
      } catch (error) {
        console.error('Error fetching property from Firebase:', error);
      }
    }
    // Fallback to mock data
    return mockProperties.find((p) => p.id === propertyId) || null;
  }

  /**
   * Subscribe to real-time property updates
   * Returns unsubscribe function
   */
  static subscribeToProperties(callback: (properties: Property[]) => void): () => void {
    if (this.firebaseRepo) {
      return this.firebaseRepo.subscribeToProperties((properties) => {
        // If Firebase has properties, use them; otherwise fall back to mock
        callback(properties.length > 0 ? properties : mockProperties);
      });
    }

    // If no Firebase, just call callback with mock data once
    callback(mockProperties);
    return () => {}; // No-op unsubscribe
  }

  /**
   * Subscribe to single property updates
   */
  static subscribeToProperty(propertyId: string, callback: (property: Property | null) => void): () => void {
    if (this.firebaseRepo) {
      return this.firebaseRepo.subscribeToProperty(propertyId, callback);
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
    if (this.firebaseRepo) {
      try {
        return await this.firebaseRepo.getUserInvestedProperties();
      } catch (error) {
        console.error('Error fetching user invested properties:', error);
      }
    }
    return [];
  }
}
