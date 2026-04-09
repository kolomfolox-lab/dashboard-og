import { useEffect, useMemo, useState } from 'react';
import { ChefHat, Clock3, Flame, RefreshCcw, Soup, UtensilsCrossed } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { kitchenAPI } from '@/services/api';

type KitchenOrderItem = {
  id: string;
  dish_name?: string;
  name?: string;
  quantity: number;
  notes?: string;
};

type KitchenOrder = {
  id: string;
  status: 'CREATED' | 'ACCEPTED' | 'COOKING' | 'READY' | string;
  table_number?: string;
  created_at: string;
  estimated_time?: number;
  extra_time?: number;
  items: KitchenOrderItem[];
};

const statusTone: Record<string, string> = {
  CREATED: 'border-[#ff7b72]/35 bg-[#ff7b72]/12 text-[#ffd0cc]',
  ACCEPTED: 'border-[#f5b04c]/35 bg-[#f5b04c]/12 text-[#ffe0af]',
  COOKING: 'border-[#55c6ff]/35 bg-[#55c6ff]/12 text-[#ccefff]',
  READY: 'border-[#38d39f]/35 bg-[#38d39f]/12 text-[#d1fff1]',
};

export default function KitchenDisplayPage() {
  const { restaurantSlug = '', kitchenToken = '' } = useParams();
  const [restaurantName, setRestaurantName] = useState('Kitchen Display');
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const metrics = useMemo(() => ({
    total: orders.length,
    created: orders.filter((order) => order.status === 'CREATED').length,
    cooking: orders.filter((order) => order.status === 'ACCEPTED' || order.status === 'COOKING').length,
    ready: orders.filter((order) => order.status === 'READY').length,
  }), [orders]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!restaurantSlug || !kitchenToken) {
        setError('Kitchen token is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await kitchenAPI.bootstrap({
          restaurant_slug: restaurantSlug,
          kitchen_token: kitchenToken,
        });
        if (active) {
          setRestaurantName(response.data.restaurant?.name || restaurantSlug);
        }
      } catch (err: any) {
        if (active) {
          setError(err?.response?.data?.error?.message || 'Kitchen bootstrap failed.');
          setLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, [kitchenToken, restaurantSlug]);

  useEffect(() => {
    let active = true;
    let intervalId: number | undefined;

    const loadOrders = async () => {
      if (!restaurantSlug || !kitchenToken) return;

      try {
        const response = await kitchenAPI.getOrders(kitchenToken);
        if (active) {
          setOrders(response.data || []);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err?.response?.data?.error?.message || 'Failed to load kitchen orders.');
          setLoading(false);
        }
      }
    };

    const connectSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}/ws/kitchen/${kitchenToken}/`);

      socket.onmessage = () => {
        loadOrders();
      };

      socket.onclose = () => {
        if (active) {
          window.setTimeout(connectSocket, 2500);
        }
      };

      return socket;
    };

    loadOrders();
    intervalId = window.setInterval(loadOrders, 15000);
    const socket = connectSocket();

    return () => {
      active = false;
      socket.close();
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [kitchenToken, restaurantSlug]);

  const handleAccept = async (orderId: string) => {
    await kitchenAPI.acceptOrder(orderId, kitchenToken);
    const response = await kitchenAPI.getOrders(kitchenToken);
    setOrders(response.data || []);
  };

  const handleReady = async (orderId: string) => {
    await kitchenAPI.markReady(orderId, kitchenToken);
    const response = await kitchenAPI.getOrders(kitchenToken);
    setOrders(response.data || []);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#07111d] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-red-500/20 bg-red-500/10 p-8">
          <div className="text-xs font-bold uppercase tracking-[0.32em] text-red-200/70">Kitchen access</div>
          <h1 className="mt-4 text-3xl font-black">Display unavailable</h1>
          <p className="mt-3 text-sm text-red-100/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,123,114,0.18),transparent_24%),linear-gradient(180deg,#050b12_0%,#07111d_42%,#0b1725_100%)] px-5 py-5 text-white lg:px-8">
      <div className="mx-auto flex max-w-[1880px] flex-col gap-5">
        <header className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ff7b72]/20 bg-[#ff7b72]/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffd0cc]">
                <ChefHat className="h-4 w-4" />
                Live kitchen pass
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight">{restaurantName}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">
                React kitchen board for active production flow. It watches new orders, cooking load, and ready handoff without the old template logic.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                const response = await kitchenAPI.getOrders(kitchenToken);
                setOrders(response.data || []);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/10"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh queue
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={UtensilsCrossed} label="Active tickets" value={metrics.total} tone="from-[#ff7b72]/20 to-transparent" />
          <MetricCard icon={Soup} label="New" value={metrics.created} tone="from-[#f5b04c]/20 to-transparent" />
          <MetricCard icon={Flame} label="Cooking" value={metrics.cooking} tone="from-[#55c6ff]/20 to-transparent" />
          <MetricCard icon={Clock3} label="Ready" value={metrics.ready} tone="from-[#38d39f]/20 to-transparent" />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {loading ? (
            <div className="xl:col-span-3 rounded-[32px] border border-white/10 bg-white/[0.04] px-6 py-24 text-center text-white/52">
              Loading kitchen stream...
            </div>
          ) : null}

          {!loading && orders.length === 0 ? (
            <div className="xl:col-span-3 rounded-[32px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-24 text-center">
              <div className="text-xs font-bold uppercase tracking-[0.32em] text-white/24">Queue is clear</div>
              <div className="mt-4 text-3xl font-black">No active orders right now</div>
              <p className="mt-3 text-sm text-white/44">New tickets will appear here automatically through websocket or timed refresh.</p>
            </div>
          ) : null}

          {!loading && orders.map((order) => (
            <article key={order.id} className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/28">Table</div>
                  <div className="mt-2 text-3xl font-black">#{order.table_number || '—'}</div>
                </div>
                <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${statusTone[order.status] || 'border-white/12 bg-white/8 text-white/78'}`}>
                  {order.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <InfoPill label="Created" value={new Date(order.created_at).toLocaleTimeString()} />
                <InfoPill label="ETA" value={`${(order.estimated_time || 0) + (order.extra_time || 0)} min`} />
              </div>

              <div className="mt-5 space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/8 bg-black/16 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">{item.dish_name || item.name || 'Dish'}</div>
                        {item.notes ? <div className="mt-1 text-xs text-[#8fd4ff]">{item.notes}</div> : null}
                      </div>
                      <div className="rounded-xl bg-white/6 px-3 py-1 text-xs font-bold text-white/82">x{item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex gap-3">
                {order.status === 'CREATED' ? (
                  <ActionButton label="Accept" tone="orange" onClick={() => handleAccept(order.id)} />
                ) : null}
                {order.status === 'ACCEPTED' || order.status === 'COOKING' ? (
                  <ActionButton label="Mark ready" tone="green" onClick={() => handleReady(order.id)} />
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]`}>
      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${tone} p-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-white/32">{label}</div>
      <div className="mt-2 text-4xl font-black">{value}</div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/16 px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/28">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white/84">{value}</div>
    </div>
  );
}

function ActionButton({ label, tone, onClick }: { label: string; tone: 'orange' | 'green'; onClick: () => void }) {
  const className =
    tone === 'green'
      ? 'border-[#38d39f]/25 bg-[#38d39f]/14 text-[#d1fff1] hover:bg-[#38d39f]/22'
      : 'border-[#ff7b72]/25 bg-[#ff7b72]/14 text-[#ffd0cc] hover:bg-[#ff7b72]/22';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-bold transition ${className}`}
    >
      {label}
    </button>
  );
}
