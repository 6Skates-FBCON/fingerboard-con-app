import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const { loading } = useAuth();
  const [isRecovery, setIsRecovery] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);

  useEffect(() => {
    const checkRecoveryMode = async () => {
      if (!supabase) {
        setCheckingRecovery(false);
        return;
      }

      try {
        if (Platform.OS !== 'web') {
          setCheckingRecovery(false);
          return;
        }

        const search = window.location?.search ?? '';
        const hash = window.location?.hash ?? '';
        const urlParams = new URLSearchParams(search);
        const hashParams = new URLSearchParams(hash.substring(1));
        const type = urlParams.get('type') || hashParams.get('type');
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');

        if (type === 'recovery' && accessToken) {
          setIsRecovery(true);
          setCheckingRecovery(false);
          return;
        }

        await supabase.auth.getSession();

      } catch (error) {
        console.error('Error checking recovery mode:', error);
      } finally {
        setCheckingRecovery(false);
      }
    };

    checkRecoveryMode();
  }, []);

  if (loading || checkingRecovery) {
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
