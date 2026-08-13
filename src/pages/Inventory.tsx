import { useEffect, useMemo, useState } from 'react';
import { Boxes, CalendarPlus, Minus, PackagePlus, Plus, RefreshCcw, Scale, Search, Trash2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  { value: 'spoilage', label: 'Порча' },
  { value: 'mistake', label: 'Ошибка' },
  { value: 'staff_meal', label: 'Staff meal' },
  { value: 'inventory_correction', label: 'Корректировка' },
  { value: 'other', label: 'Другое' },
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
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

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
      setError(err?.response?.data?.error || t('inventory_error_load', 'Не удалось загрузить склад.'));
      setInventory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [workspace.selectedRestaurantId, locale]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        document.getElementById('inventory-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const saveIngredient = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!workspace.selectedRestaurantId || !ingredientForm.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await ownerAPI.createIngredient({
        restaurant_id: workspace.selectedRestaurantId,
        name: ingredientForm.name.trim(),
        unit: ingredientForm.unit,
        minimum_quantity: ingredientForm.minimum_quantity || '0',
      });
      setIngredientForm(emptyIngredient);
      toast.success(t('inventory_saved', 'Ингредиент сохранен.'));
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || t('inventory_save_error', 'Не удалось сохранить ингредиент.'));
      toast.error(t('inventory_save_error', 'Не удалось сохранить ингредиент.'));
    } finally {
      setSaving(false);
    }
  };

  const saveSupply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!workspace.selectedRestaurantId || !supplyForm.ingredient_id || !supplyForm.quantity) return;
    setSaving(true);
    setError('');
    try {
      await ownerAPI.addSupply({
        restaurant_id: workspace.selectedRestaurantId,
        ingredient_id: supplyForm.ingredient_id,
        quantity: supplyForm.quantity,
        unit_price: supplyForm.unit_price || '0',
        note: supplyForm.note,
      });
      setSupplyForm((current) => ({ ...emptyMovement, ingredient_id: current.ingredient_id }));
      toast.success(t('inventory_supply_added', 'Приход добавлен.'));
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || t('inventory_supply_error', 'Не удалось добавить приход.'));
      toast.error(t('inventory_supply_error', 'Не удалось добавить приход.'));
    } finally {
      setSaving(false);
    }
  };

  const saveWriteOff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!workspace.selectedRestaurantId || !writeOffForm.ingredient_id || !writeOffForm.quantity) return;
    setSaving(true);
    setError('');
    try {
      await ownerAPI.writeOffStock({
        restaurant_id: workspace.selectedRestaurantId,
        ingredient_id: writeOffForm.ingredient_id,
        quantity: writeOffForm.quantity,
        reason: writeOffForm.reason,
        note: writeOffForm.note,
      });
      setWriteOffForm((current) => ({ ...emptyMovement, ingredient_id: current.ingredient_id, reason: 'other' }));
      toast.success(t('inventory_writeoff_saved', 'Списание сохранено.'));
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || t('inventory_writeoff_error', 'Не удалось списать остаток.'));
      toast.error(t('inventory_writeoff_error', 'Не удалось списать остаток.'));
    } finally {
      setSaving(false);
    }
  };

  const filteredStock = useMemo(() => {
    const rows = inventory?.stock || [];
    if (!search.trim()) return rows;
    return rows.filter((row: any) => String(row.name || '').toLowerCase().includes(search.trim().toLowerCase()));
  }, [inventory, search]);

  const metricCards = [
    { title: t('inventory_metric_ingredients', 'Ингредиенты'), value: inventory?.ingredients.length || 0, note: workspace.selectedRestaurant?.name || t('shell_workspace', 'Workspace'), icon: Boxes, tone: 'text-[#8fd4ff] bg-[#8fd4ff]/12' },
    { title: t('inventory_metric_low', 'Низкий остаток'), value: inventory?.low_stock_count || 0, note: t('inventory_metric_low_note', 'Нужно проверить закупку'), icon: TriangleAlert, tone: 'text-[#ffd28d] bg-[#ffd28d]/12' },
    { title: t('inventory_metric_empty', 'Пустые позиции'), value: inventory?.empty_stock_count || 0, note: t('inventory_metric_empty_note', 'Стоп-лист будет опираться на это'), icon: Scale, tone: 'text-[#f97360] bg-[#f97360]/12' },
  ];

  return (
    <AppShell
      title={t('inventory_title', 'Склад')}
      subtitle={t('inventory_subtitle', 'Контроль ингредиентов, приходов, списаний и минимальных остатков по ресторану.')}
      eyebrow={t('inventory_eyebrow', 'Stock control')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="border-theme bg-[var(--panel-bg)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-theme-secondary">{card.title}</CardTitle>
                    <div className={`grid h-10 w-10 place-items-center rounded-2xl ${card.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <CardDescription className="text-theme-muted">{card.note}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-16 bg-white/8" /> : <div className="font-display text-3xl font-black text-theme">{card.value}</div>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg text-theme">{t('inventory_stock_title', 'Остатки')}</CardTitle>
                  <CardDescription>{t('inventory_stock_description', 'Здесь видно, сколько сейчас есть каждого ингредиента и где остаток уже ниже минимума.')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-56">
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Search className="h-4 w-4 text-theme-muted" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="inventory-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('inventory_search', 'Поиск по складу')}
                        className="rounded-xl py-2 pl-9"
                      />
                      <InputGroupAddon align="inline-end">
                        <Kbd className="border-theme bg-white/5 text-theme-muted">/</Kbd>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => void load()} disabled={loading} aria-label={t('refresh', 'Обновить')}>
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('refresh', 'Обновить')}</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-theme">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('inventory_col_ingredient', 'Ингредиент')}</TableHead>
                      <TableHead>{t('inventory_col_quantity', 'Остаток')}</TableHead>
                      <TableHead>{t('inventory_col_minimum', 'Минимум')}</TableHead>
                      <TableHead>{t('inventory_col_status', 'Статус')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={4}><Skeleton className="h-5 w-full bg-white/6" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredStock.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-theme-muted">
                          {search ? t('inventory_no_search', 'Ничего не найдено по запросу.') : t('inventory_empty_stock', 'Пока нет остатков. Создай ингредиент и добавь приход.')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStock.map((row: any) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-semibold text-theme">{row.name}</TableCell>
                          <TableCell className={row.is_low ? 'font-semibold text-[#ffd28d]' : 'text-theme'}>
                            {row.quantity} {row.unit}
                          </TableCell>
                          <TableCell className="text-theme-secondary">{row.minimum_quantity} {row.unit}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${
                              row.is_empty ? 'bg-[#f97360]/15 text-[#f97360]' : row.is_low ? 'bg-[#ffd28d]/15 text-[#ffd28d]' : 'bg-emerald-500/12 text-emerald-400'
                            }`}>
                              {row.is_empty ? t('inventory_status_empty', 'Пусто') : row.is_low ? t('inventory_status_low', 'Низко') : t('inventory_status_ok', 'Ок')}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <CardTitle className="text-lg text-theme">{t('inventory_add_title', 'Добавить ингредиент')}</CardTitle>
              <CardDescription>{t('inventory_add_description', 'Создай позицию склада: мясо, картофель, лимонад, упаковка и так далее.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveIngredient} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ing-name" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('inventory_field_name', 'Название')}</Label>
                  <InputGroup>
                    <InputGroupAddon align="inline-start"><PackagePlus className="h-4 w-4 text-theme-muted" /></InputGroupAddon>
                    <InputGroupInput id="ing-name" value={ingredientForm.name} onChange={(e) => setIngredientForm((current) => ({ ...current, name: e.target.value }))} placeholder="Tomato" className="pl-9" />
                  </InputGroup>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ing-unit" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('inventory_field_unit', 'Ед. изм.')}</Label>
                    <select id="ing-unit" value={ingredientForm.unit} onChange={(e) => setIngredientForm((current) => ({ ...current, unit: e.target.value }))} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
                      {units.map((unit) => <option key={unit.value} value={unit.value} className="bg-[#09131e]">{unit.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ing-min" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('inventory_field_minimum', 'Минимум')}</Label>
                    <InputGroup>
                      <InputGroupInput id="ing-min" value={ingredientForm.minimum_quantity} onChange={(e) => setIngredientForm((current) => ({ ...current, minimum_quantity: e.target.value }))} placeholder="0" />
                    </InputGroup>
                  </div>
                </div>
                <Button type="submit" disabled={saving || !workspace.selectedRestaurantId || !ingredientForm.name.trim()} className="w-full">
                  {saving ? <Spinner className="h-4 w-4" /> : <><Plus className="h-4 w-4" /> {t('inventory_save_ingredient', 'Сохранить ингредиент')}</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <CardTitle className="text-lg text-theme">{t('inventory_supply_title', 'Приход товара')}</CardTitle>
              <CardDescription>{t('inventory_supply_description', 'Когда продукты привезли, добавь количество и себестоимость за единицу.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveSupply} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sup-ing" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('inventory_field_ingredient', 'Ингредиент')}</Label>
                  <select id="sup-ing" value={supplyForm.ingredient_id} onChange={(e) => setSupplyForm((current) => ({ ...current, ingredient_id: e.target.value }))} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
                    {ingredients.map((item) => <option key={item.id} value={item.id} className="bg-[#09131e]">{item.name} ({item.unit})</option>)}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sup-qty" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{`${t('inventory_field_quantity', 'Количество')} ${selectedSupplyIngredient ? `(${selectedSupplyIngredient.unit})` : ''}`}</Label>
                    <InputGroup>
                      <InputGroupInput id="sup-qty" value={supplyForm.quantity} onChange={(e) => setSupplyForm((current) => ({ ...current, quantity: e.target.value }))} placeholder="10" />
                    </InputGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sup-price" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('inventory_field_unit_price', 'Цена за ед.')}</Label>
                    <InputGroup>
                      <InputGroupInput id="sup-price" value={supplyForm.unit_price} onChange={(e) => setSupplyForm((current) => ({ ...current, unit_price: e.target.value }))} placeholder="0" />
                    </InputGroup>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sup-note" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('inventory_field_note', 'Заметка')}</Label>
                  <InputGroup>
                    <InputGroupInput id="sup-note" value={supplyForm.note} onChange={(e) => setSupplyForm((current) => ({ ...current, note: e.target.value }))} placeholder="Поставка утром" />
                  </InputGroup>
                </div>
                <Button type="submit" variant="secondary" disabled={saving || !supplyForm.ingredient_id} className="w-full">
                  {saving ? <Spinner className="h-4 w-4" /> : <><CalendarPlus className="h-4 w-4" /> {t('inventory_save_supply', 'Добавить приход')}</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <CardTitle className="text-lg text-theme">{t('inventory_writeoff_title', 'Списание')}</CardTitle>
              <CardDescription>{t('inventory_writeoff_description', 'Порча, ошибка, staff meal или ручная корректировка фиксируются в журнале.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveWriteOff} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wo-ing" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('inventory_field_ingredient', 'Ингредиент')}</Label>
                  <select id="wo-ing" value={writeOffForm.ingredient_id} onChange={(e) => setWriteOffForm((current) => ({ ...current, ingredient_id: e.target.value }))} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
                    {ingredients.map((item) => <option key={item.id} value={item.id} className="bg-[#09131e]">{item.name} ({item.unit})</option>)}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="wo-qty" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{`${t('inventory_field_quantity', 'Количество')} ${selectedWriteOffIngredient ? `(${selectedWriteOffIngredient.unit})` : ''}`}</Label>
                    <InputGroup>
                      <InputGroupInput id="wo-qty" value={writeOffForm.quantity} onChange={(e) => setWriteOffForm((current) => ({ ...current, quantity: e.target.value }))} placeholder="1" />
                    </InputGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wo-reason" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('inventory_field_reason', 'Причина')}</Label>
                    <select id="wo-reason" value={writeOffForm.reason} onChange={(e) => setWriteOffForm((current) => ({ ...current, reason: e.target.value }))} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
                      {writeOffReasons.map((reason) => <option key={reason.value} value={reason.value} className="bg-[#09131e]">{reason.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wo-note" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('inventory_field_note', 'Заметка')}</Label>
                  <InputGroup>
                    <InputGroupInput id="wo-note" value={writeOffForm.note} onChange={(e) => setWriteOffForm((current) => ({ ...current, note: e.target.value }))} placeholder="Списание кухни" />
                  </InputGroup>
                </div>
                <Button type="submit" variant="destructive" disabled={saving || !writeOffForm.ingredient_id} className="w-full">
                  {saving ? <Spinner className="h-4 w-4" /> : <><Trash2 className="h-4 w-4" /> {t('inventory_save_writeoff', 'Списать')}</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="border-theme bg-[var(--panel-bg)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-theme">{t('inventory_movements_title', 'Журнал движений')}</CardTitle>
                <CardDescription>{t('inventory_movements_description', 'Последние приходы, списания и автоматические списания по закрытым заказам.')}</CardDescription>
              </div>
              <div className="hidden items-center gap-1.5 text-[11px] text-theme-muted sm:flex">
                <Minus className="h-3 w-3" /> <Kbd className="border-theme bg-white/5 text-theme-muted">/</Kbd> — {t('inventory_focus_search', 'фокус на поиск')}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-theme">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory_col_time', 'Время')}</TableHead>
                    <TableHead>{t('inventory_col_ingredient', 'Ингредиент')}</TableHead>
                    <TableHead>{t('inventory_col_type', 'Тип')}</TableHead>
                    <TableHead>{t('inventory_col_delta', 'Изменение')}</TableHead>
                    <TableHead>{t('inventory_col_after', 'После')}</TableHead>
                    <TableHead>{t('inventory_col_user', 'Кто')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}><Skeleton className="h-5 w-full bg-white/6" /></TableCell>
                      </TableRow>
                    ))
                  ) : (inventory?.movements || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-theme-muted">{t('inventory_empty_movements', 'Движений склада пока нет.')}</TableCell>
                    </TableRow>
                  ) : (
                    (inventory?.movements || []).map((row: any) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.created_at_display}</TableCell>
                        <TableCell className="text-theme">{row.ingredient}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/6 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-theme-secondary">
                            {row.movement_type === 'supply' ? <Plus className="h-3 w-3 text-emerald-400" /> : <Minus className="h-3 w-3 text-[#f97360]" />}
                            {row.movement_type}
                          </span>
                        </TableCell>
                        <TableCell>{row.delta} {row.unit}</TableCell>
                        <TableCell>{row.after_quantity} {row.unit}</TableCell>
                        <TableCell>{row.created_by || 'System'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
