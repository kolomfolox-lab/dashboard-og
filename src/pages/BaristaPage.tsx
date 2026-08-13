import { useEffect, useRef, useState } from 'react';

const tg = (window as any).Telegram?.WebApp;

export default function BaristaPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [online, setOnline] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [rid, setRid] = useState('');
  const [token, setToken] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Init from URL params
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ridParam = p.get('restaurant_id') || localStorage.getItem('barista_restaurant_id') || '';
    const tokParam = p.get('token') || localStorage.getItem('barista_token') || '';
    setRid(ridParam);
    setToken(tokParam);
    if (ridParam) {
      localStorage.setItem('barista_restaurant_id', ridParam);
      if (tokParam) localStorage.setItem('barista_token', tokParam);
    }
    if (tg) { tg.expand(); tg.enableClosingConfirmation(); }
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(() => {});
    }
  }, []);

  // WebSocket + fetch
  useEffect(() => {
    if (!rid) return;
    const api = async (path: string, opts?: any) => {
      const h: any = { 'Content-Type': 'application/json' };
      if (token) h['Authorization'] = `Bearer ${token}`;
      try {
        const r = await fetch(path, { ...opts, headers: h });
        return r.ok ? r.json() : null;
      } catch { return null; }
    };

    const load = async () => {
      const data = await api(`/api/owner/staff-orders/?restaurant_id=${rid}&status=active`);
      if (data) {
        const list = Array.isArray(data) ? data : (data.results || []);
        setOrders(list.filter((o: any) => ['CREATED','ACCEPTED','KITCHEN','READY'].includes(o.status)));
      }
    };

    load();
    const timer = setInterval(load, 10000);

    const wsUrl = `ws://${location.hostname}:8000/ws/orders/${rid}/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => setOnline(true);
    ws.onclose = () => { setOnline(false); };
    ws.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        if (!['new_order','order_update'].includes(d.type)) return;
        if (!d.order) { load(); return; }
        setOrders((prev: any[]) => {
          const ex = prev.find((o: any) => o.id === d.order.id);
          if (ex) return prev.map((o: any) => o.id === d.order.id ? d.order : o);
          if (soundOn && audioRef.current && ['CREATED','KITCHEN'].includes(d.order.status))
            audioRef.current.play().catch(() => {});
          return [d.order, ...prev];
        });
      } catch {}
    };

    return () => { clearInterval(timer); ws.close(); };
  }, [rid, token]);

  const updateStatus = async (orderId: string, status: string) => {
    const h: any = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    try {
      const r = await fetch(`/api/orders/${orderId}/update_status/`, {
        method: 'POST', body: JSON.stringify({ status }), headers: h,
      });
      if (r.ok) setOrders((prev: any[]) => prev.map((o: any) => o.id === orderId ? { ...o, status } : o));
    } catch {}
  };

  const newO = orders.filter((o: any) => o.status === 'CREATED');
  const cookO = orders.filter((o: any) => ['ACCEPTED','KITCHEN'].includes(o.status));

  if (!rid) {
    return (
      <div className="fixed inset-0 bg-[#050d17] text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-6">Бариста</h1>
        <input placeholder="Restaurant ID" className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-lg text-white text-center mb-3 outline-none focus:border-emerald-500"
          onChange={e => { setRid(e.target.value); localStorage.setItem('barista_restaurant_id', e.target.value); }} />
        <input placeholder="Token (необязательно)" className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-lg text-white text-center mb-4 outline-none focus:border-emerald-500"
          onChange={e => { setToken(e.target.value); localStorage.setItem('barista_token', e.target.value); }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#050d17] text-white overflow-y-auto select-none">
      <audio ref={audioRef} preload="auto" src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgA" />

      <header className="sticky top-0 z-50 bg-[#050d17]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <div>
            <h1 className="text-base font-bold">Бариста</h1>
            <p className={`text-xs ${online ? 'text-emerald-400' : 'text-red-400'}`}>
              {online ? '● Онлайн' : '○ Переподключение...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSoundOn(v => !v)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${soundOn ? 'border-emerald-500/30 text-emerald-300' : 'border-white/10 text-white/30'}`}>
            {soundOn ? '🔊' : '🔇'}
          </button>
          <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-3 py-1 text-xs font-bold">{newO.length}</span>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-white/30">
          <span className="text-6xl">☕</span>
          <h2 className="text-xl font-bold">Нет заказов</h2>
          <p className="text-sm">Ожидайте поступления новых заказов</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {newO.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-3">🆕 НОВЫЕ ({newO.length})</h3>
              {newO.map(o => renderOrder(o, 'accept', updateStatus))}
            </div>
          )}
          {cookO.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/30 mb-3">🔥 ГОТОВЯТСЯ ({cookO.length})</h3>
              {cookO.map(o => renderOrder(o, 'ready', updateStatus))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function renderOrder(order: any, action: string, updateStatus: any) {
  const isNew = action === 'accept';
  const accent = isNew ? 'emerald' : 'amber';
  return (
    <div key={order.id} className={`rounded-3xl border p-5 mb-4 bg-gradient-to-b ${isNew ? 'from-emerald-500/8 to-transparent border-emerald-500/15' : 'from-amber-500/8 to-transparent border-amber-500/15'} shadow-[0_8px_30px_rgba(0,0,0,0.2)]`}>
      {order.is_preorder && (
        <div className="flex items-center gap-1.5 bg-amber-500/10 rounded-full px-3 py-1 text-xs font-bold text-amber-300 w-fit mb-3">
          ⏰ {new Date(order.pickup_time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xl font-black">#{order.order_number || order.id?.slice(0,5)}</span>
        {isNew && <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md">НОВЫЙ</span>}
      </div>
      {order.items?.map((item: any, idx: number) => (
        <div key={idx} className="flex gap-3 mb-3">
          <span className={`text-2xl font-black ${accent === 'emerald' ? 'text-emerald-300' : 'text-amber-300'}`}>{item.quantity}</span>
          <div className="flex-1">
            <div className="text-base font-bold">{item.dish_name}</div>
            {item.modifiers?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {item.modifiers.map((m: any, mi: number) => (
                  <span key={mi} className="text-xs text-white/50 bg-white/5 rounded-full px-2.5 py-0.5">
                    {m.option}{m.price > 0 ? ` +${m.price.toLocaleString()}` : ''}
                  </span>
                ))}
              </div>
            )}
            {item.notes && <p className="text-xs text-white/30 italic mt-1">«{item.notes}»</p>}
          </div>
        </div>
      ))}
      <button
        onClick={() => updateStatus(order.id, isNew ? 'ACCEPTED' : 'READY')}
        className={`w-full rounded-2xl py-5 text-lg font-bold text-white transition active:scale-[0.97] ${isNew ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20'}`}
      >
        {isNew ? '✅ ПРИНЯТЬ' : '☕ ГОТОВО'}
      </button>
    </div>
  );
}
