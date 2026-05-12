import { Bell, BookOpenText, Boxes, ChevronDown, ContactRound, CreditCard, LayoutDashboard, LineChart, LockKeyhole, Palette, Settings2, Store, UsersRound, Waves } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BrandMark } from '@/components/app/BrandMark';
import { OwnerWelcomeDialog } from '@/components/app/OwnerWelcomeDialog';
import { Button } from '@/components/ui/button';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

const navByRole = {
  SUPER_ADMIN: [
    { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Dashboard', icon: LayoutDashboard },
    { to: '/restaurants', labelKey: 'nav_restaurants', fallback: 'Networks', icon: Store },
    { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Analytics', icon: LineChart },
    { to: '/users', labelKey: 'nav_people', fallback: 'People', icon: UsersRound },
    { to: '/settings', labelKey: 'nav_settings', fallback: 'Settings', icon: Settings2 },
  ],
  CHAIN_OWNER: [
    { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Overview', icon: LayoutDashboard },
    { to: '/restaurants', labelKey: 'nav_restaurants', fallback: 'Restaurants', icon: Store },
    { to: '/tables', labelKey: 'nav_tables', fallback: 'Tables', icon: UsersRound },
    { to: '/inventory', labelKey: 'nav_inventory', fallback: 'Inventory', icon: Boxes },
    { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Analytics', icon: LineChart },
    { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
    { to: '/users', labelKey: 'nav_team', fallback: 'Team', icon: UsersRound },
    { to: '/brand-studio', labelKey: 'nav_brand_studio', fallback: 'Brand Studio', icon: Palette },
    { to: '/online-menu-studio', labelKey: 'nav_online_menu', fallback: 'Online Menu', icon: BookOpenText },
    { to: '/subscription', labelKey: 'nav_subscription', fallback: 'Subscription', icon: CreditCard },
    { to: '/settings', labelKey: 'nav_settings', fallback: 'Settings', icon: Settings2 },
  ],
  RESTAURANT_OWNER: [
    { to: '/dashboard', labelKey: 'nav_dashboard', fallback: 'Overview', icon: LayoutDashboard },
    { to: '/restaurants', labelKey: 'nav_restaurants', fallback: 'Operations', icon: Store },
    { to: '/tables', labelKey: 'nav_tables', fallback: 'Tables', icon: UsersRound },
    { to: '/inventory', labelKey: 'nav_inventory', fallback: 'Inventory', icon: Boxes },
    { to: '/analytics', labelKey: 'nav_analytics', fallback: 'Performance', icon: LineChart },
    { to: '/crm', labelKey: 'nav_crm', fallback: 'CRM', icon: ContactRound },
    { to: '/users', labelKey: 'nav_team', fallback: 'Team', icon: UsersRound },
    { to: '/brand-studio', labelKey: 'nav_brand_studio', fallback: 'Brand Studio', icon: Palette },
    { to: '/online-menu-studio', labelKey: 'nav_online_menu', fallback: 'Online Menu', icon: BookOpenText },
    { to: '/subscription', labelKey: 'nav_subscription', fallback: 'Subscription', icon: CreditCard },
    { to: '/settings', labelKey: 'nav_settings', fallback: 'Profile', icon: Settings2 },
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
  const links = navItems.map((item) => ({ label: t(item.labelKey, item.fallback), href: item.to, icon: <item.icon className="h-5 w-5 flex-shrink-0 text-white/72" /> }));
  const handleLogout = () => { logout(); navigate('/login'); };
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
          <SidebarBody className="z-50 justify-between gap-8 border-r border-white/6 bg-[rgba(6,12,20,0.94)] px-4 py-5 backdrop-blur-2xl md:sticky md:top-0 md:h-screen">
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              <BrandMark className="mb-8" />
              <div className="mb-5 rounded-[26px] border border-white/8 bg-white/[0.03] p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/38">{t('shell_workspace', 'Workspace')}</div>
                <div className="mt-2 font-display text-lg text-white">{activeWorkspace}</div>
                <div className="mt-1 text-sm text-white/42">{roleLabels[user?.role || ''] || t('shell_workspace_member', 'Workspace member')}</div>
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/30">{t('shell_navigation', 'Navigation')}</div>
              <div className="mt-3 flex flex-col gap-1.5">
                {links.map((link, idx) => <SidebarLink key={idx} link={link} className={location.pathname === link.href ? 'rounded-2xl border border-white/10 bg-white/[0.08] px-3' : 'rounded-2xl px-3 hover:bg-white/[0.05]'} />)}
              </div>
            </div>
            <div className="rounded-[28px] border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(125,211,252,0.3),rgba(52,211,153,0.15))]"><Waves className="h-5 w-5 text-[#8fd4ff]" /></div>
                <div>
                  <div className="text-xs uppercase tracking-[0.26em] text-white/38">{t('shell_current_role', 'Current role')}</div>
                  <div className="mt-1 font-display text-base text-white">{roleLabels[user?.role || ''] || t('shell_workspace_member', 'Workspace member')}</div>
                </div>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
        <div className="flex min-w-0 flex-1 flex-col overflow-visible">
          <div className="flex-1 px-4 py-4 md:px-6 md:py-5 xl:px-8">
            <header className="sticky top-0 z-30 mb-5 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,18,30,0.96),rgba(11,18,30,0.9))] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl lg:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8fd4ff]">{eyebrow}</div> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-3xl leading-none text-white md:text-[2.4rem]">{title}</h1>
                    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">{roleLabels[user?.role || ''] || 'Operator'}</span>
                  </div>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-white/56">{subtitle}</p>
                </div>
                <div className="flex flex-col gap-3 lg:min-w-[520px] sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/14 px-4 py-3 text-sm text-white/72"><span className="text-white/46">{t('shell_language', 'Language')}</span><div className="relative"><select value={locale} onChange={(event) => setLocale(event.target.value as 'ru' | 'en' | 'uz')} className="appearance-none bg-transparent pr-7 text-sm font-semibold text-white outline-none"><option value="ru" className="bg-slate-900">RU</option><option value="en" className="bg-slate-900">EN</option><option value="uz" className="bg-slate-900">UZ</option></select><ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/42" /></div></label>
                  {restaurants.length > 0 && onRestaurantChange ? <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/14 px-4 py-3 text-sm text-white/72"><span className="text-white/46">{t('shell_workspace_select', 'Workspace')}</span><div className="relative"><select value={selectedRestaurantId} onChange={(event) => onRestaurantChange(event.target.value)} className="appearance-none bg-transparent pr-7 text-sm font-semibold text-white outline-none">{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id} className="bg-slate-900">{restaurant.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-white/42" /></div></label> : null}
                  <div className="relative"><Button variant="ghost" size="icon" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10" onClick={openNotification}><Bell className="h-4 w-4 text-white transition-transform group-hover:scale-110" /><span className="absolute right-2 top-2 flex h-1.5 w-1.5 rounded-full bg-[#f97360]" /></Button></div>
                  <ProfileDropdown className="w-full sm:w-auto" data={profileData} onSignOut={handleLogout} />
                  <div id="waitly-notification" className="pointer-events-none fixed bottom-8 right-8 z-[100] flex w-80 translate-y-full items-start gap-4 rounded-3xl border border-white/10 bg-[#0c1420] p-5 opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#f97360]/20 bg-[#f97360]/10"><Waves className="h-5 w-5 text-[#f97360]" /></div><div><div className="text-xs font-bold uppercase tracking-widest text-white/30">Waitly Pulse</div><p className="mt-1 text-sm leading-relaxed text-white/80">{effectiveSubscriptionGate && !effectiveSubscriptionGate.active ? 'Subscription is inactive. Open the activation page to restore this workspace.' : t('shell_notifications', 'System sync successful. All core modules are running.')}</p></div></div>
                </div>
              </div>
            </header>
            {effectiveSubscriptionGate && !effectiveSubscriptionGate.active ? <div className="mb-5 rounded-[28px] border border-amber-300/18 bg-[linear-gradient(135deg,rgba(249,115,96,0.16),rgba(247,178,103,0.08))] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.12)]"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-300/20 bg-black/20"><LockKeyhole className="h-5 w-5 text-[#ffd28d]" /></div><div><div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd28d]">Waitly Control paywall</div><div className="mt-1 text-sm font-semibold text-white">{effectiveSubscriptionGate.restaurantName ? `${effectiveSubscriptionGate.restaurantName}: subscription is inactive.` : 'Subscription is inactive.'}</div><div className="mt-1 text-sm text-white/66">Core modules stay limited until the owner activates a subscription. This notice stays visible across owner pages.</div></div></div><Button variant="secondary" size="sm" onClick={() => navigate('/subscription')}>Activate subscription</Button></div></div> : null}
            <main className="pb-10">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
