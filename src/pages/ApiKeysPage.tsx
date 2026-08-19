import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { api } from '@/services/http';

export default function ApiKeysPage(){
 const { selectedRestaurant } = useOwnerWorkspace();
 const [keys,setKeys]=useState<any[]>([]);
 const [name,setName]=useState(''); const [newKey,setNewKey]=useState('');
 const load=async()=>{
  if(!selectedRestaurant) return;
  const d=await api.get('/public-api/keys/',{ params:{ restaurant_id: selectedRestaurant.id }}).then(r=>r.data).catch(()=>({results:[]}));
  setKeys(Array.isArray(d)?d:(d.results||[]));
 };
 useEffect(()=>{ load(); },[selectedRestaurant]);
 const create=async()=>{
  if(!name || !selectedRestaurant) return;
  const r=await api.post('/public-api/keys/',{ name, restaurant: selectedRestaurant.id, permissions:{} }).then(x=>x.data).catch(()=>null);
  if(r){ setNewKey(r.key||''); setName(''); await load(); }
 };
 const del=async(id:string)=>{ await api.delete(`/public-api/keys/${id}/`); await load(); };
 return (
  <AppShell title="API ключи" subtitle="Public API — wl_* ключи, X-Api-Key, rate-limit 60/min" eyebrow="Integrations">
   <div className="rounded-[28px] border border-theme bg-theme-panel p-6 mb-6">
    <div className="font-bold text-theme mb-3">Создать ключ</div>
    <div className="flex gap-3">
     <div className="flex-1"><Label>Название</Label><InputGroup><InputGroupInput value={name} onChange={e=>setName(e.target.value)} placeholder="POS интеграция"/></InputGroup></div>
     <Button className="self-end" onClick={create} disabled={!name}>Создать</Button>
    </div>
    {newKey && <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-mono text-emerald-300 break-all">{newKey} <span className="text-theme-secondary">— скопируйте сейчас, больше не покажется</span></div>}
   </div>
   <div className="rounded-[28px] border border-theme bg-theme-panel p-6">
    <div className="font-bold text-theme mb-3">Ключи ({keys.length})</div>
    {keys.length===0? <div className="text-theme-secondary text-sm">Нет ключей</div> : keys.map((k:any)=><div key={k.id} className="flex items-center justify-between border border-theme rounded-xl px-4 py-3 mb-2">
     <div><div className="font-mono text-sm text-theme">{k.name}</div><div className="text-xs text-theme-secondary font-mono">{k.key?.slice(0,12)}•••• • expires: {k.expires_at||'never'} • {k.is_active?'active':'disabled'}</div></div>
     <Button variant="secondary" size="sm" onClick={()=>del(k.id)}>Удалить</Button>
    </div>)}
    <div className="text-xs text-theme-secondary mt-4">Эндпоинты: <code>/api/public-api/keys/</code>, <code>GET /api/public-api/menu/{"{slug}"}</code>, <code>GET /api/public-api/tables/{"{slug}"}</code> — заголовок <code>X-Api-Key: wl_...</code></div>
   </div>
  </AppShell>
 );
}
