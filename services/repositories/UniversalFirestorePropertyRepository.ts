/**
 * Universal Firestore Property Repository
 * Works on both Web (Firebase JS SDK) and Native (React Native Firebase)
 * Provides real-time property data synchronization
 */

import { Property } from '@/types/property';
import { UniversalFirebaseWrapper } from '../firebase/UniversalFirebaseWrapper';
import { Platform } from 'react-native';

export class UniversalFirestorePropertyRepository {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Subscribe to real-time property updates
   * Returns unsubscribe function
   */
  subscribeToProperties(callback: (properties: Property[]) => void): () => void {
    try {
      const propertiesRef = UniversalFirebaseWrapper.collection('properties');

      return UniversalFirebaseWrapper.onSnapshot(
        propertiesRef,
        (snapshot: any) => {
          const properties: Property[] = this.mapSnapshotToProperties(snapshot);
          console.info(`✅ Loaded ${properties.length} properties from Firestore (Live)`);
          callback(properties);
        },
        (error: any) => {
          console.error('Error fetching properties from Firestore:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up properties listener:', error);
      callback([]);
      return () => {};
    }
  }

  /**
   * Subscribe to single property updates
   */
  subscribeToProperty(propertyId: string, callback: (property: Property | null) => void): () => void {
    try {
      const propertyRef = UniversalFirebaseWrapper.doc('properties', propertyId);

      return UniversalFirebaseWrapper.onSnapshot(
        propertyRef,
        (snapshot: any) => {
          if (Platform.OS === 'web') {
            // Web SDK
            if (snapshot.exists()) {
              const property: Property = {
                id: snapshot.id,
                ...snapshot.data(),
              } as Property;
              callback(property);
            } else {
              callback(null);
            }
          } else {
            // Native SDK
            if (snapshot.exists) {
              const data = snapshot.data();
              const property: Property = {
                id: snapshot.id,
                ...data,
              } as Property;
              callback(property);
            } else {
              callback(null);
            }
          }
        },
        (error: any) => {
          console.error('Error fetching property from Firestore:', error);
          callback(null);
        }
      );
    } catch (error) {
      console.error('Error setting up property listener:', error);
      callback(null);
      return () => {};
    }
  }

  /**
   * Get all properties (one-time fetch)
   */
  async getProperties(): Promise<Property[]> {
    try {
      const propertiesRef = UniversalFirebaseWrapper.collection('properties');

      if (Platform.OS === 'web') {
        const { getDocs } = require('firebase/firestore');
        const snapshot = await getDocs(propertiesRef);
        return this.mapSnapshotToProperties(snapshot);
      } else {
        const snapshot = await propertiesRef.get();
        return this.mapSnapshotToProperties(snapshot);
      }
    } catch (error) {
      console.error('Error fetching properties from Firestore:', error);
      return [];
    }
  }

  /**
   * Get property by ID (one-time fetch)
   */
  async getPropertyById(propertyId: string): Promise<Property | null> {
    try {
      const propertyRef = UniversalFirebaseWrapper.doc('properties', propertyId);

      if (Platform.OS === 'web') {
        const { getDoc } = require('firebase/firestore');
        const snapshot = await getDoc(propertyRef);

        if (snapshot.exists()) {
          return {
            id: snapshot.id,
            ...snapshot.data(),
          } as Property;
        }
      } else {
        const snapshot = await propertyRef.get();

        if (snapshot.exists) {
          return {
            id: snapshot.id,
            ...snapshot.data(),
          } as Property;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching property from Firestore:', error);
      return null;
    }
  }

  /**
   * Get user's invested properties
   */
  async getUserInvestedProperties(): Promise<Property[]> {
    try {
      // Get user's transactions to find invested property IDs
      const transactionsRef = UniversalFirebaseWrapper.collection(`users/${this.userId}/transactions`);

      let snapshot: any;
      if (Platform.OS === 'web') {
        const { getDocs, query, where } = require('firebase/firestore');
        const investmentQuery = query(transactionsRef, where('type', '==', 'investment'));
        snapshot = await getDocs(investmentQuery);
      } else {
        snapshot = await transactionsRef.where('type', '==', 'investment').get();
      }

      // Extract unique property IDs
      const propertyIds = new Set<string>();
      snapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        if (data.propertyId) {
          propertyIds.add(data.propertyId);
        }
      });

      // Fetch properties for each ID
      const properties: Property[] = [];
      for (const propertyId of Array.from(propertyIds)) {
        const property = await this.getPropertyById(propertyId);
        if (property) {
          properties.push(property);
        }
      }

      return properties;
    } catch (error) {
      console.error('Error fetching user invested properties from Firestore:', error);
      return [];
    }
  }

  /**
   * Map Firestore snapshot to Property array (universal)
   */
  private mapSnapshotToProperties(snapshot: any): Property[] {
    const properties: Property[] = [];

    if (Platform.OS === 'web') {
      // Web SDK
      snapshot.forEach((doc: any) => {
        properties.push({
          id: doc.id,
          ...doc.data(),
        } as Property);
      });
    } else {
      // Native SDK
      snapshot.docs.forEach((doc: any) => {
        properties.push({
          id: doc.id,
          ...doc.data(),
        } as Property);
      });
    }

    return properties;
  }

  /**
   * Create or update a property (admin function)
   */
  async saveProperty(property: Property): Promise<void> {
    try {
      const FieldValue = UniversalFirebaseWrapper.getFieldValue();
      const propertyRef = UniversalFirebaseWrapper.doc('properties', property.id);

      if (Platform.OS === 'web') {
        const { setDoc } = require('firebase/firestore');
        await setDoc(propertyRef, {
          ...property,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        await propertyRef.set({
          ...property,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      console.info(`✅ Property ${property.id} saved to Firestore`);
    } catch (error) {
      console.error('Error saving property to Firestore:', error);
      throw error;
    }
  }

  /**
   * Update property funding progress (when investments are made)
   */
  async updatePropertyFunding(propertyId: string, investmentAmount: number): Promise<void> {
    try {
      const FieldValue = UniversalFirebaseWrapper.getFieldValue();
      const propertyRef = UniversalFirebaseWrapper.doc('properties', propertyId);

      if (Platform.OS === 'web') {
        const { updateDoc } = require('firebase/firestore');
        await updateDoc(propertyRef, {
          currentFunding: FieldValue.increment(investmentAmount),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        await propertyRef.update({
          currentFunding: FieldValue.increment(investmentAmount),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      console.info(`✅ Property ${propertyId} funding updated: +$${investmentAmount}`);
    } catch (error) {
      console.error('Error updating property funding in Firestore:', error);
      throw error;
    }
  }
}
