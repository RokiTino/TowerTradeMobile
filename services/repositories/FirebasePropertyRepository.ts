/**
 * Firebase Property Repository
 * Handles property data operations with Firebase Firestore
 */

import firestore from '@react-native-firebase/firestore';
import { Property } from '@/types/property';

export class FirebasePropertyRepository {
  private userId: string;
  private firestore = firestore();

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Subscribe to real-time property updates
   */
  subscribeToProperties(callback: (properties: Property[]) => void): () => void {
    const unsubscribe = this.firestore
      .collection('properties')
      .onSnapshot(
        (snapshot) => {
          const properties: Property[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as Property));
          callback(properties);
        },
        (error) => {
          console.error('Error fetching properties:', error);
          callback([]);
        }
      );

    return unsubscribe;
  }

  /**
   * Get all properties
   */
  async getProperties(): Promise<Property[]> {
    try {
      const snapshot = await this.firestore.collection('properties').get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Property));
    } catch (error) {
      console.error('Error getting properties:', error);
      return [];
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(propertyId: string): Promise<Property | null> {
    try {
      const doc = await this.firestore.collection('properties').doc(propertyId).get();
      if (doc.exists()) {
        return { id: doc.id, ...doc.data() } as Property;
      }
      return null;
    } catch (error) {
      console.error('Error getting property:', error);
      return null;
    }
  }

  /**
   * Subscribe to single property real-time updates
   */
  subscribeToProperty(propertyId: string, callback: (property: Property | null) => void): () => void {
    const unsubscribe = this.firestore
      .collection('properties')
      .doc(propertyId)
      .onSnapshot(
        (doc) => {
          if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() } as Property);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error fetching property:', error);
          callback(null);
        }
      );

    return unsubscribe;
  }

  /**
   * Update property funding progress (admin function - for demo purposes)
   */
  async updatePropertyFunding(propertyId: string, newRaisedAmount: number): Promise<void> {
    try {
      await this.firestore.collection('properties').doc(propertyId).update({
        raisedAmount: newRaisedAmount,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating property funding:', error);
      throw error;
    }
  }

  /**
   * Get user's invested properties
   */
  async getUserInvestedProperties(): Promise<Property[]> {
    try {
      // Get user's transactions to find invested properties
      const transactionsSnapshot = await this.firestore
        .collection('users')
        .doc(this.userId)
        .collection('transactions')
        .where('status', '==', 'completed')
        .get();

      const propertyIds = new Set<string>();
      transactionsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.propertyId) {
          propertyIds.add(data.propertyId);
        }
      });

      if (propertyIds.size === 0) {
        return [];
      }

      // Fetch property details
      const properties: Property[] = [];
      for (const propertyId of Array.from(propertyIds)) {
        const property = await this.getPropertyById(propertyId);
        if (property) {
          properties.push(property);
        }
      }

      return properties;
    } catch (error) {
      console.error('Error getting user invested properties:', error);
      return [];
    }
  }
}
