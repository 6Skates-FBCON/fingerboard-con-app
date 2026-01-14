import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const [isRecovery, setIsRecovery] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);
  const [isBrowsingMode, setIsBrowsingMode] = useState<boolean | null>(null);

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

    const checkBrowsingMode = async () => {
      try {
        const mode = await AsyncStorage.getItem('browsing_mode');
        setIsBrowsingMode(mode === 'true');
      } catch (error) {
        console.error('Error checking browsing mode:', error);
        setIsBrowsingMode(false);
      }
    };

    checkRecoveryMode();
    checkBrowsingMode();
  }, []);

  if (loading || checkingRecovery || isBrowsingMode === null) {
    return null;
  }

  if (isRecovery) {
    return <Redirect href="/reset-password" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  if (isBrowsingMode) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/welcome" />;
}
