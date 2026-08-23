import { useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/app/Panel';
import { DataTable } from '@/components/app/DataTable';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ChefHat, Plus, Trash2 } from 'lucide-react';
export default function WorkshopsPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [rows, setRows] = useState([{ id: '1', name: 'Кухня', print: 'Да' }, { id: '2', name: 'Бар', print: 'Да' }]);
  const add = () => { const name = prompt('Название цеха'); if (!name) return; setRows([...rows, { id: Date.now().toString(), name, print: 'Да' }]); };
  return (
    <AppShell title="Цехи" subtitle="Кухня / Бар — печать бегунков" eyebrow="Меню" restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <Panel title="Цехи" eyebrow="Кухня" action={<Button size="sm" onClick={add}><Plus className="mr-1 h-4 w-4" />Добавить</Button>}>
        <DataTable rows={rows} emptyMessage="Нет цехов" columns={[
          { label: 'Название', key: 'name', render: (r: any) => <span className="flex items-center gap-2"><ChefHat className="h-4 w-4 text-white/30" />{r.name}</span> },
          { label: 'Печатать бегунки', key: 'print', render: (r: any) => r.print },
          { label: '', key: 'id', render: (r: any) => <Button variant="ghost" size="sm" onClick={() => setRows(rows.filter(x => x.id !== r.id))}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button> },
        ]} />
      </Panel>
    </AppShell>
  );
}
