import { api } from './http';

export type AppUserRole = 'SUPER_ADMIN' | 'CHAIN_OWNER' | 'RESTAURANT_OWNER' | string;

export interface AppUser {
  id: string;
  full_name: string;
  role: AppUserRole;
  email?: string;
  phone_number?: string;
  restaurant?: string | null;
  is_active?: boolean;
  created_at?: string;
  telegram_linked?: boolean;
  telegram_username?: string;
  telegram_auth_enabled?: boolean;
  google_linked?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
  user: AppUser;
}

export const authAPI = {
  loginWithPassword: (payload: { phone_number: string; password: string }) => api.post<AuthResponse>('/auth/login/', payload),
  loginWithTelegramMiniApp: (payload: { initData: string }) => api.post<AuthResponse & { telegram_user: { id: number; username: string; first_name: string } }>('/v1/auth/telegram/', payload),
  sendOtp: (payload: { email: string }) => api.post('/auth/otp/send/', payload),
  verifyOtp: (payload: { email: string; code: string }) => api.post<AuthResponse>('/auth/otp/verify/', payload),
  setPassword: (payload: { identifier: string; code: string; new_password: string }) => api.post<AuthResponse>('/auth/password/set/', payload),
  getCurrentUser: () => api.get<AppUser>('/auth/users/me/'),
  googleLogin: (payload: { credential: string }) => api.post<AuthResponse>('/auth/google/', payload),
  registerGoogle: (payload: { credential: string; phone_number: string; full_name?: string }) => api.post<AuthResponse>('/auth/register_google/', payload),
  linkGoogle: (payload: { credential: string }) => api.post<AppUser>('/auth/google/link/', payload),
  register: (payload: { full_name: string; phone_number: string; email?: string; password: string; password_confirm: string }) => api.post<AuthResponse>('/auth/register/', payload),
  onboarding: (payload: { chain_name: string; restaurant_name: string; staff_bot_token?: string; onboarding_answers?: Record<string, any> }) =>
    api.post<{ chain: { id: string; name: string; subdomain: string }; restaurant: any }>('/auth/onboarding/', payload),
};

export const userAPI = {
  list: () => api.get('/auth/users/'),
};
