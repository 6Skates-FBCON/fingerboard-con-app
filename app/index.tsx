import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = urlParams.get('type') || hashParams.get('type');
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');

        console.log('Recovery check - type:', type, 'accessToken:', accessToken ? 'present' : 'none');

        if (type === 'recovery' && accessToken) {
          console.log('Detected recovery token in URL');
          setIsRecovery(true);
          setCheckingRecovery(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session check:', session?.user ? 'user present' : 'no user');

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
