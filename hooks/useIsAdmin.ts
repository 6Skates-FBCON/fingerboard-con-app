import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAdminStatus() {
      if (!supabase || !user) {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (mounted) {
          if (error) {
            console.error('Error fetching admin status:', error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.role === 'admin');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    }

    if (authLoading) {
      setLoading(true);
    } else {
      checkAdminStatus();
    }

    return () => {
      mounted = false;
    };
  }, [user, authLoading]);

  return { isAdmin, loading };
}
