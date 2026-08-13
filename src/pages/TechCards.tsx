import { ChefHat, CircleDollarSign, Layers, Plus, RefreshCcw, RotateCcw, Search, Trash2, UtensilsCrossed } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app/AppShell';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
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

export default function TechCardsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'CHEF' || user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [techCards, setTechCards] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState({ dish: '', yield_amount: 1, cooking_instructions: '', cooking_time_minutes: 0 });
  const [itemForm, setItemForm] = useState({ ingredient: '', quantity_needed: 0, ingredient_cost_price: 0 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const tcRes = await ownerAPI.getTechCards(workspace.selectedRestaurantId);
      const dishRes = await ownerAPI.getMenuDishes(workspace.selectedRestaurantId);
      const ingRes = await ownerAPI.getInventory(workspace.selectedRestaurantId);
      setTechCards((tcRes.data as any).results || tcRes.data || []);
      const dishesData = dishRes.data;
      setDishes(Array.isArray(dishesData) ? dishesData : (dishesData as any).results || []);
      setIngredients(ingRes.data.ingredients || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        document.getElementById('techcard-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const create = async () => {
    if (!workspace.selectedRestaurantId || !form.dish) {
      toast.error(t('techCards_dish_required', 'Выберите блюдо'));
      return;
    }
    setSaving(true);
    try {
      await ownerAPI.createTechCard({ ...form, restaurant: workspace.selectedRestaurantId });
      setCreateOpen(false);
      setForm({ dish: '', yield_amount: 1, cooking_instructions: '', cooking_time_minutes: 0 });
      toast.success(t('techCards_created', 'Техкарта создана'));
      await load();
    } catch {
      toast.error(t('techCards_create_error', 'Не удалось создать техкарту'));
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
      toast.success(t('techCards_deleted', 'Техкарта удалена'));
      await load();
    } catch {}
    setDeleteTarget(null);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return techCards;
    return techCards.filter(tc => (tc.dish_name || '').toLowerCase().includes(search.toLowerCase()));
  }, [techCards, search]);

  const avgMargin = techCards.length > 0
    ? Math.round(techCards.reduce((s, c) => s + (parseFloat(c.margin_percent) || 0), 0) / techCards.length)
    : null;
  const topCount = techCards.filter(c => parseFloat(c.margin_percent) >= 30).length;

  const metrics = [
    { title: t('techCards_total_cards_title', 'Всего техкарт'), value: techCards.length, icon: Layers, tone: 'text-[#8fd4ff] bg-[#8fd4ff]/12', note: t('techCards_total_note', 'Рецептур и калькуляций') },
    { title: t('techCards_avg_margin_title', 'Средняя маржа'), value: avgMargin === null ? '—' : `${avgMargin}%`, icon: CircleDollarSign, tone: 'text-emerald-400 bg-emerald-500/12', note: `${topCount} ${t('techCards_top_goal', 'из')} ${techCards.length} ${t('techCards_goal_suffix', 'с маржой ≥30%')}` },
    { title: t('techCards_action_title', 'Действия'), value: t('techCards_new_card', 'Новая карта'), icon: ChefHat, tone: 'text-[#ffd28d] bg-[#ffd28d]/12', note: t('techCards_action_note', 'Создать техкарту и посчитать себестоимость') },
  ];

  return (
    <AppShell title={t('techCards_app_title', 'Техкарты')} subtitle={t('techCards_app_subtitle', 'Технологические карты, расчёт себестоимости и анализ маржинальности.')} eyebrow={t('techCards_app_eyebrow', 'Waitly Kitchen · Автор: Шеф/Менеджер')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><span className="text-theme-secondary">Waitly</span></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('techCards_app_title', 'Техкарты')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="border-theme bg-[var(--panel-bg)]">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-semibold text-theme-secondary">{metric.title}</CardTitle>
                    <div className="mt-3 font-display text-3xl font-black text-theme">{metric.value}</div>
                    <CardDescription className="mt-2">{metric.note}</CardDescription>
                  </div>
                  <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${metric.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card className="mt-4 border-theme bg-[var(--panel-bg)]">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg text-theme">{t('techCards_all_title', 'Все техкарты')}</CardTitle>
              <CardDescription>{t('techCards_all_description', 'Себестоимость, цена продажи и маржа по каждому блюду.')}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-56">
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Search className="h-4 w-4 text-theme-muted" />
                  </InputGroupAddon>
                  <InputGroupInput id="techcard-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('techCards_search', 'Поиск по блюдам...')} className="rounded-xl py-2 pl-9" />
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
                <Plus className="mr-1.5 h-4 w-4" />{t('techCards_new_card', 'Новая карта')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-theme">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('techCards_col_dish', 'Блюдо')}</TableHead>
                  <TableHead>{t('techCards_col_cost', 'Себестоимость')}</TableHead>
                  <TableHead>{t('techCards_col_selling', 'Продажа')}</TableHead>
                  <TableHead>{t('techCards_col_margin', 'Маржа')}</TableHead>
                  <TableHead className="text-right">{t('techCards_col_actions', 'Действия')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}><Skeleton className="h-5 w-full bg-white/6" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-theme-muted">
                      {search ? t('techCards_no_search', 'Ничего не найдено.') : t('techCards_empty', 'Техкарт пока нет. Создайте первую, чтобы отслеживать себестоимость.')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((card) => (
                    <ContextMenu key={card.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow className="cursor-context-menu">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#8fd4ff]/10">
                                <UtensilsCrossed className="h-4 w-4 text-[#8fd4ff]" />
                              </div>
                              <span className="font-semibold text-theme">{card.dish_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{Number(card.total_cost).toLocaleString()} UZS</TableCell>
                          <TableCell>
                            {(() => {
                              const dish = dishes.find((d: any) => d.id === card.dish);
                              return dish ? `${Number(dish.price).toLocaleString()} UZS` : '—';
                            })()}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${
                              parseFloat(card.margin_percent) > 30 ? 'bg-emerald-500/12 text-emerald-400' : parseFloat(card.margin_percent) > 0 ? 'bg-[#ffd28d]/15 text-[#ffd28d]' : 'bg-red-500/12 text-red-400'
                            }`}>
                              {card.margin_percent}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Accordion type="single" collapsible className="border-none" onValueChange={(v) => {}}>
                              <AccordionItem value={card.id} className="border-none">
                                <AccordionTrigger className="justify-end gap-2 py-0 text-theme-secondary hover:no-underline [&>svg]:hidden">
                                  <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-bold">{t('techCards_ingredients_count', '{count} ингр.').replace('{count}', String((card.items || card.tech_card_items || []).length))}</span>
                                </AccordionTrigger>
                                <AccordionContent className="pt-3">
                                  <AccordionDetail
                                    card={card}
                                    ingredients={ingredients}
                                    itemForm={itemForm}
                                    setItemForm={setItemForm}
                                    onAdd={() => addItem(card.id)}
                                    onRemove={(itemId) => removeItem(card.id, itemId)}
                                    saving={saving}
                                  />
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="border-theme bg-[var(--modal-bg)]">
                        <ContextMenuItem onClick={() => recalculate(card.id)}>
                          <RotateCcw className="h-3.5 w-3.5" /> {t('techCards_recalculate', 'Пересчитать себестоимость')}
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem variant="destructive" onClick={() => setDeleteTarget(card)}>
                          <Trash2 className="h-3.5 w-3.5" /> {t('techCards_delete', 'Удалить техкарту')}
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
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
            <DialogTitle>{t('techCards_create_title', 'Новая техкарта')}</DialogTitle>
            <DialogDescription>{t('techCards_create_description', 'Выберите блюдо и укажите выход порций и время приготовления.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tc-dish" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('techCards_dish_label', 'Блюдо')}</Label>
              <select id="tc-dish" value={form.dish} onChange={(e) => setForm((f) => ({ ...f, dish: e.target.value }))} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
                <option value="" className="bg-[#09131e]">{t('techCards_select_dish', 'Выберите блюдо')}</option>
                {dishes.map((d: any) => <option key={d.id} value={d.id} className="bg-[#09131e]">{d.name}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tc-yield" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('techCards_yield_label', 'Выход (порций)')}</Label>
                <InputGroup>
                  <InputGroupInput id="tc-yield" type="number" value={form.yield_amount} onChange={(e) => setForm((f) => ({ ...f, yield_amount: +e.target.value }))} />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tc-time" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('techCards_cooking_time_label', 'Время (мин)')}</Label>
                <InputGroup>
                  <InputGroupInput id="tc-time" type="number" value={form.cooking_time_minutes} onChange={(e) => setForm((f) => ({ ...f, cooking_time_minutes: +e.target.value }))} />
                </InputGroup>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tc-inst" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('techCards_cooking_instructions_label', 'Приготовление')}</Label>
              <InputGroup>
                <InputGroupTextarea id="tc-inst" rows={3} value={form.cooking_instructions} onChange={(e) => setForm((f) => ({ ...f, cooking_instructions: e.target.value }))} />
              </InputGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>{t('techCards_cancel', 'Отмена')}</Button>
            <Button onClick={create} disabled={saving || !form.dish}>
              {saving ? <Spinner className="h-4 w-4" /> : <><ChefHat className="mr-1.5 h-4 w-4" />{t('techCards_create_button', 'Создать')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('techCards_delete_confirm_title', 'Удалить техкарту?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('techCards_delete_confirm_text', 'Техкарта «{name}» будет удалена безвозвратно.').replace('{name}', deleteTarget?.dish_name || '')}
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

function AccordionDetail({ card, ingredients, itemForm, setItemForm, onAdd, onRemove, saving }: {
  card: any;
  ingredients: any[];
  itemForm: { ingredient: string; quantity_needed: number; ingredient_cost_price: number };
  setItemForm: (f: any) => void;
  onAdd: () => void;
  onRemove: (itemId: string) => void;
  saving: boolean;
}) {
  const items = card.items || card.tech_card_items || [];
  return (
    <div className="rounded-2xl border border-theme bg-black/10 p-3">
      <div className="overflow-hidden rounded-xl border border-theme">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[10px]">Ингредиент</TableHead>
              <TableHead className="text-[10px]">Кол-во</TableHead>
              <TableHead className="text-[10px]">Цена</TableHead>
              <TableHead className="text-right text-[10px]">Удалить</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-theme-muted">Ингредиентов пока нет</TableCell>
              </TableRow>
            ) : (
              items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="text-theme">{item.ingredient_name}</TableCell>
                  <TableCell>{item.quantity_needed} {item.ingredient_unit || ''}</TableCell>
                  <TableCell>{Number(item.ingredient_cost_price).toLocaleString()} UZS</TableCell>
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
            <InputGroupInput type="number" value={itemForm.quantity_needed} onChange={(e) => setItemForm((f: any) => ({ ...f, quantity_needed: +e.target.value }))} className="rounded-xl px-3 py-2" />
          </InputGroup>
        </div>
        <div className="w-28">
          <Label className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-theme-muted">Цена за ед.</Label>
          <InputGroup>
            <InputGroupInput type="number" value={itemForm.ingredient_cost_price} onChange={(e) => setItemForm((f: any) => ({ ...f, ingredient_cost_price: +e.target.value }))} className="rounded-xl px-3 py-2" />
          </InputGroup>
        </div>
        <InputGroupButton onClick={onAdd} disabled={saving || !itemForm.ingredient} className="mb-0.5 rounded-xl bg-[#f97360] px-4 py-2 font-semibold text-white hover:brightness-110">
          {saving ? <Spinner className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />} Добавить
        </InputGroupButton>
      </div>
    </div>
  );
}
