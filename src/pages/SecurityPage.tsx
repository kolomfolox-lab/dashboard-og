import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { api } from '@/services/http';

export default function SecurityPage(){
 const [events,setEvents]=useState<any[]>([]);
 const [stats,setStats]=useState<any>(null);
 const [filter,setFilter]=useState('');
 const [error,setError]=useState('');
 const load=async()=>{
  try{
   const [e,s]=await Promise.all([
    api.get('/security/events/',{ params: filter?{category:filter}:{} }).then(r=>r.data).catch(()=>({results:[]})),
    api.get('/security/events/stats/').then(r=>r.data).catch(()=>null),
   ]);
   setEvents(Array.isArray(e)?e:(e.results||[]));
   setStats(s);
   setError('');
  }catch(e:any){ setError(e?.response?.data?.detail||'Доступ только SUPER_ADMIN'); }
 };
 useEffect(()=>{ load(); },[filter]);
 return (
  <AppShell title="Безопасность" subtitle="PCI DSS журнал — SecurityEvent (Req 10)" eyebrow="Security">
   {stats && <div className="grid gap-4 md:grid-cols-3 mb-6">
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="text-xs uppercase tracking-widest text-theme-muted">Всего событий</div><div className="text-2xl font-black text-theme mt-1">{stats.total}</div></div>
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="text-xs uppercase tracking-widest text-theme-muted">Auth fails</div><div className="text-2xl font-black text-red-400 mt-1">{stats.auth_failures}</div></div>
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6 text-xs text-theme-secondary">{stats.by_category?.map((c:any)=><div key={c.category} className="flex justify-between py-1"><span>{c.category}</span><span>{c.count}</span></div>)}</div>
   </div>}
   <div className="flex gap-2 mb-4">
    {['','AUTH','AUTH_FAIL','PAYMENT','ADMIN_ACTION'].map(c=>(
     <button key={c||'all'} onClick={()=>setFilter(c)} className={`rounded-full px-4 py-2 text-xs font-bold border ${filter===c?'bg-white text-black border-white':'border-theme text-theme-secondary'}`}>{c||'ALL'}</button>
    ))}
   </div>
   {error && <div className="rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 p-4 mb-4 text-sm">{error}</div>}
   <div className="rounded-[28px] border border-theme bg-theme-panel p-6 overflow-x-auto">
    <table className="w-full text-sm">
     <thead className="text-theme-muted text-xs uppercase"><tr><th className="text-left py-2">Время</th><th className="text-left">Category</th><th className="text-left">Event</th><th className="text-left">Actor</th><th className="text-left">IP</th></tr></thead>
     <tbody>{events.map((e:any)=><tr key={e.id} className="border-t border-theme"><td className="py-2 text-theme-secondary text-xs">{new Date(e.created_at).toLocaleString()}</td><td className="text-theme">{e.category}</td><td className="text-theme">{e.event}</td><td className="text-theme-secondary">{e.actor||'—'}</td><td className="text-theme-secondary text-xs">{e.ip_address||''}</td></tr>)}</tbody>
    </table>
    {events.length===0 && !error && <div className="text-theme-secondary text-sm py-6 text-center">Нет событий</div>}
   </div>
  </AppShell>
 );
}
