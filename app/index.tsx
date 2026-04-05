import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';

export default function Index() {
  const { loading } = useAuth();
  const [isRecovery, setIsRecovery] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, 4000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setCheckingRecovery(false);
      return;
    }

    try {
      const search = window.location?.search ?? '';
      const hash = window.location?.hash ?? '';
      const urlParams = new URLSearchParams(search);
      const hashParams = new URLSearchParams(hash.substring(1));
      const type = urlParams.get('type') || hashParams.get('type');
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');

      if (type === 'recovery' && accessToken) {
        setIsRecovery(true);
      }
    } catch (error) {
      console.error('Error checking recovery mode:', error);
    } finally {
      setCheckingRecovery(false);
    }
  }, []);

  const isLoading = (loading || checkingRecovery) && !timedOut;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (isRecovery) {
    return <Redirect href="/reset-password" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});
