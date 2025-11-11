import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inAuthScreen = segments[0] === 'login' || segments[0] === 'register';

    if (!isAuthenticated && inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup && !inAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="transfer-ticket" />
        <Stack.Screen name="validate-ticket" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#000000" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
});