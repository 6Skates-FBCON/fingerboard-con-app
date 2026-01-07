import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const [isRecovery, setIsRecovery] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);

  useEffect(() => {
    const checkRecoveryMode = async () => {
      if (!supabase) {
        setCheckingRecovery(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = urlParams.get('type') || hashParams.get('type');

        if (type === 'recovery' || session?.user?.aud === 'authenticated') {
          const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
          if (accessToken) {
            setIsRecovery(true);
          }
        }
      } catch (error) {
        console.error('Error checking recovery mode:', error);
      } finally {
        setCheckingRecovery(false);
      }
    };

    checkRecoveryMode();
  }, []);

  if (loading || checkingRecovery) {
    return null;
  }

  if (isRecovery) {
    return <Redirect href="/reset-password" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
