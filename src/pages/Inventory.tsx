import { useEffect, useMemo, useState } from 'react';
import { Boxes, PackagePlus, RefreshCcw, Scale, Trash2, TriangleAlert } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, type OwnerInventoryResponse } from '@/services/api';

const units = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'l' },
  { value: 'ml', label: 'ml' },
  { value: 'pc', label: 'pc' },
];

const writeOffReasons = [
  { value: 'spoilage', label: 'Spoilage' },
  { value: 'mistake', label: 'Mistake' },
  { value: 'staff_meal', label: 'Staff meal' },
  { value: 'inventory_correction', label: 'Correction' },
  { value: 'other', label: 'Other' },
];

const emptyIngredient = { name: '', unit: 'kg', minimum_quantity: '0' };
const emptyMovement = { ingredient_id: '', quantity: '', unit_price: '', note: '', reason: 'other' };

export default function InventoryPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [inventory, setInventory] = useState<OwnerInventoryResponse | null>(null);
  const [ingredientForm, setIngredientForm] = useState(emptyIngredient);
  const [supplyForm, setSupplyForm] = useState(emptyMovement);
  const [writeOffForm, setWriteOffForm] = useState(emptyMovement);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const ingredients = inventory?.ingredients || [];
  const selectedSupplyIngredient = useMemo(() => ingredients.find((item) => item.id === supplyForm.ingredient_id), [ingredients, supplyForm.ingredient_id]);
  const selectedWriteOffIngredient = useMemo(() => ingredients.find((item) => item.id === writeOffForm.ingredient_id), [ingredients, writeOffForm.ingredient_id]);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    setError('');
    try {
      const response = await ownerAPI.getInventory(workspace.selectedRestaurantId);
      setInventory(response.data);
      const firstIngredientId = response.data.ingredients[0]?.id || '';
      setSupplyForm((current) => ({ ...current, ingredient_id: current.ingredient_id || firstIngredientId }));
      setWriteOffForm((current) => ({ ...current, ingredient_id: current.ingredient_id || firstIngredientId }));
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Omborni yuklab bolmadi.' : 'Не удалось загрузить склад.'));
      setInventory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [workspace.selectedRestaurantId, locale]);

  const saveIngredient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!workspace.selectedRestaurantId || !ingredientForm.name.trim()) return;
    setSaving(true);
    setError('');
    setInfo('');
    try {
      await ownerAPI.createIngredient({
        restaurant_id: workspace.selectedRestaurantId,
        name: ingredientForm.name.trim(),
        unit: ingredientForm.unit,
        minimum_quantity: ingredientForm.minimum_quantity || '0',
      });
      setIngredientForm(emptyIngredient);
      setInfo(locale === 'uz' ? 'Ingredient saqlandi.' : 'Ингредиент сохранен.');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Ingredientni saqlab bolmadi.' : 'Не удалось сохранить ингредиент.'));
    } finally {
      setSaving(false);
    }
  };

  const saveSupply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!workspace.selectedRestaurantId || !supplyForm.ingredient_id || !supplyForm.quantity) return;
    setSaving(true);
    setError('');
    setInfo('');
    try {
      await ownerAPI.addSupply({
        restaurant_id: workspace.selectedRestaurantId,
        ingredient_id: supplyForm.ingredient_id,
        quantity: supplyForm.quantity,
        unit_price: supplyForm.unit_price || '0',
        note: supplyForm.note,
      });
      setSupplyForm((current) => ({ ...emptyMovement, ingredient_id: current.ingredient_id }));
      setInfo(locale === 'uz' ? 'Kirim qoshildi.' : 'Приход добавлен.');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Kirimni saqlab bolmadi.' : 'Не удалось добавить приход.'));
    } finally {
      setSaving(false);
    }
  };

  const saveWriteOff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!workspace.selectedRestaurantId || !writeOffForm.ingredient_id || !writeOffForm.quantity) return;
    setSaving(true);
    setError('');
    setInfo('');
    try {
      await ownerAPI.writeOffStock({
        restaurant_id: workspace.selectedRestaurantId,
        ingredient_id: writeOffForm.ingredient_id,
        quantity: writeOffForm.quantity,
        reason: writeOffForm.reason,
        note: writeOffForm.note,
      });
      setWriteOffForm((current) => ({ ...emptyMovement, ingredient_id: current.ingredient_id, reason: 'other' }));
      setInfo(locale === 'uz' ? 'Spisanie saqlandi.' : 'Списание сохранено.');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Spisanieni saqlab bolmadi.' : 'Не удалось списать остаток.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title={t('inventory_title', 'Инвентаризация')}
      subtitle={t('inventory_subtitle', 'Контроль ингредиентов, приходов, списаний и минимальных остатков по ресторану.')}
      eyebrow={t('inventory_eyebrow', 'Stock control')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title={t('inventory_metric_ingredients', 'Ингредиенты')} value={inventory?.ingredients.length || 0} note={workspace.selectedRestaurant?.name || t('shell_workspace', 'Workspace')} icon={Boxes} tone="cyan" />
          <MetricCard title={t('inventory_metric_low', 'Низкий остаток')} value={inventory?.low_stock_count || 0} note={t('inventory_metric_low_note', 'Нужно проверить закупку')} icon={TriangleAlert} tone="sand" />
          <MetricCard title={t('inventory_metric_empty', 'Пустые позиции')} value={inventory?.empty_stock_count || 0} note={t('inventory_metric_empty_note', 'Стоп-лист будет опираться на это')} icon={Scale} tone="coral" />
        </div>

        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
        {info ? <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{info}</div> : null}

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel
            title={t('inventory_stock_title', 'Остатки')}
            eyebrow={t('inventory_stock_eyebrow', 'Live stock')}
            description={t('inventory_stock_description', 'Здесь видно, сколько сейчас есть каждого ингредиента и где остаток уже ниже минимума.')}
            action={<Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4" />{t('refresh', 'Обновить')}</Button>}
          >
            <DataTable
              rows={inventory?.stock || []}
              emptyMessage={loading ? t('loading', 'Загрузка...') : t('inventory_empty_stock', 'Пока нет остатков. Создай ингредиент и добавь приход.')}
              columns={[
                { label: t('inventory_col_ingredient', 'Ингредиент'), key: 'name', render: (row) => <div className="font-semibold text-white">{row.name}</div> },
                { label: t('inventory_col_quantity', 'Остаток'), key: 'quantity', render: (row) => <span className={row.is_low ? 'text-[#ffd28d]' : 'text-white'}>{row.quantity} {row.unit}</span> },
                { label: t('inventory_col_minimum', 'Минимум'), key: 'minimum_quantity', render: (row) => `${row.minimum_quantity} ${row.unit}` },
                { label: t('inventory_col_status', 'Статус'), key: 'is_low', render: (row) => row.is_empty ? t('inventory_status_empty', 'Пусто') : row.is_low ? t('inventory_status_low', 'Низко') : t('inventory_status_ok', 'Ок') },
              ]}
            />
          </Panel>

          <Panel title={t('inventory_add_title', 'Добавить ингредиент')} eyebrow={t('inventory_add_eyebrow', 'Catalog')} description={t('inventory_add_description', 'Создай позицию склада: мясо, картофель, лимонад, упаковка и так далее.')}>
            <form onSubmit={saveIngredient} className="space-y-3">
              <InlineField label={t('inventory_field_name', 'Название')} value={ingredientForm.name} onChange={(value) => setIngredientForm((current) => ({ ...current, name: value }))} placeholder="Tomato" />
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField label={t('inventory_field_unit', 'Ед. изм.')} value={ingredientForm.unit} onChange={(value) => setIngredientForm((current) => ({ ...current, unit: value }))} options={units} />
                <InlineField label={t('inventory_field_minimum', 'Минимум')} value={ingredientForm.minimum_quantity} onChange={(value) => setIngredientForm((current) => ({ ...current, minimum_quantity: value }))} placeholder="0" />
              </div>
              <Button type="submit" disabled={saving || !workspace.selectedRestaurantId}><PackagePlus className="mr-2 h-4 w-4" />{t('inventory_save_ingredient', 'Сохранить ингредиент')}</Button>
            </form>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title={t('inventory_supply_title', 'Приход товара')} eyebrow={t('inventory_supply_eyebrow', 'Supply')} description={t('inventory_supply_description', 'Когда продукты привезли, добавь количество и себестоимость за единицу.')}>
            <form onSubmit={saveSupply} className="space-y-3">
              <SelectField label={t('inventory_field_ingredient', 'Ингредиент')} value={supplyForm.ingredient_id} onChange={(value) => setSupplyForm((current) => ({ ...current, ingredient_id: value }))} options={ingredients.map((item) => ({ value: item.id, label: `${item.name} (${item.unit})` }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <InlineField label={`${t('inventory_field_quantity', 'Количество')} ${selectedSupplyIngredient ? `(${selectedSupplyIngredient.unit})` : ''}`} value={supplyForm.quantity} onChange={(value) => setSupplyForm((current) => ({ ...current, quantity: value }))} placeholder="10" />
                <InlineField label={t('inventory_field_unit_price', 'Цена за ед.')} value={supplyForm.unit_price} onChange={(value) => setSupplyForm((current) => ({ ...current, unit_price: value }))} placeholder="0" />
              </div>
              <InlineField label={t('inventory_field_note', 'Заметка')} value={supplyForm.note} onChange={(value) => setSupplyForm((current) => ({ ...current, note: value }))} placeholder="Поставка утром" />
              <Button type="submit" disabled={saving || !supplyForm.ingredient_id}>{t('inventory_save_supply', 'Добавить приход')}</Button>
            </form>
          </Panel>

          <Panel title={t('inventory_writeoff_title', 'Списание')} eyebrow={t('inventory_writeoff_eyebrow', 'Write-off')} description={t('inventory_writeoff_description', 'Порча, ошибка, staff meal или ручная корректировка фиксируются в журнале.')}>
            <form onSubmit={saveWriteOff} className="space-y-3">
              <SelectField label={t('inventory_field_ingredient', 'Ингредиент')} value={writeOffForm.ingredient_id} onChange={(value) => setWriteOffForm((current) => ({ ...current, ingredient_id: value }))} options={ingredients.map((item) => ({ value: item.id, label: `${item.name} (${item.unit})` }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <InlineField label={`${t('inventory_field_quantity', 'Количество')} ${selectedWriteOffIngredient ? `(${selectedWriteOffIngredient.unit})` : ''}`} value={writeOffForm.quantity} onChange={(value) => setWriteOffForm((current) => ({ ...current, quantity: value }))} placeholder="1" />
                <SelectField label={t('inventory_field_reason', 'Причина')} value={writeOffForm.reason} onChange={(value) => setWriteOffForm((current) => ({ ...current, reason: value }))} options={writeOffReasons} />
              </div>
              <InlineField label={t('inventory_field_note', 'Заметка')} value={writeOffForm.note} onChange={(value) => setWriteOffForm((current) => ({ ...current, note: value }))} placeholder="Списание кухни" />
              <Button type="submit" variant="destructive" disabled={saving || !writeOffForm.ingredient_id}><Trash2 className="mr-2 h-4 w-4" />{t('inventory_save_writeoff', 'Списать')}</Button>
            </form>
          </Panel>
        </div>

        <Panel title={t('inventory_movements_title', 'Журнал движений')} eyebrow={t('inventory_movements_eyebrow', 'Audit')} description={t('inventory_movements_description', 'Последние приходы, списания и автоматические списания по закрытым заказам.')}>
          <DataTable
            rows={inventory?.movements || []}
            emptyMessage={loading ? t('loading', 'Загрузка...') : t('inventory_empty_movements', 'Движений склада пока нет.')}
            columns={[
              { label: t('inventory_col_time', 'Время'), key: 'created_at_display' },
              { label: t('inventory_col_ingredient', 'Ингредиент'), key: 'ingredient' },
              { label: t('inventory_col_type', 'Тип'), key: 'movement_type' },
              { label: t('inventory_col_delta', 'Изменение'), key: 'delta', render: (row) => `${row.delta} ${row.unit}` },
              { label: t('inventory_col_after', 'После'), key: 'after_quantity', render: (row) => `${row.after_quantity} ${row.unit}` },
              { label: t('inventory_col_user', 'Кто'), key: 'created_by', render: (row) => row.created_by || 'System' },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}

function InlineField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block rounded-[24px] border border-white/8 bg-black/12 p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</div>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f97360]" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block rounded-[24px] border border-white/8 bg-black/12 p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</div>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]">
        <option value="" className="bg-[#09131e]">-</option>
        {options.map((option) => <option key={option.value} value={option.value} className="bg-[#09131e]">{option.label}</option>)}
      </select>
    </label>
  );
}
