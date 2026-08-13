import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import api from '@/services/api';
import { showToast } from '@/lib/toast';
import { CheckCircle, Plus, Loader2, X, Trash2 } from 'lucide-react';

export default function ChecklistsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', itemsText: '' });
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const res = await api.get('/checklists/templates/', { params: { restaurant_id: workspace.selectedRestaurantId } });
      setItems(res.data?.results || res.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      await api.post('/checklists/templates/', {
        title: form.title,
        restaurant: workspace.selectedRestaurantId,
        tasks: form.itemsText.split('\n').filter(Boolean).map((text: string, i: number) => ({ text, order: i })),
      });
      showToast('Checklist created', 'success');
      setShowForm(false);
      setForm({ title: '', itemsText: '' });
      await load();
    } catch { showToast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/checklists/templates/${id}/`);
      showToast('Deleted', 'success');
      await load();
    } catch { showToast('Failed', 'error'); }
  };

  return (
    <AppShell
      title={t('nav_checklists', 'Checklists')}
      subtitle={t('checklists_subtitle', 'Operational checklists for staff')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.selectRestaurant}
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 rounded-xl bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105">
            <Plus className="h-4 w-4" /> New Checklist
          </button>
        </div>

        {showForm && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-white">New Checklist Template</h3>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-white/40" /></button>
            </div>
            <input
              placeholder="Title"
              className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
            <textarea
              placeholder="Items (one per line)"
              className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              rows={6}
              value={form.itemsText}
              onChange={e => setForm(p => ({ ...p, itemsText: e.target.value }))}
            />
            <button onClick={handleCreate} className="rounded-xl bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white">Save</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-sm text-white/40">No checklists yet</div>
        ) : (
          items.map((item: any) => (
            <Panel key={item.id} title={item.title || item.name || item.id}>
              {item.tasks && (
                <div className="space-y-2 mt-2">
                  {item.tasks.map((task: any, i: number) => (
                    <div key={task.id || i} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-white/20" />
                      <span>{task.text || task.name || `Task ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 flex justify-end">
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Panel>
          ))
        )}
      </div>
    </AppShell>
  );
}
