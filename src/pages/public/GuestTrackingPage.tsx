import { useEffect, useMemo, useRef, useState } from 'react';
import { BellRing, CheckCheck, ChevronRight, Clock3, Flame, Loader2, MapPinned, Route, ShieldCheck, Sparkles, Star, UserRound } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { useLocale } from '@/context/LocaleContext';
import { publicAPI, guestPaymentAPI, type GuestActiveOrdersResponse, type GuestBootstrapResponse, type GuestLoadSnapshot, type GuestOrder, type GuestPaymentMethod, type GuestReviewPromptResponse, type PublicMenuPageResponse } from '@/services/api';

declare global {
  interface Window {
    turnstile?: {
      render: (target: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

let turnstileLoader: Promise<void> | null = null;

const reviewDefaults = {
  author_name: '',
  comment: '',
  rating_food: 5,
  rating_service_speed: 5,
  rating_waiter: 5,
  rating_waitly: 5,
};

const loadTone = {
  LOW: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  MEDIUM: 'border-amber-200 bg-amber-50 text-amber-700',
  HIGH: 'border-rose-200 bg-rose-50 text-rose-700',
};

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve();
  }
  if (turnstileLoader) {
    return turnstileLoader;
  }
  turnstileLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-turnstile="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Turnstile failed to load.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile failed to load.'));
    document.head.appendChild(script);
  });
  return turnstileLoader;
}

export default function GuestTrackingPage() {
  const { restaurantSlug = '', tableNumber = '' } = useParams();
  const { t, locale, setLocale } = useLocale();
  const [bootstrap, setBootstrap] = useState<GuestBootstrapResponse | null>(null);
  const [ordersState, setOrdersState] = useState<GuestActiveOrdersResponse | null>(null);
  const [menuData, setMenuData] = useState<PublicMenuPageResponse | null>(null);
  const [prompt, setPrompt] = useState<GuestReviewPromptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [waiterBusy, setWaiterBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewUrl, setReviewUrl] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [form, setForm] = useState(reviewDefaults);
  const [paymentMethods, setPaymentMethods] = useState<GuestPaymentMethod[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [payUrl, setPayUrl] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    publicAPI.guestBootstrap(restaurantSlug, tableNumber)
      .then((response) => {
        if (!active) return;
        setBootstrap(response.data);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.response?.data?.error?.message || 'Failed to bootstrap this guest page.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [restaurantSlug, tableNumber]);

  useEffect(() => {
    if (!bootstrap?.guest_token || reviewSent) {
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const [ordersResponse, promptResponse] = await Promise.all([
          publicAPI.guestActiveOrders(bootstrap.guest_token),
          publicAPI.guestReviewPrompt(bootstrap.guest_token),
        ]);
        if (!active) return;
        setOrdersState(ordersResponse.data);
        setPrompt(promptResponse.data);
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.error?.message || 'Failed to refresh guest data.');
      }
    };

    load();
    const intervalId = window.setInterval(load, 10000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [bootstrap?.guest_token, reviewSent]);

  const orders = ordersState?.orders || [];
  const load = ordersState?.load;

  useEffect(() => {
    if (!restaurantSlug || loading || error || orders.length > 0 || reviewSent) return;
    let active = true;
    publicAPI.menuPage(restaurantSlug)
      .then((res) => { if (active) setMenuData(res.data); })
      .catch(() => { if (active) setMenuData(null); });
    return () => { active = false; };
  }, [restaurantSlug, loading, error, orders.length, reviewSent]);
  const canReview = !reviewSent && orders.length === 0 && !!prompt?.eligible;
  const restaurantName = bootstrap?.restaurant.name || bootstrap?.restaurant.chain_name || 'Waitly';

  const timeline = useMemo(() => {
    if (!orders.length) {
      return [
        { label: t('guest_stage_kitchen_queue'), active: false },
        { label: t('guest_stage_cooking'), active: false },
        { label: t('guest_stage_to_table'), active: false },
      ];
    }

    const hasAccepted = orders.some((order) => order.status === 'ACCEPTED' || order.status === 'CREATED');
    const hasCooking = orders.some((order) => order.status === 'COOKING');
    const hasReady = orders.some((order) => order.status === 'READY');
    return [
      { label: t('guest_stage_kitchen_queue'), active: hasAccepted || hasCooking || hasReady },
      { label: t('guest_stage_cooking'), active: hasCooking || hasReady },
      { label: t('guest_stage_to_table'), active: hasReady },
    ];
  }, [orders, t]);

  const handleCallWaiter = async () => {
    if (!bootstrap?.guest_token || waiterBusy) return;
    setWaiterBusy(true);
    try {
      await publicAPI.guestCallWaiter(bootstrap.guest_token);
    } finally {
      setWaiterBusy(false);
    }
  };

  const handleOpenPayment = async () => {
    if (!bootstrap?.guest_token) return;
    try {
      const res = await guestPaymentAPI.methods(bootstrap.guest_token);
      setPaymentMethods(res.data.providers);
      setShowPayment(true);
      setPayError('');
      setPayUrl('');
    } catch (err: any) {
      setPayError(err?.response?.data?.error?.message || 'No payment methods available.');
    }
  };

  const handleInitPayment = async (provider: string) => {
    if (!bootstrap?.guest_token || !orders.length || paying) return;
    setPaying(true);
    setPayError('');
    try {
      const res = await guestPaymentAPI.init({
        guest_token: bootstrap.guest_token,
        order_id: orders[0].id,
        provider,
      });
      if (res.data.payment_url) {
        window.open(res.data.payment_url, '_blank');
      }
      setPayUrl(`/receipt/${res.data.transaction_id}`);
    } catch (err: any) {
      setPayError(err?.response?.data?.error?.message || 'Payment initiation failed.');
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt?.review_token || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      const response = await publicAPI.guestSubmitReview({
        review_token: prompt.review_token,
        turnstile_token: turnstileToken,
        author_name: form.author_name,
        comment: form.comment,
        rating_food: form.rating_food,
        rating_service_speed: form.rating_service_speed,
        rating_waiter: form.rating_waiter,
        rating_waitly: form.rating_waitly,
      });
      setReviewSent(true);
      setReviewUrl(response.data.review_page_url);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to submit review.');
      setTurnstileResetKey((current) => current + 1);
      setTurnstileToken('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#eef4f6_44%,#edf1f5_100%)] text-slate-900">
      <div className="mx-auto max-w-[1680px] px-3 py-3 pb-24 md:pb-0 lg:px-6 lg:py-5">
        <header className="rounded-[24px] border border-white/70 bg-white/84 px-4 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:px-7 md:py-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/12 bg-[#0f766e]/7 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.32em] text-[#0f766e] md:px-4 md:py-2 md:text-[11px]">
                <Route className="h-3 w-3 md:h-4 md:w-4" />
                {t('guest_qr_tracking')}
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-3">
                <h1 className="text-2xl font-black tracking-[-0.06em] text-slate-950 md:text-4xl lg:text-[4.15rem]">
                  {restaurantName}
                </h1>
                <div className="flex items-center gap-1 ml-auto shrink-0 md:ml-3">
                  <button
                    type="button"
                    onClick={() => setLocale('ru')}
                    className={`rounded-lg border px-2 py-1 text-[11px] font-bold uppercase leading-none transition md:px-3 md:py-1.5 md:text-xs ${locale === 'ru' ? 'border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}
                  >
                    RU
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocale('uz')}
                    className={`rounded-lg border px-2 py-1 text-[11px] font-bold uppercase leading-none transition md:px-3 md:py-1.5 md:text-xs ${locale === 'uz' ? 'border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}
                  >
                    UZ
                  </button>
                </div>
              </div>
              <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-600 md:mt-3 md:text-sm md:leading-7 lg:block">
                {t('guest_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:min-w-[360px] md:grid-cols-3 md:gap-3 xl:max-w-[540px]">
              <TopStat label={t('guest_table')} value={bootstrap?.table.number || tableNumber || '-'} />
              <TopStat label={t('guest_active_orders')} value={String(load?.active_orders_count || orders.length || 0)} />
              <TopStat label={t('guest_kitchen_load')} value={load?.label || t('guest_menu_loading')} accent />
            </div>
          </div>
        </header>

        <div className="mt-3 grid gap-3 md:mt-4 md:gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="grid gap-3 md:gap-4">
            {loading ? <StateCard title={t('guest_loading_title')} body={t('guest_loading_body')} /> : null}
            {!loading && error ? <StateCard title={t('guest_error_title')} body={error} error /> : null}
            {!loading && !error && reviewSent ? <SuccessCard reviewUrl={reviewUrl || bootstrap?.review_page_url || ''} /> : null}
            {!loading && !error && !reviewSent && orders.length > 0 ? (
              <div className="grid gap-3 md:gap-4">
                {orders.map((order) => <OrderCard key={order.id} order={order} />)}
              </div>
            ) : null}
            {!loading && !error && !reviewSent && orders.length === 0 && canReview ? (
              <ReviewForm
                prompt={prompt}
                siteKey={bootstrap?.turnstile_site_key || ''}
                form={form}
                onChange={setForm}
                onSubmit={handleSubmitReview}
                submitting={submitting}
                turnstileToken={turnstileToken}
                setTurnstileToken={setTurnstileToken}
                turnstileResetKey={turnstileResetKey}
              />
            ) : null}
            {!loading && !error && !reviewSent && orders.length === 0 && !canReview ? (
              <div className="rounded-[24px] border border-white/70 bg-white/88 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:rounded-[32px] md:p-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 md:text-[11px]">{t('guest_menu_title')}</div>
                <h2 className="mt-2 text-xl font-black tracking-[-0.05em] text-slate-950 md:mt-3 md:text-3xl">{restaurantName}</h2>
                <p className="mt-1 text-xs leading-6 text-slate-500 md:mt-2 md:text-sm md:leading-7">{t('guest_no_orders_body')}</p>
                {menuData ? (
                  <div className="mt-4 grid gap-4 md:mt-5">
                    {menuData.categories.map((cat) => (
                      <div key={cat.id}>
                        <h3 className="text-sm font-black tracking-[-0.03em] text-slate-900 md:text-base">{cat.name}</h3>
                        <div className="mt-2 grid gap-2 md:mt-3 md:grid-cols-2">
                          {cat.dishes.map((dish) => (
                            <div key={dish.id} className={`rounded-[16px] border px-3 py-3 md:rounded-[20px] md:px-4 md:py-4 ${dish.is_available ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-sm font-black tracking-[-0.02em] text-slate-950 md:text-base">{dish.name}</div>
                                  {dish.description ? <div className="mt-0.5 text-xs text-slate-500 md:mt-1 md:text-sm">{dish.description}</div> : null}
                                </div>
                                <div className="shrink-0 text-right">
                                  <div className="text-sm font-bold text-slate-900 md:text-base">{Number(dish.price).toLocaleString()} UZS</div>
                                  {!dish.is_available ? <div className="text-[10px] font-semibold text-rose-500 md:text-xs">{t('guest_menu_not_available')}</div> : null}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : menuData === null && !loading ? (
                  <p className="mt-4 text-xs text-slate-400 md:mt-5 md:text-sm">{t('guest_menu_error')}</p>
                ) : null}
              </div>
            ) : null}
          </section>

          <aside className="grid gap-3 md:gap-4 xl:sticky xl:top-4 xl:h-fit">
            <div className="rounded-[24px] border border-white/70 bg-white/88 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:rounded-[32px] md:p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 md:text-[11px]">{t('guest_route_board')}</div>
              <h2 className="mt-2 text-base font-black tracking-[-0.05em] md:mt-3 md:text-2xl">{t('guest_route_board_title')}</h2>
              <div className="mt-3 rounded-[18px] border border-slate-200 bg-slate-50 p-3 md:mt-4 md:rounded-[24px] md:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 md:text-xs">{t('guest_load_level')}</div>
                    <div className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold md:mt-2 md:px-3 md:py-1 md:text-sm ${loadTone[(load?.level as 'LOW' | 'MEDIUM' | 'HIGH')] || 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                      {load?.label || t('guest_menu_loading')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 md:text-xs">{t('guest_queue')}</div>
                    <div className="mt-1 text-2xl font-black tracking-[-0.05em] md:mt-2 md:text-3xl">{load?.active_orders_count || 0}</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 md:mt-4 md:h-2">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#f59e0b,#ea580c)]" style={{ width: `${Math.min(100, ((load?.load_score || 0) / 12) * 100)}%` }} />
                </div>
                  <div className="mt-2 text-[10px] leading-5 text-slate-500 md:mt-3 md:text-xs md:leading-6">
                    {t('guest_delay_buffer').replace('{n}', String(load?.delay_buffer_minutes || 0))}
                  </div>
              </div>

              <div className="mt-3 rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f9_100%)] p-3 md:mt-4 md:rounded-[24px] md:p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 md:text-xs">{t('guest_route_stages')}</div>
                <div className="mt-3 space-y-2 md:mt-4 md:space-y-3">
                  {timeline.map((step, index) => (
                    <div key={step.label} className="flex items-center gap-2 md:gap-3">
                      <div className={`grid h-8 w-8 place-items-center rounded-xl border md:h-9 md:w-9 md:rounded-2xl ${step.active ? 'border-[#0f766e]/18 bg-[#0f766e]/9 text-[#0f766e]' : 'border-slate-200 bg-white text-slate-400'}`}>
                        <span className="text-xs font-black md:text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1 rounded-[14px] border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 md:rounded-[18px] md:px-3 md:py-3 md:text-sm">
                        {step.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden md:block rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,#16202c_0%,#0f1722_100%)] p-4 text-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:rounded-[32px] md:p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8fd4ff] md:text-[11px]">{t('guest_table_tools')}</div>
              <h3 className="mt-2 text-base font-black tracking-[-0.05em] md:mt-3 md:text-2xl">{t('guest_call_waiter_title')}</h3>
              <p className="mt-2 text-xs leading-6 text-white/64 md:mt-3 md:text-sm md:leading-7">
                {t('guest_call_waiter_desc')}
              </p>

              <button
                type="button"
                onClick={handleCallWaiter}
                disabled={waiterBusy || !bootstrap?.guest_token}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-white px-4 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:mt-5 md:rounded-[22px] md:py-3"
              >
                {waiterBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                {waiterBusy ? t('guest_sending') : t('guest_call_waiter')}
              </button>

              {orders.length > 0 && orders[0].total_amount ? (
                <button
                  type="button"
                  onClick={handleOpenPayment}
                  disabled={!bootstrap?.guest_token}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#0f766e] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0d6b63] active:scale-[0.98] disabled:opacity-60 md:rounded-[22px] md:py-3"
                >
                  {payUrl ? t('guest_paid') : t('guest_pay').replace('{amount}', orders[0].total_amount.toLocaleString())}
                </button>
              ) : null}

              {showPayment && paymentMethods.length > 0 && !payUrl ? (
                <div className="mt-3 space-y-2 md:mt-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8fd4ff] md:text-[11px]">{t('guest_select_payment')}</div>
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleInitPayment(m.provider)}
                      disabled={paying}
                      className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.14] active:scale-[0.98] disabled:opacity-50 md:rounded-[18px] md:py-2.5"
                    >
                      {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {m.label}
                    </button>
                  ))}
                  {payError ? <div className="rounded-[14px] border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">{payError}</div> : null}
                </div>
              ) : null}

              {payUrl ? (
                <a href={payUrl} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                  {t('guest_view_receipt')}
                  <ChevronRight className="h-4 w-4" />
                </a>
              ) : null}

              {(bootstrap?.review_page_url || reviewUrl) ? (
                <a href={(bootstrap?.review_page_url || reviewUrl)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/84 transition hover:bg-white/[0.1]">
                  {t('guest_open_reviews')}
                  <ChevronRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </aside>
        </div>

        {/* Mobile bottom bar: always visible, always at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[linear-gradient(180deg,#16202c_0%,#0f1722_100%)] px-3 pb-[max(env(safe-area-inset-bottom,12px),12px)] pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.3)] md:hidden">
          {showPayment && paymentMethods.length > 0 && !payUrl ? (
            <div className="mb-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8fd4ff]">{t('guest_select_payment')}</div>
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleInitPayment(m.provider)}
                  disabled={paying}
                  className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.14] active:scale-[0.97] disabled:opacity-50"
                >
                  {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {m.label}
                </button>
              ))}
              {payError ? <div className="rounded-[12px] border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">{payError}</div> : null}
            </div>
          ) : null}
          {payUrl ? (
            <div className="mb-3">
              <a href={payUrl} className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20">
                {t('guest_open_payment')}
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCallWaiter}
              disabled={waiterBusy || !bootstrap?.guest_token}
              className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-white px-4 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {waiterBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
              {waiterBusy ? t('guest_sending') : t('guest_call_waiter')}
            </button>
            {orders.length > 0 && orders[0].total_amount ? (
              <button
                type="button"
                onClick={handleOpenPayment}
                disabled={!bootstrap?.guest_token}
                className="flex flex-1 items-center justify-center gap-2 rounded-[16px] bg-[#0f766e] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0d6b63] active:scale-[0.97] disabled:opacity-60"
              >
                {payUrl ? t('guest_paid') : t('guest_pay').replace('{amount}', orders[0].total_amount.toLocaleString())}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-[16px] border px-3 py-3 md:rounded-[24px] md:px-4 md:py-4 ${accent ? 'border-[#0f766e]/18 bg-[#0f766e]/8' : 'border-white/70 bg-slate-50'}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 md:text-[11px]">{label}</div>
      <div className="mt-1 text-xl font-black tracking-[-0.06em] text-slate-950 md:mt-3 md:text-3xl">{value}</div>
    </div>
  );
}

function OrderCard({ order }: { order: GuestOrder }) {
  const { t } = useLocale();
  return (
    <article className="rounded-[24px] border border-white/70 bg-white/88 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:rounded-[32px] md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-700 md:px-3 md:py-1 md:text-xs">
            {order.status_text}
          </div>
          <h2 className="mt-3 text-xl font-black tracking-[-0.05em] text-slate-950 md:mt-4 md:text-3xl">{order.stage_label}</h2>
          <p className="mt-1 text-xs leading-6 text-slate-600 md:mt-2 md:text-sm md:leading-7">
            {t('guest_eta_range').replace('{from}', String(order.eta_window.from)).replace('{to}', String(order.eta_window.to)).replace('{queue}', String(order.queue_position))}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-3 lg:w-[340px] lg:grid-cols-1 xl:grid-cols-3">
          <MiniMetric icon={Clock3} label={t('guest_eta')} value={`${order.eta_minutes} min`} />
          <MiniMetric icon={Flame} label={t('guest_progress')} value={`${Math.round(order.progress)}%`} />
          <MiniMetric icon={UserRound} label={t('guest_waiter')} value={order.waiter_name || t('guest_assigned')} />
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200 md:mt-5 md:h-2">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#ea580c,#f59e0b,#0f766e)]" style={{ width: `${Math.max(8, order.progress)}%` }} />
      </div>

      <div className="mt-4 grid gap-2 md:mt-5 md:gap-3 md:grid-cols-2">
        {order.items.map((item, index) => (
          <div key={`${order.id}-${index}`} className="rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-3 md:rounded-[22px] md:px-4 md:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-black tracking-[-0.03em] text-slate-950 md:text-base">{item.name}</div>
                {item.notes ? <div className="mt-0.5 text-xs text-slate-500 md:mt-1 md:text-sm">{item.notes}</div> : null}
              </div>
              <div className="shrink-0 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)] md:px-3 md:py-1 md:text-xs">x{item.quantity}</div>
            </div>
            {item.cooking_time ? <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 md:mt-3 md:text-xs">{t('guest_cooking_time').replace('{n}', String(item.cooking_time))}</div> : null}
          </div>
        ))}
      </div>
    </article>
  );
}

function ReviewForm({
  prompt,
  siteKey,
  form,
  onChange,
  onSubmit,
  submitting,
  turnstileToken,
  setTurnstileToken,
  turnstileResetKey,
}: {
  prompt: GuestReviewPromptResponse | null;
  siteKey: string;
  form: typeof reviewDefaults;
  onChange: React.Dispatch<React.SetStateAction<typeof reviewDefaults>>;
  onSubmit: (event: React.FormEvent) => Promise<void> | void;
  submitting: boolean;
  turnstileToken: string;
  setTurnstileToken: (value: string) => void;
  turnstileResetKey: number;
}) {
  const { t } = useLocale();
  return (
    <form onSubmit={onSubmit} className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:rounded-[32px] md:p-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/12 bg-[#0f766e]/7 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#0f766e] md:px-4 md:py-2 md:text-[11px]">
        <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
        {t('guest_review_sent')}
      </div>
      <h2 className="mt-3 text-xl font-black tracking-[-0.05em] text-slate-950 md:mt-4 md:text-3xl">{t('guest_review_title')}</h2>
      <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-600 md:mt-3 md:text-sm md:leading-7">
        {t('guest_review_desc')}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 md:mt-5 md:grid-cols-2 md:gap-4">
        <RatingRow label={t('guest_review_food')} field="rating_food" form={form} onChange={onChange} />
        <RatingRow label={t('guest_review_service_speed')} field="rating_service_speed" form={form} onChange={onChange} />
        <RatingRow label={t('guest_review_waiter')} field="rating_waiter" form={form} onChange={onChange} />
        <RatingRow label={t('guest_review_waitly')} field="rating_waitly" form={form} onChange={onChange} />
      </div>

      <div className="mt-3 grid gap-3 md:mt-4 md:gap-4">
        <label className="grid gap-1 text-xs font-semibold text-slate-700 md:gap-2 md:text-sm">
          {t('guest_review_name')}
          <input
            value={form.author_name}
            onChange={(event) => onChange((current) => ({ ...current, author_name: event.target.value }))}
            placeholder={t('guest_review_name_placeholder')}
            className="rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-[#0f766e] md:rounded-[20px] md:px-4 md:py-3"
          />
        </label>

        <label className="grid gap-1 text-xs font-semibold text-slate-700 md:gap-2 md:text-sm">
          {t('guest_review_comment')}
          <textarea
            value={form.comment}
            onChange={(event) => onChange((current) => ({ ...current, comment: event.target.value }))}
            placeholder={t('guest_review_comment_placeholder')}
            className="min-h-[100px] rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-900 outline-none transition focus:border-[#0f766e] md:min-h-[130px] md:rounded-[20px] md:px-4 md:py-3"
          />
        </label>

        <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 md:rounded-[22px] md:p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 md:text-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0f766e] md:h-4 md:w-4" />
            {t('guest_review_verification')}
          </div>
          <div className="mt-2 md:mt-3">
            <TurnstileField siteKey={siteKey} onTokenChange={setTurnstileToken} resetKey={turnstileResetKey} />
          </div>
          {!siteKey ? <div className="mt-2 text-[10px] leading-5 text-slate-500 md:mt-3 md:text-xs md:leading-6">{t('guest_review_turnstile_note')}</div> : null}
          <div className="mt-2 text-[10px] leading-5 text-slate-500 md:mt-3 md:text-xs md:leading-6">{t('guest_review_scope_note')}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:mt-5 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-slate-500 md:text-sm">{t('guest_review_ready')}</div>
        <button
          type="submit"
          disabled={submitting || (!!siteKey && !turnstileToken) || !prompt?.review_token}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto md:rounded-[22px] md:py-3"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
          {submitting ? t('guest_review_submitting') : t('guest_review_submit')}
        </button>
      </div>
    </form>
  );
}

function RatingRow({ label, field, form, onChange }: { label: string; field: keyof typeof reviewDefaults; form: typeof reviewDefaults; onChange: React.Dispatch<React.SetStateAction<typeof reviewDefaults>> }) {
  const value = Number(form[field]);
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-3 md:rounded-[22px] md:p-4">
      <div className="text-xs font-semibold text-slate-700 md:text-sm">{label}</div>
      <div className="mt-2 flex gap-1 md:mt-3 md:gap-2">
        {Array.from({ length: 5 }, (_, index) => {
          const current = index + 1;
          const active = current <= value;
          return (
            <button
              key={current}
              type="button"
              onClick={() => onChange((state) => ({ ...state, [field]: current }))}
              className={`grid h-9 w-9 place-items-center rounded-xl border transition md:h-11 md:w-11 md:rounded-2xl ${active ? 'border-amber-200 bg-amber-50 text-amber-500' : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300'}`}
            >
              <Star className={`h-5 w-5 ${active ? 'fill-current' : ''}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TurnstileField({ siteKey, onTokenChange, resetKey }: { siteKey: string; onTokenChange: (value: string) => void; resetKey: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !ref.current) {
      return;
    }

    let disposed = false;

    loadTurnstileScript()
      .then(() => {
        if (disposed || !ref.current || !window.turnstile) return;
        ref.current.innerHTML = '';
        widgetIdRef.current = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (token: string) => onTokenChange(token),
          'expired-callback': () => onTokenChange(''),
          'error-callback': () => onTokenChange(''),
        });
      })
      .catch(() => {
        onTokenChange('');
      });

    return () => {
      disposed = true;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, onTokenChange, resetKey]);

  return <div ref={ref} />;
}

function MiniMetric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-slate-50 px-3 py-3 md:rounded-[22px] md:px-4 md:py-4">
      <div className="flex items-center gap-1.5 text-slate-500 md:gap-2">
        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] md:text-[11px]">{label}</span>
      </div>
      <div className="mt-2 text-base font-black tracking-[-0.04em] text-slate-950 md:mt-3 md:text-xl">{value}</div>
    </div>
  );
}

function StateCard({ title, body, error = false }: { title: string; body: string; error?: boolean }) {
  return (
    <article className={`rounded-[24px] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:rounded-[32px] md:p-6 ${error ? 'border-red-200 bg-red-50' : 'border-white/70 bg-white/88'}`}>
      <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-slate-900 text-white md:h-16 md:w-16 md:rounded-[24px]">
        {error ? <MapPinned className="h-5 w-5 md:h-7 md:w-7" /> : <Loader2 className="h-5 w-5 animate-spin md:h-7 md:w-7" />}
      </div>
      <h2 className="mt-3 text-xl font-black tracking-[-0.05em] text-slate-950 md:mt-4 md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-600 md:mt-3 md:text-sm md:leading-7">{body}</p>
    </article>
  );
}

function SuccessCard({ reviewUrl }: { reviewUrl: string }) {
  const { t } = useLocale();
  return (
    <article className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:rounded-[32px] md:p-6">
      <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-emerald-500 text-white shadow-[0_18px_44px_rgba(16,185,129,0.2)] md:h-16 md:w-16 md:rounded-[24px]">
        <CheckCheck className="h-6 w-6 md:h-8 md:w-8" />
      </div>
      <h2 className="mt-3 text-xl font-black tracking-[-0.05em] text-slate-950 md:mt-4 md:text-3xl">{t('guest_success_title')}</h2>
      <p className="mt-2 max-w-3xl text-xs leading-6 text-slate-600 md:mt-3 md:text-sm md:leading-7">
        {t('guest_success_body')}
      </p>
      <div className="mt-4 flex flex-col gap-2 md:mt-5 md:gap-3 sm:flex-row">
        {reviewUrl ? (
          <a href={reviewUrl} className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 md:rounded-[22px] md:px-5">
            {t('guest_open_review_page')}
            <ChevronRight className="h-4 w-4" />
          </a>
        ) : null}
        <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center justify-center gap-2 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:rounded-[22px] md:px-5">
          {t('guest_refresh')}
        </button>
      </div>
    </article>
  );
}
