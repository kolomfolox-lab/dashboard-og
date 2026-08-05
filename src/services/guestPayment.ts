import { api } from './http';

export interface GuestPaymentMethod {
  id: string;
  provider: string;
  label: string;
}

export interface GuestPaymentMethodsResponse {
  providers: GuestPaymentMethod[];
  waitly_fee?: number;
  waitly_fee_label?: string;
  waitly_fee_description?: string;
}

export interface GuestPaymentInitResponse {
  transaction_id: string;
  amount: number;
  order_amount: number;
  waitly_fee: number;
  provider: string;
  status: string;
  payment_url: string | null;
}

export const guestPaymentAPI = {
  methods: (guestToken: string, orderId?: string) =>
    api.get<GuestPaymentMethodsResponse>('/v1/guest/payment/methods/', { params: { guest_token: guestToken, ...(orderId ? { order_id: orderId } : {}) } }),
  init: (payload: { guest_token: string; order_id: string; provider: string }) =>
    api.post<GuestPaymentInitResponse>('/v1/guest/payment/init/', payload),
};
