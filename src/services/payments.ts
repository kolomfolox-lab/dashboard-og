import { api } from './http';

export const paymentsAPI = {
  getMerchantConfigs: (restaurantId?: string) =>
    api.get('/payments/merchant-configs/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createMerchantConfig: (payload: { restaurant: string; provider: string; merchant_id?: string; merchant_key?: string; terminal_id?: string; is_active?: boolean }) =>
    api.post('/payments/merchant-configs/', payload),
  updateMerchantConfig: (id: string, payload: any) =>
    api.patch(`/payments/merchant-configs/${id}/`, payload),
  deleteMerchantConfig: (id: string) =>
    api.delete(`/payments/merchant-configs/${id}/`),
  getTransactions: (restaurantId?: string) =>
    api.get('/payments/transactions/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  refundTransaction: (id: string) =>
    api.post(`/payments/transactions/${id}/refund/`),

  // Fiscal
  getFiscalConfigs: (restaurantId?: string) =>
    api.get('/payments/fiscal-configs/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createFiscalConfig: (payload: any) =>
    api.post('/payments/fiscal-configs/', payload),
  updateFiscalConfig: (id: string, payload: any) =>
    api.patch(`/payments/fiscal-configs/${id}/`, payload),
  deleteFiscalConfig: (id: string) =>
    api.delete(`/payments/fiscal-configs/${id}/`),
  getFiscalReceipts: (restaurantId?: string) =>
    api.get('/payments/fiscal-receipts/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
};
