import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    if (!supabase) return 'user';

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }

      return (data?.role as UserRole) || 'user';
    } catch (err) {
      console.error('Error fetching user role:', err);
      return 'user';
    }
  };

  useEffect(() => {
    let mounted = true;

    if (!supabase) {
      if (mounted) {
        setLoading(false);
      }
      return;
    }

    loadingTimeoutRef.current = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - forcing completion');
        setLoading(false);
      }
    }, 3000);

    const initAuth = async () => {
      if (!supabase) {
        setLoading(false);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        return;
      }

      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 2000)
        );

        const { data: { session } } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id);
          if (mounted) {
            setRole(userRole);
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
        }
      }
    };

    initAuth();

    if (!supabase) {
      return () => {
        mounted = false;
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id);
          if (mounted) {
            setRole(userRole);
          }
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      mounted = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    role,
    loading,
    isAuthenticated: !!user,
  };
}