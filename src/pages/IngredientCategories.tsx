import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/app/Panel';
import { DataTable } from '@/components/app/DataTable';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { Tag, Plus, Trash2, Pencil } from 'lucide-react';
export default function IngredientCategoriesPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [rows, setRows] = useState<any[]>([]);
  const load = async () => { if (!workspace.selectedRestaurantId) return; try { const r = await ownerAPI.getInventory(workspace.selectedRestaurantId); const cats = new Set((r.data?.ingredients || []).map((i: any) => i.category).filter(Boolean)); setRows(Array.from(cats).map(c => ({ id: c, name: c }))); } catch {} };
  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);
  const add = async () => { const name = prompt('Название категории ингредиентов'); if (!name) return; try { await ownerAPI.createIngredient({ restaurant: workspace.selectedRestaurantId, name: 'Тест', category: name, unit: 'кг' }); await load(); } catch {} };
  return (
    <AppShell title="Категории ингредиентов" subtitle={`${rows.length} категорий`} eyebrow="Меню" restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <Panel title="Категории ингредиентов" eyebrow="Склад" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-4 w-4" />Добавить</Button>}>
        <DataTable rows={rows} emptyMessage="Нет категорий" columns={[
          { label: 'Категория', key: 'name', render: (r: any) => <span className="flex items-center gap-2"><Tag className="h-4 w-4 text-white/30" />{r.name}</span> },
          { label: '', key: 'id', render: () => <div className="flex gap-1"><Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm"><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button></div> },
        ]} />
      </Panel>
    </AppShell>
  );
}
