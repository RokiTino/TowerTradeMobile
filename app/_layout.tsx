import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Platform, ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { UniversalFirebaseWrapper } from '@/services/firebase/UniversalFirebaseWrapper';
import { Colors } from '@/constants/Theme';

export default function RootLayout() {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    // Initialize Firebase for all platforms (web + native)
    const initializeFirebase = async () => {
      try {
        console.info('🚀 Initializing Firebase Universal Wrapper...');
        const success = await UniversalFirebaseWrapper.initialize();

        if (success) {
          console.info('✅ Firebase initialized successfully');
        } else {
          console.warn('⚠️  Firebase initialization failed, falling back to Local Mode');
        }

        setFirebaseInitialized(true);
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        setFirebaseInitialized(true); // Allow app to continue in Local Mode
      }
    };

    initializeFirebase();
  }, []);

  // Show premium loading state while Firebase initializes
  if (!firebaseInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.towerGold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="property" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.pureWhite,
  },
});
