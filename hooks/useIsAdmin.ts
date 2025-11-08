import { useAuth } from './useAuth';

export function useIsAdmin(): { isAdmin: boolean; loading: boolean } {
  const { role, loading } = useAuth();

  return {
    isAdmin: role === 'admin',
    loading
  };
}
