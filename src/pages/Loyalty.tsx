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
      setError(err?.response?.data?.error || t('loyalty_load_error', 'Ошибка загрузки.'));
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
      setError(err?.response?.data?.error || t('loyalty_create_error', 'Ошибка создания.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tier: LoyaltyTier) => {
    if (!window.confirm(`${t('loyalty_delete_confirm', 'Удалить уровень')} ${tier.name}?`)) return;
    setError('');
    try {
      await ownerAPI.deleteLoyaltyTier(tier.id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || t('loyalty_delete_error', 'Ошибка удаления.'));
    }
  };

  return (
    <AppShell
      title={t('loyalty_title', 'Лояльность')}
      subtitle={t('loyalty_subtitle', 'Управляйте уровнями и баллами гостей.')}
      eyebrow="CRM"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <Panel title="" eyebrow={t('loyalty_statistics', 'Статистика')}>
            <div className="flex items-center gap-3 text-white/52">
              <Users className="h-4 w-4 text-[#8fd4ff]" />
              <span className="text-sm">{t('loyalty_active_tiers', 'Активных уровней')}</span>
            </div>
            <div className="mt-2 font-display text-2xl text-white">{tiers.filter(t => t.is_active).length}</div>
          </Panel>
          <Panel title="" eyebrow={t('loyalty_multiplier', 'Множитель')}>
            <div className="flex items-center gap-3 text-white/52">
              <TrendingUp className="h-4 w-4 text-[#a7f3d0]" />
              <span className="text-sm">{t('loyalty_max_coefficient', 'Макс. коэффициент')}</span>
            </div>
            <div className="mt-2 font-display text-2xl text-white">{Math.max(...tiers.filter(t => t.is_active).map(t => Number(t.multiplier)), 1)}x</div>
          </Panel>
          <Panel title="" eyebrow={t('loyalty_starting', 'Стартовый')}>
            <div className="flex items-center gap-3 text-white/52">
              <Gift className="h-4 w-4 text-[#ffd28d]" />
              <span className="text-sm">{t('loyalty_min_threshold', 'Мин. порог')}</span>
            </div>
            <div className="mt-2 font-display text-2xl text-white">{tiers.length > 0 ? formatMoney(tiers.reduce((a, b) => Math.min(a, Number(b.min_spend)), Infinity)) : '—'}</div>
          </Panel>
        </div>

        <Panel
          title={`${tiers.length}`}
          eyebrow={t('loyalty_tiers', 'Уровни')}
          description={t('loyalty_tiers_desc', 'Для каждого уровня — минимальные траты и множитель баллов.')}
        >
          {showForm ? (
            <div className="mb-4 rounded-[24px] border border-white/10 bg-black/12 p-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder={t('loyalty_tier_name', 'Название уровня')} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30" />
                <input type="number" value={form.min_spend} onChange={(e) => setForm(f => ({ ...f, min_spend: Number(e.target.value) }))} placeholder={t('loyalty_min_amount', 'Мин. сумма')} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30" />
                <input type="number" step="0.1" value={form.multiplier} onChange={(e) => setForm(f => ({ ...f, multiplier: Number(e.target.value) }))} placeholder={t('loyalty_multiplier', 'Множитель')} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30" />
                <input type="color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} className="h-10 rounded-xl border border-white/10 bg-black/20 px-2" />
              </div>
              <div className="mt-3 flex gap-2">
                <Button onClick={handleCreate} disabled={saving || !form.name}>{saving ? t('loyalty_saving', 'Сохранение...') : t('loyalty_create', 'Создать')}</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>{t('loyalty_cancel', 'Отмена')}</Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setShowForm(true)} className="mb-4">
              <Plus className="mr-2 h-4 w-4" /> {t('loyalty_add_tier', 'Добавить уровень')}
            </Button>
          )}

          <DataTable
            rows={tiers}
            emptyMessage={t('loyalty_no_tiers', 'Уровней пока нет.')}
            columns={[
              { label: '', key: 'color', render: (row) => <div className="h-5 w-5 rounded-full" style={{ backgroundColor: row.color }} /> },
              { label: t('loyalty_col_name', 'Название'), key: 'name', render: (row) => <div><span className="font-semibold text-white">{row.name}</span>{!row.is_active ? <span className="ml-2 text-xs text-white/40">({t('loyalty_inactive', 'неактивен')})</span> : null}</div> },
              { label: t('loyalty_col_min_spend', 'Мин. траты'), key: 'min_spend', render: (row) => formatMoney(row.min_spend) },
              { label: t('loyalty_col_multiplier', 'Баллы ×'), key: 'multiplier', render: (row) => `${row.multiplier}x` },
              { label: t('loyalty_col_action', 'Действие'), key: 'id', render: (row) => <Button variant="secondary" size="sm" onClick={() => handleDelete(row)}><Trash2 className="h-4 w-4" /></Button> },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
