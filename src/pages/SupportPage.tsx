import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { ownerAPI } from '@/services/api';
export default function SupportPage(){
 const [events,setEvents]=useState<any[]>([]);
 useEffect(()=>{ ownerAPI.getSecurityEvents?.().then((r:any)=>setEvents(r.data?.results||[])).catch(()=>{}); },[]);
 return (
  <AppShell title="Поддержка" subtitle="Обращения гостей, отзывы и системные события" eyebrow="Support">
    <div className="grid gap-4 md:grid-cols-3"><a href="/crm" className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme">CRM</div><p className="text-sm text-theme-secondary">Гости и визиты</p></a><a href="/notifications" className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme">Уведомления</div><p className="text-sm text-theme-secondary">Логи</p></a><a href="/security" className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme">Безопасность</div><p className="text-sm text-theme-secondary">Auth fails</p></a></div>
    {events.length>0 && <div className="mt-6 rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold mb-3 text-theme">Последние ошибки</div>{events.slice(0,5).map((e:any,i:number)=><div key={i} className="text-sm text-theme-secondary border-b border-theme py-2">{e.event} — {e.category}</div>)}</div>}
  </AppShell>
 );
}
