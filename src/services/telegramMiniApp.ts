import { api } from './http';
import type { AuthResponse } from './auth';

export interface TelegramMiniAppAuthResponse extends AuthResponse {
  telegram_user: {
    id: number;
    username: string;
    first_name: string;
  };
}

export interface TelegramMiniAppMenuItem {
  id: string;
  title: string;
  description: string;
  price: string;
  is_available: boolean;
  category?: string | null;
}

export interface TelegramMiniAppMenuResponse {
  restaurant: {
    id: string;
    name: string;
    address: string;
  };
  table?: {
    id: string;
    number: string;
  } | null;
  currency: 'UZS' | string;
  items: TelegramMiniAppMenuItem[];
}

export interface TelegramMiniAppWaiterCallResponse {
  id: string;
  table_id: string;
  table_number: string;
  restaurant_id: string;
  telegram_user_id?: number | null;
  status: string;
  created_at: string;
}

export const telegramMiniAppAPI = {
  bootstrap: (restaurantSlug: string, tableNumber: string | number) =>
    api.get<TelegramMiniAppMenuResponse>(`/v1/telegram-mini-app/${restaurantSlug}/${tableNumber}/`),
  getMenu: (restaurantId: string, tableId?: string) =>
    api.get<TelegramMiniAppMenuResponse>(`/v1/restaurants/${restaurantId}/menu/`, {
      params: tableId ? { table_id: tableId } : {},
    }),
  callWaiter: (tableId: string) =>
    api.post<TelegramMiniAppWaiterCallResponse>(`/v1/tables/${tableId}/call-waiter/`),
};
