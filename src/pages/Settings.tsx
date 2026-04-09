import { useMemo, useState } from 'react';
import { ArrowRight, Copy, Link2, MessageSquareLock, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/app/AppShell';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { authAPI, type AppUser, type TelegramLinkResponse } from '@/services/api';

export default function SettingsPage() {
  const { user, replaceUser } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramError, setTelegramError] = useState('');
  const [telegramInfo, setTelegramInfo] = useState('');
  const [linkData, setLinkData] = useState<TelegramLinkResponse | null>(null);
  const mergedUser = useMemo(() => ({ ...workspace.profile, ...user }), [user, workspace.profile]);
  const syncUser = (nextUser?: AppUser) => { if (!nextUser) return; replaceUser({ ...(user || {}), ...nextUser }); workspace.reload(); };

  const handleRequestLink = async () => {
    setTelegramLoading(true); setTelegramError(''); setTelegramInfo('');
    try { const response = await authAPI.requestTelegramLink(); setLinkData(response.data); if (response.data.bot_url) window.open(response.data.bot_url, '_blank', 'noopener,noreferrer'); setTelegramInfo(locale === 'uz' ? 'Telegram bot ochildi.' : 'Telegram bot opened.'); }
    catch (err: any) { setTelegramError(err?.response?.data?.error || 'Could not generate Telegram link code.'); }
    finally { setTelegramLoading(false); }
  };

  const handleConfirmLink = async () => {
    if (!linkData?.link_code) return; setTelegramLoading(true); setTelegramError(''); setTelegramInfo('');
    try { const response = await authAPI.confirmTelegramLink({ link_code: linkData.link_code }); if (response.data.user) { syncUser(response.data.user); setLinkData(null); } setTelegramInfo(response.data.message || 'Telegram connected.'); }
    catch (err: any) { setTelegramError(err?.response?.data?.error || 'Telegram link is not confirmed yet.'); }
    finally { setTelegramLoading(false); }
  };

  const handleUnlink = async () => {
    setTelegramLoading(true); setTelegramError(''); setTelegramInfo('');
    try { const response = await authAPI.unlinkTelegram(); syncUser(response.data.user); setLinkData(null); setTelegramInfo('Telegram disconnected.'); }
    catch (err: any) { setTelegramError(err?.response?.data?.error || 'Could not disconnect Telegram.'); }
    finally { setTelegramLoading(false); }
  };

  return (
    <AppShell title={t('settings_title', 'Profile and Security')} subtitle={t('settings_subtitle', 'Owner account, Telegram auth, and fast entry points to the dedicated owner pages.')} eyebrow={locale === 'uz' ? 'Profil' : 'Profile'} restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard title={locale === 'uz' ? 'Profil' : 'Profile'} value={mergedUser?.full_name || 'User'} note={mergedUser?.role || 'Member'} icon={UserRound} tone="coral" />
          <MetricCard title={locale === 'uz' ? 'Ish maydonlari' : 'Workspaces'} value={workspace.restaurants.length || workspace.profile?.chains?.length || 0} note={locale === 'uz' ? 'Restoran yoki tarmoq' : 'Restaurant or chain'} icon={UserRound} tone="sand" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel title={locale === 'uz' ? 'Akkaunt kartasi' : 'Account card'} eyebrow={locale === 'uz' ? 'Malumotlar' : 'Details'} description={locale === 'uz' ? 'Asosiy owner malumotlari.' : 'Core owner profile details.'}>
            <div className="grid gap-4 md:grid-cols-2"><InfoCard label={locale === 'uz' ? 'Ism' : 'Name'} value={mergedUser?.full_name || '-'} /><InfoCard label="Email" value={mergedUser?.email || '-'} /><InfoCard label={locale === 'uz' ? 'Telefon' : 'Phone'} value={mergedUser?.phone_number || mergedUser?.phone || '-'} /><InfoCard label={locale === 'uz' ? 'Rol' : 'Role'} value={mergedUser?.role || '-'} /></div>
          </Panel>
          <Panel title="Telegram auth" eyebrow={locale === 'uz' ? 'Kirish' : 'Access'} description={locale === 'uz' ? 'Telegram orqali OTP va recovery.' : 'Telegram for OTP and recovery.'}>
            <div className="rounded-[24px] border border-white/8 bg-black/12 p-5">
              <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><div className={`grid h-12 w-12 place-items-center rounded-2xl ${mergedUser?.telegram_linked ? 'bg-[linear-gradient(135deg,rgba(34,197,94,0.22),rgba(143,212,255,0.22))]' : 'bg-[linear-gradient(135deg,rgba(125,211,252,0.22),rgba(249,115,96,0.18))]'}`}>{mergedUser?.telegram_linked ? <ShieldCheck className="h-5 w-5 text-[#9ae6b4]" /> : <MessageSquareLock className="h-5 w-5 text-[#8fd4ff]" />}</div><div><div className="text-sm font-semibold text-white">Telegram</div><div className="mt-1 text-sm text-white/48">{mergedUser?.telegram_linked ? `Connected${mergedUser?.telegram_username ? ` as @${mergedUser.telegram_username}` : ''}.` : 'Connect Telegram for OTP and account recovery.'}</div></div></div><div className={`rounded-full px-3 py-1 text-xs font-semibold ${mergedUser?.telegram_linked ? 'bg-emerald-500/12 text-emerald-200' : 'bg-white/8 text-white/55'}`}>{mergedUser?.telegram_linked ? 'Connected' : 'Not connected'}</div></div>
              <div className="mt-5 flex flex-wrap gap-3">{!mergedUser?.telegram_linked ? <><Button size="sm" onClick={handleRequestLink} disabled={telegramLoading}><Link2 className="mr-2 h-4 w-4" />{linkData ? 'Refresh code' : 'Connect Telegram'}</Button>{linkData ? <Button variant="outline" size="sm" onClick={handleConfirmLink} disabled={telegramLoading}>Confirm</Button> : null}</> : <Button variant="outline" size="sm" onClick={handleUnlink} disabled={telegramLoading}>Disconnect Telegram</Button>}</div>
              {linkData ? <div className="mt-5 rounded-[22px] border border-dashed border-[#8fd4ff]/25 bg-[#081a28] p-4"><div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fd4ff]">Link code</div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-lg font-semibold tracking-[0.2em] text-white">{linkData.link_code}</div><Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(linkData.link_code)}><Copy className="mr-2 h-4 w-4" />Copy</Button></div></div> : null}
              {telegramError ? <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{telegramError}</div> : null}
              {telegramInfo ? <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{telegramInfo}</div> : null}
            </div>
          </Panel>
        </div>
        <Panel title="Workspace tools" eyebrow="Separate pages" description="Brand, online menu, and subscription now live on dedicated owner pages instead of one overloaded settings screen."><div className="grid gap-4 md:grid-cols-3"><QuickLinkCard title="Brand Studio" description="Logo, cover, reviews card, and live preview." action="Open Brand Studio" onClick={() => navigate('/brand-studio')} /><QuickLinkCard title="Online Menu" description="Hero photo, menu-facing presentation, and booking settings." action="Open Online Menu Studio" onClick={() => navigate('/online-menu-studio')} /><QuickLinkCard title="Subscription" description="Dedicated page for activation and workspace subscription state." action="Open Subscription" onClick={() => navigate('/subscription')} /></div></Panel>
      </div>
    </AppShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) { return <div className="rounded-[24px] border border-white/8 bg-black/12 p-5"><div className="text-xs uppercase tracking-[0.28em] text-white/40">{label}</div><div className="mt-2 text-xl font-semibold text-white">{value}</div></div>; }
function QuickLinkCard({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) { return <button type="button" onClick={onClick} className="rounded-[24px] border border-white/8 bg-black/12 p-5 text-left transition hover:border-[#8fd4ff]/25 hover:bg-white/[0.04]"><div className="text-lg font-semibold text-white">{title}</div><div className="mt-2 text-sm leading-7 text-white/56">{description}</div><div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8fd4ff]">{action}<ArrowRight className="h-4 w-4" /></div></button>; }
