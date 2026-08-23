import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { showToast } from '@/lib/toast';
import { Building2, Phone, Mail, Plus, Trash2, Package, ShoppingCart, Truck } from 'lucide-react';

export default function SuppliersPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const res = await ownerAPI.getSuppliers(workspace.selectedRestaurantId);
      setSuppliers(res.data.results || res.data || []);
    } catch { showToast('Ошибка загрузки поставщиков', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const create = async () => {
    if (!form.name.trim() || !workspace.selectedRestaurantId) return;
    setSaving(true);
    try {
      await ownerAPI.createSupplier({ restaurant: workspace.selectedRestaurantId, ...form });
      setForm({ name: '', contact_person: '', phone: '', email: '' });
      await load();
      showToast('Поставщик добавлен', 'success');
    } catch { showToast('Ошибка', 'error'); }
    finally { setSaving(false); }
  };
  const remove = async (id: string) => {
    if (!confirm('Удалить поставщика?')) return;
    try { await ownerAPI.deleteSupplier(id); await load(); showToast('Удален', 'success'); } catch {}
  };

  return (
    <AppShell title="Поставщики" subtitle="Закупки, продукты поставщиков и заказы — всё в одном месте" eyebrow="Закупки"
      restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card className="border-theme bg-[var(--panel-bg)] h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-theme"><Building2 className="h-5 w-5 text-[#8fd4ff]" />Новый поставщик</CardTitle>
            <CardDescription>Владелец сам добавляет любых поставщиков</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><Label className="text-xs uppercase tracking-widest text-theme-muted">Название *</Label><InputGroup><InputGroupInput value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ООО ФрешФуд" /></InputGroup></div>
            <div><Label className="text-xs uppercase tracking-widest text-theme-muted">Контакт</Label><InputGroup><InputGroupInput value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} placeholder="Алишер" /></InputGroup></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs uppercase tracking-widest text-theme-muted">Телефон</Label><InputGroup><InputGroupInput value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+99890..." /></InputGroup></div>
              <div><Label className="text-xs uppercase tracking-widest text-theme-muted">Email</Label><InputGroup><InputGroupInput value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="info@..." /></InputGroup></div>
            </div>
            <Button onClick={create} disabled={saving || !form.name.trim()} className="w-full"><Plus className="mr-2 h-4 w-4" />Добавить поставщика</Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-theme">Поставщики ({suppliers.length})</h3>
            <Button variant="ghost" size="sm" onClick={() => void load()}>Обновить</Button>
          </div>
          {loading ? <div className="text-theme-muted">Загрузка...</div> : suppliers.length === 0 ? (
            <Card className="border-dashed border-theme bg-transparent">
              <CardContent className="py-12 text-center">
                <Truck className="mx-auto h-12 w-12 text-white/20 mb-3" />
                <div className="text-theme">Пока нет поставщиков</div>
                <div className="text-sm text-theme-muted">Добавьте первого — и сразу сможете создавать заказы</div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {suppliers.map(s => (
                <Card key={s.id} className="border-theme bg-[var(--panel-bg)] hover:border-white/15 transition group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base text-theme truncate flex items-center gap-2"><Building2 className="h-4 w-4 text-[#8fd4ff] shrink-0" />{s.name}</CardTitle>
                        {s.contact_person && <CardDescription className="truncate">{s.contact_person}</CardDescription>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => remove(s.id)} className="opacity-0 group-hover:opacity-100 transition"><Trash2 className="h-4 w-4 text-red-400" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {s.phone && <div className="flex items-center gap-2 text-theme-secondary"><Phone className="h-3.5 w-3.5" />{s.phone}</div>}
                    {s.email && <div className="flex items-center gap-2 text-theme-secondary"><Mail className="h-3.5 w-3.5" />{s.email}</div>}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="secondary" className="flex-1"><Package className="mr-1 h-3.5 w-3.5" />Товары</Button>
                      <Button size="sm" variant="outline" className="flex-1"><ShoppingCart className="mr-1 h-3.5 w-3.5" />Заказ</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
