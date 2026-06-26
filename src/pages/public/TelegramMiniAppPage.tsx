import { useEffect, useMemo, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { BellRing, Loader2, ShieldCheck, Sparkles, Utensils } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { authAPI, telegramMiniAppAPI, type TelegramMiniAppMenuResponse } from '@/services/api';

const TOKEN_KEY = 'token';
const CALL_LOCK_PREFIX = 'waitly-tg-call-lock:';
const CALL_LOCK_MS = 120_000;

function formatUZS(value: string | number) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

function getTelegramWebApp() {
  return WebApp || window.Telegram?.WebApp;
}

export default function TelegramMiniAppPage() {
  const routeParams = useParams();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const tg = getTelegramWebApp();

  const startParam = tg?.initDataUnsafe?.start_param || '';
  const [startSlug, ...startTableParts] = startParam.split('_');
  const startTableNumber = startTableParts.join('_');

  const restaurantId = params.get('restaurant_id') || '';
  const queryTableId = params.get('table_id') || '';
  const restaurantSlug = routeParams.restaurantSlug || startSlug || '';
  const tableNumber = routeParams.tableNumber || startTableNumber || '';
  const [menu, setMenu] = useState<TelegramMiniAppMenuResponse | null>(null);
  const [resolvedTableId, setResolvedTableId] = useState(queryTableId);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState('');
  const [callLockedUntil, setCallLockedUntil] = useState(0);
  const callTargetId = resolvedTableId || queryTableId;
  const lockKey = `${CALL_LOCK_PREFIX}${callTargetId || `${restaurantSlug}:table${tableNumber}`}`;
  const isCallLocked = callLockedUntil > Date.now();
  const remainingSeconds = Math.max(0, Math.ceil((callLockedUntil - Date.now()) / 1000));

  useEffect(() => {
    tg?.ready?.();
    tg?.expand?.();
    const theme = tg?.themeParams || {};
    document.documentElement.style.setProperty('--tg-bg', theme.bg_color || '#101726');
    document.documentElement.style.setProperty('--tg-text', theme.text_color || '#fff7ed');
    document.documentElement.style.setProperty('--tg-card', theme.secondary_bg_color || '#172033');
    document.documentElement.style.setProperty('--tg-button', theme.button_color || '#ff7a59');
    document.documentElement.style.setProperty('--tg-button-text', theme.button_text_color || '#ffffff');
  }, [tg]);

  useEffect(() => {
    const savedLock = Number(localStorage.getItem(lockKey) || '0');
    if (savedLock > Date.now()) setCallLockedUntil(savedLock);
  }, [lockKey]);

  useEffect(() => {
    const timer = window.setInterval(() => setCallLockedUntil((current) => current), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const ensureTelegramAuth = async () => {
    const existingToken = localStorage.getItem(TOKEN_KEY);
    if (existingToken) return existingToken;

    const initData = tg?.initData || window.Telegram?.WebApp?.initData || '';
    if (!initData) {
      throw new Error('Открой это меню внутри Telegram Mini App.');
    }

    setAuthenticating(true);
    try {
      const response = await authAPI.loginWithTelegramMiniApp({ initData });
      localStorage.setItem(TOKEN_KEY, response.data.access);
      if (response.data.refresh) localStorage.setItem('refresh', response.data.refresh);
      return response.data.access;
    } finally {
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!restaurantId && (!restaurantSlug || !tableNumber)) {
        setError('Открой меню через QR столика или Telegram бота.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const initData = tg?.initData || window.Telegram?.WebApp?.initData || '';
        if (initData) await ensureTelegramAuth();
        const response = restaurantId
          ? await telegramMiniAppAPI.getMenu(restaurantId, queryTableId || undefined)
          : await telegramMiniAppAPI.bootstrap(restaurantSlug, tableNumber);
        setMenu(response.data);
        setResolvedTableId(response.data.table?.id || queryTableId);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err?.message || 'Не удалось загрузить меню.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [restaurantId, queryTableId, restaurantSlug, tableNumber]);

  const callWaiter = async () => {
    if (!callTargetId || isCallLocked || calling) return;

    setCalling(true);
    setError('');
    try {
      await ensureTelegramAuth();
      await telegramMiniAppAPI.callWaiter(callTargetId);
      tg?.HapticFeedback?.notificationOccurred?.('success');
      const nextLock = Date.now() + CALL_LOCK_MS;
      localStorage.setItem(lockKey, String(nextLock));
      setCallLockedUntil(nextLock);
    } catch (err: any) {
      tg?.HapticFeedback?.notificationOccurred?.('error');
      setError(err?.response?.data?.error?.message || err?.message || 'Не удалось позвать официанта.');
    } finally {
      setCalling(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--tg-bg)] px-4 py-5 text-[var(--tg-text)]">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-[#ff7a59]/30 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-[#ffd166]/20 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-xl">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,89,0.26),rgba(255,255,255,0.07))] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] opacity-65">
                <Utensils className="h-4 w-4" />
                Waitly Mini
              </div>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.07em]">{menu?.restaurant.name || 'Меню'}</h1>
              <p className="mt-2 text-sm leading-6 opacity-72">
                {menu?.table?.number ? `Стол ${menu.table.number}` : tableNumber ? `Стол ${tableNumber}` : 'Выбери блюдо и зови сервис'}
              </p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
              <ShieldCheck className="h-6 w-6 text-[var(--tg-button)]" />
            </div>
          </div>

          <Button
            type="button"
            onClick={() => void callWaiter()}
            disabled={!callTargetId || isCallLocked || calling || authenticating}
            className="mt-5 h-14 w-full rounded-2xl bg-[var(--tg-button)] text-base font-black text-[var(--tg-button-text)] shadow-[0_16px_46px_rgba(255,122,89,0.34)] hover:opacity-95 disabled:opacity-55"
          >
            {calling || authenticating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BellRing className="mr-2 h-5 w-5" />}
            {isCallLocked ? `Официант уже идёт · ${remainingSeconds}s` : 'Позвать официанта'}
          </Button>
        </div>

        {error ? <div className="mt-4 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="grid min-h-[220px] place-items-center rounded-[32px] bg-[var(--tg-card)]">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--tg-button)]" />
            </div>
          ) : null}

          {!loading && menu?.items.length === 0 ? (
            <div className="rounded-[32px] bg-[var(--tg-card)] p-6 text-center text-sm opacity-70">Доступные блюда появятся здесь.</div>
          ) : null}

          {menu?.items.map((item) => (
            <article key={item.id} className="rounded-[28px] border border-white/8 bg-[var(--tg-card)] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {item.category ? <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--tg-button)]"><Sparkles className="h-3 w-3" />{item.category}</div> : null}
                  <h2 className="text-lg font-black tracking-[-0.03em]">{item.title}</h2>
                  {item.description ? <p className="mt-2 text-sm leading-6 opacity-64">{item.description}</p> : null}
                </div>
                <div className="shrink-0 rounded-2xl bg-white/8 px-3 py-2 text-sm font-black">{formatUZS(item.price)}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
