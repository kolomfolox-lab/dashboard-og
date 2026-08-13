import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { MetricCard } from '@/components/app/MetricCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { expenseAPI } from '@/services/api';
import { showToast } from '@/lib/toast';
import { Plus, Loader2, X, Trash2, TrendingDown } from 'lucide-react';

const CATEGORIES = [
  { value: 'products', label: 'Продукты' },
  { value: 'rent', label: 'Аренда' },
  { value: 'salary', label: 'Зарплата' },
  { value: 'transport', label: 'Транспорт' },
  { value: 'utilities', label: 'Коммунальные' },
  { value: 'marketing', label: 'Маркетинг' },
  { value: 'equipment', label: 'Оборудование' },
  { value: 'other', label: 'Другое' },
];

export default function ExpensesPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [total, setTotal] = useState('0');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'other', amount: '', notes: '', date: '' });

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const res = await expenseAPI.list({ restaurant_id: workspace.selectedRestaurantId });
      setExpenses(res.data.results || res.data || []);
      setTotal(res.data.total || '0');
    } catch { setExpenses([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const handleCreate = async () => {
    if (!form.amount || !form.category) return;
    try {
      await expenseAPI.create({
        restaurant_id: workspace.selectedRestaurantId,
        category: form.category,
        amount: Number(form.amount),
        notes: form.notes,
        date: form.date || undefined,
      });
      showToast('Expense added', 'success');
      setShowForm(false);
      setForm({ category: 'other', amount: '', notes: '', date: '' });
      await load();
    } catch { showToast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await expenseAPI.delete(id); showToast('Deleted', 'success'); await load(); } catch { showToast('Failed', 'error'); }
  };

  return (
    <AppShell
      title={t('nav_expenses', 'Расходы')}
      subtitle={t('expenses_subtitle', 'Ежедневные расходы ресторана')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.selectRestaurant}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MetricCard title="Всего расходов" value={`${Number(total).toLocaleString()} сум`} icon={TrendingDown} />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)}><Plus className="mr-1 h-4 w-4" /> Добавить расход</Button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white">Новый расход</h3>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-white/40" /></button>
            </div>
            <select
              className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white"
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input type="number" placeholder="Сумма (сум)" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            <input type="date" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white"
              value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            <input placeholder="Заметка" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            <Button onClick={handleCreate}>Сохранить</Button>
          </div>
        )}

        <Panel title="Список расходов">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
          ) : expenses.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/40">Расходов пока нет</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-white/10 text-xs uppercase text-white/40">
                  <th className="pb-3 pr-4">Дата</th><th className="pb-3 pr-4">Категория</th><th className="pb-3 pr-4 text-right">Сумма</th><th className="pb-3 pr-4">Заметка</th><th className="pb-3"></th>
                </tr></thead>
                <tbody>
                  {expenses.map((e: any) => (
                    <tr key={e.id} className="border-b border-white/5">
                      <td className="py-2 pr-4">{e.date || '—'}</td>
                      <td className="py-2 pr-4">{CATEGORIES.find(c => c.value === e.category)?.label || e.category}</td>
                      <td className="py-2 pr-4 text-right font-semibold">{Number(e.amount || 0).toLocaleString()} сум</td>
                      <td className="py-2 pr-4 text-white/50">{e.notes || '—'}</td>
                      <td className="py-2">
                        <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
