import axios from 'axios';

export type AppUserRole = 'SUPER_ADMIN' | 'CHAIN_OWNER' | 'RESTAURANT_OWNER' | string;

export interface AppUser {
  id: string;
  full_name: string;
  role: AppUserRole;
  email?: string;
  phone_number?: string;
  restaurant?: string | null;
  is_active?: boolean;
  created_at?: string;
  telegram_linked?: boolean;
  telegram_username?: string;
  telegram_auth_enabled?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
  user: AppUser;
}

export interface OwnerInventoryIngredient {
  id: string;
  name: string;
  unit: string;
  quantity: string;
  minimum_quantity: string;
  is_active: boolean;
}

export interface OwnerInventoryStockRow extends OwnerInventoryIngredient {
  ingredient_id: string;
  is_low: boolean;
  is_empty: boolean;
  updated_at: string;
}

export interface OwnerInventoryMovement {
  id: string;
  ingredient: string;
  unit: string;
  movement_type: string;
  before_quantity: string;
  delta: string;
  after_quantity: string;
  source: string;
  created_by?: string | null;
  created_at: string;
  created_at_display: string;
}

export interface OwnerInventoryResponse {
  restaurant_id: string;
  restaurant_name: string;
  permissions: {
    manager_can_write_off_stock: boolean;
    chef_can_write_off_stock: boolean;
    cook_can_view_recipes: boolean;
  };
  ingredients: OwnerInventoryIngredient[];
  stock: OwnerInventoryStockRow[];
  low_stock_count: number;
  empty_stock_count: number;
  movements: OwnerInventoryMovement[];
}

export interface TelegramLinkResponse {
  link_code: string;
  expires_at: string;
  bot_username?: string;
  bot_url?: string;
  command: string;
}

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

export interface GuestBootstrapResponse {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    subdomain?: string | null;
    chain_name?: string | null;
    chain_subdomain?: string | null;
  };
  table: {
    id: string;
    number: string;
  };
  guest_token: string;
  turnstile_site_key?: string;
  review_page_path?: string;
  review_page_url?: string;
}

export interface GuestLoadSnapshot {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  label: string;
  active_orders_count: number;
  created_orders: number;
  accepted_orders: number;
  cooking_orders: number;
  ready_orders: number;
  load_score: number;
  delay_buffer_minutes: number;
}

export interface GuestOrderItem {
  name: string;
  quantity: number;
  notes?: string;
  cooking_time?: number | null;
}

export interface GuestOrder {
  id: string;
  status: string;
  status_text: string;
  stage_label: string;
  waiter_name?: string | null;
  estimated_time: number;
  remaining_minutes: number;
  progress: number;
  eta_minutes: number;
  eta_window: {
    from: number;
    to: number;
  };
  queue_position: number;
  load_level: string;
  items: GuestOrderItem[];
}

export interface GuestActiveOrdersResponse {
  restaurant: string;
  table_id: string;
  table_number: string;
  load: GuestLoadSnapshot;
  orders: GuestOrder[];
}

export interface GuestReviewPromptResponse {
  eligible: boolean;
  reason?: string | null;
  review_token?: string;
  table_id?: string;
  table_number?: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
    subdomain?: string | null;
    chain_subdomain?: string | null;
  } | string;
  order?: {
    id: string;
    status: string;
    waiter_name?: string | null;
    delivered_at?: string | null;
  };
  review_page_path?: string;
  review_page_url?: string;
}

export interface PublicReviewEntry {
  id: string;
  comment: string;
  author_name: string;
  average_rating: number;
  created_at: string;
  restaurant: {
    id: string;
    name: string;
    chain_name?: string | null;
    review_path: string;
  };
  ratings: {
    food: number;
    service_speed: number;
    waiter: number;
    waitly: number;
  };
}

export interface PublicRestaurantCard {
  id: string;
  name: string;
  slug: string;
  subdomain?: string | null;
  chain_name?: string | null;
  chain_subdomain?: string | null;
  review_path: string;
  review_url?: string | null;
  menu_url?: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  manual_cover_url?: string | null;
  primary_color: string;
  secondary_color: string;
  phone_number?: string;
  address?: string;
  review_category?: string;
  review_short_description?: string;
  working_hours_text?: string;
  average_check_text?: string;
  map_link?: string;
  telegram_url?: string;
  instagram_url?: string;
  whatsapp_url?: string;
  features?: string[];
  average_rating: number;
  published_reviews_count: number;
}

export interface PublicMenuPreviewItem {
  id: string;
  name: string;
  description?: string;
  ingredients?: string;
  price: string;
  image_url?: string | null;
}

export interface PublicGalleryItem {
  id: string;
  name: string;
  image_url?: string | null;
}

export interface ReviewsHubResponse {
  hero_stats: {
    total_reviews: number;
    restaurants_count: number;
    average_rating: number;
  };
  restaurants: PublicRestaurantCard[];
  featured_reviews: PublicReviewEntry[];
}

export interface ReviewsRestaurantResponse {
  restaurant: PublicRestaurantCard;
  rating_breakdown: {
    food: number;
    service_speed: number;
    waiter: number;
    waitly: number;
  };
  menu_preview: PublicMenuPreviewItem[];
  gallery: PublicGalleryItem[];
  reviews: PublicReviewEntry[];
  pagination: {
    page: number;
    pages: number;
    has_next: boolean;
    has_previous: boolean;
    total_reviews: number;
  };
}

export interface OwnerReviewsProfileResponse {
  restaurant_id: string;
  restaurant_name: string;
  review_page_url?: string | null;
  menu_url?: string | null;
  primary_color: string;
  secondary_color: string;
  phone_number?: string;
  address?: string;
  reviews_logo_url?: string | null;
  reviews_cover_url?: string | null;
  review_category?: string;
  review_short_description?: string;
  review_features?: string;
  features_list?: string[];
  working_hours_text?: string;
  average_check_text?: string;
  map_link?: string;
  telegram_url?: string;
  instagram_url?: string;
  whatsapp_url?: string;
  menu_hero_image_url?: string | null;
  menu_spotlight_image_url?: string | null;
  menu_headline?: string;
  menu_subheadline?: string;
  booking_enabled?: boolean;
  booking_open_time?: string;
  booking_close_time?: string;
  booking_slot_minutes?: number;
  booking_window_days?: number;
  booking_notes?: string;
}

export interface OwnerSubscriptionStatusResponse {
  restaurant_id?: string | null;
  subscription_status: string;
  expires_at?: string | null;
  grace_until?: string | null;
  is_blocking_mobile?: boolean;
  is_blocking_owner?: boolean;
  allowed_actions?: string[];
  message_code?: string;
  message_text?: string;
}

export interface OwnerBooking {
  id: string;
  table_id: string;
  table_number: string;
  booking_date: string;
  booking_time: string;
  guest_count: number;
  client_name: string;
  client_phone: string;
  client_telegram?: string | null;
  occasion?: string;
  notes?: string;
  status: string;
  source: string;
  created_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicBookingSlot {
  time: string;
  is_available: boolean;
  available_tables_count: number;
}

export interface PublicBookingState {
  enabled: boolean;
  open_time: string;
  close_time: string;
  slot_minutes: number;
  window_days: number;
  notes?: string;
  dates: Array<{
    date: string;
    label: string;
  }>;
  selected_date: string;
  slots: PublicBookingSlot[];
}

export interface PublicMenuRestaurant {
  id: string;
  name: string;
  slug: string;
  chain_name?: string | null;
  subdomain?: string | null;
  menu_url?: string | null;
  phone_number?: string;
  address?: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string | null;
  hero_image_url?: string | null;
  spotlight_image_url?: string | null;
  headline?: string;
  subheadline?: string;
  working_hours_text?: string;
  average_check_text?: string;
  review_category?: string;
  review_short_description?: string;
  features?: string[];
  map_link?: string;
  telegram_url?: string;
  instagram_url?: string;
  whatsapp_url?: string;
}

export interface PublicMenuDish {
  id: string;
  name: string;
  description?: string;
  ingredients?: string;
  price: string;
  image_url?: string | null;
  cooking_time?: number;
  is_available: boolean;
}

export interface PublicMenuCategory {
  id: string;
  name: string;
  dishes: PublicMenuDish[];
}

export interface PublicMenuPageResponse {
  restaurant: PublicMenuRestaurant;
  booking: PublicBookingState;
  spotlight?: PublicMenuDish | null;
  categories: PublicMenuCategory[];
}

const localBase = 'http://localhost:8000/api';
const resolvedBase =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? localBase
    : `${window.location.origin}/api`);

const api = axios.create({
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

export const authAPI = {
  loginWithPassword: (payload: { phone_number: string; password: string }) => api.post<AuthResponse>('/auth/login/', payload),
  sendOtp: (payload: { email: string }) => api.post('/auth/otp/send/', payload),
  verifyOtp: (payload: { email: string; code: string }) => api.post<AuthResponse>('/auth/otp/verify/', payload),
  requestTelegramOtp: (payload: { identifier: string }) => api.post('/auth/telegram/request/', payload),
  verifyTelegramOtp: (payload: { identifier: string; code: string }) => api.post<AuthResponse>('/auth/telegram/verify/', payload),
  setPassword: (payload: { identifier: string; code: string; new_password: string }) => api.post<AuthResponse>('/auth/password/set/', payload),
  requestTelegramPasswordReset: (payload: { identifier: string }) => api.post('/auth/password/forgot/telegram/request/', payload),
  verifyResetOtp: (payload: { identifier: string; code: string }) => api.post('/auth/password/forgot/telegram/verify/', payload),
  confirmTelegramPasswordReset: (payload: { identifier: string; code: string; new_password: string }) => api.post('/auth/password/forgot/telegram/confirm/', payload),
  requestTelegramLink: () => api.post<TelegramLinkResponse>('/auth/profile/telegram/link/request/'),
  confirmTelegramLink: (payload: { link_code: string }) => api.post<{ message: string; user?: AppUser }>('/auth/profile/telegram/link/confirm/', payload),
  unlinkTelegram: () => api.post<{ message: string; user?: AppUser }>('/auth/profile/telegram/unlink/'),
  getCurrentUser: () => api.get<AppUser>('/auth/users/me/'),
};

export const adminAPI = {
  getSuperAdminStats: () => api.get('/admin/stats/super/'),
  getDashboard: () => api.get('/admin/dashboard/'),
  getChains: () => api.get('/admin/chains/'),
  getRestaurants: () => api.get('/admin/restaurants/'),
  getOwners: () => api.get('/admin/owners/'),
  deleteChain: (chainId: string) => api.delete(`/admin/chains/${chainId}/`),
  deleteRestaurant: (restaurantId: string) => api.delete(`/admin/restaurants/${restaurantId}/`),
  getKeys: () => api.get('/admin/keys/'),
  revokeKey: (keyId: string) => api.delete(`/admin/keys/${keyId}/revoke/`),
};

export const ownerAPI = {
  getMe: () => api.get('/owner/me/'),
  activateSubscription: (payload: { key: string; restaurant_id: string }) => api.post('/owner/subscription/activate/', payload),
  getReviewsProfile: (restaurantId?: string) => api.get<OwnerReviewsProfileResponse>('/v1/owner/restaurants/reviews-profile/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  updateReviewsProfile: (restaurantId: string, payload: FormData) =>
    api.put<OwnerReviewsProfileResponse>('/v1/owner/restaurants/reviews-profile/', payload, {
      params: { restaurant_id: restaurantId },
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getBookings: (restaurantId?: string, scope = 'upcoming') =>
    api.get<OwnerBooking[]>('/v1/owner/restaurants/bookings/', { params: { ...(restaurantId ? { restaurant_id: restaurantId } : {}), scope } }),
  createBooking: (payload: {
    restaurant_id: string;
    table_id?: string;
    booking_date: string;
    booking_time: string;
    guest_count: number;
    client_name: string;
    client_phone: string;
    client_telegram?: string;
    occasion?: string;
    notes?: string;
    status?: string;
  }) => api.post<OwnerBooking>('/v1/owner/restaurants/bookings/', payload),
  updateBooking: (bookingId: string, payload: Partial<OwnerBooking>) =>
    api.put<OwnerBooking>(`/v1/owner/restaurants/bookings/${bookingId}/`, payload),
  deleteBooking: (bookingId: string) => api.delete(`/v1/owner/restaurants/bookings/${bookingId}/`),
  getStaff: (restaurantId?: string) => api.get('/owner/staff/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createStaff: (payload: {
    restaurant_id: string;
    full_name: string;
    phone_number: string;
    email?: string;
    role: string;
  }) => api.post('/owner/staff/', payload),
  updateStaff: (staffId: string, payload: { full_name?: string; role?: string; is_active?: boolean }) =>
    api.put(`/owner/staff/${staffId}/`, payload),
  deleteStaff: (staffId: string) => api.delete(`/owner/staff/${staffId}/`),
  resendStaffInvite: (staffId: string) => api.post(`/owner/staff/${staffId}/resend-invite/`),
  getStats: (restaurantId?: string) => api.get('/owner/stats/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  getTables: (restaurantId?: string) => api.get('/owner/tables/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createTable: (payload: { restaurant_id: string; number: string }) => api.post('/owner/tables/', payload),
  deleteTable: (tableId: string) => api.delete(`/owner/tables/${tableId}/`),
  getTableQr: (tableId: string) => `${resolvedBase}/owner/tables/${tableId}/qr/`,
  getTablesQrPdf: (restaurantId?: string) => `${resolvedBase}/owner/tables/qr-pdf/${restaurantId ? `?restaurant_id=${restaurantId}` : ''}`,
  getInventory: (restaurantId?: string) =>
    api.get<OwnerInventoryResponse>('/owner/inventory/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createIngredient: (payload: { restaurant_id: string; name: string; unit: string; minimum_quantity: string }) =>
    api.post<OwnerInventoryIngredient>('/owner/inventory/ingredients/', payload),
  addSupply: (payload: { restaurant_id: string; ingredient_id: string; quantity: string; unit_price?: string; note?: string }) =>
    api.post<OwnerInventoryStockRow>('/owner/inventory/supply/', payload),
  writeOffStock: (payload: { restaurant_id: string; ingredient_id: string; quantity: string; reason?: string; note?: string }) =>
    api.post<OwnerInventoryStockRow>('/owner/inventory/write-off/', payload),
  getOrders: (restaurantId?: string, period = 'all') =>
    api.get('/owner/orders/today/', { params: { ...(restaurantId ? { restaurant_id: restaurantId } : {}), period, limit: 100 } }),
};

export const userAPI = {
  list: () => api.get('/auth/users/'),
};

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
  markReady: (orderId: string, kitchenToken: string) =>
    api.post(`/v1/core/orders/${orderId}/ready/`, null, {
      headers: { Authorization: `Bearer ${kitchenToken}` },
    }),
};

export const publicAPI = {
  guestBootstrap: (restaurantSlug: string, tableNumber: string | number) =>
    api.get<GuestBootstrapResponse>(`/v1/guest/bootstrap/${restaurantSlug}/table${tableNumber}/`),
  guestActiveOrders: (guestToken: string) =>
    api.get<GuestActiveOrdersResponse>('/v1/guest/orders/active/', { params: { guest_token: guestToken } }),
  guestReviewPrompt: (guestToken: string) =>
    api.get<GuestReviewPromptResponse>('/v1/guest/reviews/prompt/', { params: { guest_token: guestToken } }),
  guestCallWaiter: (guestToken: string) =>
    api.post('/v1/guest/waiter-calls/', { guest_token: guestToken }),
  guestSubmitReview: (payload: {
    review_token: string;
    turnstile_token: string;
    author_name?: string;
    comment?: string;
    rating_food: number;
    rating_service_speed: number;
    rating_waiter: number;
    rating_waitly: number;
  }) => api.post('/v1/guest/reviews/submit/', payload),
  reviewsHub: (query?: string) =>
    api.get<ReviewsHubResponse>('/v1/public/reviews/hub/', { params: query ? { q: query } : {} }),
  reviewsRestaurantBySubdomain: (restaurantSubdomain: string, page = 1) =>
    api.get<ReviewsRestaurantResponse>(`/v1/public/reviews/restaurants/${restaurantSubdomain}/`, { params: { page } }),
  reviewsRestaurantByChain: (chainSubdomain: string, restaurantSlug: string, page = 1) =>
    api.get<ReviewsRestaurantResponse>(`/v1/public/reviews/chains/${chainSubdomain}/${restaurantSlug}/`, { params: { page } }),
  menuPage: (restaurantSlug: string, params?: { scope_subdomain?: string; scope_chain_subdomain?: string }) =>
    api.get<PublicMenuPageResponse>(`/v1/public/menu/${restaurantSlug}/`, { params }),
  bookingAvailability: (restaurantSlug: string, payload: { date: string; scope_subdomain?: string; scope_chain_subdomain?: string }) =>
    api.get<PublicBookingState>(`/v1/public/menu/${restaurantSlug}/booking-availability/`, { params: payload }),
  createBooking: (restaurantSlug: string, payload: {
    client_name: string;
    client_phone: string;
    client_telegram?: string;
    booking_date: string;
    booking_time: string;
    guest_count: number;
    occasion?: string;
    notes?: string;
    scope_subdomain?: string;
    scope_chain_subdomain?: string;
  }) => api.post<{ message: string; booking: OwnerBooking }>(`/v1/public/menu/${restaurantSlug}/bookings/`, payload),
};

export default api;






