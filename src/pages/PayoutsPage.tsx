import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { api } from '@/services/http';

export default function PayoutsPage(){
 const [earnings,setEarnings]=useState<any[]>([]);
 const [payouts,setPayouts]=useState<any[]>([]);
 const [summary,setSummary]=useState<any>(null);
 const [amount,setAmount]=useState(''); const [waiter,setWaiter]=useState('');
 const load=async()=>{
  const [e,p,s]=await Promise.all([
   api.get('/v1/owner/waiter/earnings-summary/').then(r=>r.data).catch(()=>null),
   api.get('/v1/owner/waiter/payouts/').then(r=>r.data).catch(()=>[]),
   api.get('/v1/mobile/waiter/earnings/').then(r=>r.data).catch(()=>[]),
  ]);
  setSummary(e); setPayouts(Array.isArray(p)?p:(p?.results||[])); setEarnings(Array.isArray(s)?s:(s?.results||s?.earnings||[]));
 };
 useEffect(()=>{ load(); },[]);
 const requestPayout=async()=>{
  if(!waiter||!amount) return;
  await api.post('/v1/owner/waiter/payouts/',{ waiter, amount }).catch(()=> api.post('/hr/payroll-periods/',{}));
  setAmount(''); await load();
 };
 return (
  <AppShell title="Выплаты" subtitle="WaiterEarning (TIP/COMMISSION) и WaiterPayout — ledger официантов" eyebrow="Finance">
   {summary && <div className="grid gap-4 md:grid-cols-3 mb-6">
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="text-xs uppercase tracking-widest text-theme-muted">Всего чаевых</div><div className="text-2xl font-black text-theme mt-1">{summary.total_tips ?? '—'}</div></div>
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="text-xs uppercase tracking-widest text-theme-muted">Комиссии</div><div className="text-2xl font-black text-theme mt-1">{summary.total_commission ?? '—'}</div></div>
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="text-xs uppercase tracking-widest text-theme-muted">К выплате</div><div className="text-2xl font-black text-emerald-400 mt-1">{summary.pending_payouts ?? summary.balance ?? '—'}</div></div>
   </div>}
   <div className="rounded-[28px] border border-theme bg-theme-panel p-6 mb-6">
    <div className="font-bold text-theme mb-3">Создать выплату</div>
    <div className="flex gap-3"><InputGroup><InputGroupInput value={waiter} onChange={e=>setWaiter(e.target.value)} placeholder="waiter ID"/></InputGroup><InputGroup><InputGroupInput value={amount} onChange={e=>setAmount(e.target.value)} placeholder="сумма"/></InputGroup><Button onClick={requestPayout}>Выплатить</Button></div>
   </div>
   <div className="grid gap-4 md:grid-cols-2">
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme mb-3">Начисления ({earnings.length})</div>{earnings.slice(0,10).map((e:any,i:number)=><div key={i} className="flex justify-between border-b border-theme py-2 text-sm"><span className="text-theme">{e.source||e.type} — {e.amount}</span><span className="text-theme-secondary text-xs">{new Date(e.created_at).toLocaleDateString()}</span></div>)}{earnings.length===0&&<div className="text-theme-secondary text-sm">Нет данных</div>}</div>
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme mb-3">Выплаты ({payouts.length})</div>{payouts.slice(0,10).map((p:any)=><div key={p.id} className="flex justify-between border-b border-theme py-2 text-sm"><span className="text-theme">{p.amount} — {p.status}</span><span className="text-theme-secondary text-xs">{p.created_at?new Date(p.created_at).toLocaleDateString():''}</span></div>)}{payouts.length===0&&<div className="text-theme-secondary text-sm">Нет выплат</div>}</div>
   </div>
  </AppShell>
 );
}
