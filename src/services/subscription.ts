import { api } from './http';

export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_uzs: number;
  duration_months: number;
  features: Record<string, boolean>;
  sort_order: number;
}

export interface PurchaseSubscriptionPayload {
  plan_slug: string;
  duration_months: number;
  payment_method: 'payme' | 'click';
}

export interface PurchaseSubscriptionResponse {
  key_id: string;
  payment_id: string;
  amount: number;
  payment_url: string | null;
}

export const subscriptionAPI = {
  getPlans: () => api.get<SubscriptionPlanResponse[]>('/subscriptions/plans/'),
  getPlan: (slug: string) => api.get<SubscriptionPlanResponse>(`/subscriptions/plans/${slug}/`),
  purchase: (payload: PurchaseSubscriptionPayload) => api.post<PurchaseSubscriptionResponse>('/subscriptions/purchase/', payload),
};
