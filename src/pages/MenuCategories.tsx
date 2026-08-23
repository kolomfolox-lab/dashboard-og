import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/app/Panel';
import { DataTable } from '@/components/app/DataTable';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { showToast } from '@/lib/toast';
import { Tag, Plus, Trash2, Pencil } from 'lucide-react';
export default function MenuCategoriesPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => { if (!workspace.selectedRestaurantId) return; try { const r = await ownerAPI.getMenuCategories(workspace.selectedRestaurantId); setRows(Array.isArray(r.data) ? r.data : (r.data?.results || [])); } catch {} };
  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);
  const add = async () => { const name = prompt('Название категории'); if (!name) return; try { await ownerAPI.createMenuCategory({ restaurant_id: workspace.selectedRestaurantId, name }); showToast('Создана', 'success'); await load(); } catch {} };
  const edit = async (r: any) => { const name = prompt('Новое название', r.name); if (!name) return; try { await ownerAPI.updateMenuCategory(r.id, { name }); await load(); } catch {} };
  const del = async (id: string) => { if (!confirm('Удалить?')) return; try { await ownerAPI.deleteMenuCategory(id); await load(); } catch {} };
  return (
    <AppShell title="Категории товаров и тех. карт" subtitle={`${rows.length} категорий`} eyebrow="Меню" restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <Panel title="Категории" eyebrow="Меню" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-4 w-4" />Добавить</Button>}>
        <DataTable rows={rows} emptyMessage="Нет категорий" columns={[
          { label: 'Название', key: 'name', render: (r: any) => <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-white/30" />{r.name}</span> },
          { label: 'Налог', key: 'tax', render: () => <span className="text-theme-muted">—</span> },
          { label: '', key: 'id', render: (r: any) => <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => edit(r)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => del(r.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button></div> },
        ]} />
      </Panel>
    </AppShell>
  );
}
