import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { VideoSplashLoader } from '@/components/app/VideoSplashLoader';
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
import DataExportPage from '@/pages/DataExport.tsx';
import InventoryPage from '@/pages/Inventory.tsx';
import KeysPage from '@/pages/KeysPage.tsx';
import KitchenDisplayPage from '@/pages/KitchenDisplay.tsx';
import LoginPage from '@/pages/Login.tsx';
import LoyaltyPage from '@/pages/Loyalty.tsx';
import MenuPage from '@/pages/Menu.tsx';
import OnlineMenuStudioPage from '@/pages/OnlineMenuStudio.tsx';
import PaymentsPage from '@/pages/Payments.tsx';
import PermissionsPage from '@/pages/Permissions.tsx';
import PromoPage from '@/pages/Promo.tsx';
import RegisterPage from '@/pages/Register.tsx';
import ReportsPage from '@/pages/Reports.tsx';
import RestaurantsPage from '@/pages/Restaurants.tsx';
import SettingsPage from '@/pages/Settings.tsx';
import SubscriptionPage from '@/pages/SubscriptionPage.tsx';
import SurveysPage from '@/pages/Surveys.tsx';
import TablesPage from '@/pages/Tables.tsx';
import TechCardsPage from '@/pages/TechCards.tsx';
import UsersPage from '@/pages/Users.tsx';
import GuestTrackingPage from '@/pages/public/GuestTrackingPage.tsx';
import OnlineMenuPage from '@/pages/public/OnlineMenuPage.tsx';
import OwnerOnboardingPage from '@/pages/public/OwnerOnboardingPage.tsx';
import OwnerSetupPage from '@/pages/OwnerSetupPage.tsx';
import ReceiptPage from '@/pages/public/ReceiptPage.tsx';
import TelegramMiniAppPage from '@/pages/public/TelegramMiniAppPage.tsx';
import ShiftLeaderPage from '@/pages/ShiftLeaderPage.tsx';
import DispatcherPage from '@/pages/DispatcherPage.tsx';
import CourierPage from '@/pages/CourierPage.tsx';
import SupportPage from '@/pages/SupportPage.tsx';
import AuditorPage from '@/pages/AuditorPage.tsx';
import SupplierPage from '@/pages/SupplierPage.tsx';

let authSplashShown = false;

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  const [minSplashDone, setMinSplashDone] = useState(authSplashShown);

  useEffect(() => {
    if (authSplashShown) return;
    const timer = window.setTimeout(() => {
      authSplashShown = true;
      setMinSplashDone(true);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, []);

  if (loading || !minSplashDone) {
    return <VideoSplashLoader title="Booting Waitly Control" subtitle="Checking the saved session and preparing the workspace." durationMs={4000} />;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <ThemeProvider>{children}</ThemeProvider>;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading && !authSplashShown) {
    return <VideoSplashLoader title="Launching Waitly" subtitle="Restoring the workspace and preparing the control panel." durationMs={4000} />;
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
      <Route path="/tv/:restaurantSlug/:kitchenToken" element={<KitchenDisplayPage />} />
      <Route path="/qr/:restaurantSlug/:tableNumber/*" element={<GuestTrackingPage />} />
      <Route path="/telegram-mini-app" element={<TelegramMiniAppPage />} />
      <Route path="/telegram-mini-app/:restaurantSlug/:tableNumber" element={<TelegramMiniAppPage />} />
      <Route path="/menu/:restaurantSlug/*" element={<OnlineMenuPage />} />
      <Route path="/receipt/:transactionId" element={<ReceiptPage />} />
      <Route path="/owner/invite/:token" element={<OwnerOnboardingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><DashboardPage /></PrivateRoute>} />
      <Route path="/accountant" element={<PrivateRoute roles={['ACCOUNTANT','SUPER_ADMIN']}><AccountantDashboardPage /></PrivateRoute>} />
      <Route path="/marketer" element={<PrivateRoute roles={['MARKETER','SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><MarketerDashboardPage /></PrivateRoute>} />
      <Route path="/analyst" element={<PrivateRoute roles={['ANALYST','SUPER_ADMIN']}><AnalystDashboardPage /></PrivateRoute>} />
      <Route path="/restaurants" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><RestaurantsPage /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ANALYST']}><AnalyticsPage /></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><AttendanceStatsPage /></PrivateRoute>} />
      <Route path="/bookings" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><BookingsPage /></PrivateRoute>} />
      <Route path="/crm" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><CRMPage /></PrivateRoute>} />
      <Route path="/loyalty" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><LoyaltyPage /></PrivateRoute>} />
      <Route path="/menu" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><MenuPage /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><UsersPage /></PrivateRoute>} />
      <Route path="/tables" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','HOSTESS']}><TablesPage /></PrivateRoute>} />
      <Route path="/inventory" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','CHEF','KITCHEN_MANAGER']}><InventoryPage /></PrivateRoute>} />
      <Route path="/keys" element={<PrivateRoute roles={['SUPER_ADMIN']}><KeysPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><SettingsPage /></PrivateRoute>} />
      <Route path="/setup" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><OwnerSetupPage /></PrivateRoute>} />
      <Route path="/brand-studio" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><BrandStudioPage /></PrivateRoute>} />
      <Route path="/online-menu-studio" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER']}><OnlineMenuStudioPage /></PrivateRoute>} />
      <Route path="/payments" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT']}><PaymentsPage /></PrivateRoute>} />
      <Route path="/subscription" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><SubscriptionPage /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT','ANALYST']}><ReportsPage /></PrivateRoute>} />
      <Route path="/tech-cards" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','CHEF','KITCHEN_MANAGER']}><TechCardsPage /></PrivateRoute>} />
      <Route path="/promo" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MARKETER']}><PromoPage /></PrivateRoute>} />
      <Route path="/surveys" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MARKETER']}><SurveysPage /></PrivateRoute>} />
      <Route path="/auto-notify" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MARKETER']}><AutoNotifyPage /></PrivateRoute>} />
      <Route path="/data-export" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','ACCOUNTANT','ANALYST']}><DataExportPage /></PrivateRoute>} />
      <Route path="/permissions" element={<PrivateRoute roles={['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER']}><PermissionsPage /></PrivateRoute>} />
      <Route path="/shift-leader" element={<PrivateRoute roles={['SHIFT_LEADER']}><ShiftLeaderPage /></PrivateRoute>} />
      <Route path="/dispatcher" element={<PrivateRoute roles={['DISPATCHER']}><DispatcherPage /></PrivateRoute>} />
      <Route path="/courier" element={<PrivateRoute roles={['COURIER']}><CourierPage /></PrivateRoute>} />
      <Route path="/support" element={<PrivateRoute roles={['SUPPORT']}><SupportPage /></PrivateRoute>} />
      <Route path="/auditor" element={<PrivateRoute roles={['AUDITOR']}><AuditorPage /></PrivateRoute>} />
      <Route path="/supplier" element={<PrivateRoute roles={['SUPPLIER']}><SupplierPage /></PrivateRoute>} />
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
      return <div className="grid min-h-screen place-items-center bg-[#07111d] px-4 text-white"><div className="w-full max-w-2xl rounded-[32px] border border-red-500/20 bg-[#0d1825] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)]"><div className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-300/70">Waitly runtime crash</div><h1 className="mt-4 text-3xl font-black tracking-[-0.05em]">The frontend crashed during render.</h1><p className="mt-4 text-sm leading-7 text-white/70">This is no longer a blank screen. The runtime error is shown below so we can fix it fast.</p><pre className="mt-6 overflow-auto whitespace-pre-wrap rounded-[24px] border border-white/8 bg-black/20 p-4 text-xs leading-6 text-red-100">{this.state.error.stack || this.state.error.message}</pre></div></div>;
    }
    return this.props.children;
  }
}

export default function App() {
  return <RootErrorBoundary><LocaleProvider><AuthProvider><AppRoutes /></AuthProvider></LocaleProvider></RootErrorBoundary>;
}
