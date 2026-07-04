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
  google_linked?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
  user: AppUser;
}

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
  price: number;
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
  total_amount: number;
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

export interface OwnerCrmGuest {
  id: string;
  restaurant: string;
  user?: string | null;
  telegram_user_id?: number | null;
  telegram_username?: string;
  first_name?: string;
  phone_number?: string;
  display_name?: string;
  language: 'ru' | 'en' | 'uz' | string;
  tags: string[];
  notes: string;
  total_visits: number;
  total_spend: string;
  last_visit_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerCrmGuestVisit {
  id: string;
  restaurant: string;
  guest?: string | null;
  guest_name?: string | null;
  table_session: string;
  table?: string | null;
  table_number?: string | null;
  source: string;
  seat_label?: string;
  guest_count: number;
  started_at: string;
  ended_at?: string | null;
  created_at: string;
}

export interface OwnerFeedbackInsight {
  id: string;
  restaurant: string;
  period: string;
  date_from: string;
  date_to: string;
  reviews_count: number;
  average_rating: string;
  weaknesses: string[];
  strengths: string[];
  recommended_actions: string[];
  summary: string;
  created_at: string;
}

export interface LoyaltyTier {
  id: string;
  restaurant: string;
  name: string;
  min_spend: number;
  multiplier: number;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyPoint {
  id: string;
  guest: string;
  restaurant: string;
  points: number;
  source: string;
  note: string;
  earned_at: string;
  expires_at: string | null;
}

export interface LoyaltyRedemption {
  id: string;
  guest: string;
  restaurant: string;
  points_spent: number;
  discount_amount: number;
  order: string | null;
  redeemed_at: string;
}

export interface PromoCodeValidationResponse {
  valid: boolean;
  promo_code_id?: string;
  code?: string;
  discount_type?: string;
  discount_value?: number;
  discount?: number;
  error?: string;
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
  loginWithTelegramMiniApp: (payload: { initData: string }) => api.post<TelegramMiniAppAuthResponse>('/v1/auth/telegram/', payload),
  sendOtp: (payload: { email: string }) => api.post('/auth/otp/send/', payload),
  verifyOtp: (payload: { email: string; code: string }) => api.post<AuthResponse>('/auth/otp/verify/', payload),
  setPassword: (payload: { identifier: string; code: string; new_password: string }) => api.post<AuthResponse>('/auth/password/set/', payload),
  getCurrentUser: () => api.get<AppUser>('/auth/users/me/'),
  googleLogin: (payload: { credential: string }) => api.post<AuthResponse>('/auth/google/', payload),
  registerGoogle: (payload: { credential: string; phone_number: string; full_name?: string }) => api.post<AuthResponse>('/auth/register_google/', payload),
  linkGoogle: (payload: { credential: string }) => api.post<AppUser>('/auth/google/link/', payload),
  register: (payload: { full_name: string; phone_number: string; email?: string; password: string; password_confirm: string }) => api.post<AuthResponse>('/auth/register/', payload),
  onboarding: (payload: { chain_name: string; restaurant_name: string; staff_bot_token?: string; onboarding_answers?: Record<string, any> }) =>
    api.post<{ chain: { id: string; name: string; subdomain: string }; restaurant: any }>('/auth/onboarding/', payload),
};

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

export interface OwnerTable {
  id: string;
  number: string;
  is_occupied: boolean;
  waiter: string | null;
  qr_url: string;
  has_qr: boolean;
  pos_x: number | null;
  pos_y: number | null;
}

export interface OwnerMenuCategory {
  id: string;
  name: string;
  name_uz: string;
  name_en: string;
  order: number;
  dish_count: number;
}

export interface OwnerMenuDish {
  id: string;
  name: string;
  name_uz: string;
  name_en: string;
  description: string;
  ingredients: string;
  price: string;
  cost_price: string;
  margin: number;
  margin_percent: number | null;
  image: string | null;
  category_id: string | null;
  category_name: string | null;
  cooking_time: number;
  is_available: boolean;
}

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

export const ownerAPI = {
  getMe: () => api.get('/owner/me/'),
  subscriptionStatus: (restaurantId: string) => api.get<OwnerSubscriptionStatusResponse>('/v1/owner/subscription/status/', { params: { restaurant_id: restaurantId } }),
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
  getTables: (restaurantId?: string) => api.get<OwnerTable[]>('/owner/tables/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createTable: (payload: { restaurant_id: string; number: string; pos_x?: number; pos_y?: number }) => api.post('/owner/tables/', payload),
  deleteTable: (tableId: string) => api.delete(`/owner/tables/${tableId}/`),
  updateTablePosition: (tableId: string, payload: { pos_x: number; pos_y: number }) => api.put(`/owner/tables/${tableId}/`, payload),
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
  getCrmGuests: (restaurantId?: string, query?: string) =>
    api.get<OwnerCrmGuest[] | { results: OwnerCrmGuest[] }>('/v1/core/crm/guests/', {
      params: { ...(restaurantId ? { restaurant_id: restaurantId } : {}), ...(query ? { q: query } : {}) },
    }),
  updateCrmGuest: (guestId: string, payload: Partial<Pick<OwnerCrmGuest, 'display_name' | 'phone_number' | 'language' | 'tags' | 'notes'>>) =>
    api.patch<OwnerCrmGuest>(`/v1/core/crm/guests/${guestId}/`, payload),
  getCrmGuestVisits: (guestId: string) =>
    api.get<OwnerCrmGuestVisit[]>(`/v1/core/crm/guests/${guestId}/visits/`),
  getFeedbackInsights: (restaurantId?: string) =>
    api.get<OwnerFeedbackInsight[] | { results: OwnerFeedbackInsight[] }>('/v1/core/crm/feedback-insights/', {
      params: restaurantId ? { restaurant_id: restaurantId } : {},
    }),
  getLoyaltyTiers: (restaurantId?: string) =>
    api.get<LoyaltyTier[] | { results: LoyaltyTier[] }>('/v1/core/crm/loyalty-tiers/', {
      params: restaurantId ? { restaurant_id: restaurantId } : {},
    }),
  createLoyaltyTier: (payload: { restaurant_id: string; name: string; min_spend: number; multiplier: number; color?: string; is_active?: boolean; sort_order?: number }) =>
    api.post<LoyaltyTier>('/v1/core/crm/loyalty-tiers/', payload),
  updateLoyaltyTier: (tierId: string, payload: Partial<{ name: string; min_spend: number; multiplier: number; color: string; is_active: boolean; sort_order: number }>) =>
    api.patch<LoyaltyTier>(`/v1/core/crm/loyalty-tiers/${tierId}/`, payload),
  deleteLoyaltyTier: (tierId: string) => api.delete(`/v1/core/crm/loyalty-tiers/${tierId}/`),
  getLoyaltyPoints: (params?: { guest_id?: string; restaurant_id?: string }) =>
    api.get<LoyaltyPoint[] | { results: LoyaltyPoint[] }>('/v1/core/crm/loyalty-points/', { params }),
  createLoyaltyPoint: (payload: { guest_id: string; restaurant_id: string; points: number; source?: string; note?: string }) =>
    api.post<LoyaltyPoint>('/v1/core/crm/loyalty-points/', payload),
  getLoyaltyRedemptions: (params?: { guest_id?: string; restaurant_id?: string }) =>
    api.get<LoyaltyRedemption[] | { results: LoyaltyRedemption[] }>('/v1/core/crm/loyalty-redemptions/', { params }),
  getMenuCategories: (restaurantId?: string) =>
    api.get<OwnerMenuCategory[]>('/owner/menu/categories/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createMenuCategory: (payload: { restaurant_id: string; name: string; name_uz?: string; name_en?: string; order?: number }) =>
    api.post<OwnerMenuCategory>('/owner/menu/categories/', payload),
  updateMenuCategory: (categoryId: string, payload: { name?: string; name_uz?: string; name_en?: string; order?: number }) =>
    api.put<OwnerMenuCategory>(`/owner/menu/categories/${categoryId}/`, payload),
  deleteMenuCategory: (categoryId: string) => api.delete(`/owner/menu/categories/${categoryId}/`),
  getMenuDishes: (restaurantId?: string) =>
    api.get<OwnerMenuDish[]>('/owner/menu/dishes/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createMenuDish: (payload: FormData) => api.post<OwnerMenuDish>('/owner/menu/dishes/', payload),
  updateMenuDish: (dishId: string, payload: FormData) => api.put<OwnerMenuDish>(`/owner/menu/dishes/${dishId}/`, payload),
  deleteMenuDish: (dishId: string) => api.delete(`/owner/menu/dishes/${dishId}/`),

  // Shift Reports (X/Z)
  getShiftReports: (restaurantId: string) =>
    api.get('/orders/shift-reports/', { params: { restaurant_id: restaurantId } }),
  generateXReport: (payload: { restaurant_id: string; shift_id?: string }) =>
    api.post('/orders/shift-reports/generate_x/', payload),
  generateZReport: (payload: { restaurant_id: string; shift_id?: string }) =>
    api.post('/orders/shift-reports/generate_z/', payload),

  // Tech Cards
  getTechCards: (restaurantId?: string) =>
    api.get('/inventory/tech-cards/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createTechCard: (payload: { restaurant: string; dish: string; yield_amount?: number; cooking_instructions?: string; cooking_time_minutes?: number }) =>
    api.post('/inventory/tech-cards/', payload),
  updateTechCard: (id: string, payload: any) =>
    api.patch(`/inventory/tech-cards/${id}/`, payload),
  deleteTechCard: (id: string) =>
    api.delete(`/inventory/tech-cards/${id}/`),
  addTechCardItem: (techCardId: string, payload: { ingredient: string; quantity_needed: number; ingredient_cost_price?: number }) =>
    api.post(`/inventory/tech-cards/${techCardId}/add_item/`, payload),
  removeTechCardItem: (techCardId: string, itemId: string) =>
    api.post(`/inventory/tech-cards/${techCardId}/remove_item/`, { item_id: itemId }),
  recalculateTechCard: (techCardId: string) =>
    api.post(`/inventory/tech-cards/${techCardId}/recalculate/`),

  // Staff photo upload
  updateStaffPhoto: (staffId: string, formData: FormData) =>
    api.patch(`/owner/staff/${staffId}/`, formData),

  // Hall map (floor plan objects)
  getHallMap: (restaurantId: string) =>
    api.get<any[]>('/v1/owner/hall-map/', { params: { restaurant_id: restaurantId } }),
  saveHallMap: (restaurantId: string, objects: any[]) =>
    api.put('/v1/owner/hall-map/', { restaurant_id: restaurantId, objects }),

  // QR downloads (use these functions to trigger downloads with auth headers)
  downloadTableQrPng: async (tableId: string) => {
    const res = await api.get(`/owner/tables/${tableId}/qr/`, { responseType: 'blob' });
    const disposition = res.headers['content-disposition'];
    const match = disposition && disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : `table_qr_${tableId}.png`;
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
  downloadTablesQrPdf: async (restaurantId: string) => {
    const res = await api.get('/owner/tables/qr-pdf/', { params: { restaurant_id: restaurantId }, responseType: 'blob' });
    const disposition = res.headers['content-disposition'];
    const match = disposition && disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : `qr_codes.pdf`;
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};

export const userAPI = {
  list: () => api.get('/auth/users/'),
};

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

export const marketingAPI = {
  // Promo Codes
  getPromoCodes: (restaurantId?: string) =>
    api.get('/marketing/promo-codes/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createPromoCode: (payload: any) => api.post('/marketing/promo-codes/', payload),
  updatePromoCode: (id: string, payload: any) => api.patch(`/marketing/promo-codes/${id}/`, payload),
  deletePromoCode: (id: string) => api.delete(`/marketing/promo-codes/${id}/`),
  validatePromoCode: (payload: { code: string; order_amount: number; guest_id?: string }) =>
    api.post<PromoCodeValidationResponse>('/marketing/promo-codes/validate/', payload),

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
    api.get<GuestBootstrapResponse>(`/v1/guest/bootstrap/${restaurantSlug}/${tableNumber}/`),
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

export interface GuestPaymentMethod {
  id: string;
  provider: string;
  label: string;
}

export interface GuestPaymentMethodsResponse {
  providers: GuestPaymentMethod[];
}

export interface GuestPaymentInitResponse {
  transaction_id: string;
  amount: number;
  provider: string;
  status: string;
  payment_url: string | null;
}

export const guestPaymentAPI = {
  methods: (guestToken: string) =>
    api.get<GuestPaymentMethodsResponse>('/v1/guest/payment/methods/', { params: { guest_token: guestToken } }),
  init: (payload: { guest_token: string; order_id: string; provider: string }) =>
    api.post<GuestPaymentInitResponse>('/v1/guest/payment/init/', payload),
};

export default api;






