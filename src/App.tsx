import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { VideoSplashLoader } from '@/components/app/VideoSplashLoader';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AccountantDashboardPage from '@/pages/AccountantDashboard.tsx';
import AnalystDashboardPage from '@/pages/AnalystDashboard.tsx';
import AnalyticsPage from '@/pages/Analytics.tsx';
import AttendanceStatsPage from '@/pages/AttendanceStats.tsx';
import MarketerDashboardPage from '@/pages/MarketerDashboard.tsx';
import AutoNotifyPage from '@/pages/AutoNotify.tsx';
import BookingsPage from '@/pages/Bookings.tsx';
import BrandStudioPage from '@/pages/BrandStudio.tsx';
import CRMPage from '@/pages/CRM.tsx';
import DashboardPage from '@/pages/Dashboard.tsx';
import InventoryPage from '@/pages/Inventory.tsx';
import KeysPage from '@/pages/KeysPage.tsx';
import KitchenDisplayPage from '@/pages/KitchenDisplay.tsx';
import KdsPage from '@/pages/Kds.tsx';
import LoginPage from '@/pages/Login.tsx';
import LandingPage from '@/pages/LandingPage.tsx';
import LoyaltyPage from '@/pages/Loyalty.tsx';
import MenuPage from '@/pages/Menu.tsx';
import OnlineMenuStudioPage from '@/pages/OnlineMenuStudio.tsx';
import PaymentsPage from '@/pages/Payments.tsx';
import PayrollPage from '@/pages/PayrollPage.tsx';
import PermissionsPage from '@/pages/Permissions.tsx';
import PromoPage from '@/pages/Promo.tsx';
import RegisterPage from '@/pages/Register.tsx';
import ReportsPage from '@/pages/Reports.tsx';
import RestaurantsPage from '@/pages/Restaurants.tsx';
import SettingsPage from '@/pages/Settings.tsx';
import SubscriptionPage from '@/pages/SubscriptionPage.tsx';
import PricingPage from '@/pages/PricingPage.tsx';
import SurveysPage from '@/pages/Surveys.tsx';
import TablesPage from '@/pages/Tables.tsx';
import TechCardsPage from '@/pages/TechCards.tsx';
import CashflowPage from '@/pages/CashflowPage.tsx';
import FinancesPage from '@/pages/FinancesPage.tsx';
import UsersPage from '@/pages/Users.tsx';
import GuestTrackingPage from '@/pages/public/GuestTrackingPage.tsx';
import OnlineMenuPage from '@/pages/public/OnlineMenuPage.tsx';
import OwnerOnboardingPage from '@/pages/public/OwnerOnboardingPage.tsx';
import PosPairConfirmPage from '@/pages/PosPairConfirmPage.tsx';
import OwnerSetupPage from '@/pages/OwnerSetupPage.tsx';
import ReceiptPage from '@/pages/public/ReceiptPage.tsx';
import TelegramMiniAppPage from '@/pages/public/TelegramMiniAppPage.tsx';
import ShiftLeaderPage from '@/pages/ShiftLeaderPage.tsx';
import DispatcherPage from '@/pages/DispatcherPage.tsx';
import CourierPage from '@/pages/CourierPage.tsx';
import SupportPage from '@/pages/SupportPage.tsx';
import AuditorPage from '@/pages/AuditorPage.tsx';
import SupplierPage from '@/pages/SupplierPage.tsx';
import SuppliersPage from '@/pages/Suppliers.tsx';
import SemisPage from '@/pages/Semis.tsx';
import AbcXyzPage from '@/pages/AbcXyzPage.tsx';
import IngredientsPage from '@/pages/IngredientsPage.tsx';
import MenuCategoriesPage from '@/pages/MenuCategories.tsx';
import IngredientCategoriesPage from '@/pages/IngredientCategories.tsx';
import WorkshopsPage from '@/pages/Workshops.tsx';
import QrMenuPage from '@/pages/QrMenuPage.tsx';
import ShiftsPage from '@/pages/Shifts.tsx';
import HRPage from '@/pages/HR.tsx';
import ChecklistsPage from '@/pages/Checklists.tsx';
import IntegrationsPage from '@/pages/Integrations.tsx';
import PosManagementPage from '@/pages/PosManagementPage.tsx';
import NotificationsPage from '@/pages/Notifications.tsx';
import ExpensesPage from '@/pages/Expenses.tsx';
import PrintersPage from '@/pages/PrintersPage.tsx';
import SecurityPage from '@/pages/SecurityPage.tsx';
import ApiKeysPage from '@/pages/ApiKeysPage.tsx';
import PayoutsPage from '@/pages/PayoutsPage.tsx';
import SplitBillPage from '@/pages/SplitBillPage.tsx';
import BaristaPage from '@/pages/BaristaPage.tsx';
import VibeModulePage from '@/pages/VibeModulePage.tsx';

let authSplashShown = false;

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;
  const splashMs = isDev ? 400 : 1200;
  const [minSplashDone, setMinSplashDone] = useState(authSplashShown || isDev);

  useEffect(() => {
    if (authSplashShown) return;
    if (isDev) { authSplashShown = true; setMinSplashDone(true); return; }
    const timer = window.setTimeout(() => {
      authSplashShown = true;
      setMinSplashDone(true);
    }, splashMs);
    return () => window.clearTimeout(timer);
  }, [splashMs, isDev]);

  if (loading || !minSplashDone) {
    return <VideoSplashLoader title="Booting Waitly Control" subtitle="Checking the saved session and preparing the workspace." durationMs={splashMs} />;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111d] px-4 text-white">
        <div className="w-full max-w-md rounded-[32px] border border-red-500/20 bg-[#0d1825] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-300/70">Доступ запрещён</div>
          <h1 className="mt-4 text-2xl font-black">Нет доступа к этой странице</h1>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-left text-xs text-white/50">
            <div>Твоя роль: <span className="text-white/80">{user.role}</span></div>
            <div>Нужна роль: <span className="text-white/80">{roles.join(', ')}</span></div>
          </div>
          {user.role === 'WAITER' || user.role === 'GUEST' ? (
            <p className="mt-3 text-sm leading-7 text-white/60">Официанты не имеют доступа к веб-панели. Используйте мобильное приложение.</p>
          ) : null}
          <a href="/login" onClick={(e) => { e.preventDefault(); logout(); navigate('/login'); }} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#ff6b6b] px-6 py-3 text-sm font-bold text-white transition hover:brightness-105">Выйти и зайти заново</a>
        </div>
      </div>
    );
  }
  return <ThemeProvider>{children}</ThemeProvider>;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading && !authSplashShown && !import.meta.env.DEV) {
    return <VideoSplashLoader title="Launching Waitly" subtitle="Restoring the workspace and preparing the control panel." durationMs={1200} />;
  }
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function FallbackRoute() {
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/tv/:restaurantSlug/:kitchenToken" element={<KitchenDisplayPage />} />
      <Route path="/kds" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><KdsPage /></PrivateRoute>} />
      <Route path="/qr/:restaurantSlug/:tableNumber/*" element={<GuestTrackingPage />} />
      <Route path="/telegram-mini-app" element={<TelegramMiniAppPage />} />
      <Route path="/telegram-mini-app/:restaurantSlug/:tableNumber" element={<TelegramMiniAppPage />} />
      <Route path="/menu/:restaurantSlug/*" element={<OnlineMenuPage />} />
      <Route path="/receipt/:transactionId" element={<ReceiptPage />} />
      <Route path="/pos-pair/:code" element={<PosPairConfirmPage />} />
      <Route path="/owner/invite/:token" element={<OwnerOnboardingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
       <Route path="/dashboard" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><DashboardPage /></PrivateRoute>} />
      <Route path="/accountant" element={<PrivateRoute roles={['ACCOUNTANT','SUPER_ADMIN']}><AccountantDashboardPage /></PrivateRoute>} />
      <Route path="/marketer" element={<PrivateRoute roles={['MARKETER','SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><MarketerDashboardPage /></PrivateRoute>} />
      <Route path="/analyst" element={<PrivateRoute roles={['ANALYST','SUPER_ADMIN']}><AnalystDashboardPage /></PrivateRoute>} />
      <Route path="/restaurants" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><RestaurantsPage /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ANALYST']}><AnalyticsPage /></PrivateRoute>} />
      <Route path="/analytics/abc-xyz" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ANALYST']}><AbcXyzPage /></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><AttendanceStatsPage /></PrivateRoute>} />
      <Route path="/bookings" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><BookingsPage /></PrivateRoute>} />
      <Route path="/crm" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><CRMPage /></PrivateRoute>} />
      <Route path="/loyalty" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><LoyaltyPage /></PrivateRoute>} />
      <Route path="/menu" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><MenuPage /></PrivateRoute>} />
      <Route path="/menu/categories" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><MenuCategoriesPage /></PrivateRoute>} />
      <Route path="/semis" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','CHEF']}><SemisPage /></PrivateRoute>} />
      <Route path="/ingredients" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','CHEF']}><IngredientsPage /></PrivateRoute>} />
      <Route path="/ingredients/categories" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','CHEF']}><IngredientCategoriesPage /></PrivateRoute>} />
      <Route path="/workshops" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','CHEF']}><WorkshopsPage /></PrivateRoute>} />
      <Route path="/qr-menu" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><QrMenuPage /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><UsersPage /></PrivateRoute>} />
      <Route path="/printers" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','CHEF','KITCHEN_MANAGER']}><PrintersPage /></PrivateRoute>} />
      <Route path="/security" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT','ANALYST','AUDITOR','SUPPORT']}><SecurityPage /></PrivateRoute>} />
      <Route path="/api-keys" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><ApiKeysPage /></PrivateRoute>} />
      <Route path="/payouts" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT']}><PayoutsPage /></PrivateRoute>} />
      <Route path="/split-bill" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><SplitBillPage /></PrivateRoute>} />
      <Route path="/barista" element={<PrivateRoute roles={['BARTENDER','BARISTA','CHEF','KITCHEN_MANAGER','SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><BaristaPage /></PrivateRoute>} />
      <Route path="/tables" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','HOSTESS']}><TablesPage /></PrivateRoute>} />
       <Route path="/inventory" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','CHEF','KITCHEN_MANAGER']}><InventoryPage /></PrivateRoute>} />
        <Route path="/suppliers" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><SuppliersPage /></PrivateRoute>} />
      <Route path="/keys" element={<PrivateRoute roles={['SUPER_ADMIN']}><KeysPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><SettingsPage /></PrivateRoute>} />
      <Route path="/setup" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><OwnerSetupPage /></PrivateRoute>} />
      <Route path="/brand-studio" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><BrandStudioPage /></PrivateRoute>} />
      <Route path="/online-menu-studio" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><OnlineMenuStudioPage /></PrivateRoute>} />
       <Route path="/payments" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT']}><PaymentsPage /></PrivateRoute>} />
       <Route path="/payroll" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT']}><PayrollPage /></PrivateRoute>} />
       <Route path="/pricing" element={<PrivateRoute roles={['CHAIN_OWNER','RESTAURANT_OWNER']}><PricingPage /></PrivateRoute>} />
       <Route path="/subscription" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><SubscriptionPage /></PrivateRoute>} />
       <Route path="/reports" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT','ANALYST']}><ReportsPage /></PrivateRoute>} />
       <Route path="/finances" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT']}><FinancesPage /></PrivateRoute>} />
       <Route path="/cashflow" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT']}><CashflowPage /></PrivateRoute>} />
      <Route path="/tech-cards" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','CHEF','KITCHEN_MANAGER']}><TechCardsPage /></PrivateRoute>} />
      <Route path="/promo" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MARKETER']}><PromoPage /></PrivateRoute>} />
      <Route path="/surveys" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MARKETER']}><SurveysPage /></PrivateRoute>} />
      <Route path="/auto-notify" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MARKETER']}><AutoNotifyPage /></PrivateRoute>} />
      <Route path="/permissions" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><PermissionsPage /></PrivateRoute>} />
      <Route path="/shift-leader" element={<PrivateRoute roles={['SHIFT_LEADER']}><ShiftLeaderPage /></PrivateRoute>} />
      <Route path="/dispatcher" element={<PrivateRoute roles={['DISPATCHER']}><DispatcherPage /></PrivateRoute>} />
      <Route path="/courier" element={<PrivateRoute roles={['COURIER']}><CourierPage /></PrivateRoute>} />
      <Route path="/support" element={<PrivateRoute roles={['SUPPORT']}><SupportPage /></PrivateRoute>} />
      <Route path="/auditor" element={<PrivateRoute roles={['AUDITOR']}><AuditorPage /></PrivateRoute>} />
      <Route path="/supplier" element={<PrivateRoute roles={['SUPPLIER']}><SupplierPage /></PrivateRoute>} />
      <Route path="/shifts" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><ShiftsPage /></PrivateRoute>} />
      <Route path="/hr" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><HRPage /></PrivateRoute>} />
      <Route path="/checklists" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><ChecklistsPage /></PrivateRoute>} />
      <Route path="/integrations" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><IntegrationsPage /></PrivateRoute>} />
      <Route path="/pos" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','HEAD_WAITER','WAITER','CASHIER','ADMIN']}><PosManagementPage /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><NotificationsPage /></PrivateRoute>} />
      <Route path="/expenses" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><ExpensesPage /></PrivateRoute>} />
      <Route path="/vibe/:slug" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><VibeModulePage /></PrivateRoute>} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="*" element={<FallbackRoute />} />
    </Routes>
  );
}

class RootErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Waitly root render error', error, info); }
  render() {
    if (this.state.error) {
      const msg = this.state.error.message || 'Unknown error';
      const recover = () => { this.setState({ error: null }); };
      return <div className="grid min-h-screen place-items-center bg-[#07111d] px-4 text-white"><div className="w-full max-w-2xl rounded-[32px] border border-red-500/20 bg-[#0d1825] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)]"><div className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-300/70">Waitly runtime crash</div><h1 className="mt-4 text-3xl font-black tracking-[-0.05em]">The frontend crashed during render.</h1><div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-200">{msg}</div><pre className="mt-4 overflow-auto whitespace-pre-wrap rounded-[24px] border border-white/8 bg-black/20 p-4 text-xs leading-6 text-white/50">{this.state.error.stack || msg}</pre><div className="mt-6 flex flex-wrap gap-3"><button onClick={recover} className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">Продолжить без перезагрузки</button><button onClick={() => window.location.reload()} className="rounded-2xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:text-white">Перезагрузить страницу</button></div></div></div>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <RootErrorBoundary>
      <LocaleProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <AppRoutes />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LocaleProvider>
    </RootErrorBoundary>
  );
}
