import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/app/Panel';
import { DataTable } from '@/components/app/DataTable';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { showToast } from '@/lib/toast';
import { Beaker, Plus, Trash2 } from 'lucide-react';
export default function IngredientsPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => { if (!workspace.selectedRestaurantId) return; try { const r = await ownerAPI.getInventory(workspace.selectedRestaurantId); const data = r.data?.ingredients || r.data || []; setRows(Array.isArray(data) ? data : (data.results || [])); } catch {} };
  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);
  const add = async () => { const name = prompt('Название ингредиента'); if (!name) return; try { await ownerAPI.createIngredient({ restaurant: workspace.selectedRestaurantId, name, unit: 'кг' }); showToast('Создан', 'success'); await load(); } catch { showToast('Ошибка', 'error'); } };
  const del = async (id: string) => { if (!confirm('Удалить?')) return; try { await ownerAPI.deleteIngredient(id); await load(); } catch {} };
  return (
    <AppShell title="Ингредиенты" subtitle={`${rows.length} позиций`} eyebrow="Меню" restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <Panel title="Ингредиенты" eyebrow="Склад" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-4 w-4" />Добавить</Button>}>
        <DataTable rows={rows} emptyMessage="Нет ингредиентов" columns={[
          { label: 'Название', key: 'name', render: (r: any) => <span className="flex items-center gap-2"><Beaker className="h-4 w-4 text-white/30" />{r.name}</span> },
          { label: 'Ед.', key: 'unit', render: (r: any) => r.unit || 'шт.' },
          { label: 'Категория', key: 'category', render: (r: any) => r.category || '—' },
          { label: '', key: 'id', render: (r: any) => <Button variant="ghost" size="sm" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button> },
        ]} />
      </Panel>
    </AppShell>
  );
}
