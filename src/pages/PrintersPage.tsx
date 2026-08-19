import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { api } from '@/services/http';

export default function PrintersPage(){
 const { selectedRestaurant } = useOwnerWorkspace();
 const slug = selectedRestaurant?.slug;
 const [printers,setPrinters]=useState<any[]>([]);
 const [jobs,setJobs]=useState<any[]>([]);
 const [name,setName]=useState(''); const [ip,setIp]=useState(''); const [port,setPort]=useState('9100');
 const [loading,setLoading]=useState(false);
 const [testText,setTestText]=useState('Waitly Test Print');
 const load=async()=>{
  if(!slug) return;
  const r=await api.get(`/printers/${slug}/`).then(x=>x.data).catch(()=>null);
  setPrinters(r?.printers||[]);
  if(r?.printers?.[0]){
   const j=await api.get(`/printers/${slug}/${r.printers[0].id}/jobs/pending/`).then(x=>x.data).catch(()=>null);
   setJobs(j?.jobs||[]);
  }
 };
 useEffect(()=>{ load(); },[slug]);
 const create=async()=>{
  if(!slug || !name) return;
  setLoading(true);
  try{ await api.post(`/printers/${slug}/`,{ name, connection_type: ip?'NETWORK':'USB', ip_address: ip, port: Number(port)||9100 }); setName(''); setIp(''); await load(); }catch{} setLoading(false);
 };
 const createJob=async()=>{
  if(!printers[0]) return;
  await api.post(`/print-jobs/create/`,{ printer_id: printers[0].id, job_type:'receipt', text: testText }).then(()=>load()).catch(()=>{});
 };
 if(!selectedRestaurant) return <AppShell title="Принтеры" subtitle="Загрузка..." eyebrow="Hardware"><div className="text-theme-secondary">Выберите заведение</div></AppShell>;
 return (
  <AppShell title="Принтеры" subtitle={`WS: wss://waitly.uz/ws/prints/${selectedRestaurant.id}/${selectedRestaurant.print_token||'—'}`} eyebrow="Hardware">
   <div className="grid gap-4 md:grid-cols-2">
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6">
     <div className="font-bold text-theme mb-3">Добавить принтер</div>
     <div className="grid gap-3">
      <div><Label>Название</Label><InputGroup><InputGroupInput value={name} onChange={e=>setName(e.target.value)} placeholder="Кухня / Бар"/></InputGroup></div>
      <div><Label>IP (пусто = USB)</Label><InputGroup><InputGroupInput value={ip} onChange={e=>setIp(e.target.value)} placeholder="192.168.1.50"/></InputGroup></div>
      <div><Label>Port</Label><InputGroup><InputGroupInput value={port} onChange={e=>setPort(e.target.value)} /></InputGroup></div>
      <Button onClick={create} disabled={loading || !name}>{loading?'...':'Создать'}</Button>
     </div>
    </div>
    <div className="rounded-[28px] border border-theme bg-theme-panel p-6">
     <div className="font-bold text-theme mb-3">Тест печати</div>
     <InputGroup><InputGroupInput value={testText} onChange={e=>setTestText(e.target.value)} /></InputGroup>
     <Button className="mt-3" onClick={createJob} disabled={!printers[0]}>Отправить на первый принтер</Button>
     <div className="text-xs text-theme-secondary mt-3">Агент: <code>python printer_agent.py</code> слушает <code>ws/prints/{"{id}"}/{"{token}"}</code></div>
    </div>
   </div>
   <div className="mt-6 rounded-[28px] border border-theme bg-theme-panel p-6">
    <div className="font-bold text-theme mb-3">Принтеры ({printers.length})</div>
    {printers.length===0? <div className="text-theme-secondary text-sm">Нет принтеров</div> : <div className="space-y-2">{printers.map((p:any)=><div key={p.id} className="flex justify-between border border-theme rounded-xl px-4 py-3 text-sm"><span className="text-theme font-semibold">{p.name}</span><span className="text-theme-secondary">{p.connection_type} {p.ip_address||p.serial_path||''}:{p.port||''}</span></div>)}</div>}
   </div>
   <div className="mt-6 rounded-[28px] border border-theme bg-theme-panel p-6">
    <div className="font-bold text-theme mb-3">Pending jobs ({jobs.length})</div>
    {jobs.length===0? <div className="text-theme-secondary text-sm">Очередь пуста</div> : jobs.map((j:any)=><div key={j.id} className="border border-theme rounded-xl px-4 py-3 text-sm mb-2"><div className="text-theme font-mono text-xs">{j.text_preview?.slice(0,120)}</div><div className="text-theme-secondary text-xs">{j.job_type} — {j.status}</div></div>)}
   </div>
  </AppShell>
 );
}
