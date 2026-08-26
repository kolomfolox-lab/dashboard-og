import { Layers, Plus, RefreshCcw, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app/AppShell';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

const uzs = (value: unknown) => `${Number(value || 0).toLocaleString('ru-RU')} UZS`;

export default function SemisPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'CHEF' || user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [semis, setSemis] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', yield_amount: 1, cooking_instructions: '', cooking_time_minutes: 0 });
  const [itemForm, setItemForm] = useState({ ingredient: '', quantity_needed: 0, ingredient_cost_price: 0 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const tcRes = await ownerAPI.getTechCards(workspace.selectedRestaurantId);
      const ingRes = await ownerAPI.getInventory(workspace.selectedRestaurantId);
      const cards = (tcRes.data as any).results || tcRes.data || [];
      // Полуфабрикаты — техкарты без блюда меню (is_semi), см. part-13.
      setSemis(cards.filter((c: any) => c.is_semi));
      setIngredients(ingRes.data.ingredients || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const create = async () => {
    if (!workspace.selectedRestaurantId || !form.name.trim()) {
      toast.error(t('semis_name_required', 'Укажите название полуфабриката'));
      return;
    }
    setSaving(true);
    try {
      await ownerAPI.createTechCard({
        is_semi: true,
        name: form.name.trim(),
        yield_amount: form.yield_amount,
        cooking_instructions: form.cooking_instructions,
        cooking_time_minutes: form.cooking_time_minutes,
        restaurant: workspace.selectedRestaurantId,
      });
      setCreateOpen(false);
      setForm({ name: '', yield_amount: 1, cooking_instructions: '', cooking_time_minutes: 0 });
      toast.success(t('semis_created', 'Полуфабрикат создан'));
      await load();
    } catch {
      toast.error(t('semis_create_error', 'Не удалось создать полуфабрикат'));
    } finally { setSaving(false); }
  };

  const addItem = async (cardId: string) => {
    if (!itemForm.ingredient) return;
    setSaving(true);
    try {
      await ownerAPI.addTechCardItem(cardId, itemForm);
      setItemForm({ ingredient: '', quantity_needed: 0, ingredient_cost_price: 0 });
      toast.success(t('techCards_item_added', 'Ингредиент добавлен'));
      await load();
    } catch {
      toast.error(t('techCards_item_error', 'Не удалось добавить ингредиент'));
    } finally { setSaving(false); }
  };

  const removeItem = async (cardId: string, itemId: string) => {
    try {
      await ownerAPI.removeTechCardItem(cardId, itemId);
      toast.success(t('techCards_item_removed', 'Ингредиент удалён'));
      await load();
    } catch {}
  };

  const recalculate = async (cardId: string) => {
    try {
      await ownerAPI.recalculateTechCard(cardId);
      toast.success(t('techCards_recalculated', 'Себестоимость пересчитана'));
      await load();
    } catch {}
  };

  const deleteCard = async () => {
    if (!deleteTarget) return;
    try {
      await ownerAPI.deleteTechCard(deleteTarget.id);
      toast.success(t('semis_deleted', 'Полуфабрикат удалён'));
      await load();
    } catch {}
    setDeleteTarget(null);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return semis;
    return semis.filter((s) => (s.display_name || s.name || '').toLowerCase().includes(search.toLowerCase()));
  }, [semis, search]);

  const totalBatchCost = semis.reduce((sum, s) => sum + (parseFloat(s.total_cost) || 0), 0);

  return (
    <AppShell
      title={t('semis_app_title', 'Полуфабрикаты')}
      subtitle={t('semis_app_subtitle', 'Заготовки — тесто, соусы, бульоны. Их себестоимость входит в техкарты блюд.')}
      eyebrow={t('semis_app_eyebrow', 'Waitly Kitchen · Часть 13')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title={t('semis_count_title', 'Полуфабрикатов')} value={String(semis.length)} note={t('semis_count_note', 'Заготовок на кухне')} tone="text-[#8fd4ff] bg-[#8fd4ff]/12" />
        <MetricCard title={t('semis_batch_title', 'Стоимость батчей')} value={uzs(totalBatchCost)} note={t('semis_batch_note', 'Суммарно по всем заготовкам')} tone="text-emerald-400 bg-emerald-500/12" />
        <MetricCard title={t('semis_action_title', 'Действия')} value={t('semis_new', 'Новый полуфабрикат')} note={t('semis_action_note', 'Создать заготовку и посчитать себестоимость')} tone="text-[#ffd28d] bg-[#ffd28d]/12" />
      </div>

      <Card className="mt-4 border-theme bg-[var(--panel-bg)]">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg text-theme">{t('semis_all_title', 'Все полуфабрикаты')}</CardTitle>
              <CardDescription>{t('semis_all_description', 'Состав и себестоимость батча и порции.')}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-56">
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Search className="h-4 w-4 text-theme-muted" />
                  </InputGroupAddon>
                  <InputGroupInput id="semis-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('semis_search', 'Поиск по заготовкам...')} className="rounded-xl py-2 pl-9" />
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
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />{t('semis_new', 'Новый полуфабрикат')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-theme">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('semis_col_name', 'Заготовка')}</TableHead>
                  <TableHead>{t('semis_col_yield', 'Выход')}</TableHead>
                  <TableHead>{t('semis_col_batch_cost', 'Батч')}</TableHead>
                  <TableHead>{t('semis_col_portion_cost', 'Порция')}</TableHead>
                  <TableHead className="text-right">{t('techCards_col_actions', 'Действия')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-5 w-full bg-white/6" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-theme-muted">
                      {search
                        ? t('techCards_no_search', 'Ничего не найдено.')
                        : t('semis_empty', 'Полуфабрикатов пока нет. Создайте первый — например, соус или тесто.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((semi) => (
                    <TableRow key={semi.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#8fd4ff]/10">
                            <Layers className="h-4 w-4 text-[#8fd4ff]" />
                          </div>
                          <span className="font-semibold text-theme">{semi.display_name || semi.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{Number(semi.yield_amount || 1)} {t('semis_portions_suffix', 'порц.')}</TableCell>
                      <TableCell>{uzs(semi.total_cost)}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                          {uzs(semi.cost_per_portion)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Accordion type="single" collapsible className="border-none">
                          <AccordionItem value={semi.id} className="border-none">
                            <AccordionTrigger className="justify-end gap-2 py-0 text-theme-secondary hover:no-underline [&>svg]:hidden">
                              <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-bold">
                                {t('techCards_ingredients_count', '{count} ингр.').replace('{count}', String((semi.items || []).length))}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="pt-3">
                              <SemiDetail
                                semi={semi}
                                ingredients={ingredients}
                                itemForm={itemForm}
                                setItemForm={setItemForm}
                                onAdd={() => addItem(semi.id)}
                                onRemove={(itemId) => removeItem(semi.id, itemId)}
                                onRecalculate={() => recalculate(semi.id)}
                                onDelete={() => setDeleteTarget(semi)}
                                saving={saving}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-theme bg-[var(--modal-bg)] text-theme">
          <DialogHeader>
            <DialogTitle>{t('semis_create_title', 'Новый полуфабрикат')}</DialogTitle>
            <DialogDescription>{t('semis_create_description', 'Заготовка без блюда в меню: укажите название и выход порций с одного батча.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="semi-name" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('semis_name_label', 'Название')}</Label>
              <InputGroup>
                <InputGroupInput id="semi-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t('semis_name_placeholder', 'Томатный соус, тесто, бульон...')} />
              </InputGroup>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="semi-yield" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('techCards_yield_label', 'Выход (порций)')}</Label>
                <InputGroup>
                  <InputGroupInput id="semi-yield" type="number" min={1} value={form.yield_amount} onChange={(e) => setForm((f) => ({ ...f, yield_amount: +e.target.value }))} />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semi-time" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('techCards_cooking_time_label', 'Время (мин)')}</Label>
                <InputGroup>
                  <InputGroupInput id="semi-time" type="number" min={0} value={form.cooking_time_minutes} onChange={(e) => setForm((f) => ({ ...f, cooking_time_minutes: +e.target.value }))} />
                </InputGroup>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semi-inst" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('techCards_cooking_instructions_label', 'Приготовление')}</Label>
              <InputGroup>
                <InputGroupTextarea id="semi-inst" rows={3} value={form.cooking_instructions} onChange={(e) => setForm((f) => ({ ...f, cooking_instructions: e.target.value }))} />
              </InputGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>{t('techCards_cancel', 'Отмена')}</Button>
            <Button onClick={create} disabled={saving || !form.name.trim()}>
              {saving ? <Spinner className="h-4 w-4" /> : <><Plus className="mr-1.5 h-4 w-4" />{t('techCards_create_button', 'Создать')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('semis_delete_confirm_title', 'Удалить полуфабрикат?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('semis_delete_confirm_text', '«{name}» будет удалён безвозвратно. Техкарты блюд, где он указан, потребуется пересчитать.').replace('{name}', deleteTarget?.display_name || deleteTarget?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('techCards_cancel', 'Отмена')}</AlertDialogCancel>
            <AlertDialogAction onClick={deleteCard}>{t('techCards_delete', 'Удалить')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function MetricCard({ title, value, note, tone }: { title: string; value: string; note: string; tone: string }) {
  return (
    <Card className="border-theme bg-[var(--panel-bg)]">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-theme-secondary">{title}</CardTitle>
        <div className="mt-3 font-display text-2xl font-black text-theme">{value}</div>
        <CardDescription className="mt-2">{note}</CardDescription>
        <div className={`absolute right-6 top-6 hidden h-10 w-10 place-items-center rounded-2xl ${tone}`} aria-hidden />
      </CardHeader>
    </Card>
  );
}

function SemiDetail({ semi, ingredients, itemForm, setItemForm, onAdd, onRemove, onRecalculate, onDelete, saving }: {
  semi: any;
  ingredients: any[];
  itemForm: { ingredient: string; quantity_needed: number; ingredient_cost_price: number };
  setItemForm: (f: any) => void;
  onAdd: () => void;
  onRemove: (itemId: string) => void;
  onRecalculate: () => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const items = semi.items || [];
  return (
    <div className="rounded-2xl border border-theme bg-black/10 p-3">
      <div className="overflow-hidden rounded-xl border border-theme">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Ингредиент</TableHead>
              <TableHead className="text-[10px]">Кол-во</TableHead>
              <TableHead className="text-[10px]">Цена за ед.</TableHead>
              <TableHead className="text-right text-[10px]">Удалить</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-theme-muted">Ингредиентов пока нет — добавьте первый ниже</TableCell>
              </TableRow>
            ) : (
              items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="text-theme">{item.ingredient_name}</TableCell>
                  <TableCell>{item.quantity_needed} {item.ingredient_unit || ''}</TableCell>
                  <TableCell>{uzs(item.ingredient_cost_price)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)} aria-label="Удалить">
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <div className="min-w-40 flex-1">
          <Label className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-theme-muted">Ингредиент</Label>
          <select value={itemForm.ingredient} onChange={(e) => setItemForm((f: any) => ({ ...f, ingredient: e.target.value }))} className="w-full rounded-xl border border-theme bg-[var(--input-bg)] px-3 py-2 text-sm text-theme outline-none">
            <option value="" className="bg-[#09131e]">Выберите</option>
            {ingredients.map((i: any) => <option key={i.id} value={i.id} className="bg-[#09131e]">{i.name}</option>)}
          </select>
        </div>
        <div className="w-20">
          <Label className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-theme-muted">Кол-во</Label>
          <InputGroup>
            <InputGroupInput type="number" min={0} value={itemForm.quantity_needed} onChange={(e) => setItemForm((f: any) => ({ ...f, quantity_needed: +e.target.value }))} className="rounded-xl px-3 py-2" />
          </InputGroup>
        </div>
        <div className="w-28">
          <Label className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-theme-muted">Цена за ед.</Label>
          <InputGroup>
            <InputGroupInput type="number" min={0} value={itemForm.ingredient_cost_price} onChange={(e) => setItemForm((f: any) => ({ ...f, ingredient_cost_price: +e.target.value }))} className="rounded-xl px-3 py-2" />
          </InputGroup>
        </div>
        <InputGroupButton onClick={onAdd} disabled={saving || !itemForm.ingredient} className="mb-0.5 rounded-xl bg-[#f97360] px-4 py-2 font-semibold text-white hover:brightness-110">
          {saving ? <Spinner className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} Добавить
        </InputGroupButton>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onRecalculate}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Пересчитать
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-400 hover:text-red-300">
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Удалить
        </Button>
      </div>
    </div>
  );
}
