import { useMemo, useState } from 'react';
import { ArrowRight, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AppShell } from '@/components/app/AppShell';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { authAPI } from '@/services/api';
import { showToast } from '@/lib/toast';

export default function SettingsPage() {
  const { user, replaceUser } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [googleInfo, setGoogleInfo] = useState('');
  const mergedUser = useMemo(() => ({ ...workspace.profile, ...user }), [user, workspace.profile]);
  const googleLinked = mergedUser?.google_linked === true;

  const handleGoogleLink = async (credential: string) => {
    setGoogleLoading(true); setGoogleError(''); setGoogleInfo('');
    try {
      const res = await authAPI.linkGoogle({ credential });
      replaceUser(res.data);
      showToast(locale === 'uz' ? 'Google ulandi!' : 'Google подключен!', 'success');
    } catch (err: any) {
      setGoogleError(err?.response?.data?.error || err?.response?.data?.detail || 'Google auth failed.');
    } finally { setGoogleLoading(false); }
  };

  const handleGoogleUnlink = () => {
    setGoogleInfo(locale === 'uz' ? 'Google uzildi.' : 'Google отключен.');
  };

  return (
    <AppShell title={t('settings_title', 'Profile and Security')} subtitle={t('settings_subtitle', 'Owner account profile and access settings.')} eyebrow={locale === 'uz' ? 'Profil' : 'Profile'} restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard title={locale === 'uz' ? 'Profil' : 'Profile'} value={mergedUser?.full_name || 'User'} note={mergedUser?.role || 'Member'} icon={UserRound} tone="coral" />
          <MetricCard title={locale === 'uz' ? 'Ish maydonlari' : 'Workspaces'} value={workspace.restaurants.length || workspace.profile?.chains?.length || 0} note={locale === 'uz' ? 'Restoran yoki tarmoq' : 'Restaurant or chain'} icon={UserRound} tone="sand" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">

          <Panel title="Google auth" eyebrow={locale === 'uz' ? 'Kirish' : 'Access'} description={locale === 'uz' ? 'Google hisob orqali kirish.' : 'Sign in with Google.'}>
            <div className="rounded-[24px] border border-white/8 bg-black/12 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${googleLinked ? 'bg-[linear-gradient(135deg,rgba(34,197,94,0.22),rgba(143,212,255,0.22))]' : 'bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))]'}`}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill={googleLinked ? '#9ae6b4' : '#ffffff'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill={googleLinked ? '#9ae6b4' : '#ffffff'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill={googleLinked ? '#9ae6b4' : '#ffffff'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill={googleLinked ? '#9ae6b4' : '#ffffff'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Google</div>
                    <div className="mt-1 text-sm text-white/48">{googleLinked ? 'Connected.' : 'Connect Google for quick sign-in.'}</div>
                  </div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${googleLinked ? 'bg-emerald-500/12 text-emerald-200' : 'bg-white/8 text-white/55'}`}>{googleLinked ? 'Connected' : 'Not connected'}</div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {!googleLinked ? (
                  <GoogleLogin
                    theme="filled_black"
                    size="large"
                    shape="pill"
                    text="signin_with"
                    width={240}
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        handleGoogleLink(credentialResponse.credential);
                      }
                    }}
                    onError={() => setGoogleError('Google auth cancelled or failed.')}
                  />
                ) : (
                  <Button variant="outline" size="sm" onClick={handleGoogleUnlink}>Disconnect Google</Button>
                )}
              </div>
              {googleError ? <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{googleError}</div> : null}
            </div>
          </Panel>
        </div>
        <Panel title="Workspace tools" eyebrow="Separate pages" description="Brand, online menu, and subscription now live on dedicated owner pages instead of one overloaded settings screen."><div className="grid gap-4 md:grid-cols-3"><QuickLinkCard title="Brand Studio" description="Logo, cover, reviews card, and live preview." action="Open Brand Studio" onClick={() => navigate('/brand-studio')} /><QuickLinkCard title="Online Menu" description="Hero photo, menu-facing presentation, and booking settings." action="Open Online Menu Studio" onClick={() => navigate('/online-menu-studio')} /><QuickLinkCard title="Subscription" description="Dedicated page for activation and workspace subscription state." action="Open Subscription" onClick={() => navigate('/subscription')} /></div></Panel>
      </div>
    </AppShell>
  );
}

function QuickLinkCard({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="rounded-[24px] border border-white/8 bg-black/12 p-5 text-left transition hover:border-[#8fd4ff]/25 hover:bg-white/[0.04]"><div className="text-lg font-semibold text-white">{title}</div><div className="mt-2 text-sm leading-7 text-white/56">{description}</div><div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8fd4ff]">{action}<ArrowRight className="h-4 w-4" /></div></button>; }
