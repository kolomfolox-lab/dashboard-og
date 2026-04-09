import { useEffect, useMemo, useRef, useState } from 'react';
import { BellRing, CheckCheck, ChevronRight, Clock3, Flame, Loader2, MapPinned, Route, ShieldCheck, Sparkles, Star, UserRound } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { publicAPI, type GuestActiveOrdersResponse, type GuestBootstrapResponse, type GuestLoadSnapshot, type GuestOrder, type GuestReviewPromptResponse } from '@/services/api';

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
  const [bootstrap, setBootstrap] = useState<GuestBootstrapResponse | null>(null);
  const [ordersState, setOrdersState] = useState<GuestActiveOrdersResponse | null>(null);
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
  const canReview = !reviewSent && orders.length === 0 && !!prompt?.eligible;
  const restaurantName = bootstrap?.restaurant.chain_name || bootstrap?.restaurant.name || 'Waitly';

  const timeline = useMemo(() => {
    if (!orders.length) {
      return [
        { label: 'Kitchen queue', active: false },
        { label: 'Cooking', active: false },
        { label: 'To table', active: false },
      ];
    }

    const hasAccepted = orders.some((order) => order.status === 'ACCEPTED' || order.status === 'CREATED');
    const hasCooking = orders.some((order) => order.status === 'COOKING');
    const hasReady = orders.some((order) => order.status === 'READY');
    return [
      { label: 'Kitchen queue', active: hasAccepted || hasCooking || hasReady },
      { label: 'Cooking', active: hasCooking || hasReady },
      { label: 'To table', active: hasReady },
    ];
  }, [orders]);

  const handleCallWaiter = async () => {
    if (!bootstrap?.guest_token || waiterBusy) return;
    setWaiterBusy(true);
    try {
      await publicAPI.guestCallWaiter(bootstrap.guest_token);
    } finally {
      setWaiterBusy(false);
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
      <div className="mx-auto max-w-[1680px] px-4 py-4 lg:px-6 lg:py-5">
        <header className="rounded-[34px] border border-white/70 bg-white/84 px-5 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:px-7 md:py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/12 bg-[#0f766e]/7 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.32em] text-[#0f766e]">
                <Route className="h-4 w-4" />
                QR guest tracking
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-slate-950 md:text-[4.15rem]">
                {restaurantName}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                React tracking page for table flow, kitchen load, simple ETA, and post-delivery reviews. No heavy prediction engine, just a clean heuristic your guests can understand.
              </p>
            </div>

            <div className="grid gap-3 md:min-w-[360px] md:grid-cols-3 xl:max-w-[540px]">
              <TopStat label="Table" value={bootstrap?.table.number || tableNumber || '-'} />
              <TopStat label="Active orders" value={String(load?.active_orders_count || orders.length || 0)} />
              <TopStat label="Kitchen load" value={load?.label || 'Loading'} accent />
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="grid gap-4">
            {loading ? <StateCard title="Loading guest flow" body="We are building the QR view and current order state for this table right now." /> : null}
            {!loading && error ? <StateCard title="Guest flow unavailable" body={error} error /> : null}
            {!loading && !error && reviewSent ? <SuccessCard reviewUrl={reviewUrl || bootstrap?.review_page_url || ''} /> : null}
            {!loading && !error && !reviewSent && orders.length > 0 ? (
              <div className="grid gap-4">
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
              <StateCard title="No active orders right now" body="As soon as the kitchen or waiter updates the flow, this page will refresh automatically. After delivery, the review form appears here." />
            ) : null}
          </section>

          <aside className="grid gap-4 xl:sticky xl:top-4 xl:h-fit">
            <div className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Route board</div>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.05em]">Kitchen load and handoff track</h2>
              <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Load level</div>
                    <div className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-bold ${loadTone[(load?.level as 'LOW' | 'MEDIUM' | 'HIGH')] || 'border-slate-200 bg-slate-100 text-slate-600'}`}>
                      {load?.label || 'Loading'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Queue</div>
                    <div className="mt-2 text-3xl font-black tracking-[-0.05em]">{load?.active_orders_count || 0}</div>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#f59e0b,#ea580c)]" style={{ width: `${Math.min(100, ((load?.load_score || 0) / 12) * 100)}%` }} />
                </div>
                <div className="mt-3 text-xs leading-6 text-slate-500">
                  Delay buffer in this snapshot: about {load?.delay_buffer_minutes || 0} extra minutes.
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f9_100%)] p-4">
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Route stages</div>
                <div className="mt-4 space-y-3">
                  {timeline.map((step, index) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className={`grid h-9 w-9 place-items-center rounded-2xl border ${step.active ? 'border-[#0f766e]/18 bg-[#0f766e]/9 text-[#0f766e]' : 'border-slate-200 bg-white text-slate-400'}`}>
                        <span className="text-sm font-black">{index + 1}</span>
                      </div>
                      <div className="flex-1 rounded-[18px] border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700">
                        {step.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,#16202c_0%,#0f1722_100%)] p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8fd4ff]">Table tools</div>
              <h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">Call the waiter and keep the guest flow clean.</h3>
              <p className="mt-3 text-sm leading-7 text-white/64">
                Waiter call stays lightweight and available while the table is active.
              </p>

              <button
                type="button"
                onClick={handleCallWaiter}
                disabled={waiterBusy || !bootstrap?.guest_token}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[22px] bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {waiterBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                {waiterBusy ? 'Sending request...' : 'Call waiter'}
              </button>

              {(bootstrap?.review_page_url || reviewUrl) ? (
                <a href={(bootstrap?.review_page_url || reviewUrl)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/84 transition hover:bg-white/[0.1]">
                  Open public reviews
                  <ChevronRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TopStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-[24px] border px-4 py-4 ${accent ? 'border-[#0f766e]/18 bg-[#0f766e]/8' : 'border-white/70 bg-slate-50'}`}>
      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-950">{value}</div>
    </div>
  );
}

function OrderCard({ order }: { order: GuestOrder }) {
  return (
    <article className="rounded-[32px] border border-white/70 bg-white/88 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">
            {order.status_text}
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950">{order.stage_label}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Estimated to reach the table in about {order.eta_window.from}-{order.eta_window.to} minutes. Queue spot #{order.queue_position} in the current kitchen flow.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:w-[340px] lg:grid-cols-1 xl:grid-cols-3">
          <MiniMetric icon={Clock3} label="ETA" value={`${order.eta_minutes} min`} />
          <MiniMetric icon={Flame} label="Progress" value={`${Math.round(order.progress)}%`} />
          <MiniMetric icon={UserRound} label="Waiter" value={order.waiter_name || 'Assigned'} />
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#ea580c,#f59e0b,#0f766e)]" style={{ width: `${Math.max(8, order.progress)}%` }} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {order.items.map((item, index) => (
          <div key={`${order.id}-${index}`} className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-black tracking-[-0.03em] text-slate-950">{item.name}</div>
                {item.notes ? <div className="mt-1 text-sm text-slate-500">{item.notes}</div> : null}
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">x{item.quantity}</div>
            </div>
            {item.cooking_time ? <div className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Cooking time {item.cooking_time} min</div> : null}
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
  return (
    <form onSubmit={onSubmit} className="rounded-[32px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/12 bg-[#0f766e]/7 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0f766e]">
        <Sparkles className="h-4 w-4" />
        Delivered order review
      </div>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950">Thanks for the order.</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        Leave a short review right after delivery. This flow is still one-order-to-one-review, just moved into React with captcha and a cleaner guest experience.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <RatingRow label="Food" field="rating_food" form={form} onChange={onChange} />
        <RatingRow label="Service speed" field="rating_service_speed" form={form} onChange={onChange} />
        <RatingRow label="Waiter" field="rating_waiter" form={form} onChange={onChange} />
        <RatingRow label="Waitly" field="rating_waitly" form={form} onChange={onChange} />
      </div>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Your name, if you want to sign the review
          <input
            value={form.author_name}
            onChange={(event) => onChange((current) => ({ ...current, author_name: event.target.value }))}
            placeholder="For example, Azamat"
            className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-[#0f766e]"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Comment
          <textarea
            value={form.comment}
            onChange={(event) => onChange((current) => ({ ...current, comment: event.target.value }))}
            placeholder="What felt strong and what could be better?"
            className="min-h-[130px] rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-[#0f766e]"
          />
        </label>

        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ShieldCheck className="h-4 w-4 text-[#0f766e]" />
            Guest verification
          </div>
          <div className="mt-3">
            <TurnstileField siteKey={siteKey} onTokenChange={setTurnstileToken} resetKey={turnstileResetKey} />
          </div>
          {!siteKey ? <div className="mt-3 text-xs leading-6 text-slate-500">Turnstile will appear here automatically when site keys are configured.</div> : null}
          <div className="mt-3 text-xs leading-6 text-slate-500">This review applies only to the latest delivered order from this table.</div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-500">Order token is active and ready for submission.</div>
        <button
          type="submit"
          disabled={submitting || (!!siteKey && !turnstileToken) || !prompt?.review_token}
          className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
          {submitting ? 'Submitting...' : 'Submit review'}
        </button>
      </div>
    </form>
  );
}

function RatingRow({ label, field, form, onChange }: { label: string; field: keyof typeof reviewDefaults; form: typeof reviewDefaults; onChange: React.Dispatch<React.SetStateAction<typeof reviewDefaults>> }) {
  const value = Number(form[field]);
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, index) => {
          const current = index + 1;
          const active = current <= value;
          return (
            <button
              key={current}
              type="button"
              onClick={() => onChange((state) => ({ ...state, [field]: current }))}
              className={`grid h-11 w-11 place-items-center rounded-2xl border transition ${active ? 'border-amber-200 bg-amber-50 text-amber-500' : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300'}`}
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
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-[0.22em]">{label}</span>
      </div>
      <div className="mt-3 text-xl font-black tracking-[-0.04em] text-slate-950">{value}</div>
    </div>
  );
}

function StateCard({ title, body, error = false }: { title: string; body: string; error?: boolean }) {
  return (
    <article className={`rounded-[32px] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${error ? 'border-red-200 bg-red-50' : 'border-white/70 bg-white/88'}`}>
      <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-slate-900 text-white">
        {error ? <MapPinned className="h-7 w-7" /> : <Loader2 className="h-7 w-7 animate-spin" />}
      </div>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{body}</p>
    </article>
  );
}

function SuccessCard({ reviewUrl }: { reviewUrl: string }) {
  return (
    <article className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-emerald-500 text-white shadow-[0_18px_44px_rgba(16,185,129,0.2)]">
        <CheckCheck className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-slate-950">Review sent</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        Thanks. The restaurant will see your feedback, and the public review page can now show the published result for future guests.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {reviewUrl ? (
          <a href={reviewUrl} className="inline-flex items-center justify-center gap-2 rounded-[22px] bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
            Open review page
            <ChevronRight className="h-4 w-4" />
          </a>
        ) : null}
        <button type="button" onClick={() => window.location.reload()} className="inline-flex items-center justify-center gap-2 rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Refresh page
        </button>
      </div>
    </article>
  );
}
