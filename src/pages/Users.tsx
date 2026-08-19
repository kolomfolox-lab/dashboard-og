import { useEffect, useState } from 'react';
import { DollarSign, KeyRound, Phone, Plus, UserRound, UsersRound, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app/AppShell';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { adminAPI, ownerAPI } from '@/services/api';

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

const roleLabels: Record<string, string> = {
  WAITER: 'Официант',
  CHEF: 'Повар',
  MANAGER: 'Менеджер',
  KITCHEN_MANAGER: 'Зав. кухней',
  HOSTESS: 'Хостес',
  SHIFT_LEADER: 'Старший смены',
  BARTENDER: 'Бармен',
  BARISTA: 'Бариста',
};

const roleTones: Record<string, string> = {
  WAITER: 'bg-[#8fd4ff]/12 text-[#8fd4ff]',
  CHEF: 'bg-[#f97360]/12 text-[#f97360]',
  MANAGER: 'bg-[#a78bfa]/12 text-[#a78bfa]',
  KITCHEN_MANAGER: 'bg-[#ffd28d]/12 text-[#ffd28d]',
  HOSTESS: 'bg-emerald-500/12 text-emerald-400',
};

export default function UsersPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [rateValue, setRateValue] = useState('');
  const [editingPin, setEditingPin] = useState<string | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [savingPin, setSavingPin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: '', phone_number: '', role: 'WAITER', email: '' });
  const [saving, setSaving] = useState(false);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const restaurantId = workspace.selectedRestaurantId;
      const response = isSuperAdmin ? await adminAPI.getOwners() : await ownerAPI.getStaff(restaurantId);
      setRows(toArray(response.data));
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Load failed');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [locale, isSuperAdmin, user?.role, workspace.selectedRestaurantId]);

  const saveRate = async (staffId: string) => {
    try {
      await ownerAPI.updateStaff(staffId, { hourly_rate: Number(rateValue) });
      toast.success(t('users_rate_saved', 'Ставка сохранена'));
      setEditingRate(null);
      await load();
    } catch {
      toast.error(t('users_rate_error', 'Ошибка'));
    }
  };

  const handleCreate = async () => {
    if (!createForm.full_name.trim() || !createForm.phone_number.trim() || !workspace.selectedRestaurantId) return;
    setSaving(true);
    try {
      await ownerAPI.createStaff({
        restaurant_id: workspace.selectedRestaurantId,
        full_name: createForm.full_name.trim(),
        phone_number: createForm.phone_number.trim(),
        role: createForm.role,
        email: createForm.email.trim() || undefined,
      });
      toast.success(t('users_created', 'Сотрудник добавлен'));
      setShowCreate(false);
      setCreateForm({ full_name: '', phone_number: '', role: 'WAITER', email: '' });
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.response?.data?.detail || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  const copyPhone = (phone: string) => {
    navigator.clipboard?.writeText(phone).then(() => toast.success(t('users_phone_copied', 'Телефон скопирован')));
  };

  const savePin = async () => {
    if (!editingPin) return;
    if (!/^\d{4}$/.test(pinValue.trim())) {
      toast.error(t('users_pin_4digits', 'PIN должен быть ровно 4 цифры'));
      return;
    }
    setSavingPin(true);
    try {
      await ownerAPI.setStaffPin(editingPin, pinValue.trim());
      toast.success(t('users_pin_saved', 'PIN сохранён'));
      setEditingPin(null);
      setPinValue('');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Ошибка');
    } finally {
      setSavingPin(false);
    }
  };

  const clearPin = async (userId: string) => {
    try {
      await ownerAPI.clearStaffPin(userId);
      toast.success(t('users_pin_cleared', 'PIN удалён'));
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Ошибка');
    }
  };

  return (
    <>
      <AppShell
        title={isSuperAdmin ? t('users_title_superadmin', 'Owners') : t('users_title_owner', 'Команда')}
        subtitle={isSuperAdmin ? 'All owners' : `${t('users_staff', 'Сотрудников')}: ${rows.length}`}
        eyebrow={isSuperAdmin ? 'Owners' : 'Team'}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <div className="space-y-4">
          <Breadcrumb className="mb-1">
            <BreadcrumbList>
              <BreadcrumbItem><span className="text-theme-secondary">Waitly</span></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{isSuperAdmin ? 'Owners' : t('users_title_owner', 'Команда')}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {error}
              <button onClick={load} className="ml-3 underline hover:text-white">{t('retry', 'Retry')}</button>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-theme bg-[var(--panel-bg)]">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-semibold text-theme-secondary">{t('users_loaded', 'Всего')}</CardTitle>
                    {loading ? <Skeleton className="mt-3 h-8 w-16 bg-white/8" /> : <div className="mt-2 font-display text-3xl font-black text-theme">{rows.length}</div>}
                    <CardDescription className="mt-1">{t('users_staff', 'Сотрудников')}</CardDescription>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#8fd4ff]/12">
                    <UsersRound className="h-5 w-5 text-[#8fd4ff]" />
                  </div>
                </div>
              </CardHeader>
            </Card>
            <Card className="border-theme bg-[var(--panel-bg)]">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-semibold text-theme-secondary">{t('users_current_role', 'Текущая роль')}</CardTitle>
                    <div className="mt-2 font-display text-2xl font-black text-theme">{user?.full_name || user?.role || '-'}</div>
                    <CardDescription className="mt-1">ID: {(user?.id || '').slice(0, 8)}</CardDescription>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ffd28d]/12">
                    <UserRound className="h-5 w-5 text-[#ffd28d]" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg text-theme">{isSuperAdmin ? 'Owners' : t('users_staff_list', 'Сотрудники')}</CardTitle>
                  <CardDescription>{t('users_staff_desc', 'Управление командой: роли и почасовая ставка.')}</CardDescription>
                </div>
                {!isSuperAdmin ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => setShowCreate(true)} disabled={!workspace.selectedRestaurantId}>
                        <Plus className="mr-1.5 h-4 w-4" />{t('users_add', 'Добавить')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('users_add_tooltip', 'Пригласить нового сотрудника')}</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-theme">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('name', 'Имя')}</TableHead>
                      <TableHead>{t('role', 'Должность')}</TableHead>
                      <TableHead>{t('phone', 'Телефон')}</TableHead>
                      {!isSuperAdmin ? <TableHead className="text-right">PIN (касса)</TableHead> : null}
                      <TableHead className="text-right">{t('users_hourly_rate', 'Ставка/час')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={4}><Skeleton className="h-5 w-full bg-white/6" /></TableCell>
                        </TableRow>
                      ))
                    ) : rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-theme-muted">{t('no_data', 'Нет данных')}</TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => (
                        <ContextMenu key={row.id}>
                          <ContextMenuTrigger asChild>
                            <TableRow className="cursor-context-menu">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/6">
                                    <UserRound className="h-4 w-4 text-theme-secondary" />
                                  </div>
                                  <span className="font-semibold text-theme">{row.full_name || '-'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${roleTones[row.role] || 'bg-white/6 text-theme-secondary'}`}>
                                  {roleLabels[row.role] || row.role || '-'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <button type="button" onClick={() => copyPhone(row.phone || row.phone_number || '')} className="inline-flex items-center gap-1.5 text-theme-secondary transition hover:text-theme">
                                  <Phone className="h-3.5 w-3.5" />
                                  {row.phone || row.phone_number || '-'}
                                </button>
                              </TableCell>
                              {!isSuperAdmin ? (
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => { setEditingPin(row.id); setPinValue(''); }}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-theme px-2.5 py-1 text-xs font-bold text-theme-secondary transition hover:border-emerald-400/50 hover:text-emerald-300"
                                    >
                                      <KeyRound className="h-3.5 w-3.5" />
                                      PIN
                                    </button>
                                    {row.has_pin ? (
                                      <button
                                        type="button"
                                        onClick={() => clearPin(row.id)}
                                        title={t('users_pin_clear', 'Удалить PIN')}
                                        className="text-[11px] text-theme-muted underline-offset-2 hover:text-red-400 hover:underline"
                                      >
                                        сбросить
                                      </button>
                                    ) : null}
                                  </div>
                                </TableCell>
                              ) : null}
                              <TableCell className="text-right">
                                {editingRate === row.id ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <InputGroup className="w-28">
                                      <InputGroupInput
                                        type="number"
                                        value={rateValue}
                                        onChange={(e) => setRateValue(e.target.value)}
                                        className="rounded-xl px-3 py-1.5"
                                        autoFocus
                                      />
                                    </InputGroup>
                                    <Button size="sm" variant="secondary" onClick={() => saveRate(row.id)}>{t('save', 'OK')}</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingRate(null)}>{t('cancel', 'X')}</Button>
                                  </div>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => { setEditingRate(row.id); setRateValue(String(row.hourly_rate || 0)); }}
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-theme-secondary transition hover:text-theme"
                                      >
                                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                                        {Number(row.hourly_rate || 0).toLocaleString()} UZS
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>{t('users_edit_rate', 'Изменить ставку')}</TooltipContent>
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="border-theme bg-[var(--modal-bg)]">
                            <ContextMenuItem onClick={() => { setEditingRate(row.id); setRateValue(String(row.hourly_rate || 0)); }}>
                              <DollarSign className="h-3.5 w-3.5" /> {t('users_edit_rate', 'Изменить ставку')}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => copyPhone(row.phone || row.phone_number || '')}>
                              <Copy className="h-3.5 w-3.5" /> {t('users_copy_phone', 'Скопировать телефон')}
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
        </div>
      </AppShell>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="border-theme bg-[var(--modal-bg)] text-theme">
          <DialogHeader>
            <DialogTitle>{t('users_add', 'Новый сотрудник')}</DialogTitle>
            <DialogDescription>{t('users_add_desc', 'Сотрудник получит доступ к мобильному приложению по номеру телефона.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u-name" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('users_name_placeholder', 'Имя *')}</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start"><UserRound className="h-4 w-4 text-theme-muted" /></InputGroupAddon>
                <InputGroupInput id="u-name" value={createForm.full_name} onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} placeholder={t('users_name_placeholder', 'Имя *')} className="pl-9" />
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-phone" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('users_phone_placeholder', 'Телефон *')}</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start"><Phone className="h-4 w-4 text-theme-muted" /></InputGroupAddon>
                <InputGroupInput id="u-phone" value={createForm.phone_number} onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })} placeholder="+998..." className="pl-9" />
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-email" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('users_email_placeholder', 'Email (необязательно)')}</Label>
              <InputGroup>
                <InputGroupInput id="u-email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="name@example.com" />
              </InputGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-role" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('role', 'Должность')}</Label>
              <select id="u-role" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
                <option value="WAITER" className="bg-[#09131e]">{t('role_waiter', 'Официант')}</option>
                <option value="CHEF" className="bg-[#09131e]">{t('role_chef', 'Повар')}</option>
                <option value="MANAGER" className="bg-[#09131e]">{t('role_manager', 'Менеджер')}</option>
                <option value="KITCHEN_MANAGER" className="bg-[#09131e]">{t('role_kitchen_manager', 'Зав. кухней')}</option>
                <option value="HOSTESS" className="bg-[#09131e]">{t('role_hostess', 'Хостес')}</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>{t('cancel', 'Отмена')}</Button>
            <Button onClick={handleCreate} disabled={saving || !createForm.full_name.trim() || !createForm.phone_number.trim()}>
              {saving ? <Skeleton className="h-4 w-4 rounded-full bg-white/20" /> : <><Plus className="mr-1.5 h-4 w-4" />{t('users_add', 'Добавить')}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingPin} onOpenChange={(open) => { if (!open) { setEditingPin(null); setPinValue(''); } }}>
        <DialogContent className="border-theme bg-[var(--modal-bg)] text-theme">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-emerald-300" />
              {t('users_pin_title', 'PIN для кассы')}
            </DialogTitle>
            <DialogDescription>
              {t('users_pin_desc', '4-значный PIN для входа в POS на планшете. По PIN определяется, кто выполнил действие.')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="pin-input" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">
              PIN
            </Label>
            <InputGroup>
              <InputGroupAddon align="inline-start"><KeyRound className="h-4 w-4 text-theme-muted" /></InputGroupAddon>
              <InputGroupInput
                id="pin-input"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="••••"
                className="pl-9 tracking-[0.5em]"
                autoFocus
              />
            </InputGroup>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setEditingPin(null); setPinValue(''); }}>{t('cancel', 'Отмена')}</Button>
            <Button onClick={savePin} disabled={savingPin || pinValue.length !== 4}>
              {savingPin ? <Skeleton className="h-4 w-4 rounded-full bg-white/20" /> : null}
              {t('users_pin_save', 'Сохранить PIN')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
