import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { ownerAPI } from '@/services/api';

export default function ShiftLeaderPage() {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    ownerAPI.getStats().then(r=>setStats(r.data)).catch(()=>{});
    ownerAPI.getSecurityEvents?.().then((r:any)=>setEvents(r.data?.results||r.data||[])).catch(()=>{});
  }, []);
  return (
    <AppShell title="Смена" subtitle="Контроль смены, чек-листы и персонал на линии" eyebrow="Shift Leader">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="text-xs uppercase tracking-widest text-theme-muted">Заказов сегодня</div><div className="mt-2 text-3xl font-black text-theme">{stats?.orders_today??'—'}</div></div>
        <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="text-xs uppercase tracking-widest text-theme-muted">Выручка</div><div className="mt-2 text-3xl font-black text-theme">{stats?.revenue_today ? `${Number(stats.revenue_today).toLocaleString()} сум` : '—'}</div></div>
        <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="text-xs uppercase tracking-widest text-theme-muted">Активные столы</div><div className="mt-2 text-3xl font-black text-theme">{stats?.active_tables??stats?.tables_occupied??'—'}</div></div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <a href="/checklists" className="rounded-[28px] border border-theme bg-theme-panel p-6 hover:bg-theme-surface transition"><div className="font-bold text-theme">Чек-листы смены</div><p className="text-sm text-theme-secondary mt-1">Открытие / закрытие, HACCP</p></a>
        <a href="/attendance" className="rounded-[28px] border border-theme bg-theme-panel p-6 hover:bg-theme-surface transition"><div className="font-bold text-theme">Посещаемость</div><p className="text-sm text-theme-secondary mt-1">Кто на смене, опоздания</p></a>
      </div>
      {events.length>0 && <div className="mt-6 rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme mb-3">Последние события</div><div className="space-y-2 text-sm text-theme-secondary">{events.slice(0,5).map((e:any,i:number)=><div key={i} className="flex justify-between border-b border-theme py-2"><span>{e.event||e.category}</span><span className="text-theme-muted">{new Date(e.created_at).toLocaleTimeString()}</span></div>)}</div></div>}
    </AppShell>
  );
}
