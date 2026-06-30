import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('keytone_token');
      if (!token) {
        setLoading(false);
        if (requireAuth) {
          router.push('/login');
        }
        return;
      }

      try {
        const userData = await api.get('/auth/me');
        setUser(userData);
        localStorage.setItem('keytone_user', JSON.stringify(userData));
      } catch (err) {
        console.error('Auth verification failed', err);
        localStorage.removeItem('keytone_token');
        localStorage.removeItem('keytone_user');
        if (requireAuth) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, requireAuth]);

  const logout = () => {
    localStorage.removeItem('keytone_token');
    localStorage.removeItem('keytone_user');
    setUser(null);
    router.push('/login');
  };

  return { user, loading, logout, setUser };
}
