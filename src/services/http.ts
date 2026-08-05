import axios from 'axios';

export const localBase = 'http://localhost:8000/api';
export const resolvedBase =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? localBase
    : `${window.location.origin}/api`);

export const api = axios.create({
  baseURL: resolvedBase,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

export async function tryRefresh(): Promise<string | null> {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) return null;
  try {
    // Bare axios call: bypasses interceptors to avoid a refresh deadlock
    // (the refresh request must never retry itself).
    const { data } = await axios.post(`${resolvedBase}/v1/auth/refresh/`, { refresh });
    const access: string | undefined = data.access;
    if (!access) return null;
    localStorage.setItem('token', access);
    if (data.refresh) localStorage.setItem('refresh', data.refresh);
    return access;
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('waitly-auth-expired'));
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      localStorage.getItem('refresh')
    ) {
      original._retried = true;
      if (!refreshing) {
        refreshing = tryRefresh().finally(() => {
          refreshing = null;
        });
      }
      const access = await refreshing;
      if (access) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
