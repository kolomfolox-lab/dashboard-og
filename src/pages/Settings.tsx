import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Ban, Gift, Percent, Plus, Printer, RefreshCcw, ShieldAlert, UserRound, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '@/components/app/AppShell';
import { hasGoogleOAuth } from '@/lib/google';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { authAPI, ownerAPI } from '@/services/api';

const toArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
};

export default function SettingsPage() {
  const { user, replaceUser } = useAuth();
  const { locale, t } = useLocale();
  const navigate = useNavigate();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [googleInfo, setGoogleInfo] = useState('');
  const mergedUser = useMemo(() => ({ ...(workspace.profile || {}), ...(user || {}) }), [user, workspace.profile]);
  const googleLinked = mergedUser?.google_linked === true;

  const [commissionPct, setCommissionPct] = useState('');
  const [serviceChargePct, setServiceChargePct] = useState('');
  const [commissionLoading, setCommissionLoading] = useState(false);

  const restaurantId = workspace.selectedRestaurantId;

  useEffect(() => {
    if (!restaurantId) return;
    ownerAPI.getWaiterCommission(restaurantId).then(r => setCommissionPct(r.data.waiter_commission_percent)).catch(() => {});
    ownerAPI.getServiceCharge(restaurantId).then(r => setServiceChargePct(r.data.service_charge_percent)).catch(() => {});
  }, [restaurantId]);

  const saveCommission = async () => {
    if (!restaurantId) return;
    setCommissionLoading(true);
    try {
      const r = await ownerAPI.setWaiterCommission(restaurantId, Number(commissionPct));
      setCommissionPct(r.data.waiter_commission_percent);
      toast.success(t('settings_commission_saved', 'Комиссия сохранена'));
    } catch { toast.error(t('settings_save_error', 'Ошибка сохранения')); }
    finally { setCommissionLoading(false); }
  };

  const saveServiceCharge = async () => {
    if (!restaurantId) return;
    setCommissionLoading(true);
    try {
      const r = await ownerAPI.setServiceCharge(restaurantId, Number(serviceChargePct));
      setServiceChargePct(r.data.service_charge_percent);
      toast.success(t('settings_service_charge_saved', 'Сервисный сбор сохранён'));
    } catch { toast.error(t('settings_save_error', 'Ошибка сохранения')); }
    finally { setCommissionLoading(false); }
  };

  const [fines, setFines] = useState<any[]>([]);
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [showFineModal, setShowFineModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [fineForm, setFineForm] = useState({ user: '', reason: 'LATE', amount: '', description: '' });
  const [bonusForm, setBonusForm] = useState({ user: '', reason: 'GOOD_REVIEW', amount: '', description: '' });
  const [staffList, setStaffList] = useState<any[]>([]);

  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [iikoApiKey, setIikoApiKey] = useState('');
  const [iikoOrgId, setIikoOrgId] = useState('');
  const [iikoLastSync, setIikoLastSync] = useState<string | null>(null);
  const [iikoLoading, setIikoLoading] = useState(false);
  const [printWsUrl, setPrintWsUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    ownerAPI.getStaffFines(restaurantId).then(r => setFines(toArray(r.data))).catch(() => {});
    ownerAPI.getStaffBonuses(restaurantId).then(r => setBonuses(toArray(r.data))).catch(() => {});
    ownerAPI.getStaff(restaurantId).then(r => setStaffList(toArray(r.data))).catch(() => {});
    ownerAPI.getSecurityEvents(restaurantId).then(r => setSecurityEvents(toArray(r.data))).catch(() => {});
    ownerAPI.getIikoSettings(restaurantId).then(r => {
      setIikoApiKey(r.data.iiko_api_key || '');
      setIikoOrgId(r.data.iiko_org_id || '');
      setIikoLastSync(r.data.iiko_last_sync || null);
    }).catch(() => {});
    ownerAPI.getPrintSettings(restaurantId).then(r => setPrintWsUrl(r.data.print_ws_url)).catch(() => {});
  }, [restaurantId]);

  const FINE_REASONS = [
    { value: 'LATE', label: t('fine_reason_late', 'Опоздание') },
    { value: 'EARLY_LEAVE', label: t('fine_reason_early', 'Ранний уход') },
    { value: 'NO_SHOW', label: t('fine_reason_noshow', 'Неявка на смену') },
    { value: 'MISTAKE', label: t('fine_reason_mistake', 'Ошибка в заказе') },
    { value: 'VIOLATION', label: t('fine_reason_violation', 'Нарушение дисциплины') },
    { value: 'DAMAGE', label: t('fine_reason_damage', 'Порча имущества') },
    { value: 'OTHER', label: t('fine_reason_other', 'Другое') },
  ];

  const BONUS_REASONS = [
    { value: 'GOOD_REVIEW', label: t('bonus_reason_review', 'Хороший отзыв гостя') },
    { value: 'TOP_SALES', label: t('bonus_reason_sales', 'Лучшие продажи') },
    { value: 'NO_LATE', label: t('bonus_reason_nolate', 'Без опозданий') },
    { value: 'OVERTIME', label: t('bonus_reason_overtime', 'Переработка') },
    { value: 'ACHIEVEMENT', label: t('bonus_reason_achievement', 'Достижение') },
    { value: 'OTHER', label: t('bonus_reason_other', 'Другое') },
  ];

  const handleAddFine = async () => {
    if (!restaurantId || !fineForm.user || !fineForm.amount) return;
    try {
      await ownerAPI.createStaffFine({ restaurant_id: restaurantId, user: fineForm.user, reason: fineForm.reason, amount: Number(fineForm.amount), description: fineForm.description });
      setShowFineModal(false);
      setFineForm({ user: '', reason: 'LATE', amount: '', description: '' });
      ownerAPI.getStaffFines(restaurantId).then(r => setFines(r.data));
      toast.success(t('settings_fine_added', 'Штраф добавлен'));
    } catch { toast.error(t('settings_save_error', 'Ошибка')); }
  };

  const handleAddBonus = async () => {
    if (!restaurantId || !bonusForm.user || !bonusForm.amount) return;
    try {
      await ownerAPI.createStaffBonus({ restaurant_id: restaurantId, user: bonusForm.user, reason: bonusForm.reason, amount: Number(bonusForm.amount), description: bonusForm.description });
      setShowBonusModal(false);
      setBonusForm({ user: '', reason: 'GOOD_REVIEW', amount: '', description: '' });
      ownerAPI.getStaffBonuses(restaurantId).then(r => setBonuses(r.data));
      toast.success(t('settings_bonus_added', 'Бонус добавлен'));
    } catch { toast.error(t('settings_save_error', 'Ошибка')); }
  };

  const saveIikoSettings = async () => {
    if (!restaurantId) return;
    setIikoLoading(true);
    try {
      await ownerAPI.updateIikoSettings(restaurantId, { iiko_api_key: iikoApiKey, iiko_org_id: iikoOrgId });
      toast.success(t('settings_iiko_saved', 'Настройки iiko сохранены'));
    } catch { toast.error(t('settings_save_error', 'Ошибка')); }
    finally { setIikoLoading(false); }
  };

  const triggerIikoSync = async () => {
    if (!restaurantId) return;
    setIikoLoading(true);
    try {
      const res = await ownerAPI.syncIikoMenu(restaurantId);
      setIikoLastSync(new Date().toISOString());
      toast.success(res.data.message || t('settings_iiko_sync_done', 'Синхронизация завершена'));
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Ошибка синхронизации';
      toast.error(msg);
    }
    finally { setIikoLoading(false); }
  };

  const handleGoogleLink = async (credential: string) => {
    setGoogleLoading(true); setGoogleError(''); setGoogleInfo('');
    try {
      const res = await authAPI.linkGoogle({ credential });
      replaceUser(res.data);
      toast.success(t('settings_google_connected', 'Google подключен!'));
    } catch (err: any) {
      setGoogleError(err?.response?.data?.error || err?.response?.data?.detail || 'Google auth failed.');
    } finally { setGoogleLoading(false); }
  };

  const handleGoogleUnlink = () => {
    setGoogleInfo(t('settings_google_disconnected', 'Google отключен.'));
  };

  return (<>
    <AppShell title={t('settings_title', 'Profile and Security')} subtitle={t('settings_subtitle', 'Owner account profile and access settings.')} eyebrow={t('settings_eyebrow', 'Profile')} restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard title={t('settings_profile', 'Profile')} value={mergedUser?.full_name || 'User'} note={mergedUser?.role || 'Member'} icon={UserRound} tone="coral" />
          <MetricCard title={t('settings_workspaces', 'Workspaces')} value={workspace.restaurants.length || workspace.profile?.chains?.length || 0} note={t('settings_workspace_note', 'Restaurant or chain')} icon={UserRound} tone="sand" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">

          <Panel title={t('settings_google_auth_title', 'Google auth')} eyebrow={t('settings_access', 'Access')} description={t('settings_google_desc', 'Sign in with Google.')}>
            <div className="rounded-2xl border border-theme bg-black/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${googleLinked ? 'bg-[linear-gradient(135deg,rgba(34,197,94,0.22),rgba(143,212,255,0.22))]' : 'bg-white/8'}`}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill={googleLinked ? '#9ae6b4' : '#ffffff'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill={googleLinked ? '#9ae6b4' : '#ffffff'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill={googleLinked ? '#9ae6b4' : '#ffffff'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill={googleLinked ? '#9ae6b4' : '#ffffff'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-theme">Google</div>
                    <div className="mt-1 text-sm text-theme-secondary">{googleLinked ? t('settings_google_connected_label', 'Connected.') : t('settings_google_connect_prompt', 'Connect Google for quick sign-in.')}</div>
                  </div>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${googleLinked ? 'bg-emerald-500/12 text-emerald-400' : 'bg-white/8 text-theme-muted'}`}>{googleLinked ? t('settings_connected_badge', 'Connected') : t('settings_not_connected_badge', 'Not connected')}</div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {!googleLinked ? (
                  hasGoogleOAuth ? (
                    <Button variant="outline" size="sm" onClick={() => setGoogleError('Google auth only on login.moonlauncher.org')}>
                      {t('settings_connect_google_btn', 'Connect Google')}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled className="opacity-50">
                      {t('settings_google_not_configured', 'Google not configured')}
                    </Button>
                  )
                ) : (
                  <Button variant="outline" size="sm" onClick={handleGoogleUnlink}>{t('settings_disconnect_google', 'Disconnect Google')}</Button>
                )}
              </div>
              {googleError ? <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{googleError}</div> : null}
              {googleInfo ? <div className="mt-4 rounded-2xl border border-[#8fd4ff]/20 bg-[#8fd4ff]/10 px-4 py-3 text-sm text-[#8fd4ff]">{googleInfo}</div> : null}
            </div>
          </Panel>

          <Panel title={t('settings_commission_title', 'Комиссии и сборы')} eyebrow={t('settings_pricing', 'Ценообразование')} description={t('settings_commission_desc', 'Настройте комиссию официантов и сервисный сбор для ресторана.')}>
            <div className="space-y-5">
              <div className="rounded-2xl border border-theme bg-black/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f97360]/12">
                    <Percent className="h-5 w-5 text-[#f97360]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-theme">{t('settings_waiter_commission', 'Комиссия официанта')}</div>
                    <div className="mt-1 text-sm text-theme-secondary">{t('settings_waiter_commission_desc', 'Процент от суммы заказа, который начисляется официанту.')}</div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="w-28">
                        <InputGroup>
                          <InputGroupInput
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={commissionPct}
                            onChange={e => setCommissionPct(e.target.value)}
                            className="px-3 py-2 pr-9 text-center"
                          />
                          <InputGroupAddon align="inline-end"><span className="text-sm text-theme-muted">%</span></InputGroupAddon>
                        </InputGroup>
                      </div>
                      <Button size="sm" onClick={saveCommission} disabled={commissionLoading || !restaurantId}>
                        {commissionLoading ? <Spinner className="h-3.5 w-3.5" /> : t('settings_save', 'Сохранить')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-theme bg-black/10 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/12">
                    <Wallet className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-theme">{t('settings_service_charge', 'Сервисный сбор')}</div>
                    <div className="mt-1 text-sm text-theme-secondary">{t('settings_service_charge_desc', 'Процент, добавляемый к счету гостя как сервисный сбор.')}</div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="w-28">
                        <InputGroup>
                          <InputGroupInput
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={serviceChargePct}
                            onChange={e => setServiceChargePct(e.target.value)}
                            className="px-3 py-2 pr-9 text-center"
                          />
                          <InputGroupAddon align="inline-end"><span className="text-sm text-theme-muted">%</span></InputGroupAddon>
                        </InputGroup>
                      </div>
                      <Button size="sm" onClick={saveServiceCharge} disabled={commissionLoading || !restaurantId}>
                        {commissionLoading ? <Spinner className="h-3.5 w-3.5" /> : t('settings_save', 'Сохранить')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title={t('settings_staff_fines_title', 'Штрафы и бонусы')} eyebrow={t('settings_staff_control', 'Персонал')} description={t('settings_staff_fines_desc', 'Управление штрафами и бонусами сотрудников. Суммы автоматически учитываются в расчёте зарплаты.')}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-theme bg-black/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ban className="h-4 w-4 text-[#f97360]" />
                    <span className="text-sm font-semibold text-theme">{t('settings_fines', 'Штрафы')}</span>
                  </div>
                  <button onClick={() => {
                    if (toArray(staffList).length === 0) {
                      toast.error(t('settings_no_staff_for_fines', 'Сначала добавьте сотрудников в Team'));
                      navigate('/users');
                      return;
                    }
                    setShowFineModal(true);
                  }} className="flex items-center gap-1 text-xs font-semibold text-[#f97360] transition hover:text-theme">
                    <Plus className="h-3 w-3" />{t('add', 'Добавить')}
                  </button>
                </div>
                <div className="mt-3 max-h-40 space-y-1.5 overflow-y-auto">
                  {toArray(fines).slice(0, 10).map(f => (
                    <div key={f.id} className="flex items-center justify-between rounded-xl border border-theme bg-white/[0.03] px-3 py-2 text-xs">
                      <span className="text-theme-secondary">{f.user_name} — {f.reason}</span>
                      <span className="font-semibold text-red-400">-{Number(f.amount).toLocaleString()} UZS</span>
                    </div>
                  ))}
                  {toArray(fines).length === 0 && <p className="text-xs text-theme-muted">{t('settings_no_fines', 'Нет штрафов')}</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-theme bg-black/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-theme">{t('settings_bonuses', 'Бонусы')}</span>
                  </div>
                  <button onClick={() => {
                    if (toArray(staffList).length === 0) {
                      toast.error(t('settings_no_staff_for_bonuses', 'Сначала добавьте сотрудников в Team'));
                      navigate('/users');
                      return;
                    }
                    setShowBonusModal(true);
                  }} className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:text-theme">
                    <Plus className="h-3 w-3" />{t('add', 'Добавить')}
                  </button>
                </div>
                <div className="mt-3 max-h-40 space-y-1.5 overflow-y-auto">
                  {toArray(bonuses).slice(0, 10).map(b => (
                    <div key={b.id} className="flex items-center justify-between rounded-xl border border-theme bg-white/[0.03] px-3 py-2 text-xs">
                      <span className="text-theme-secondary">{b.user_name} — {b.reason}</span>
                      <span className="font-semibold text-emerald-400">+{Number(b.amount).toLocaleString()} UZS</span>
                    </div>
                  ))}
                  {toArray(bonuses).length === 0 && <p className="text-xs text-theme-muted">{t('settings_no_bonuses', 'Нет бонусов')}</p>}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title={t('settings_security_title', 'Аудит безопасности')} eyebrow={t('settings_security', 'Security')} description={t('settings_security_desc', 'События: отмены оплаченных заказов, возвраты, подозрительные скидки и операции с кассой.')}>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {toArray(securityEvents).length === 0 ? (
                <p className="py-4 text-center text-sm text-theme-muted">{t('settings_no_security_events', 'Нет событий')}</p>
              ) : toArray(securityEvents).slice(0, 20).map((ev: any) => (
                <div key={ev.id} className="flex items-start gap-3 rounded-xl border border-theme bg-black/10 px-4 py-3">
                  <ShieldAlert className={`mt-0.5 h-4 w-4 shrink-0 ${ev.event_type === 'ORDER_VOIDED' ? 'text-[#f97360]' : 'text-[#ffd28d]'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-theme">{ev.event_type}</span>
                      <span className="text-[10px] text-theme-muted">{new Date(ev.created_at).toLocaleString()}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-theme-secondary">
                      {ev.user_name && <span>{ev.user_name} · </span>}
                      {ev.payload?.total_amount && <span>{Number(ev.payload.total_amount).toLocaleString()} UZS</span>}
                      {ev.payload?.previous_status && <span> · {ev.payload.previous_status}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={t('settings_printers_title', 'Принтеры')} eyebrow="XPrinter" description={t('settings_printers_desc', 'Подключите чековый принтер один раз — дальше он будет работать сам.')}>
            <div className="rounded-2xl border border-theme bg-gradient-to-br from-[#8fd4ff]/10 to-transparent p-5">
              <div className="flex items-start gap-3">
                <Printer className="mt-1 h-8 w-8 shrink-0 text-[#8fd4ff]" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-theme">{t('settings_printers_step1', '1. Подключите XPrinter через USB к ПК в ресторане')}</h4>
                  <p className="mt-0.5 text-xs text-theme-secondary">{t('settings_printers_step1_desc', 'Нужен любой компьютер (Windows/macOS) с Node.js LTS с nodejs.org. Принтер сам определится.')}</p>

                  <h4 className="mt-4 text-sm font-semibold text-theme">{t('settings_printers_step2', '2. Запустите эту команду один раз')}</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {printWsUrl ? (
                      <>
                        <code className="flex-1 select-all overflow-auto whitespace-nowrap rounded-xl border border-theme bg-black/30 px-4 py-3 text-xs text-emerald-300">
                          npx https://waitly.uz/media/packages/waitly-print-1.0.1.tgz {printWsUrl} --install
                        </code>
                        <Button variant="outline" size="sm" onClick={() => {
                          const cmd = `npx https://waitly.uz/media/packages/waitly-print-1.0.1.tgz ${printWsUrl} --install`;
                          navigator.clipboard.writeText(cmd);
                          toast.success(t('settings_printers_copied', 'Команда скопирована!'));
                        }}>
                          {t('copy', 'Копировать')}
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-theme bg-black/30 px-4 py-3 text-xs text-theme-muted">
                        <Spinner className="h-3.5 w-3.5" />
                        {t('settings_printers_loading', 'Загрузка ссылки для подключения…')}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-theme-muted">{t('settings_printers_note', 'Агент сам установится в автозагрузку и будет запускаться при включении компьютера. Больше ничего делать не нужно.')}</p>

                  <h4 className="mt-4 text-sm font-semibold text-theme">{t('settings_printers_step3', '3. Готово — проверьте')}</h4>
                  <p className="mt-0.5 text-xs text-theme-secondary">{t('settings_printers_step3_desc', 'В консоли введите test — напечатается тестовая страница. Кухонные листы и чеки будут печататься автоматически при каждом заказе и оплате.')}</p>
                  <p className="mt-4 text-xs text-theme-secondary">{t('settings_printers_remove', 'Чтобы отключить: запустите ту же команду с флагом --uninstall.')}</p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title={t('settings_iiko_title', 'iikoCloud')} eyebrow="iiko" description={t('settings_iiko_desc', 'Подключите iikoCloud, чтобы меню синхронизировалось автоматически. Подходит для ресторанов с iiko.')}>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="iiko-key" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('settings_iiko_api_key', 'API ключ iikoCloud')}</Label>
                <InputGroup>
                  <InputGroupInput id="iiko-key" value={iikoApiKey} onChange={e => setIikoApiKey(e.target.value)} placeholder={t('settings_iiko_api_key', 'API ключ iikoCloud')} />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="iiko-org" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('settings_iiko_org_id', 'ID организации в iiko')}</Label>
                <InputGroup>
                  <InputGroupInput id="iiko-org" value={iikoOrgId} onChange={e => setIikoOrgId(e.target.value)} placeholder={t('settings_iiko_org_id', 'ID организации в iiko')} />
                </InputGroup>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" onClick={saveIikoSettings} disabled={iikoLoading || !restaurantId}>
                  {iikoLoading ? <Spinner className="mr-1.5 h-3.5 w-3.5" /> : null}{t('settings_iiko_save', 'Сохранить')}
                </Button>
                <Button size="sm" variant="outline" onClick={triggerIikoSync} disabled={iikoLoading || !restaurantId || !iikoApiKey}>
                  <RefreshCcw className={`mr-1.5 h-4 w-4 ${iikoLoading ? 'animate-spin' : ''}`} />
                  {t('settings_iiko_sync', 'Синхронизировать меню')}
                </Button>
              </div>
              {iikoLastSync && (
                <p className="text-xs text-theme-muted">{t('settings_iiko_last_sync', 'Последняя синхронизация')}: {new Date(iikoLastSync).toLocaleString('ru')}</p>
              )}
            </div>
          </Panel>
        </div>
        <Panel title={t('settings_workspace_tools_title', 'Workspace tools')} eyebrow={t('settings_separate_pages', 'Separate pages')} description={t('settings_workspace_tools_desc', 'Brand, online menu, and subscription now live on dedicated owner pages instead of one overloaded settings screen.')}>
          <div className="grid gap-4 md:grid-cols-3">
            <QuickLinkCard title={t('settings_brand_studio_title', 'Brand Studio')} description={t('settings_brand_studio_desc', 'Logo, cover, reviews card, and live preview.')} action={t('settings_brand_studio_action', 'Open Brand Studio')} onClick={() => navigate('/brand-studio')} />
            <QuickLinkCard title={t('settings_online_menu_title', 'Online Menu')} description={t('settings_online_menu_desc', 'Hero photo, menu-facing presentation, and booking settings.')} action={t('settings_online_menu_action', 'Open Online Menu Studio')} onClick={() => navigate('/online-menu-studio')} />
            <QuickLinkCard title={t('settings_subscription_title', 'Subscription')} description={t('settings_subscription_desc', 'Dedicated page for activation and workspace subscription state.')} action={t('settings_subscription_action', 'Open Subscription')} onClick={() => navigate('/subscription')} />
          </div>
        </Panel>
      </div>
    </AppShell>

    <Dialog open={showFineModal} onOpenChange={setShowFineModal}>
      <DialogContent className="border-theme bg-[var(--modal-bg)] text-theme">
        <DialogHeader>
          <DialogTitle>{t('settings_add_fine', 'Добавить штраф')}</DialogTitle>
          <DialogDescription>{t('settings_fine_modal_desc', 'Укажите сотрудника, причину и сумму штрафа.')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fine-user" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('settings_select_staff', 'Выберите сотрудника')}</Label>
            <select id="fine-user" value={fineForm.user} onChange={e => setFineForm({ ...fineForm, user: e.target.value })}
              className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
              <option value="" className="bg-[#09131e]">{t('settings_select_staff', 'Выберите сотрудника')}</option>
              {toArray(staffList).map((s: any) => <option key={s.id} value={s.id} className="bg-[#09131e]">{s.full_name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fine-reason" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('fine_reason_late', 'Причина')}</Label>
            <select id="fine-reason" value={fineForm.reason} onChange={e => setFineForm({ ...fineForm, reason: e.target.value })}
              className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
              {FINE_REASONS.map(r => <option key={r.value} value={r.value} className="bg-[#09131e]">{r.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fine-amount" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('settings_fine_amount', 'Сумма')}</Label>
            <InputGroup>
              <InputGroupInput id="fine-amount" type="number" value={fineForm.amount} onChange={e => setFineForm({ ...fineForm, amount: e.target.value })} placeholder={t('settings_fine_amount', 'Сумма')} />
            </InputGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fine-desc" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('settings_fine_desc', 'Описание')}</Label>
            <InputGroup>
              <InputGroupInput id="fine-desc" value={fineForm.description} onChange={e => setFineForm({ ...fineForm, description: e.target.value })} placeholder={t('settings_fine_desc', 'Описание')} />
            </InputGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowFineModal(false)}>{t('cancel', 'Отмена')}</Button>
          <Button variant="destructive" onClick={handleAddFine} disabled={!fineForm.user || !fineForm.amount}>
            <Ban className="mr-1.5 h-4 w-4" />{t('settings_add_fine', 'Добавить штраф')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={showBonusModal} onOpenChange={setShowBonusModal}>
      <DialogContent className="border-theme bg-[var(--modal-bg)] text-theme">
        <DialogHeader>
          <DialogTitle>{t('settings_add_bonus', 'Добавить бонус')}</DialogTitle>
          <DialogDescription>{t('settings_bonus_modal_desc', 'Укажите сотрудника, причину и сумму бонуса.')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bonus-user" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('settings_select_staff', 'Выберите сотрудника')}</Label>
            <select id="bonus-user" value={bonusForm.user} onChange={e => setBonusForm({ ...bonusForm, user: e.target.value })}
              className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-emerald-400/60">
              <option value="" className="bg-[#09131e]">{t('settings_select_staff', 'Выберите сотрудника')}</option>
              {toArray(staffList).map((s: any) => <option key={s.id} value={s.id} className="bg-[#09131e]">{s.full_name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bonus-reason" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('bonus_reason_review', 'Причина')}</Label>
            <select id="bonus-reason" value={bonusForm.reason} onChange={e => setBonusForm({ ...bonusForm, reason: e.target.value })}
              className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-emerald-400/60">
              {BONUS_REASONS.map(r => <option key={r.value} value={r.value} className="bg-[#09131e]">{r.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bonus-amount" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('settings_bonus_amount', 'Сумма')}</Label>
            <InputGroup>
              <InputGroupInput id="bonus-amount" type="number" value={bonusForm.amount} onChange={e => setBonusForm({ ...bonusForm, amount: e.target.value })} placeholder={t('settings_bonus_amount', 'Сумма')} />
            </InputGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bonus-desc" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('settings_bonus_desc', 'Описание')}</Label>
            <InputGroup>
              <InputGroupInput id="bonus-desc" value={bonusForm.description} onChange={e => setBonusForm({ ...bonusForm, description: e.target.value })} placeholder={t('settings_bonus_desc', 'Описание')} />
            </InputGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setShowBonusModal(false)}>{t('cancel', 'Отмена')}</Button>
          <Button onClick={handleAddBonus} disabled={!bonusForm.user || !bonusForm.amount}>
            <Gift className="mr-1.5 h-4 w-4" />{t('settings_add_bonus', 'Добавить бонус')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>);
}
function QuickLinkCard({ title, description, action, onClick }: { title: string; description: string; action: string; onClick: () => void }) {
  const { t } = useLocale();
  const [completed, setCompleted] = useState(() => localStorage.getItem(`setup_${title}`) === 'done');
  return (
    <button type="button" onClick={() => { onClick(); localStorage.setItem(`setup_${title}`, 'done'); setCompleted(true); }} className="group rounded-2xl border border-theme bg-black/10 p-5 text-left transition hover:border-[#8fd4ff]/25 hover:bg-white/[0.04]">
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-theme">{title}</div>
        {completed ? <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{t('settings_done', 'Done')}</span> : <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted">{t('settings_pending', 'Pending')}</span>}
      </div>
      <div className="mt-2 text-sm leading-7 text-theme-secondary">{description}</div>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#8fd4ff] transition group-hover:gap-3">{action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></div>
    </button>
  );
}
