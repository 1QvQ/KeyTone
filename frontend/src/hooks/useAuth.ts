/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('keytone_token');
    if (!token) {
      setLoading(false);
      if (requireAuth) {
        router.push('/login');
      }
      return;
    }

    const cached = localStorage.getItem('keytone_user');
    if (cached) {
      try {
        setUser(JSON.parse(cached) as User);
      } catch {}
    }

    setLoading(false);
  }, [router, requireAuth]);

  const logout = () => {
    localStorage.removeItem('keytone_token');
    localStorage.removeItem('keytone_user');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, logout, setUser };
}
