import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/app/Panel';
import { DataTable } from '@/components/app/DataTable';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { showToast } from '@/lib/toast';
import { Layers, Plus, Trash2, Pencil } from 'lucide-react';
export default function SemisPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => { if (!workspace.selectedRestaurantId) return; try { const r = await ownerAPI.getTechCards(workspace.selectedRestaurantId); const data = Array.isArray(r.data) ? r.data : (r.data?.results || []); setRows(data.filter((t: any) => t.is_semi || t.type === 'SEMI')); } catch {} };
  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);
  const add = async () => { const name = prompt('Название полуфабриката'); if (!name) return; try { await ownerAPI.createTechCard({ restaurant_id: workspace.selectedRestaurantId, dish_name: name, is_semi: true, price: 0 }); showToast('Создан', 'success'); await load(); } catch { showToast('Ошибка', 'error'); } };
  const del = async (id: string) => { if (!confirm('Удалить?')) return; try { await ownerAPI.deleteTechCard(id); await load(); } catch {} };
  return (
    <AppShell title="Полуфабрикаты" subtitle="Заготовки — тесто, соусы, бульоны. Добавляйте в тех. карты" eyebrow="Меню" restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <Panel title="Полуфабрикаты" eyebrow="Заготовки" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-4 w-4" />Добавить</Button>}>
        <DataTable rows={rows} emptyMessage="Нет полуфабрикатов — добавьте первый" columns={[
          { label: 'Название', key: 'dish_name', render: (r: any) => <span className="flex items-center gap-2"><Layers className="h-4 w-4 text-white/40" />{r.dish_name || r.name}</span> },
          { label: 'Выход', key: 'yield', render: (r: any) => r.yield || '—' },
          { label: 'Себестоимость', key: 'total_cost', render: (r: any) => r.total_cost ? `${Number(r.total_cost).toLocaleString()} ₴` : '—' },
          { label: '', key: 'id', render: (r: any) => <div className="flex gap-1"><Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button></div> },
        ]} />
      </Panel>
    </AppShell>
  );
}
