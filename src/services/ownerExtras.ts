import { api } from './http';

// ── Modifiers (coffee shop customization) ──
export const modifierAPI = {
  getGroups: (restaurantId: string) =>
    api.get('/menu/modifier-groups/', { params: { restaurant_id: restaurantId } }),
  createGroup: (payload: { restaurant_id: string; name: string; is_required?: boolean; max_options?: number }) =>
    api.post('/menu/modifier-groups/', payload),
  deleteGroup: (id: string) => api.delete(`/menu/modifier-groups/${id}/`),
  createOption: (payload: { group_id: string; name: string; price_modifier?: number; is_default?: boolean }) =>
    api.post('/menu/modifier-options/', payload),
  deleteOption: (id: string) => api.delete(`/menu/modifier-options/${id}/`),
  getDishModifiers: (dishId: string) =>
    api.get(`/menu/dishes/${dishId}/modifiers/`),
  setDishModifiers: (dishId: string, payload: { group_ids: string[] }) =>
    api.post(`/menu/dishes/${dishId}/modifiers/`, payload),
};

export const expenseAPI = {
  list: (params: { restaurant_id?: string; category?: string; date_from?: string; date_to?: string }) =>
    api.get('/v1/owner/expenses/', { params }),
  create: (payload: { restaurant_id: string; category: string; amount: number; notes?: string; date?: string }) =>
    api.post('/v1/owner/expenses/', payload),
  delete: (id: string) => api.delete(`/v1/owner/expenses/${id}/`),
  stats: (restaurantId: string) =>
    api.get('/v1/owner/expenses/stats/', { params: { restaurant_id: restaurantId } }),
};

export const paymentSettingsAPI = {
  get: (restaurantId: string) =>
    api.get('/v1/owner/payment-settings/', { params: { restaurant_id: restaurantId } }),
  update: (payload: {
    restaurant_id: string; inn?: string;
    payme_merchant_id?: string; payme_key?: string; payme_test_key?: string; payme_test_mode?: boolean;
    uzkassa_login?: string; uzkassa_password?: string; uzkassa_terminal_id?: string;
  }) => api.put('/v1/owner/payment-settings/', payload),
};
