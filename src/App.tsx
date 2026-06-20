import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { VideoSplashLoader } from '@/components/app/VideoSplashLoader';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AnalyticsPage from '@/pages/Analytics.tsx';
import AttendanceStatsPage from '@/pages/AttendanceStats.tsx';
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

let authSplashShown = false;

function PrivateRoute({ children }: { children: React.ReactNode }) {
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
  return user ? <ThemeProvider>{children}</ThemeProvider> : <Navigate to="/login" replace />;
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
      <Route path="/qr/:restaurantSlug/table:tableNumber/*" element={<GuestTrackingPage />} />
      <Route path="/telegram-mini-app" element={<TelegramMiniAppPage />} />
      <Route path="/telegram-mini-app/:restaurantSlug/table:tableNumber" element={<TelegramMiniAppPage />} />
      <Route path="/menu/:restaurantSlug/*" element={<OnlineMenuPage />} />
      <Route path="/receipt/:transactionId" element={<ReceiptPage />} />
      <Route path="/owner/invite/:token" element={<OwnerOnboardingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/restaurants" element={<PrivateRoute><RestaurantsPage /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><AttendanceStatsPage /></PrivateRoute>} />
      <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
      <Route path="/crm" element={<PrivateRoute><CRMPage /></PrivateRoute>} />
      <Route path="/loyalty" element={<PrivateRoute><LoyaltyPage /></PrivateRoute>} />
      <Route path="/menu" element={<PrivateRoute><MenuPage /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
      <Route path="/tables" element={<PrivateRoute><TablesPage /></PrivateRoute>} />
      <Route path="/inventory" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />
      <Route path="/keys" element={<PrivateRoute><KeysPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/setup" element={<PrivateRoute><OwnerSetupPage /></PrivateRoute>} />
      <Route path="/brand-studio" element={<PrivateRoute><BrandStudioPage /></PrivateRoute>} />
      <Route path="/online-menu-studio" element={<PrivateRoute><OnlineMenuStudioPage /></PrivateRoute>} />
      <Route path="/payments" element={<PrivateRoute><PaymentsPage /></PrivateRoute>} />
      <Route path="/subscription" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
      <Route path="/tech-cards" element={<PrivateRoute><TechCardsPage /></PrivateRoute>} />
      <Route path="/promo" element={<PrivateRoute><PromoPage /></PrivateRoute>} />
      <Route path="/surveys" element={<PrivateRoute><SurveysPage /></PrivateRoute>} />
      <Route path="/auto-notify" element={<PrivateRoute><AutoNotifyPage /></PrivateRoute>} />
      <Route path="/data-export" element={<PrivateRoute><DataExportPage /></PrivateRoute>} />
      <Route path="/permissions" element={<PrivateRoute><PermissionsPage /></PrivateRoute>} />
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
