export type PageDef = { path: string; label: string; labelKey?: string; group: string; roles: string[] };

export const ALL_PAGES: PageDef[] = [
  { path: '/dashboard', label: 'Начало работы', group: 'Главное', roles: ['RESTAURANT_OWNER','CHAIN_OWNER','SUPER_ADMIN','MANAGER'] },
  { path: '/analytics', label: 'Статистика', group: 'Аналитика', roles: ['RESTAURANT_OWNER','CHAIN_OWNER','SUPER_ADMIN'] },
  { path: '/finances', label: 'Финансы', group: 'Финансы', roles: ['RESTAURANT_OWNER','ACCOUNTANT'] },
  { path: '/cashflow', label: 'Cash Flow', group: 'Финансы', roles: ['RESTAURANT_OWNER','ACCOUNTANT'] },
  { path: '/expenses', label: 'Расходы', group: 'Финансы', roles: ['RESTAURANT_OWNER'] },
  { path: '/reports', label: 'Отчёты', group: 'Финансы', roles: ['RESTAURANT_OWNER','ACCOUNTANT'] },
  { path: '/payments', label: 'Платежи', group: 'Финансы', roles: ['RESTAURANT_OWNER'] },
  { path: '/menu', label: 'Меню', group: 'Кухня', roles: ['RESTAURANT_OWNER','MANAGER','CHEF'] },
  { path: '/tech-cards', label: 'Техкарты', group: 'Кухня', roles: ['RESTAURANT_OWNER','CHEF'] },
  { path: '/inventory', label: 'Склад', group: 'Склад', roles: ['RESTAURANT_OWNER','CHEF'] },
  { path: '/suppliers', label: 'Поставщики', group: 'Склад', roles: ['RESTAURANT_OWNER'] },
  { path: '/kds', label: 'KDS', group: 'Кухня', roles: ['RESTAURANT_OWNER','CHEF'] },
  { path: '/printers', label: 'Принтеры', group: 'Кухня', roles: ['RESTAURANT_OWNER'] },
  { path: '/crm', label: 'Маркетинг', group: 'Гости', roles: ['RESTAURANT_OWNER','MARKETER'] },
  { path: '/loyalty', label: 'Лояльность', group: 'Гости', roles: ['RESTAURANT_OWNER'] },
  { path: '/promo', label: 'Акции', group: 'Гости', roles: ['RESTAURANT_OWNER','MARKETER'] },
  { path: '/surveys', label: 'Опросы', group: 'Гости', roles: ['RESTAURANT_OWNER'] },
  { path: '/reviews', label: 'Отзывы', group: 'Гости', roles: ['RESTAURANT_OWNER'] },
  { path: '/bookings', label: 'Брони', group: 'Зал', roles: ['RESTAURANT_OWNER','MANAGER','HOSTESS'] },
  { path: '/tables', label: 'Столы', group: 'Зал', roles: ['RESTAURANT_OWNER','MANAGER'] },
  { path: '/pos', label: 'Касса (POS)', group: 'Касса', roles: ['RESTAURANT_OWNER','MANAGER','WAITER'] },
  { path: '/split-bill', label: 'Раздел счёта', group: 'Касса', roles: ['RESTAURANT_OWNER'] },
  { path: '/payouts', label: 'Выплаты', group: 'Касса', roles: ['RESTAURANT_OWNER'] },
  { path: '/users', label: 'Доступ', group: 'Команда', roles: ['RESTAURANT_OWNER'] },
  { path: '/hr', label: 'Персонал', group: 'Команда', roles: ['RESTAURANT_OWNER'] },
  { path: '/shifts', label: 'Смены', group: 'Команда', roles: ['RESTAURANT_OWNER'] },
  { path: '/checklists', label: 'Чек-листы', group: 'Команда', roles: ['RESTAURANT_OWNER'] },
  { path: '/attendance', label: 'Посещаемость', group: 'Команда', roles: ['RESTAURANT_OWNER'] },
  { path: '/security', label: 'Безопасность', group: 'Система', roles: ['RESTAURANT_OWNER','SUPER_ADMIN'] },
  { path: '/api-keys', label: 'API ключи', group: 'Система', roles: ['RESTAURANT_OWNER'] },
  { path: '/brand-studio', label: 'Брендинг', group: 'Система', roles: ['RESTAURANT_OWNER'] },
  { path: '/online-menu-studio', label: 'Онлайн-меню', group: 'Система', roles: ['RESTAURANT_OWNER'] },
  { path: '/notifications', label: 'Уведомления', group: 'Система', roles: ['RESTAURANT_OWNER'] },
  { path: '/integrations', label: 'Интеграции', group: 'Система', roles: ['RESTAURANT_OWNER'] },
  { path: '/settings', label: 'Настройки', group: 'Система', roles: ['RESTAURANT_OWNER'] },
];

export function getVisiblePages(restaurantId: string | null, role: string): Set<string> {
  const key = `waitly-visible-pages:${restaurantId || 'global'}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (parsed.length === 0) throw new Error('empty');
      if (parsed.length <= 9) {
        localStorage.removeItem(key);
        throw new Error('migrate');
      }
      return new Set(parsed);
    }
  } catch {}
  return new Set(ALL_PAGES.filter(p => p.roles.includes(role) || p.roles.includes('RESTAURANT_OWNER') || role === 'SUPER_ADMIN').map(p => p.path));
}
export function setVisiblePages(restaurantId: string | null, paths: string[]) {
  const key = `waitly-visible-pages:${restaurantId || 'global'}`;
  localStorage.setItem(key, JSON.stringify(paths));
}
