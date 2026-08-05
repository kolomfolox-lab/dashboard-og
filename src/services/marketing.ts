import { api } from './http';

export const marketingAPI = {
  // Promo Codes
  getPromoCodes: (restaurantId?: string) =>
    api.get('/marketing/promo-codes/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createPromoCode: (payload: any) => api.post('/marketing/promo-codes/', payload),
  updatePromoCode: (id: string, payload: any) => api.patch(`/marketing/promo-codes/${id}/`, payload),
  deletePromoCode: (id: string) => api.delete(`/marketing/promo-codes/${id}/`),
  validatePromoCode: (payload: { code: string; order_amount: number; guest_id?: string }) =>
    api.post<{ valid: boolean; promo_code_id?: string; code?: string; discount_type?: string; discount_value?: number; discount?: number; error?: string }>('/marketing/promo-codes/validate/', payload),

  // Auto Notify
  getAutoNotifySettings: (restaurantId?: string) =>
    api.get('/marketing/auto-notify/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createAutoNotifySetting: (payload: any) => api.post('/marketing/auto-notify/', payload),
  updateAutoNotifySetting: (id: string, payload: any) => api.patch(`/marketing/auto-notify/${id}/`, payload),
  deleteAutoNotifySetting: (id: string) => api.delete(`/marketing/auto-notify/${id}/`),

  // Surveys
  getSurveyTemplates: (restaurantId?: string) =>
    api.get('/marketing/survey-templates/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createSurveyTemplate: (payload: any) => api.post('/marketing/survey-templates/', payload),
  updateSurveyTemplate: (id: string, payload: any) => api.patch(`/marketing/survey-templates/${id}/`, payload),
  deleteSurveyTemplate: (id: string) => api.delete(`/marketing/survey-templates/${id}/`),
  getSurveyResponses: (restaurantId?: string) =>
    api.get('/marketing/survey-responses/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
};

export const dataExportAPI = {
  exportRestaurants: (restaurantId: string) =>
    api.get(`/admin/reports/restaurant/${restaurantId}/`, { responseType: 'blob' }),
  exportTaxReport: (restaurantId: string) =>
    api.get(`/admin/reports/restaurant/${restaurantId}/tax/`, { responseType: 'blob' }),
  exportChain: (chainId: string) =>
    api.get(`/admin/reports/chain/${chainId}/`, { responseType: 'blob' }),
};

export const notificationsAPI = {
  getTemplates: (restaurantId?: string) =>
    api.get('/notifications/templates/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createTemplate: (data: any) =>
    api.post('/notifications/templates/', data),
  updateTemplate: (id: string, data: any) =>
    api.patch(`/notifications/templates/${id}/`, data),
  deleteTemplate: (id: string) =>
    api.delete(`/notifications/templates/${id}/`),
  testSend: (data: any) =>
    api.post('/notifications/templates/test_send/', data),
  getLogs: (restaurantId?: string) =>
    api.get('/notifications/logs/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  getSettings: (restaurantId?: string) =>
    api.get('/notifications/settings/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  updateSettings: (id: string, data: any) =>
    api.patch(`/notifications/settings/${id}/`, data),
};

export const reviewsAPI = {
  list: (params: { restaurant_id?: string; page?: number }) =>
    api.get('/reviews/reviews/', { params }),
  stats: (params: { restaurant_id?: string }) =>
    api.get('/reviews/reviews/stats/', { params }),
  latest: (params: { restaurant_id?: string }) =>
    api.get('/reviews/reviews/latest/', { params }),
};
