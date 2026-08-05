import { api } from './http';

export interface KitchenBootstrapResponse {
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
  token: {
    type: string;
    value: string;
  };
  channels: {
    kitchen: string;
    restaurant: string;
  };
  transport: {
    websocket_path: string;
  };
  endpoints: {
    orders: string;
    accept: string;
    ready: string;
  };
}

export const kitchenAPI = {
  bootstrap: (params: { restaurant_slug: string; kitchen_token: string; scope_subdomain?: string }) =>
    api.get<KitchenBootstrapResponse>('/v1/kitchen/bootstrap/', { params }),
  getOrders: (kitchenToken: string) =>
    api.get('/v1/core/orders/', {
      params: { status: 'CREATED,ACCEPTED,COOKING' },
      headers: { Authorization: `Bearer ${kitchenToken}` },
    }),
  acceptOrder: (orderId: string, kitchenToken: string) =>
    api.post(`/v1/core/orders/${orderId}/accept/`, null, {
      headers: { Authorization: `Bearer ${kitchenToken}` },
    }),
  cookingOrder: (orderId: string, kitchenToken: string) =>
    api.post(`/v1/core/orders/${orderId}/cooking/`, null, {
      headers: { Authorization: `Bearer ${kitchenToken}` },
    }),
  markReady: (orderId: string, kitchenToken: string) =>
    api.post(`/v1/core/orders/${orderId}/ready/`, null, {
      headers: { Authorization: `Bearer ${kitchenToken}` },
    }),
  addDelay: (orderId: string, minutes: number, reason: string, kitchenToken: string) =>
    api.post(`/v1/core/orders/${orderId}/add_delay/`, { extra_time: minutes, delay_message: reason }, {
      headers: { Authorization: `Bearer ${kitchenToken}` },
    }),
  cancelOrder: (orderId: string, kitchenToken: string) =>
    api.post(`/v1/core/orders/${orderId}/cancel/`, null, {
      headers: { Authorization: `Bearer ${kitchenToken}` },
    }),
};
