import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { FirebaseWrapper } from '@/services/firebase/FirebaseWrapper';

export default function RootLayout() {
  useEffect(() => {
    // Configure Google Sign-In when Firebase is available (not on web)
    if (Platform.OS !== 'web' && FirebaseWrapper.isAvailable()) {
      // Dynamic import to prevent loading on web
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        webClientId: '253066400729-ci4vlbmo1mthqbgd7lt202r42lda9jom.apps.googleusercontent.com',
        offlineAccess: true,
      });
    }
  }, []);

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
