import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI, type AppUser, type AuthResponse } from '@/services/api';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  loginWithPassword: (payload: { phone_number: string; password: string }) => Promise<AuthResponse>;
  sendOtp: (email: string) => Promise<any>;
  verifyOtp: (payload: { email: string; code: string }) => Promise<AuthResponse>;
  setPassword: (payload: { identifier: string; code: string; new_password: string }) => Promise<AuthResponse>;
  replaceUser: (nextUser: AppUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistAuth(response: AuthResponse) {
  localStorage.setItem('token', response.access);
  if (response.refresh) {
    localStorage.setItem('refresh', response.refresh);
  }
  localStorage.setItem('user', JSON.stringify(response.user));
}

function persistUser(user: AppUser) {
  localStorage.setItem('user', JSON.stringify(user));
}

const DEMO_USER: AppUser = {
  id: 'demo-user-id',
  full_name: 'Демо Владелец',
  phone_number: '+998901234567',
  email: 'owner@waitly.uz',
  role: 'SUPER_ADMIN',
  restaurant_id: 'demo-pos',
  restaurant_slug: 'demo-pos',
  restaurant_name: 'Демо Заведение Waitly',
  is_active: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(DEMO_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (!token || !savedUser) {
        if (mounted) {
          setUser(DEMO_USER);
          setLoading(false);
        }
        return;
      }

      try {
        const parsed = JSON.parse(savedUser) as AppUser;
        if (mounted) {
          setUser(parsed);
          setLoading(false);
        }
        const response = await Promise.race([
          authAPI.getCurrentUser(),
          new Promise<never>((_, rej) => setTimeout(() => rej(new Error('auth timeout')), 2500)),
        ]) as any;
        const mergedUser = { ...parsed, ...response.data };
        persistUser(mergedUser);
        if (mounted) setUser(mergedUser);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          if (mounted) setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      loginWithPassword: async (payload) => {
        const response = await authAPI.loginWithPassword(payload);
        persistAuth(response.data);
        setUser(response.data.user);
        return response.data;
      },
      sendOtp: async (email) => {
        const response = await authAPI.sendOtp({ email });
        return response.data;
      },
      verifyOtp: async (payload) => {
        const response = await authAPI.verifyOtp(payload);
        persistAuth(response.data);
        setUser(response.data.user);
        return response.data;
      },
      setPassword: async (payload) => {
        const response = await authAPI.setPassword(payload);
        persistAuth(response.data);
        setUser(response.data.user);
        return response.data;
      },
      replaceUser: (nextUser) => {
        persistUser(nextUser);
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        localStorage.removeItem('waitly-onboarding-complete');
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
