import { api } from './http';

export const adminAPI = {
  getSuperAdminStats: () => api.get('/admin/stats/super/'),
  getDashboard: () => api.get('/admin/dashboard/'),
  getChains: () => api.get('/admin/chains/'),
  getRestaurants: () => api.get('/admin/restaurants/'),
  getOwners: () => api.get('/admin/owners/'),
  createOwner: (payload: { full_name: string; phone_number: string; email?: string; role: string }) =>
    api.post('/admin/owners/create/', payload),
  updateOwner: (ownerId: string, payload: { full_name: string; email?: string; role: string; is_active?: boolean }) =>
    api.put(`/admin/owners/${ownerId}/`, payload),
  deleteOwner: (ownerId: string) => api.delete(`/admin/owners/${ownerId}/`),
  deleteChain: (chainId: string) => api.delete(`/admin/chains/${chainId}/`),
  deleteRestaurant: (restaurantId: string) => api.delete(`/admin/restaurants/${restaurantId}/`),
  getKeys: () => api.get('/admin/keys/'),
  generateKey: (payload: { duration_months: number; count?: number }) => api.post('/admin/keys/generate/', payload),
  revokeKey: (keyId: string) => api.delete(`/admin/keys/${keyId}/revoke/`),
};
