/**
 * Authentication Context
 * Provides app-wide authentication state and methods
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, AuthUser } from '@/services/auth/AuthService';
import { PaymentService } from '@/services/ServiceFactory';
import { PropertyService } from '@/services/PropertyService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signInWithFacebook: (accessToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session and listen to auth state changes
    const unsubscribe = AuthService.onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);

      // Switch services to Firebase when user logs in
      if (authUser) {
        PaymentService.switchToFirebase(authUser.uid);
        PropertyService.initializeForUser(authUser.uid);
      } else {
        PaymentService.switchToLocal();
        PropertyService.reset();
      }
    });

    // Initial session restore
    AuthService.getCurrentAuthUser().then((authUser) => {
      setUser(authUser);
      setIsLoading(false);
      if (authUser) {
        PaymentService.switchToFirebase(authUser.uid);
        PropertyService.initializeForUser(authUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const authUser = await AuthService.signInWithEmail(email, password);
      setUser(authUser);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const authUser = await AuthService.signUpWithEmail(email, password);
      setUser(authUser);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (idToken: string) => {
    try {
      const authUser = await AuthService.signInWithGoogle(idToken);
      setUser(authUser);
    } catch (error) {
      throw error;
    }
  };

  const signInWithFacebook = async (accessToken: string) => {
    try {
      const authUser = await AuthService.signInWithFacebook(accessToken);
      setUser(authUser);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOutUser();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
