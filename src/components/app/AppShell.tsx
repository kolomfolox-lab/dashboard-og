import { Activity, BarChart3, Beaker, Bell, BookOpenText, Boxes, Calendar, CheckSquare, ChefHat, ChevronDown, ChevronRight, ClipboardList, Coffee, ContactRound, CreditCard, DollarSign, Gift, LayoutDashboard, Layers, LineChart, Link, LockKeyhole, MonitorSmartphone, Moon, Package, QrCode, Receipt, RefreshCw, Settings2, ShoppingCart, Store, Sun, Tag, TrendingDown, Tv, UsersRound, UtensilsCrossed, Wallet, Waves } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandMark } from '@/components/app/BrandMark';
import logoUrl from '@/assets/waitly-lil.webp';
import { getVisiblePages } from '@/lib/pageRegistry';
import { AIAssistant } from '@/components/app/AIAssistant';
import { AppNotificationBell } from '@/components/app/AppNotificationBell';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { Select } from '@/components/ui/select';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { FEATURES } from '@/config/features';
import { useTheme } from '@/context/ThemeContext';
import { ownerAPI } from '@/services/api';

type NavItem = { to: string; labelKey: string; fallback: string; icon: any; featureKey?: string };
type NavGroup = { label: string; labelKey: string; items: NavItem[] };

const navByRole: Record<string, NavGroup[]> = {
  SUPER_ADMIN: [
    { label: '', labelKey: '', items: [
      { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
      { to: '/restaurants', labelKey: 'nav_restaurants', fallback: 'Networks', icon: Store },
      { to: '/keys', labelKey: 'nav_keys', fallback: 'Keys', icon: LockKeyhole },
    ]},
    { label: '', labelKey: '', items: [
      { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Analytics', icon: LineChart },
      { to: '/finances', labelKey: 'nav_finances', fallback: 'Финансы', icon: Wallet },
      { to: '/cashflow', labelKey: 'nav_cashflow', fallback: 'Cash Flow', icon: Activity },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Reports', icon: BarChart3 },
      { to: '/payments', labelKey: 'nav_payments', fallback: 'Payments', icon: Receipt },
      { to: '/expenses', labelKey: 'nav_expenses', fallback: 'Expenses', icon: TrendingDown },
      { to: '/hr', labelKey: 'nav_hr', fallback: 'HR', icon: UsersRound },
      { to: '/notifications', labelKey: 'nav_notifications', fallback: 'Notifications', icon: Bell },
      { to: '/users', labelKey: 'nav_people', fallback: 'People', icon: UsersRound },
      { to: '/payroll', labelKey: 'nav_payroll', fallback: 'Зарплата', icon: Receipt },
      { to: '/permissions', labelKey: 'nav_permissions', fallback: 'Permissions', icon: LockKeyhole },
      { to: '/settings', labelKey: 'nav_settings', fallback: 'Settings', icon: Settings2 },
    ]},
  ],
  CHAIN_OWNER: [
    { label: 'Operations', labelKey: 'nav_group_operations', items: [
      { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
      { to: '/finances', labelKey: 'nav_finances', fallback: 'Финансы', icon: Wallet },
      { to: '/cashflow', labelKey: 'nav_cashflow', fallback: 'Cash Flow', icon: Activity },
      { to: '/bookings', labelKey: 'nav_bookings', fallback: 'Bookings', icon: Calendar },
      { to: '/tables', labelKey: 'nav_tables', fallback: 'Tables', icon: UsersRound },
      { to: '/menu', labelKey: 'nav_menu', fallback: 'Menu', icon: UtensilsCrossed },
      { to: '/inventory', labelKey: 'nav_inventory', fallback: 'Inventory', icon: Boxes },
      { to: '/tech-cards', labelKey: 'nav_tech_cards', fallback: 'Tech Cards', icon: UtensilsCrossed },
      { to: '/kds', labelKey: 'nav_kds', fallback: 'KDS — Кухонный экран', icon: Tv },
      { to: '/suppliers', labelKey: 'nav_suppliers', fallback: 'Закупки', icon: ShoppingCart },
      { to: '/expenses', labelKey: 'nav_expenses', fallback: 'Расходы', icon: TrendingDown },
    ]},
    { label: 'Analytics', labelKey: 'nav_group_analytics', items: [
      { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Analytics', icon: LineChart },
      { to: '/attendance', labelKey: 'nav_attendance', fallback: 'Attendance', icon: BarChart3 },
    ]},
    { label: 'Guests', labelKey: 'nav_group_guests', items: [
      { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
      { to: '/loyalty', labelKey: 'nav_loyalty', fallback: 'Loyalty', icon: Gift, featureKey: 'loyalty_program' },
    ]},
    { label: 'Management', labelKey: 'nav_group_management', items: [
      { to: '/restaurants', labelKey: 'nav_restaurants', fallback: 'Operations', icon: Store },
      { to: '/users', labelKey: 'nav_team', fallback: 'Team', icon: UsersRound },
      { to: '/online-menu-studio', labelKey: 'nav_online_menu', fallback: 'Online Menu', icon: BookOpenText, featureKey: 'online_menu' },
      { to: '/promo', labelKey: 'nav_promo', fallback: 'Promo', icon: Gift },
    ]},
    { label: 'System', labelKey: 'nav_group_system', items: [
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Reports', icon: BarChart3 },
      { to: '/payments', labelKey: 'nav_payments', fallback: 'Payments', icon: Receipt },
      { to: '/hr', labelKey: 'nav_hr', fallback: 'HR', icon: UsersRound },
      { to: '/notifications', labelKey: 'nav_notifications', fallback: 'Notifications', icon: Bell },
      { to: '/payroll', labelKey: 'nav_payroll', fallback: 'Зарплата', icon: Receipt },
      { to: '/permissions', labelKey: 'nav_permissions', fallback: 'Permissions', icon: LockKeyhole },
      { to: '/pos', labelKey: 'nav_pos', fallback: 'Касса (POS)', icon: MonitorSmartphone },
      { to: '/subscription', labelKey: 'nav_subscription', fallback: 'Subscription', icon: CreditCard },
      { to: '/settings', labelKey: 'nav_settings', fallback: 'Settings', icon: Settings2 },
    ]},
  ],
   RESTAURANT_OWNER: [
    { label: 'Аналитика', labelKey: 'nav_group_analytics', items: [
      { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Начало работы', icon: LayoutDashboard },
      { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Статистика', icon: BarChart3 },
      { to: '/analytics/abc-xyz', labelKey: 'nav_abc_xyz', fallback: 'ABC/XYZ', icon: BarChart3 },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Отчёты', icon: BarChart3 },
    ]},
    { label: 'Финансы', labelKey: 'nav_group_finance', items: [
      { to: '/finances', labelKey: 'nav_finances', fallback: 'Финансы', icon: Wallet },
      { to: '/cashflow', labelKey: 'nav_cashflow', fallback: 'Cash Flow', icon: Activity },
      { to: '/expenses', labelKey: 'nav_expenses', fallback: 'Расходы', icon: TrendingDown },
      { to: '/payments', labelKey: 'nav_payments', fallback: 'Платежи', icon: Receipt },
      { to: '/payouts', labelKey: 'nav_payouts', fallback: 'Выплаты', icon: DollarSign },
    ]},
    { label: 'Меню', labelKey: 'nav_group_menu', items: [
      { to: '/menu', labelKey: 'nav_menu_products', fallback: 'Товары', icon: Package },
      { to: '/tech-cards', labelKey: 'nav_tech_cards', fallback: 'Тех. карты', icon: UtensilsCrossed },
      { to: '/semis', labelKey: 'nav_semis', fallback: 'Полуфабрикаты', icon: Layers },
      { to: '/ingredients', labelKey: 'nav_ingredients', fallback: 'Ингредиенты', icon: Beaker },
      { to: '/menu/categories', labelKey: 'nav_menu_cats', fallback: 'Категории товаров и тех. карт', icon: Tag },
      { to: '/ingredients/categories', labelKey: 'nav_ing_cats', fallback: 'Категории ингредиентов', icon: Tag },
      { to: '/workshops', labelKey: 'nav_workshops', fallback: 'Цехи', icon: ChefHat },
      { to: '/qr-menu', labelKey: 'nav_qr_menu', fallback: 'QR-меню', icon: QrCode },
    ]},
    { label: 'Кухня', labelKey: 'nav_group_kitchen', items: [
      { to: '/kds', labelKey: 'nav_kds', fallback: 'KDS', icon: Tv },
      { to: '/printers', labelKey: 'nav_printers', fallback: 'Принтеры', icon: Receipt },
    ]},
    { label: 'Склад', labelKey: 'nav_group_stock', items: [
      { to: '/inventory', labelKey: 'nav_inventory', fallback: 'Склад', icon: Boxes },
      { to: '/suppliers', labelKey: 'nav_suppliers', fallback: 'Поставщики', icon: ShoppingCart },
    ]},
    { label: 'Гости', labelKey: 'nav_group_guests', items: [
      { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
      { to: '/loyalty', labelKey: 'nav_loyalty', fallback: 'Лояльность', icon: Gift },
      { to: '/promo', labelKey: 'nav_promo', fallback: 'Акции', icon: Gift },
      { to: '/surveys', labelKey: 'nav_surveys', fallback: 'Опросы', icon: ClipboardList },
    ]},
    { label: 'Зал', labelKey: 'nav_group_hall', items: [
      { to: '/bookings', labelKey: 'nav_bookings', fallback: 'Брони', icon: Calendar },
      { to: '/tables', labelKey: 'nav_tables', fallback: 'Столы', icon: UsersRound },
    ]},
    { label: 'Касса', labelKey: 'nav_group_pos', items: [
      { to: '/pos', labelKey: 'nav_pos', fallback: 'Касса (POS)', icon: MonitorSmartphone },
      { to: '/split-bill', labelKey: 'nav_split_bill', fallback: 'Раздел счёта', icon: Waves },
    ]},
    { label: 'Команда', labelKey: 'nav_group_team', items: [
      { to: '/users', labelKey: 'nav_users', fallback: 'Доступ', icon: LockKeyhole },
      { to: '/hr', labelKey: 'nav_hr', fallback: 'Персонал', icon: UsersRound },
      { to: '/shifts', labelKey: 'nav_shifts', fallback: 'Смены', icon: ClipboardList },
      { to: '/checklists', labelKey: 'nav_checklists', fallback: 'Чек-листы', icon: CheckSquare },
      { to: '/attendance', labelKey: 'nav_attendance', fallback: 'Посещаемость', icon: BarChart3 },
    ]},
    { label: 'Система', labelKey: 'nav_group_system', items: [
      { to: '/security', labelKey: 'nav_security', fallback: 'Безопасность', icon: LockKeyhole },
      { to: '/api-keys', labelKey: 'nav_api_keys', fallback: 'API ключи', icon: Link },
      { to: '/brand-studio', labelKey: 'nav_brand_studio', fallback: 'Брендинг', icon: Store },
      { to: '/online-menu-studio', labelKey: 'nav_online_menu', fallback: 'Онлайн-меню', icon: BookOpenText },
      { to: '/notifications', labelKey: 'nav_notifications', fallback: 'Уведомления', icon: Bell },
      { to: '/integrations', labelKey: 'nav_integrations', fallback: 'Интеграции', icon: Link },
      { to: '/settings', labelKey: 'nav_settings', fallback: 'Настройки', icon: Settings2 },
    ]},
  ],
  MANAGER: [
    { label: 'Operations', labelKey: 'nav_group_operations', items: [
      { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Главная', icon: LayoutDashboard },
      { to: '/tables', labelKey: 'nav_tables', fallback: 'Столы', icon: UsersRound },
      { to: '/bookings', labelKey: 'nav_bookings', fallback: 'Брони', icon: Calendar },
      { to: '/menu', labelKey: 'nav_menu', fallback: 'Меню', icon: UtensilsCrossed },
      { to: '/inventory', labelKey: 'nav_inventory', fallback: 'Склад', icon: Boxes },
      { to: '/tech-cards', labelKey: 'nav_tech_cards', fallback: 'Техкарты', icon: UtensilsCrossed },
      { to: '/kds', labelKey: 'nav_kds', fallback: 'KDS', icon: Tv },
      { to: '/printers', labelKey: 'nav_printers', fallback: 'Принтеры', icon: Receipt },
      { to: '/suppliers', labelKey: 'nav_suppliers', fallback: 'Закупки', icon: ShoppingCart },
    ]},
    { label: 'Guests', labelKey: 'nav_group_guests', items: [
      { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
      { to: '/split-bill', labelKey: 'nav_split_bill', fallback: 'Раздел счёта', icon: Waves },
    ]},
    { label: 'System', labelKey: 'nav_group_system', items: [
      { to: '/hr', labelKey: 'nav_hr', fallback: 'HR', icon: UsersRound },
      { to: '/users', labelKey: 'nav_team', fallback: 'Команда', icon: UsersRound },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Отчёты', icon: BarChart3 },
      { to: '/checklists', labelKey: 'nav_checklists', fallback: 'Чек-листы', icon: CheckSquare },
      { to: '/pos', labelKey: 'nav_pos', fallback: 'Касса', icon: MonitorSmartphone },
      { to: '/notifications', labelKey: 'nav_notifications', fallback: 'Notifications', icon: Bell },
      { to: '/settings', labelKey: 'nav_settings', fallback: 'Настройки', icon: Settings2 },
    ]},
  ],
  HOSTESS: [
    { label: '', labelKey: '', items: [
      { to: '/tables', labelKey: 'nav_tables', fallback: 'Столы', icon: UsersRound },
      { to: '/bookings', labelKey: 'nav_bookings', fallback: 'Брони', icon: Calendar },
      { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
    ]},
  ],
  CHEF: [
    { label: '', labelKey: '', items: [
      { to: '/kds', labelKey: 'nav_kds', fallback: 'KDS', icon: Tv },
      { to: '/inventory', labelKey: 'nav_inventory', fallback: 'Склад', icon: Boxes },
      { to: '/tech-cards', labelKey: 'nav_tech_cards', fallback: 'Техкарты', icon: UtensilsCrossed },
      { to: '/suppliers', labelKey: 'nav_suppliers', fallback: 'Закупки', icon: ShoppingCart },
      { to: '/printers', labelKey: 'nav_printers', fallback: 'Принтеры', icon: Receipt },
    ]},
  ],
  KITCHEN_MANAGER: [
    { label: '', labelKey: '', items: [
      { to: '/kds', labelKey: 'nav_kds', fallback: 'KDS', icon: Tv },
      { to: '/inventory', labelKey: 'nav_inventory', fallback: 'Склад', icon: Boxes },
      { to: '/tech-cards', labelKey: 'nav_tech_cards', fallback: 'Техкарты', icon: UtensilsCrossed },
      { to: '/checklists', labelKey: 'nav_checklists', fallback: 'Чек-листы', icon: CheckSquare },
    ]},
  ],
  HEAD_CHEF: [
    { label: '', labelKey: '', items: [
      { to: '/kds', labelKey: 'nav_kds', fallback: 'KDS', icon: Tv },
      { to: '/tech-cards', labelKey: 'nav_tech_cards', fallback: 'Техкарты', icon: UtensilsCrossed },
    ]},
  ],
  COOK: [
    { label: '', labelKey: '', items: [
      { to: '/kds', labelKey: 'nav_kds', fallback: 'KDS', icon: Tv },
    ]},
  ],
  BARTENDER: [
    { label: '', labelKey: '', items: [
      { to: '/kds', labelKey: 'nav_kds', fallback: 'KDS', icon: Tv },
      { to: '/barista', labelKey: 'nav_barista', fallback: 'Бар', icon: Coffee },
    ]},
  ],
  BARISTA: [
    { label: '', labelKey: '', items: [
      { to: '/barista', labelKey: 'nav_barista', fallback: 'Бар', icon: Coffee },
      { to: '/kds', labelKey: 'nav_kds', fallback: 'KDS', icon: Tv },
    ]},
  ],
  ACCOUNTANT: [
    { label: '', labelKey: '', items: [
      { to: '/accountant', labelKey: 'nav_accountant', fallback: 'Панель бухгалтера', icon: Wallet },
      { to: '/finances', labelKey: 'nav_finances', fallback: 'Финансы', icon: Wallet },
      { to: '/cashflow', labelKey: 'nav_cashflow', fallback: 'Cash Flow', icon: Activity },
      { to: '/expenses', labelKey: 'nav_expenses', fallback: 'Расходы', icon: TrendingDown },
      { to: '/payroll', labelKey: 'nav_payroll', fallback: 'Зарплата', icon: Receipt },
      { to: '/payouts', labelKey: 'nav_payouts', fallback: 'Выплаты', icon: DollarSign },
      { to: '/payments', labelKey: 'nav_payments', fallback: 'Платежи', icon: Receipt },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Отчёты', icon: BarChart3 },
      { to: '/security', labelKey: 'nav_security', fallback: 'Безопасность', icon: LockKeyhole },
    ]},
  ],
  ANALYST: [
    { label: '', labelKey: '', items: [
      { to: '/analyst', labelKey: 'nav_analyst', fallback: 'Панель аналитика', icon: LineChart },
      { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Аналитика', icon: LineChart },
      { to: '/attendance', labelKey: 'nav_attendance', fallback: 'Attendance', icon: BarChart3 },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Отчёты', icon: BarChart3 },
      { to: '/security', labelKey: 'nav_security', fallback: 'Безопасность', icon: LockKeyhole },
    ]},
  ],
  MARKETER: [
    { label: '', labelKey: '', items: [
      { to: '/marketer', labelKey: 'nav_marketer', fallback: 'Панель маркетолога', icon: Gift },
      { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
      { to: '/loyalty', labelKey: 'nav_loyalty', fallback: 'Лояльность', icon: Gift },
      { to: '/promo', labelKey: 'nav_promo', fallback: 'Promo', icon: Gift },
      { to: '/surveys', labelKey: 'nav_surveys', fallback: 'Опросы', icon: ClipboardList },
      { to: '/auto-notify', labelKey: 'nav_auto_notify', fallback: 'Авто-уведомления', icon: Bell },
      { to: '/notifications', labelKey: 'nav_notifications', fallback: 'Notifications', icon: Bell },
      { to: '/brand-studio', labelKey: 'nav_brand_studio', fallback: 'Брендинг', icon: Store },
    ]},
  ],
  SUPPORT: [
    { label: '', labelKey: '', items: [
      { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Главная', icon: LayoutDashboard },
      { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
      { to: '/notifications', labelKey: 'nav_notifications', fallback: 'Notifications', icon: Bell },
      { to: '/security', labelKey: 'nav_security', fallback: 'Безопасность', icon: LockKeyhole },
    ]},
  ],
  AUDITOR: [
    { label: '', labelKey: '', items: [
      { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Аналитика', icon: LineChart },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Отчёты', icon: BarChart3 },
      { to: '/finances', labelKey: 'nav_finances', fallback: 'Финансы', icon: Wallet },
      { to: '/security', labelKey: 'nav_security', fallback: 'Безопасность', icon: LockKeyhole },
      { to: '/attendance', labelKey: 'nav_attendance', fallback: 'Attendance', icon: BarChart3 },
    ]},
  ],
  SUPPLIER: [
    { label: '', labelKey: '', items: [
      { to: '/supplier', labelKey: 'nav_supplier', fallback: 'Поставки', icon: ShoppingCart },
    ]},
  ],
  COURIER: [
    { label: '', labelKey: '', items: [
      { to: '/courier', labelKey: 'nav_courier', fallback: 'Доставка', icon: ShoppingCart },
    ]},
  ],
  DISPATCHER: [
    { label: '', labelKey: '', items: [
      { to: '/dispatcher', labelKey: 'nav_dispatcher', fallback: 'Диспетчер', icon: MonitorSmartphone },
    ]},
  ],
  SHIFT_LEADER: [
    { label: '', labelKey: '', items: [
      { to: '/attendance', labelKey: 'nav_attendance', fallback: 'Attendance', icon: BarChart3 },
      { to: '/shifts', labelKey: 'nav_shifts', fallback: 'Смены', icon: ClipboardList },
      { to: '/checklists', labelKey: 'nav_checklists', fallback: 'Чек-листы', icon: CheckSquare },
      { to: '/hr', labelKey: 'nav_hr', fallback: 'HR', icon: UsersRound },
    ]},
  ],
  HEAD_WAITER: [
    { label: '', labelKey: '', items: [
      { to: '/tables', labelKey: 'nav_tables', fallback: 'Столы', icon: UsersRound },
      { to: '/pos', labelKey: 'nav_pos', fallback: 'Касса', icon: MonitorSmartphone },
      { to: '/bookings', labelKey: 'nav_bookings', fallback: 'Брони', icon: Calendar },
      { to: '/shifts', labelKey: 'nav_shifts', fallback: 'Смены', icon: ClipboardList },
      { to: '/hr', labelKey: 'nav_hr', fallback: 'HR', icon: UsersRound },
      { to: '/attendance', labelKey: 'nav_attendance', fallback: 'Attendance', icon: BarChart3 },
      { to: '/users', labelKey: 'nav_team', fallback: 'Команда', icon: UsersRound },
    ]},
  ],
  WAITER: [
    { label: '', labelKey: '', items: [
      { to: '/tables', labelKey: 'nav_tables', fallback: 'Столы', icon: UsersRound },
      { to: '/pos', labelKey: 'nav_pos', fallback: 'Касса', icon: MonitorSmartphone },
    ]},
  ],
};


interface AppShellProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  restaurants?: Array<any>;
  selectedRestaurantId?: string;
  onRestaurantChange?: (restaurantId: string) => void;
  subscriptionGate?: { active: boolean; restaurantName?: string };
  children: React.ReactNode;
}

export function AppShell({ title, subtitle, eyebrow, restaurants = [], selectedRestaurantId, onRestaurantChange, subscriptionGate, children }: AppShellProps) {
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const { theme, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isOwner = user?.role === 'CHAIN_OWNER' || user?.role === 'RESTAURANT_OWNER';
  const [shellRestaurants, setShellRestaurants] = useState<any[]>([]);
  const [shellSelectedRestaurantId, setShellSelectedRestaurantId] = useState('');
  useEffect(() => {
    if (!isOwner || restaurants.length > 0) return;
    let active = true;
    ownerAPI.getMe().then((response) => {
      if (!active) return;
      const nextRestaurants = response.data?.restaurants || [];
      const savedId = localStorage.getItem('waitly-selected-restaurant') || '';
      setShellRestaurants(nextRestaurants);
      setShellSelectedRestaurantId(nextRestaurants.some((item: any) => item.id === savedId) ? savedId : nextRestaurants[0]?.id || '');
    }).catch(() => undefined);
    return () => { active = false; };
  }, [isOwner, restaurants.length]);
  const availableRestaurants = restaurants.length > 0 ? restaurants : shellRestaurants;
  const availableSelectedRestaurantId = selectedRestaurantId || shellSelectedRestaurantId || availableRestaurants[0]?.id || '';
  const handleShellRestaurantChange = (restaurantId: string) => {
    setShellSelectedRestaurantId(restaurantId);
    localStorage.setItem('waitly-selected-restaurant', restaurantId);
    onRestaurantChange?.(restaurantId);
  };
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem('waitly-sidebar-open');
    if (saved !== null) return saved === '1';
    return false;
  });
  useEffect(() => { localStorage.setItem('waitly-sidebar-open', open ? '1' : '0'); }, [open]);
  const selectedRestaurant = availableRestaurants.find((restaurant) => restaurant.id === availableSelectedRestaurantId) || availableRestaurants[0] || null;
  const navItems = (navByRole[user?.role as keyof typeof navByRole] || []).map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!item.featureKey) return true;
      return FEATURES[item.featureKey] === true;
    }),
  })).filter(group => group.items.length > 0);
  const [visibleTick, setVisibleTick] = useState(0);
  useEffect(() => {
    const h = () => setVisibleTick(t => t + 1);
    window.addEventListener('page-visibility-changed', h);
    window.addEventListener('storage', h);
    return () => { window.removeEventListener('page-visibility-changed', h); window.removeEventListener('storage', h); }
  }, []);
  const visibleSet = getVisiblePages(availableSelectedRestaurantId || selectedRestaurant?.id || null, user?.role || 'RESTAURANT_OWNER');
  void visibleTick;
  const filteredNavItems = navItems.map(g => ({ ...g, items: g.items.filter(i => visibleSet.has(i.to)) })).filter(g => g.items.length > 0);
  const activeWorkspace = selectedRestaurant?.name || (isOwner ? t('shell_workspace_loading', 'Загрузка рабочей зоны…') : t('appShell_active_workspace', 'Waitly dashboard'));
  const effectiveSubscriptionGate = subscriptionGate || (user?.role !== 'SUPER_ADMIN' && selectedRestaurant ? { active: selectedRestaurant.subscription_active !== false, restaurantName: selectedRestaurant.name } : undefined);
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: t('role_super_admin', 'Platform admin'),
    CHAIN_OWNER: t('role_chain_owner', 'Chain owner'),
    RESTAURANT_OWNER: t('role_restaurant_owner', 'Restaurant owner'),
  };
  const profileData = {
    name: user?.full_name || t('profile_workspace_user', 'Workspace user'),
    email: user?.email || 'admin@waitly.local',
    subscription: user?.role === 'SUPER_ADMIN' ? t('profile_control', 'Control') : t('profile_owner', 'Owner'),
    workspace: activeWorkspace,
  };
  const makeLink = (item: NavItem) => ({ label: t(item.labelKey, item.fallback), href: item.to, icon: <item.icon className="h-[18px] w-[18px] shrink-0" /> });
  const handleLogout = () => { logout(); navigate('/login'); };
  const handleRestaurantDelete = async (restaurantId: string) => {
    const restaurant = availableRestaurants.find((item) => item.id === restaurantId);
    if (!restaurant || !window.confirm(`Удалить заведение «${restaurant.name}»? Это действие нельзя отменить.`)) return;
    try {
      await ownerAPI.deleteRestaurant(restaurantId);
      window.location.reload();
    } catch (error: any) {
      window.alert(error?.response?.data?.error || 'Не удалось удалить заведение.');
    }
  };

  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    navItems.forEach((group, gi) => {
      if (!group.label) { initial.add(gi); return; }
      const anyActive = group.items.some(item => location.pathname === item.to);
      if (anyActive) initial.add(gi);
    });
    return initial;
  });
  const toggleGroup = (gi: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(gi)) next.delete(gi); else next.add(gi);
      return next;
    });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1920px]">
        <Sidebar open={open} setOpen={setOpen} animate={true}>
          <SidebarBody className={`bg-theme-sidebar z-50 justify-between gap-8 border-r border-theme-surface backdrop-blur-2xl md:sticky md:top-0 md:h-screen ${open ? 'px-4 py-5' : 'px-2 py-4'}`}>
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              {open ? <BrandMark className="mb-6 [&_img]:h-10 [&_img]:w-10 [&_img]:rounded-xl" /> : <div className="flex justify-center mb-6"><img src={logoUrl} alt="Waitly" className="h-9 w-9 object-contain rounded-xl" /></div>}
              {open ? (
              <div className="mb-5 rounded-[26px] border border-theme-surface bg-theme-panel p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-theme-secondary">{t('shell_workspace', 'Workspace')}</div>
                <div className="mt-2 font-display text-lg text-theme">{activeWorkspace}</div>
                <div className="mt-1 text-sm text-theme-secondary">{roleLabels[user?.role || ''] || t('shell_workspace_member', 'Workspace member')}</div>
              </div>
              ) : null}
              <div className={open ? 'space-y-5' : 'flex flex-col items-center gap-1 w-full'}>
                {(() => {
                  const allItems = filteredNavItems.flatMap(g => g.items);
                  const collapsedItems = allItems.slice(0, 7);
                  const hasMore = allItems.length > 7;
                  if (!open) {
                    return (
                      <>
                        {collapsedItems.map((item) => {
                          const href = item.to;
                          const active = location.pathname === href || location.pathname.startsWith(href + '/');
                          const link = makeLink(item);
                          return (
                            <SidebarLink key={href} link={link} className={
                              active
                                ? 'bg-white text-black shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                            } />
                          );
                        })}
                        {hasMore ? <div className="mt-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/30">+{allItems.length - 7}</div> : null}
                        <div className="mt-2 text-[9px] tracking-[0.12em] text-white/20 uppercase">hover →</div>
                      </>
                    );
                  }
                  return filteredNavItems.map((group, gi) => {
                    const isOpen = expandedGroups.has(gi);
                    return (
                      <div key={gi}>
                        {group.label ? (
                          <button
                            onClick={() => toggleGroup(gi)}
                            className="w-full flex items-center justify-between px-2 py-1.5 mb-1 rounded-md hover:bg-white/[0.04] transition-colors group"
                          >
                            <span className="text-[10px] font-semibold tracking-[0.14em] text-white/35 group-hover:text-white/55 uppercase">{t(group.labelKey, group.label)}</span>
                            <span className="text-white/20 group-hover:text-white/40">{isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</span>
                          </button>
                        ) : null}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                              className="space-y-0.5 overflow-hidden"
                            >
                              {group.items.map((item) => {
                                const href = item.to;
                                const active = location.pathname === href || location.pathname.startsWith(href + '/');
                                const link = makeLink(item);
                                return (
                                  <SidebarLink key={href} link={link} className={
                                    active
                                      ? 'bg-white text-black shadow-sm'
                                      : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                                  } />
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            {open ? (
            <div className="rounded-[28px] border border-theme-surface bg-theme-panel p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(125,211,252,0.3),rgba(52,211,153,0.15))]"><Waves className="h-5 w-5 text-[#8fd4ff]" /></div>
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-theme-secondary">{t('shell_current_role', 'Current role')}</div>
                  <div className="mt-1 font-display text-base text-theme">{roleLabels[user?.role || ''] || t('shell_workspace_member', 'Workspace member')}</div>
                </div>
              </div>
            </div>
            ) : (
            <div className="flex justify-center py-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5" title={roleLabels[user?.role || ''] || ''}><Waves className="h-4 w-4 text-white/60" /></div>
            </div>
            )}
          </SidebarBody>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col overflow-visible">
          <div className="flex-1 px-4 py-4 md:px-6 md:py-5 xl:px-8">
            <header className="sticky top-0 z-30 mb-4 rounded-2xl border border-theme bg-theme-surface p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  {eyebrow ? <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8fd4ff]">{eyebrow}</div> : null}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                    <h1 className="font-display text-2xl leading-none text-theme md:text-[1.9rem]">{title}</h1>
                    <span className="inline-flex rounded-full border border-theme bg-theme-panel px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-theme-secondary">{roleLabels[user?.role || ''] || t('appShell_operator', 'Operator')}</span>
                  </div>
                  <p className="mt-2 max-w-4xl text-[13px] leading-6 text-theme-secondary">{subtitle}</p>
                  {user?.full_name ? <div className="mt-2 flex items-center gap-2 text-xs text-theme-secondary"><span>{t('appShell_welcome_back', 'С возвращением, ')}<strong className="text-theme">{user.full_name.split(' ')[0]}</strong></span></div> : null}
                </div>
                <div className="flex flex-col gap-3 lg:min-w-[520px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <label className="flex items-center gap-2 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme-secondary"><span className="text-theme-muted">{t('shell_language', 'Language')}</span><div className="relative"><select value={locale} onChange={(event) => setLocale(event.target.value as 'ru' | 'en' | 'uz')} className="appearance-none bg-transparent pr-7 text-sm font-semibold text-theme outline-none"><option value="ru">RU</option><option value="en">EN</option><option value="uz">UZ</option></select><ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" /></div></label>
                   {isOwner ? <Select placeholder={t('shell_workspace_select', 'Рабочая зона')} options={availableRestaurants.map(r => ({ value: r.id, label: r.name }))} value={availableSelectedRestaurantId} onChange={handleShellRestaurantChange} actionLabel={t('shell_add_workspace', 'Добавить заведение')} onAction={() => navigate('/setup')} onDelete={availableRestaurants.length > 0 ? handleRestaurantDelete : undefined} /> : null}
                   <button onClick={toggleTheme} className="rounded-2xl border border-theme bg-[var(--input-bg)] p-3 text-theme-secondary hover:text-theme transition-colors">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
                   <AppNotificationBell inactive={Boolean(effectiveSubscriptionGate && !effectiveSubscriptionGate.active)} />
                   <ProfileDropdown className="w-full sm:w-auto" data={profileData} onSignOut={handleLogout} />
                </div>
              </div>
            </header>
            {effectiveSubscriptionGate && !effectiveSubscriptionGate.active ? <div className="mb-5 rounded-[28px] border border-amber-300/18 bg-[linear-gradient(135deg,rgba(249,115,96,0.16),rgba(247,178,103,0.08))] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-300/20 bg-black/20"><LockKeyhole className="h-5 w-5 text-[#ffd28d]" /></div><div><div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd28d]">{t('appShell_paywall', 'Waitly Control paywall')}</div><div className="mt-1 text-sm font-semibold text-theme">{effectiveSubscriptionGate.restaurantName ? t('appShell_restaurant_inactive', '{name}: subscription is inactive.').replace('{name}', effectiveSubscriptionGate.restaurantName) : t('appShell_subscription_inactive', 'Subscription is inactive.')}</div><div className="mt-1 text-sm text-theme-secondary">{t('appShell_paywall_description', 'Core modules stay limited until the owner activates a subscription. This notice stays visible across owner pages.')}</div></div></div><Button variant="secondary" size="sm" onClick={() => navigate('/subscription')}>{t('appShell_activate_subscription', 'Activate subscription')}</Button></div></div> : null}
            <main className="pb-10">{children}</main>
          </div>
        </div>
      </div>
      <AIAssistant restaurantId={selectedRestaurantId} />
    </div>
  );
}
