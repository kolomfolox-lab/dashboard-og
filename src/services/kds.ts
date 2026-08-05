import { api } from './http';

export interface KdsInfo {
  id: string;
  name: string;
  slug: string;
  kitchen_token: string;
  kds_url: string;
}

export const kdsAPI = {
  list: () => api.get<KdsInfo[]>('/owner/kds/'),
  regenerate: (restaurant_id: string) => api.post<KdsInfo>('/owner/kds/regenerate/', { restaurant_id }),
};
