import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { api } from '@/services/http';

export default function SplitBillPage(){
 const [orderId,setOrderId]=useState(''); const [code,setCode]=useState('');
 const [session,setSession]=useState<any>(null); const [error,setError]=useState('');
 const create=async()=>{
  setError('');
  try{
   const r=await api.post('/v1/bill-split/sessions/',{ order_id: orderId }).then(x=>x.data);
   setSession(r.session); setCode(r.session.code);
  }catch(e:any){ setError(e?.response?.data?.error||'Ошибка'); }
 };
 const load=async()=>{
  if(!code) return;
  try{
   const r=await api.get(`/v1/bill-split/sessions/${code}/`).then(x=>x.data);
   setSession(r.session); setError('');
  }catch(e:any){ setError('Не найдено'); }
 };
 const close=async()=>{
  if(!code) return;
  await api.post(`/v1/bill-split/sessions/${code}/close/`).then(()=>load()).catch(()=>{});
 };
 return (
  <AppShell title="Раздел счёта" subtitle="bill_split — Deep Link /pay/session_<CODE> + SplitPay на каждого гостя" eyebrow="Bill Split">
   <div className="grid gap-4 md:grid-cols-2">
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6">
     <div className="font-bold text-theme mb-3">Создать сессию</div>
     <Label>Order ID (UUID)</Label><InputGroup><InputGroupInput value={orderId} onChange={e=>setOrderId(e.target.value)} placeholder="order uuid"/></InputGroup>
     <Button className="mt-3" onClick={create} disabled={!orderId}>Создать</Button>
     {error && <div className="text-red-400 text-sm mt-3">{error}</div>}
    </div>
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6">
     <div className="font-bold text-theme mb-3">Найти сессию</div>
     <Label>Code (8 символов)</Label><InputGroup><InputGroupInput value={code} onChange={e=>setCode(e.target.value)} placeholder="ABCD1234" className="uppercase"/></InputGroup>
     <div className="flex gap-2 mt-3"><Button onClick={load} disabled={!code}>Загрузить</Button><Button variant="secondary" onClick={close} disabled={!code}>Закрыть</Button></div>
     {session && <div className="text-xs text-theme-secondary mt-3">Ссылка: <a href={`/pay/session_${session.code}/`} target="_blank" className="underline">/pay/session_{session.code}/</a> deep: <code>waitly://pay/{session.code}</code></div>}
    </div>
   </div>
   {session && <div className="mt-6 rounded-[28px] border border-theme bg-theme-panel p-6">
    <div className="font-bold text-theme mb-3">Сессия {session.code} — {session.status}</div>
    <div className="grid md:grid-cols-3 gap-4 text-sm">
     <div className="text-theme-secondary">Покрыто: <span className="text-theme">{session.covered_total}</span></div>
     <div className="text-theme-secondary">Непокрыто: <span className="text-theme">{session.uncovered_total}</span></div>
     <div className="text-theme-secondary">Участников: <span className="text-theme">{session.participants?.length||0}</span></div>
    </div>
    <div className="mt-4 space-y-2">{(session.participants||[]).map((p:any)=><div key={p.id} className="flex justify-between border border-theme rounded-xl px-4 py-3 text-sm"><span className="text-theme">{p.name} {p.phone}</span><span className={p.status==='PAID'?'text-emerald-400':'text-theme-secondary'}>{p.status} {p.share_amount||''}</span></div>)}
     {(session.items||[]).map((it:any)=><div key={it.order_item_id} className="flex justify-between border border-theme rounded-xl px-4 py-2 text-xs"><span className="text-theme-secondary">{it.name} x{it.quantity}</span><span className="text-theme">{it.price} — claimed {it.claimed||0}/{it.quantity}</span></div>)}</div>
   </div>}
   <div className="mt-6 rounded-[28px] border border-theme bg-theme-panel p-6 text-xs text-theme-secondary">Комиссия Waitly на каждого плательщика: cafe 500, restaurant ≤75k 0, &gt;75k 1000, &gt;200k 1500 — via <code>calculate_waitly_fee + build_split_array</code> (SplitPay Payme)</div>
  </AppShell>
 );
}
