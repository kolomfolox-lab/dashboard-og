import { api, resolvedBase } from './http';

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

export const ownerAPI = {
  getMe: () => api.get('/owner/me/'),
  deleteRestaurant: (restaurantId: string) => api.delete(`/owner/restaurants/${restaurantId}/`),
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
  updateStaff: (staffId: string, payload: { full_name?: string; role?: string; is_active?: boolean; hourly_rate?: number }) =>
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

  // Waiter commission & service charge
  getWaiterCommission: (restaurantId: string) =>
    api.get<{ waiter_commission_percent: string }>('/v1/owner/restaurants/waiter-commission/', { params: { restaurant_id: restaurantId } }),
  setWaiterCommission: (restaurantId: string, waiter_commission_percent: number) =>
    api.post<{ waiter_commission_percent: string }>('/v1/owner/restaurants/waiter-commission/', { waiter_commission_percent }, { params: { restaurant_id: restaurantId } }),
  getServiceCharge: (restaurantId: string) =>
    api.get<{ service_charge_percent: string }>('/v1/owner/restaurants/service-charge/', { params: { restaurant_id: restaurantId } }),
  setServiceCharge: (restaurantId: string, service_charge_percent: number) =>
    api.put<{ service_charge_percent: string }>('/v1/owner/restaurants/service-charge/', { service_charge_percent }, { params: { restaurant_id: restaurantId } }),

  // Shift Reports (X/Z)
  getFoodCost: (restaurantId: string, period: 'today' | '7days' | '30days' = 'today') =>
    api.get<{ period: string; start_date: string; end_date: string; total_revenue: number; total_cost: number; food_cost_pct: number; gross_profit: number; dishes_count: number }>('/owner/food-cost/', { params: { restaurant_id: restaurantId, period } }),

  getFinances: (restaurantId: string, period: 'today' | 'week' | 'month' = 'today') =>
    api.get('/owner/finances/', { params: { restaurant_id: restaurantId, period } }),

  getCashflow: (restaurantId: string, period: 'today' | 'week' | 'month' = 'month') =>
    api.get('/owner/cashflow/', { params: { restaurant_id: restaurantId, period } }),

  getAbcAnalysis: (restaurantId: string, days: number = 30) =>
    api.get('/owner/abc-analysis/', { params: { restaurant_id: restaurantId, days } }),

  // Part 15: ABC/XYZ матрица + предложения автозаказа
  getAbcXyz: (restaurantId: string, days: number = 30) =>
    api.get('/owner/abc-xyz/', { params: { restaurant_id: restaurantId, days } }),

  getOrderFunnel: (restaurantId: string) =>
    api.get('/owner/order-funnel/', { params: { restaurant_id: restaurantId } }),

  getIikoSettings: (restaurantId: string) =>
    api.get('/owner/iiko-settings/', { params: { restaurant_id: restaurantId } }),

  getPrintSettings: (restaurantId: string) =>
    api.get<{ print_ws_url: string; restaurant_id: string }>('/owner/print-settings/', { params: { restaurant_id: restaurantId } }),

  sendPrintTest: (restaurantId: string) =>
    api.post<{ status: string }>('/owner/print-test/', { restaurant_id: restaurantId }),

  updateIikoSettings: (restaurantId: string, payload: { iiko_api_key?: string; iiko_org_id?: string }) =>
    api.post('/owner/iiko-settings/', { ...payload, restaurant_id: restaurantId }),

  syncIikoMenu: (restaurantId: string) =>
    api.post('/owner/iiko-sync/', { restaurant_id: restaurantId }),

  getShiftReports: (restaurantId: string) =>
    api.get('/orders/shift-reports/', { params: { restaurant_id: restaurantId } }),
  generateXReport: (payload: { restaurant_id: string; shift_id?: string }) =>
    api.post('/orders/shift-reports/generate_x/', payload),
  generateZReport: (payload: { restaurant_id: string; shift_id?: string }) =>
    api.post('/orders/shift-reports/generate_z/', payload),

  // Tech Cards
  getTechCards: (restaurantId?: string) =>
    api.get('/inventory/tech-cards/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createTechCard: (payload: { restaurant: string; dish?: string; is_semi?: boolean; name?: string; yield_amount?: number; cooking_instructions?: string; cooking_time_minutes?: number }) =>
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

  // Modules (3-tier system)
  getModules: () => api.get('/owner/modules/'),
  getModuleStatus: (restaurantId: string) =>
    api.get('/owner/modules/status/', { params: { restaurant_id: restaurantId } }),
  toggleModule: (payload: { module_slug: string; restaurant_id: string; enable: boolean }) =>
    api.post('/owner/modules/toggle/', payload),

  // Subscriptions (standalone plans)
  getActiveSubscriptions: (restaurantId: string) =>
    api.get('/owner/subscriptions/', { params: { restaurant_id: restaurantId } }),
  subscribeToPlan: (payload: { plan_slug: string; restaurant_id: string }) =>
    api.post('/owner/subscriptions/subscribe/', payload),

  // Suppliers & Purchase Orders
  getSuppliers: (restaurantId: string) =>
    api.get('/suppliers/suppliers/', { params: { restaurant_id: restaurantId } }),
  createSupplier: (payload: { restaurant_id: string; name: string; contact_person?: string; phone?: string; email?: string; address?: string; notes?: string }) =>
    api.post('/suppliers/suppliers/', payload),
  updateSupplier: (id: string, payload: any) =>
    api.patch(`/suppliers/suppliers/${id}/`, payload),
  deleteSupplier: (id: string) =>
    api.delete(`/suppliers/suppliers/${id}/`),
  getSupplierProducts: (supplierId: string) =>
    api.get('/suppliers/products/', { params: { supplier_id: supplierId } }),
  createSupplierProduct: (payload: { supplier: string; name: string; unit: string; price: number; min_order_qty?: number; delivery_lead_days?: number }) =>
    api.post('/suppliers/products/', payload),
  updateSupplierProduct: (id: string, payload: any) =>
    api.patch(`/suppliers/products/${id}/`, payload),
  deleteSupplierProduct: (id: string) =>
    api.delete(`/suppliers/products/${id}/`),
  getPurchaseOrders: (restaurantId: string) =>
    api.get('/suppliers/orders/', { params: { restaurant_id: restaurantId } }),
  createPurchaseOrder: (payload: { restaurant_id: string; supplier: string; notes?: string; expected_date?: string; items: Array<{ product: string; quantity: number; unit_price: number }> }) =>
    api.post('/suppliers/orders/', payload),
  autoGeneratePurchaseOrders: (restaurantId: string) =>
    api.post('/suppliers/orders/auto_generate/', { restaurant_id: restaurantId }),
  markPurchaseOrderSent: (orderId: string) =>
    api.post(`/suppliers/orders/${orderId}/mark_sent/`),
  markPurchaseOrderReceived: (orderId: string) =>
    api.post(`/suppliers/orders/${orderId}/mark_received/`),
  cancelPurchaseOrder: (orderId: string) =>
    api.patch(`/suppliers/orders/${orderId}/`, { status: 'CANCELLED' }),

  // Staff Fines & Bonuses
  getStaffFines: (restaurantId: string) =>
    api.get('/hr/fines/', { params: { restaurant_id: restaurantId } }),
  createStaffFine: (payload: { restaurant_id: string; user: string; reason: string; amount: number; description?: string }) =>
    api.post('/hr/fines/', payload),
  deleteStaffFine: (id: string) =>
    api.delete(`/hr/fines/${id}/`),
  getStaffBonuses: (restaurantId: string) =>
    api.get('/hr/bonuses/', { params: { restaurant_id: restaurantId } }),
  createStaffBonus: (payload: { restaurant_id: string; user: string; reason: string; amount: number; description?: string }) =>
    api.post('/hr/bonuses/', payload),
  deleteStaffBonus: (id: string) =>
    api.delete(`/hr/bonuses/${id}/`),
  // Payroll
  getPayrollPeriods: (restaurantId: string) =>
    api.get('/hr/payroll-periods/', { params: { restaurant_id: restaurantId } }),
  createPayrollPeriod: (payload: { restaurant_id: string; start_date: string; end_date: string }) =>
    api.post('/hr/payroll-periods/', { restaurant: payload.restaurant_id, start_date: payload.start_date, end_date: payload.end_date }),
  calculatePayroll: (periodId: string, restaurantId?: string) =>
    api.post(`/hr/payroll-periods/${periodId}/calculate/`, undefined, { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  getPayrollEntries: (periodId: string) =>
    api.get('/hr/payroll-entries/', { params: { period_id: periodId } }),

  // Security events
  getSecurityEvents: (restaurantId: string) =>
    api.get('/analytics/security/', { params: { restaurant_id: restaurantId } }),

  // POS PWA
  getPosSettings: (restaurantId?: string) =>
    api.get('/v1/owner/pos-settings/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  updatePosSettings: (payload: { restaurant_id?: string; pin_required?: boolean; regenerate_secret?: boolean }) =>
    api.put('/v1/owner/pos-settings/', payload),
  setStaffPin: (userId: string, pin: string) =>
    api.post(`/v1/owner/users/${userId}/set-pin/`, { pin }),
  getStaffPin: (userId: string) =>
    api.get(`/v1/owner/users/${userId}/pin/`),
  clearStaffPin: (userId: string) =>
    api.post(`/v1/owner/users/${userId}/clear-pin/`, {}),
  setMyPin: (pin: string) =>
    api.post('/v1/owner/me/set-pin/', { pin }),

  // POS registers (касса accounts, Poster-style)
  getPosRegisters: (restaurantId?: string) =>
    api.get('/v1/owner/pos/registers/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createPosRegister: (payload: { restaurant_id?: string; name: string; username?: string }) =>
    api.post('/v1/owner/pos/registers/', payload),
  updatePosRegister: (id: string, payload: { name?: string; username?: string; is_active?: boolean }) =>
    api.patch(`/v1/owner/pos/registers/${id}/`, payload),
  resetPosRegisterPassword: (id: string) =>
    api.post(`/v1/owner/pos/registers/${id}/reset-password/`),
  unbindPosRegister: (id: string) =>
    api.post(`/v1/owner/pos/registers/${id}/unbind/`),

  // Gift certificates (POS)
  getPosCertificates: (restaurantId?: string) =>
    api.get('/v1/owner/pos/certificates/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),
  createPosCertificate: (payload: { restaurant_id?: string; code: string; amount: number }) =>
    api.post('/v1/owner/pos/certificates/', payload),
  deletePosCertificate: (id: string) =>
    api.delete(`/v1/owner/pos/certificates/${id}/`),

  // Printer status for POS
  getPosPrintStatus: (restaurantId?: string) =>
    api.get('/v1/pos/print-status/', { params: restaurantId ? { restaurant_id: restaurantId } : {} }),

  // POS Magic Pair (PosPairCode — 90s)
  createPosPairCode: (restaurantId?: string) =>
    api.post('/v1/pos/pair-code/', restaurantId ? { restaurant_id: restaurantId } : {}),
  claimPosPairCode: (code: string, deviceId?: string) =>
    api.post(`/v1/pos/pair/${code}/`, deviceId ? { device_id: deviceId } : {}),
  getPosPairCode: (code: string) => api.get(`/v1/pos/pair/${code}/`),

  // Обратный Magic Pair: касса сама генерирует QR, владелец подтверждает
  // (страница /pos-pair/:code, эндпоинты PosPairRequest).
  getPosPairRequest: (code: string) => api.get(`/v1/owner/pos/pair-request/${code}/`),
  confirmPosPairRequest: (code: string, restaurantId: string) =>
    api.post(`/v1/owner/pos/pair-request/${code}/`, { restaurant_id: restaurantId }),

  // POS check archive
  getPosArchive: (params: { restaurant_id?: string; date_from?: string; date_to?: string; method?: string; q?: string; limit?: number }) =>
    api.get('/v1/owner/pos/archive/', { params }),
  addPosArchiveComment: (orderId: string, comment: string) =>
    api.post(`/v1/owner/pos/archive/${orderId}/comment/`, { comment }),
};
