import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { Platform, ActivityIndicator, View, StyleSheet, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { SupabaseService } from '@/services/supabase/SupabaseClient';
import { Colors } from '@/constants/Theme';

export default function RootLayout() {
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize Supabase for all platforms (web + native)
    const initializeSupabase = async () => {
      try {
        console.info('🚀 Initializing Supabase Client...');
        const success = await SupabaseService.initialize();

        if (success) {
          console.info('✅ Supabase initialized successfully');
        } else {
          console.warn('⚠️  Supabase initialization failed');
        }

        setSupabaseInitialized(true);
      } catch (error) {
        console.error('❌ Supabase initialization error:', error);
        setSupabaseInitialized(true); // Allow app to continue
      }
    };

    initializeSupabase();

    // Handle deep links for mobile OAuth callback
    if (Platform.OS !== 'web') {
      const handleDeepLink = (event: { url: string }) => {
        console.info('🔗 Deep link received:', event.url);

        // Parse the deep link URL
        const url = event.url;

        // Handle OAuth callback deep link: towertrade://auth/callback
        if (url.includes('auth/callback')) {
          console.info('✅ OAuth callback deep link detected, navigating to callback screen');
          // Navigate to the callback route
          router.push('/(auth)/callback');
        }
      };

      // Listen for deep links
      const subscription = Linking.addEventListener('url', handleDeepLink);

      // Check if app was opened via deep link
      Linking.getInitialURL().then((url) => {
        if (url) {
          console.info('🔗 App opened with deep link:', url);
          handleDeepLink({ url });
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, [router]);

  // Show premium loading state while Supabase initializes
  if (!supabaseInitialized) {
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
