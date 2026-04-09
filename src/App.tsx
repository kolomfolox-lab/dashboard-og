import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { VideoSplashLoader } from '@/components/app/VideoSplashLoader';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import AnalyticsPage from '@/pages/Analytics.tsx';
import BrandStudioPage from '@/pages/BrandStudio.tsx';
import DashboardPage from '@/pages/Dashboard.tsx';
import KitchenDisplayPage from '@/pages/KitchenDisplay.tsx';
import LandingPage from '@/pages/LandingPage.tsx';
import LoginPage from '@/pages/Login.tsx';
import OnlineMenuStudioPage from '@/pages/OnlineMenuStudio.tsx';
import RestaurantsPage from '@/pages/Restaurants.tsx';
import SettingsPage from '@/pages/Settings.tsx';
import SubscriptionPage from '@/pages/SubscriptionPage.tsx';
import TablesPage from '@/pages/Tables.tsx';
import UsersPage from '@/pages/Users.tsx';
import GuestTrackingPage from '@/pages/public/GuestTrackingPage.tsx';
import OnlineMenuPage from '@/pages/public/OnlineMenuPage.tsx';
import ReviewsHubPage from '@/pages/public/ReviewsHubPage.tsx';
import ReviewsRestaurantPage from '@/pages/public/ReviewsRestaurantPage.tsx';
import { isLocalHost, isMarketingHost, isReviewHubHost, shouldUseReviewsRoot } from '@/lib/publicHost';

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
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function HomeRoute() {
  const { user, loading } = useAuth();
  if (isMarketingHost() || isLocalHost()) return <LandingPage />;
  if (!shouldUseReviewsRoot() && loading && !authSplashShown) {
    return <VideoSplashLoader title="Launching Waitly" subtitle="Restoring the workspace and preparing the control panel." durationMs={4000} />;
  }
  if (shouldUseReviewsRoot()) return <ReviewsHubPage />;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function FallbackRoute() {
  if (isMarketingHost()) {
    return <Navigate to="/" replace />;
  }
  if (isReviewHubHost()) {
    return <div className="grid min-h-screen place-items-center bg-[#eef3f7] px-4 text-slate-900"><div className="max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]"><div className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Public route</div><h1 className="mt-4 text-4xl font-black tracking-[-0.05em]">This page was not found.</h1><p className="mt-4 text-sm leading-7 text-slate-600">The reviews hub only exposes the landing page and restaurant review routes.</p></div></div>;
  }
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/tv/:restaurantSlug/:kitchenToken" element={<KitchenDisplayPage />} />
      <Route path="/qr/:restaurantSlug/table:tableNumber/*" element={<GuestTrackingPage />} />
      <Route path="/menu/:restaurantSlug/*" element={<OnlineMenuPage />} />
      <Route path="/restaurants/:restaurantSubdomain/*" element={<ReviewsRestaurantPage />} />
      <Route path="/chains/:chainSubdomain/:restaurantSlug/*" element={<ReviewsRestaurantPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/restaurants" element={<PrivateRoute><RestaurantsPage /></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
      <Route path="/tables" element={<PrivateRoute><TablesPage /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
      <Route path="/brand-studio" element={<PrivateRoute><BrandStudioPage /></PrivateRoute>} />
      <Route path="/online-menu-studio" element={<PrivateRoute><OnlineMenuStudioPage /></PrivateRoute>} />
      <Route path="/subscription" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
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
