import { api } from './http';
import type { OwnerBooking } from './owner';

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
