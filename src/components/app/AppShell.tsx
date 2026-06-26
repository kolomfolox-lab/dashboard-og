import { BarChart3, Bell, BookOpenText, Boxes, Calendar, ChevronDown, ChevronRight, ContactRound, CreditCard, Gift, LayoutDashboard, LineChart, LockKeyhole, Moon, Receipt, Settings2, Store, Sun, UsersRound, UtensilsCrossed, Waves } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BrandMark } from '@/components/app/BrandMark';
import { OwnerWelcomeDialog } from '@/components/app/OwnerWelcomeDialog';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { Select } from '@/components/ui/select';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useTheme } from '@/context/ThemeContext';

type NavItem = { to: string; labelKey: string; fallback: string; icon: any };
type NavGroup = { label: string; items: NavItem[] };

const navByRole: Record<string, NavGroup[]> = {
  SUPER_ADMIN: [
    { label: '', items: [
      { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
      { to: '/restaurants', labelKey: 'nav_restaurants', fallback: 'Networks', icon: Store },
      { to: '/keys', labelKey: 'nav_keys', fallback: 'Keys', icon: LockKeyhole },
    ]},
    { label: '', items: [
      { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Analytics', icon: LineChart },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Reports', icon: BarChart3 },
      { to: '/data-export', labelKey: 'nav_data_export', fallback: 'Data Export', icon: BarChart3 },
      { to: '/payments', labelKey: 'nav_payments', fallback: 'Payments', icon: Receipt },
      { to: '/users', labelKey: 'nav_people', fallback: 'People', icon: UsersRound },
      { to: '/permissions', labelKey: 'nav_permissions', fallback: 'Permissions', icon: LockKeyhole },
      { to: '/settings', labelKey: 'nav_settings', fallback: 'Settings', icon: Settings2 },
    ]},
  ],
  CHAIN_OWNER: [
    { label: 'Operations', items: [
      { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
      { to: '/bookings', labelKey: 'nav_bookings', fallback: 'Bookings', icon: Calendar },
      { to: '/tables', labelKey: 'nav_tables', fallback: 'Tables', icon: UsersRound },
      { to: '/menu', labelKey: 'nav_menu', fallback: 'Menu', icon: UtensilsCrossed },
      { to: '/inventory', labelKey: 'nav_inventory', fallback: 'Inventory', icon: Boxes },
    ]},
    { label: 'Analytics', items: [
      { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Analytics', icon: LineChart },
      { to: '/attendance', labelKey: 'nav_attendance', fallback: 'Attendance', icon: BarChart3 },
    ]},
    { label: 'Guests', items: [
      { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
      { to: '/loyalty', labelKey: 'nav_loyalty', fallback: 'Loyalty', icon: Gift },
      { to: '/surveys', labelKey: 'nav_surveys', fallback: 'Surveys', icon: ContactRound },
      { to: '/auto-notify', labelKey: 'nav_auto_notify', fallback: 'Auto Notify', icon: ContactRound },
    ]},
    { label: 'Management', items: [
      { to: '/restaurants', labelKey: 'nav_restaurants', fallback: 'Restaurants', icon: Store },
      { to: '/users', labelKey: 'nav_team', fallback: 'Team', icon: UsersRound },
      { to: '/tech-cards', labelKey: 'nav_tech_cards', fallback: 'Tech Cards', icon: UtensilsCrossed },
      { to: '/online-menu-studio', labelKey: 'nav_online_menu', fallback: 'Online Menu', icon: BookOpenText },
      { to: '/promo', labelKey: 'nav_promo', fallback: 'Promo', icon: Gift },
    ]},
    { label: 'System', items: [
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Reports', icon: BarChart3 },
      { to: '/data-export', labelKey: 'nav_data_export', fallback: 'Data Export', icon: BarChart3 },
      { to: '/payments', labelKey: 'nav_payments', fallback: 'Payments', icon: Receipt },
      { to: '/permissions', labelKey: 'nav_permissions', fallback: 'Permissions', icon: LockKeyhole },
      { to: '/subscription', labelKey: 'nav_subscription', fallback: 'Subscription', icon: CreditCard },
      { to: '/settings', labelKey: 'nav_settings', fallback: 'Settings', icon: Settings2 },
    ]},
  ],
  ACCOUNTANT: [
    { label: '', items: [
      { to: '/accountant', labelKey: 'nav_accountant', fallback: 'Accountant', icon: LayoutDashboard },
      { to: '/payments', labelKey: 'nav_payments', fallback: 'Payments', icon: Receipt },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Reports', icon: BarChart3 },
      { to: '/data-export', labelKey: 'nav_data_export', fallback: 'Data Export', icon: BarChart3 },
    ]},
  ],
  MARKETER: [
    { label: '', items: [
      { to: '/marketer', labelKey: 'nav_marketer', fallback: 'Marketer', icon: LayoutDashboard },
      { to: '/promo', labelKey: 'nav_promo', fallback: 'Promo', icon: Gift },
      { to: '/auto-notify', labelKey: 'nav_auto_notify', fallback: 'Auto Notify', icon: Bell },
      { to: '/surveys', labelKey: 'nav_surveys', fallback: 'Surveys', icon: ContactRound },
    ]},
  ],
  ANALYST: [
    { label: '', items: [
      { to: '/analyst', labelKey: 'nav_analyst', fallback: 'Analyst', icon: LayoutDashboard },
      { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Analytics', icon: LineChart },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Reports', icon: BarChart3 },
      { to: '/data-export', labelKey: 'nav_data_export', fallback: 'Data Export', icon: BarChart3 },
    ]},
  ],
  RESTAURANT_OWNER: [
    { label: 'Operations', items: [
      { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
      { to: '/bookings', labelKey: 'nav_bookings', fallback: 'Bookings', icon: Calendar },
      { to: '/tables', labelKey: 'nav_tables', fallback: 'Tables', icon: UsersRound },
      { to: '/menu', labelKey: 'nav_menu', fallback: 'Menu', icon: UtensilsCrossed },
      { to: '/inventory', labelKey: 'nav_inventory', fallback: 'Inventory', icon: Boxes },
    ]},
    { label: 'Analytics', items: [
      { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Analytics', icon: LineChart },
      { to: '/attendance', labelKey: 'nav_attendance', fallback: 'Attendance', icon: BarChart3 },
      { to: '/reports', labelKey: 'nav_reports', fallback: 'Reports', icon: BarChart3 },
    ]},
    { label: 'Guests', items: [
      { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
      { to: '/loyalty', labelKey: 'nav_loyalty', fallback: 'Loyalty', icon: Gift },
      { to: '/surveys', labelKey: 'nav_surveys', fallback: 'Surveys', icon: ContactRound },
      { to: '/auto-notify', labelKey: 'nav_auto_notify', fallback: 'Auto Notify', icon: ContactRound },
    ]},
    { label: 'Management', items: [
      { to: '/restaurants', labelKey: 'nav_restaurants', fallback: 'Operations', icon: Store },
      { to: '/users', labelKey: 'nav_team', fallback: 'Team', icon: UsersRound },
      { to: '/tech-cards', labelKey: 'nav_tech_cards', fallback: 'Tech Cards', icon: UtensilsCrossed },
      { to: '/online-menu-studio', labelKey: 'nav_online_menu', fallback: 'Online Menu', icon: BookOpenText },
      { to: '/promo', labelKey: 'nav_promo', fallback: 'Promo', icon: Gift },
    ]},
    { label: 'System', items: [
      { to: '/data-export', labelKey: 'nav_data_export', fallback: 'Data Export', icon: BarChart3 },
      { to: '/payments', labelKey: 'nav_payments', fallback: 'Payments', icon: Receipt },
      { to: '/permissions', labelKey: 'nav_permissions', fallback: 'Permissions', icon: LockKeyhole },
      { to: '/subscription', labelKey: 'nav_subscription', fallback: 'Subscription', icon: CreditCard },
      { to: '/settings', labelKey: 'nav_settings', fallback: 'Profile', icon: Settings2 },
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
  const navItems = navByRole[user?.role as keyof typeof navByRole] || navByRole.RESTAURANT_OWNER;
  const [open, setOpen] = useState(true);
  const selectedRestaurant = restaurants.find((restaurant) => restaurant.id === selectedRestaurantId) || restaurants[0] || null;
  const welcomeStorageKey = user?.id ? `waitly-owner-welcome:${user.id}` : 'waitly-owner-welcome';
  const shouldWelcomeOwner = user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER';
  const [welcomeOpen, setWelcomeOpen] = useState(() => {
    if (!shouldWelcomeOwner) return false;
    return localStorage.getItem(welcomeStorageKey) !== 'done';
  });
  const activeWorkspace = selectedRestaurant?.name || 'Waitly dashboard';
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
  const makeLink = (item: NavItem) => ({ label: t(item.labelKey, item.fallback), href: item.to, icon: <item.icon className="h-4 w-4 flex-shrink-0 text-white/72" /> });
  const handleLogout = () => { logout(); navigate('/login'); };

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
  const completeWelcome = () => {
    localStorage.setItem(welcomeStorageKey, 'done');
    localStorage.setItem('waitly-onboarding-complete', 'true');
    setWelcomeOpen(false);
  };
  const openNotification = () => {
    const notification = document.getElementById('waitly-notification');
    if (!notification) return;
    notification.classList.remove('translate-y-full', 'opacity-0');
    setTimeout(() => notification.classList.add('translate-y-full', 'opacity-0'), 4000);
  };

  return (
    <div className="min-h-screen text-white">
      {welcomeOpen && shouldWelcomeOwner ? (
        <OwnerWelcomeDialog ownerName={user?.full_name} workspaceName={activeWorkspace} onComplete={completeWelcome} />
      ) : null}
      <div className="mx-auto flex min-h-screen w-full max-w-[1920px]">
        <Sidebar open={open} setOpen={setOpen} animate={false}>
          <SidebarBody className="bg-theme-sidebar z-50 justify-between gap-8 border-r border-theme-surface px-4 py-5 backdrop-blur-2xl md:sticky md:top-0 md:h-screen">
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <BrandMark className="mb-8" />
              <div className="mb-5 rounded-[26px] border border-theme-surface bg-theme-panel p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-theme-secondary">{t('shell_workspace', 'Workspace')}</div>
                <div className="mt-2 font-display text-lg text-theme">{activeWorkspace}</div>
                <div className="mt-1 text-sm text-theme-secondary">{roleLabels[user?.role || ''] || t('shell_workspace_member', 'Workspace member')}</div>
              </div>
              <div className="flex flex-col gap-1">
                {navItems.map((group, gi) => {
                  const isOpen = expandedGroups.has(gi);
                  return (
                    <div key={gi}>
                      <div
                        onClick={() => group.label ? toggleGroup(gi) : null}
                        className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] ${group.label ? 'cursor-pointer text-theme-muted hover:text-theme-secondary hover:bg-white/[0.03]' : 'text-theme-muted'}`}
                      >
                        <span>{group.label || ''}</span>
                        {group.label ? (
                          isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
                        ) : null}
                      </div>
                      <div className={`flex flex-col gap-0.5 overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        {group.items.map((item) => {
                          const href = item.to;
                          const active = location.pathname === href;
                          const link = makeLink(item);
                          return (
                            <SidebarLink key={href} link={link} className={
                              active
                                ? 'rounded-xl border border-theme bg-theme-panel px-2.5 py-1.5'
                                : 'rounded-xl px-2.5 py-1.5 hover:bg-[var(--panel-bg)]'
                            } />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[28px] border border-theme-surface bg-theme-panel p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(125,211,252,0.3),rgba(52,211,153,0.15))]"><Waves className="h-5 w-5 text-[#8fd4ff]" /></div>
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-theme-secondary">{t('shell_current_role', 'Current role')}</div>
                  <div className="mt-1 font-display text-base text-theme">{roleLabels[user?.role || ''] || t('shell_workspace_member', 'Workspace member')}</div>
                </div>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col overflow-visible">
          <div className="flex-1 px-4 py-4 md:px-6 md:py-5 xl:px-8">
            <header className="sticky top-0 z-30 mb-5 rounded-[30px] border border-theme bg-theme-surface p-4 shadow-[0_20px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl lg:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8fd4ff]">{eyebrow}</div> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-3xl leading-none text-theme md:text-[2.4rem]">{title}</h1>
                    <span className="inline-flex rounded-full border border-theme bg-theme-panel px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-theme-secondary">{roleLabels[user?.role || ''] || 'Operator'}</span>
                  </div>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-theme-secondary">{subtitle}</p>
                </div>
                <div className="flex flex-col gap-3 lg:min-w-[520px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <label className="flex items-center gap-2 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme-secondary"><span className="text-theme-muted">{t('shell_language', 'Language')}</span><div className="relative"><select value={locale} onChange={(event) => setLocale(event.target.value as 'ru' | 'en' | 'uz')} className="appearance-none bg-transparent pr-7 text-sm font-semibold text-theme outline-none"><option value="ru">RU</option><option value="en">EN</option><option value="uz">UZ</option></select><ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-secondary" /></div></label>
                  {restaurants.length > 0 && onRestaurantChange ? <Select placeholder={t('shell_workspace_select', 'Workspace')} options={restaurants.map(r => ({ value: r.id, label: r.name }))} value={selectedRestaurantId} onChange={onRestaurantChange} /> : null}
                  <button onClick={toggleTheme} className="rounded-2xl border border-theme bg-[var(--input-bg)] p-3 text-theme-secondary hover:text-theme transition-colors">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
                  <div className="relative"><Button variant="ghost" size="icon" className="group relative overflow-hidden rounded-2xl border border-theme bg-[var(--input-bg)] hover:bg-theme-panel" onClick={openNotification}><Bell className="h-4 w-4 text-theme-secondary transition-transform group-hover:scale-110" /><span className="absolute right-2 top-2 flex h-1.5 w-1.5 rounded-full bg-[#f97360]" /></Button></div>
                  <ProfileDropdown className="w-full sm:w-auto" data={profileData} onSignOut={handleLogout} />
                  <div id="waitly-notification" className="pointer-events-none fixed bottom-8 right-8 z-[100] flex w-80 translate-y-full items-start gap-4 rounded-3xl border border-theme bg-[var(--modal-bg)] p-5 opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#f97360]/20 bg-[#f97360]/10"><Waves className="h-5 w-5 text-[#f97360]" /></div><div><div className="text-xs font-bold uppercase tracking-widest text-theme-muted">Waitly Pulse</div><p className="mt-1 text-sm leading-relaxed text-theme-secondary">{effectiveSubscriptionGate && !effectiveSubscriptionGate.active ? 'Subscription is inactive. Open the activation page to restore this workspace.' : t('shell_notifications', 'System sync successful. All core modules are running.')}</p></div></div>
                </div>
              </div>
            </header>
            {effectiveSubscriptionGate && !effectiveSubscriptionGate.active ? <div className="mb-5 rounded-[28px] border border-amber-300/18 bg-[linear-gradient(135deg,rgba(249,115,96,0.16),rgba(247,178,103,0.08))] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-300/20 bg-black/20"><LockKeyhole className="h-5 w-5 text-[#ffd28d]" /></div><div><div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd28d]">Waitly Control paywall</div><div className="mt-1 text-sm font-semibold text-theme">{effectiveSubscriptionGate.restaurantName ? `${effectiveSubscriptionGate.restaurantName}: subscription is inactive.` : 'Subscription is inactive.'}</div><div className="mt-1 text-sm text-theme-secondary">Core modules stay limited until the owner activates a subscription. This notice stays visible across owner pages.</div></div></div><Button variant="secondary" size="sm" onClick={() => navigate('/subscription')}>Activate subscription</Button></div></div> : null}
            <main className="pb-10">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
