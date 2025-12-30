/**
 * Firebase Initialization Service
 * Handles Firebase setup and authentication
 */

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';

export class FirebaseService {
  private static initialized = false;
  private static currentUser: any = null;

  /**
   * Initialize Firebase
   * This will be called automatically when the app starts
   */
  static async initialize(): Promise<boolean> {
    if (this.initialized) {
      console.log('Firebase already initialized');
      return true;
    }

    try {
      // Check if Firebase is configured
      const apps = firebase.apps;

      if (apps.length === 0) {
        console.warn('Firebase not configured. Please add google-services.json (Android) or GoogleService-Info.plist (iOS)');
        return false;
      }

      console.log('Firebase initialized successfully');
      this.initialized = true;

      // Set up auth state listener
      auth().onAuthStateChanged((user: any) => {
        this.currentUser = user;
        console.log('Auth state changed:', user ? user.uid : 'No user');
      });

      return true;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return false;
    }
  }

  /**
   * Check if Firebase is available
   */
  static isAvailable(): boolean {
    return this.initialized && firebase.apps.length > 0;
  }

  /**
   * Get current user
   */
  static getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get current user ID
   */
  static getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }

  /**
   * Sign in with email/password
   */
  static async signIn(email: string, password: string): Promise<any> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  /**
   * Create user with email/password
   */
  static async signUp(email: string, password: string, name: string): Promise<any> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      // Update profile with name
      await userCredential.user.updateProfile({
        displayName: name,
      });

      // Create user document in Firestore
      await firestore().collection('users').doc(userCredential.user.uid).set({
        email,
        name,
        createdAt: firestore.FieldValue.serverTimestamp(),
        kycVerified: false,
        totalInvested: 0,
        portfolioValue: 0,
      });

      this.currentUser = userCredential.user;
      return userCredential.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      await auth().signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
}

// Note: Firebase auto-initialization has been moved to FirebaseWrapper
// This service is kept for backward compatibility but initialization
// is now handled lazily through FirebaseWrapper.isAvailable()
