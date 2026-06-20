import { useEffect, useState } from 'react';
import { Gift, Plus, Trash2, TrendingUp, Users, Wallet } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { formatMoney } from '@/lib/utils';
import { ownerAPI, LoyaltyTier } from '@/services/api';

export default function LoyaltyPage() {
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(true);
  const restaurantId = workspace.selectedRestaurantId;

  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', min_spend: 0, multiplier: 1, color: '#f97360' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError('');
    try {
      const res = await ownerAPI.getLoyaltyTiers(restaurantId);
      const data = res.data;
      setTiers(Array.isArray(data) ? data : data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Yuklab bo‘lmadi.' : 'Ошибка загрузки.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [restaurantId, locale]);

  const handleCreate = async () => {
    if (!restaurantId || !form.name) return;
    setSaving(true);
    setError('');
    try {
      await ownerAPI.createLoyaltyTier({ restaurant_id: restaurantId, ...form });
      setShowForm(false);
      setForm({ name: '', min_spend: 0, multiplier: 1, color: '#f97360' });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Yaratib bo‘lmadi.' : 'Ошибка создания.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tier: LoyaltyTier) => {
    if (!window.confirm(`${locale === 'uz' ? 'Daraja o‘chirilsinmi' : 'Удалить уровень'} ${tier.name}?`)) return;
    setError('');
    try {
      await ownerAPI.deleteLoyaltyTier(tier.id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'O‘chirib bo‘lmadi.' : 'Ошибка удаления.'));
    }
  };

  return (
    <AppShell
      title={locale === 'uz' ? 'Loyallik' : 'Лояльность'}
      subtitle={locale === 'uz' ? 'Darajalar va ballar tizimini boshqaring.' : 'Управляйте уровнями и баллами гостей.'}
      eyebrow={locale === 'uz' ? 'CRM' : 'CRM'}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Panel title="" eyebrow={locale === 'uz' ? 'Statistika' : 'Статистика'}>
            <div className="flex items-center gap-3 text-white/52">
              <Users className="h-4 w-4 text-[#8fd4ff]" />
              <span className="text-sm">{locale === 'uz' ? 'Faol darajalar' : 'Активных уровней'}</span>
            </div>
            <div className="mt-2 font-display text-2xl text-white">{tiers.filter(t => t.is_active).length}</div>
          </Panel>
          <Panel title="" eyebrow={locale === 'uz' ? 'Multiplikator' : 'Множитель'}>
            <div className="flex items-center gap-3 text-white/52">
              <TrendingUp className="h-4 w-4 text-[#a7f3d0]" />
              <span className="text-sm">{locale === 'uz' ? 'Maks. koeffitsient' : 'Макс. коэффициент'}</span>
            </div>
            <div className="mt-2 font-display text-2xl text-white">{Math.max(...tiers.filter(t => t.is_active).map(t => Number(t.multiplier)), 1)}x</div>
          </Panel>
          <Panel title="" eyebrow={locale === 'uz' ? 'Boshlang‘ich' : 'Стартовый'}>
            <div className="flex items-center gap-3 text-white/52">
              <Gift className="h-4 w-4 text-[#ffd28d]" />
              <span className="text-sm">{locale === 'uz' ? 'Min. chegara' : 'Мин. порог'}</span>
            </div>
            <div className="mt-2 font-display text-2xl text-white">{tiers.length > 0 ? formatMoney(tiers.reduce((a, b) => Math.min(a, Number(b.min_spend)), Infinity)) : '—'}</div>
          </Panel>
        </div>

        <Panel
          title={`${tiers.length}`}
          eyebrow={locale === 'uz' ? 'Darajalar' : 'Уровни'}
          description={locale === 'uz' ? 'Har bir daraja uchun minimal xarajat va ball multiplikatori.' : 'Для каждого уровня — минимальные траты и множитель баллов.'}
        >
          {showForm ? (
            <div className="mb-4 rounded-[24px] border border-white/10 bg-black/12 p-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder={locale === 'uz' ? 'Daraja nomi' : 'Название уровня'} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30" />
                <input type="number" value={form.min_spend} onChange={(e) => setForm(f => ({ ...f, min_spend: Number(e.target.value) }))} placeholder={locale === 'uz' ? 'Min. summa' : 'Мин. сумма'} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30" />
                <input type="number" step="0.1" value={form.multiplier} onChange={(e) => setForm(f => ({ ...f, multiplier: Number(e.target.value) }))} placeholder={locale === 'uz' ? 'Multiplikator' : 'Множитель'} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30" />
                <input type="color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} className="h-10 rounded-xl border border-white/10 bg-black/20 px-2" />
              </div>
              <div className="mt-3 flex gap-2">
                <Button onClick={handleCreate} disabled={saving || !form.name}>{saving ? (locale === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...') : (locale === 'uz' ? 'Yaratish' : 'Создать')}</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>{locale === 'uz' ? 'Bekor qilish' : 'Отмена'}</Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setShowForm(true)} className="mb-4">
              <Plus className="mr-2 h-4 w-4" /> {locale === 'uz' ? 'Daraja qo‘shish' : 'Добавить уровень'}
            </Button>
          )}

          <DataTable
            rows={tiers}
            emptyMessage={locale === 'uz' ? 'Hali darajalar yo‘q.' : 'Уровней пока нет.'}
            columns={[
              { label: '', key: 'color', render: (row) => <div className="h-5 w-5 rounded-full" style={{ backgroundColor: row.color }} /> },
              { label: locale === 'uz' ? 'Nomi' : 'Название', key: 'name', render: (row) => <div><span className="font-semibold text-white">{row.name}</span>{!row.is_active ? <span className="ml-2 text-xs text-white/40">({locale === 'uz' ? 'nofaol' : 'неактивен'})</span> : null}</div> },
              { label: locale === 'uz' ? 'Min. xarajat' : 'Мин. траты', key: 'min_spend', render: (row) => formatMoney(row.min_spend) },
              { label: locale === 'uz' ? 'Ball ×' : 'Баллы ×', key: 'multiplier', render: (row) => `${row.multiplier}x` },
              { label: locale === 'uz' ? 'Amal' : 'Действие', key: 'id', render: (row) => <Button variant="secondary" size="sm" onClick={() => handleDelete(row)}><Trash2 className="h-4 w-4" /></Button> },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
