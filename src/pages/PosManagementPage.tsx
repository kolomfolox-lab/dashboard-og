import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { showToast } from '@/lib/toast';
import {
  Archive, ChevronDown, Copy, KeyRound, Loader2, MonitorSmartphone, Plus, RefreshCw, Trash2, Check, X, QrCode, Timer, Smartphone,
} from 'lucide-react';

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export default function PosManagementPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const isOwnerRole = user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER' || user?.role === 'SUPER_ADMIN';
  const workspace = useOwnerWorkspace(isOwnerRole);
  const canGeneratePair = !!user && ['SUPER_ADMIN','CHAIN_OWNER','RESTAURANT_OWNER','MANAGER','HEAD_WAITER','WAITER','CASHIER','ADMIN'].includes(user.role || '') || isOwnerRole;
  const [pos, setPos] = useState<any>({});
  const [print, setPrint] = useState<any>({});
  const [staff, setStaff] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pinUser, setPinUser] = useState<string | null>(null);
  const [pinValue, setPinValue] = useState('');
  const [certForm, setCertForm] = useState({ code: '', amount: '' });

  const [archive, setArchive] = useState<any[]>([]);
  const [archLoading, setArchLoading] = useState(false);
  const [archDateFrom, setArchDateFrom] = useState('');
  const [archDateTo, setArchDateTo] = useState('');
  const [archMethod, setArchMethod] = useState('');
  const [archQuery, setArchQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  const [pairCode, setPairCode] = useState<string | null>(null);
  const [pairLink, setPairLink] = useState<string | null>(null);
  const [pairExpiresAt, setPairExpiresAt] = useState<string | null>(null);
  const [pairLeft, setPairLeft] = useState(0);
  const [pairLoading, setPairLoading] = useState(false);

  const [registers, setRegisters] = useState<any[]>([]);
  const [regName, setRegName] = useState('');
  const [regBusy, setRegBusy] = useState(false);
  // Password is returned by the API only once (on create/reset) — keep it on screen until dismissed.
  const [shownSecret, setShownSecret] = useState<{ username: string; password: string } | null>(null);

  const load = async () => {
    const rid = workspace.selectedRestaurantId;
    if (!rid) return;
    setLoading(true);
    try {
      const [posRes, printRes, staffRes, certRes, regRes] = await Promise.allSettled([
        ownerAPI.getPosSettings(rid),
        ownerAPI.getPosPrintStatus(rid),
        ownerAPI.getStaff(rid),
        ownerAPI.getPosCertificates(rid),
        ownerAPI.getPosRegisters(rid),
      ]);
      setPos(posRes.status === 'fulfilled' ? posRes.value.data : {});
      setPrint(printRes.status === 'fulfilled' ? printRes.value.data : {});
      setStaff(posRes.status === 'fulfilled' ? toArray(staffRes.status === 'fulfilled' ? staffRes.value.data : []) : []);
      setCerts(certRes.status === 'fulfilled' ? toArray(certRes.value.data) : []);
      setRegisters(regRes.status === 'fulfilled' ? toArray(regRes.value.data?.registers ?? regRes.value.data) : []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const updatePos = async (patch: any) => {
    try {
      setSaving(true);
      const res = await ownerAPI.updatePosSettings({ restaurant_id: workspace.selectedRestaurantId, ...patch });
      setPos(res.data);
      showToast('Сохранено', 'success');
    } catch { showToast('Ошибка', 'error'); }
    finally { setSaving(false); }
  };

  const savePin = async () => {
    if (!pinUser || !/^\d{4}$/.test(pinValue.trim())) {
      showToast('PIN должен быть ровно 4 цифры', 'error');
      return;
    }
    try {
      await ownerAPI.setStaffPin(pinUser, pinValue.trim());
      showToast('PIN сохранён', 'success');
      setPinUser(null);
      setPinValue('');
      await load();
    } catch (e: any) {
      showToast(e?.response?.data?.error?.message || 'Ошибка', 'error');
    }
  };

  const clearPin = async (id: string) => {
    try {
      await ownerAPI.clearStaffPin(id);
      showToast('PIN удалён', 'success');
      await load();
    } catch { showToast('Ошибка', 'error'); }
  };

  const createCert = async () => {
    if (!certForm.code.trim() || !certForm.amount) {
      showToast('Введите код и сумму', 'error');
      return;
    }
    try {
      await ownerAPI.createPosCertificate({
        restaurant_id: workspace.selectedRestaurantId,
        code: certForm.code.trim().toUpperCase(),
        amount: Number(certForm.amount),
      });
      showToast('Сертификат создан', 'success');
      setCertForm({ code: '', amount: '' });
      await load();
    } catch (e: any) {
      showToast(e?.response?.data?.error?.message || 'Ошибка', 'error');
    }
  };

  const deleteCert = async (id: string) => {
    if (!confirm('Деактивировать сертификат?')) return;
    try {
      await ownerAPI.deletePosCertificate(id);
      showToast('Сертификат деактивирован', 'success');
      await load();
    } catch { showToast('Ошибка', 'error'); }
  };

  const loadArchive = async () => {
    setArchLoading(true);
    try {
      const res = await ownerAPI.getPosArchive({
        restaurant_id: workspace.selectedRestaurantId,
        date_from: archDateFrom || undefined,
        date_to: archDateTo || undefined,
        method: archMethod || undefined,
        q: archQuery || undefined,
        limit: 200,
      });
      setArchive(res.data?.checks || []);
    } catch { setArchive([]); }
    finally { setArchLoading(false); }
  };

  useEffect(() => { void loadArchive(); /* eslint-disable-next-line */ }, [workspace.selectedRestaurantId]);

  useEffect(() => {
    if (!pairExpiresAt) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((new Date(pairExpiresAt).getTime() - Date.now()) / 1000));
      setPairLeft(left);
      if (left <= 0) { setPairCode(null); setPairLink(null); setPairExpiresAt(null); }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [pairExpiresAt]);

  const generatePair = async () => {
    const rid = workspace.selectedRestaurantId || (user as any)?.restaurant_id || pos?.restaurant_id;
    try {
      setPairLoading(true);
      const res = await ownerAPI.createPosPairCode(rid);
      setPairCode(res.data.code);
      setPairLink(res.data.magic_link);
      setPairExpiresAt(res.data.expires_at);
      setPairLeft(90);
      showToast(`Код ${res.data.code} — 90 сек`, 'success');
    } catch (e: any) { showToast(e?.response?.data?.error?.message || e?.response?.data?.detail || 'Ошибка генерации', 'error'); }
    finally { setPairLoading(false); }
  };

  const createRegister = async () => {
    if (!regName.trim()) { showToast('Введите название кассы', 'error'); return; }
    try {
      setRegBusy(true);
      const res = await ownerAPI.createPosRegister({
        restaurant_id: workspace.selectedRestaurantId || (user as any)?.restaurant_id || undefined,
        name: regName.trim(),
      });
      setShownSecret({ username: res.data.username, password: res.data.password });
      setRegName('');
      showToast('Касса создана', 'success');
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error?.message || 'Ошибка', 'error'); }
    finally { setRegBusy(false); }
  };

  const resetRegisterPassword = async (id: string) => {
    if (!confirm('Сгенерировать новый пароль? Старый пароль перестанет работать.')) return;
    try {
      const res = await ownerAPI.resetPosRegisterPassword(id);
      setShownSecret({ username: res.data.username, password: res.data.password });
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error?.message || 'Ошибка', 'error'); }
  };

  const unbindRegister = async (id: string) => {
    if (!confirm('Отвязать кассу от устройства? После этого к ней сможет подключиться другой браузер.')) return;
    try {
      await ownerAPI.unbindPosRegister(id);
      showToast('Касса отвязана', 'success');
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error?.message || 'Ошибка', 'error'); }
  };

  const toggleRegister = async (id: string, isActive: boolean) => {
    try {
      await ownerAPI.updatePosRegister(id, { is_active: isActive });
      showToast(isActive ? 'Касса включена' : 'Касса выключена', 'success');
      await load();
    } catch (e: any) { showToast(e?.response?.data?.error?.message || 'Ошибка', 'error'); }
  };

  const saveComment = async (id: string) => {
    try {
      await ownerAPI.addPosArchiveComment(id, commentDraft[id] || '');
      showToast('Комментарий сохранён', 'success');
      await loadArchive();
    } catch { showToast('Ошибка', 'error'); }
  };

  const methodLabel = (m: string) => {
    switch (m) {
      case 'CASH': return 'Наличными';
      case 'CARD': return 'Карточкой';
      case 'CERTIFICATE': return 'Сертификатом';
      case 'CLOSED_NO_PAYMENT': return 'Закрыт без оплаты';
      case 'REFUND': return 'Возврат';
      default: return '—';
    }
  };

  const fmtDate = (iso?: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-white/20" /></div>;
  }

  return (
    <AppShell
      title="Касса (POS)"
      subtitle="Приложение-касса для планшета, PIN-коды сотрудников, сертификаты"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <Panel title={<span className="flex items-center gap-2"><MonitorSmartphone className="h-5 w-5" /> Приложение-касса</span>}>
          <p className="mb-3 text-sm text-white/50">
            Откройте ссылку на планшете — она установится как приложение (PWA). Вход по PIN определяет, кто выполнил действие.
          </p>
          {canGeneratePair ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300"><QrCode className="h-4 w-4" /> Magic Pair — мгновенное подключение моноблока</div>
              <p className="mt-1 text-xs text-white/60">Официант/менеджер жмёт «Показать QR» → на кассе сканируют → PWA сама подхватывает <code>pwa.waitly.uz/pair/{"{code}"}</code> за 90с (одноразовый).</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button onClick={generatePair} disabled={pairLoading || !workspace.selectedRestaurantId && !(user as any)?.restaurant_id && !pos?.restaurant_id}>
                  {pairLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />} Показать QR
                </Button>
                {pairCode ? (
                  <>
                    <div className="rounded-xl bg-white p-3">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pairLink || '')}`} alt="QR" className="h-[120px] w-[120px]" />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <div className="text-3xl font-black tracking-[0.2em] text-white">{pairCode}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-amber-300"><Timer className="h-3.5 w-3.5" /> {pairLeft}с до истечения</div>
                      <code className="mt-1 block truncate rounded bg-white/10 px-2 py-1 text-[11px] text-emerald-300">{pairLink}</code>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(pairLink || '').then(() => showToast('Magic Link скопирован','success'))}><Copy className="mr-1 h-3.5 w-3.5" /> Копировать ссылку</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setPairCode(null); setPairLink(null); setPairExpiresAt(null); }}>Сбросить</Button>
                      </div>
                    </div>
                  </>
                ) : <span className="text-xs text-white/40">Рабочие (официанты) тоже могут генерировать для своих касс</span>}
              </div>
            </div>
          ) : null}
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <span className="text-sm text-white/60">
                {pos.pin_policy_fixed
                  ? 'PIN обязателен (кофейня)'
                  : pos.pin_required ? 'PIN вход включён' : 'PIN вход выключен (ресторан)'}
              </span>
              <button
                disabled={pos.pin_policy_fixed || saving}
                onClick={() => updatePos({ pin_required: !pos.pin_required })}
                className={`relative h-7 w-12 rounded-full transition-colors ${pos.pin_required ? 'bg-emerald-500' : 'bg-white/15'} disabled:opacity-40`}
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${pos.pin_required ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-xl bg-white/5 px-3 py-2 text-xs text-emerald-300">{pos.pos_url || '—'}</code>
              <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(pos.pos_url || '').then(() => showToast('Ссылка скопирована', 'success'))}>
                <Copy className="mr-1 h-3.5 w-3.5" /> Копировать
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { if (confirm('Сгенерировать новый секрет? Старая ссылка перестанет работать.')) updatePos({ regenerate_secret: true }); }} disabled={saving}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Ссылка
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={print.connected ? 'text-emerald-300' : 'text-amber-300'}>
                {print.connected ? '● Принтер подключён' : print.printer_bound ? '● Принтер не подключён' : '● Принтер не привязан'}
              </span>
            </div>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><Smartphone className="h-5 w-5" /> Кассы заведения (логин + пароль)</span>}>
          <p className="mb-3 text-sm text-white/50">
            Создайте кассу и выдайте сотрудникам логин с паролем — вход на планшете через «Войти по логину кассы».
            Логин у всех касс одинаковый (название заведения), пароль определяет конкретную кассу. Касса привязывается
            к первому браузеру; другой браузер сможет войти только после отвязки.
          </p>

          {shownSecret && (
            <div className="mb-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="text-sm font-bold text-emerald-300">Пароль показан один раз — запишите или скопируйте его сейчас</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="rounded-xl bg-black/30 px-4 py-2 font-mono text-xl font-black tracking-[0.25em] text-white">{shownSecret.password}</span>
                <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(`Логин: ${shownSecret.username}\nПароль: ${shownSecret.password}`).then(() => showToast('Скопировано', 'success'))}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Копировать
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShownSecret(null)}>Скрыть</Button>
              </div>
              <div className="mt-1 text-xs text-white/50">Логин: <code className="text-emerald-300">{shownSecret.username}</code></div>
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-theme-muted">Название кассы</label>
              <input
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Касса у входа / Бар"
                className="w-56 rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>
            <Button onClick={createRegister} disabled={regBusy || !workspace.selectedRestaurantId && !(user as any)?.restaurant_id}>
              {regBusy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />} Создать кассу
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-theme">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme text-left text-xs uppercase tracking-wide text-theme-muted">
                  <th className="px-3 py-2">Касса</th>
                  <th className="px-3 py-2">Логин</th>
                  <th className="px-3 py-2">Устройство</th>
                  <th className="px-3 py-2">Последний вход</th>
                  <th className="px-3 py-2 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {registers.length === 0 ? (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-theme-muted">Касс ещё нет — создайте первую</td></tr>
                ) : registers.map((r: any) => (
                  <tr key={r.id} className={`border-b border-theme ${!r.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-3 py-2 font-semibold text-theme">{r.name}</td>
                    <td className="px-3 py-2"><code className="text-emerald-300">{r.username}</code></td>
                    <td className="px-3 py-2 text-theme-secondary">
                      {r.is_bound ? `привязана · ${fmtDate(r.bound_at)}` : 'не привязана'}
                    </td>
                    <td className="px-3 py-2 text-theme-secondary">{fmtDate(r.last_login_at)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => resetRegisterPassword(r.id)}>
                          <KeyRound className="mr-1 h-3.5 w-3.5" /> Пароль
                        </Button>
                        {r.is_bound ? (
                          <Button size="sm" variant="ghost" onClick={() => unbindRegister(r.id)}>Отвязать</Button>
                        ) : null}
                        <Button size="sm" variant="ghost" onClick={() => toggleRegister(r.id, !r.is_active)}>
                          {r.is_active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> PIN сотрудников</span>}>
          <div className="overflow-hidden rounded-2xl border border-theme">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme text-left text-xs uppercase tracking-wide text-theme-muted">
                  <th className="px-3 py-2">Имя</th>
                  <th className="px-3 py-2">Должность</th>
                  <th className="px-3 py-2 text-right">PIN</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr><td colSpan={3} className="px-3 py-6 text-center text-theme-muted">Нет сотрудников</td></tr>
                ) : staff.map((s: any) => (
                  <tr key={s.id} className="border-b border-theme">
                    <td className="px-3 py-2 font-semibold text-theme">{s.full_name}</td>
                    <td className="px-3 py-2 text-theme-secondary">{s.role}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => { setPinUser(s.id); setPinValue(''); }}>
                          {s.has_pin ? <><Check className="mr-1 h-3.5 w-3.5 text-emerald-400" /> Сменить</> : <><Plus className="mr-1 h-3.5 w-3.5" /> Задать</>}
                        </Button>
                        {s.has_pin ? (
                          <Button size="sm" variant="ghost" onClick={() => clearPin(s.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pinUser ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-theme bg-white/5 p-4">
              <input
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                placeholder="••••"
                className="w-40 rounded-xl bg-white/10 px-3 py-2 text-center text-lg tracking-[0.5em] text-white"
                autoFocus
              />
              <Button onClick={savePin}>Сохранить</Button>
              <Button variant="ghost" onClick={() => setPinUser(null)}>Отмена</Button>
            </div>
          ) : null}
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><Plus className="h-5 w-5" /> Сертификаты</span>}>
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-theme-muted">Код</label>
              <input
                value={certForm.code}
                onChange={(e) => setCertForm({ ...certForm, code: e.target.value })}
                placeholder="CERT-100"
                className="w-40 rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-theme-muted">Сумма (сум)</label>
              <input
                value={certForm.amount}
                onChange={(e) => setCertForm({ ...certForm, amount: e.target.value.replace(/\D/g, '') })}
                inputMode="numeric"
                placeholder="100000"
                className="w-40 rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              />
            </div>
            <Button onClick={createCert}><Plus className="mr-1 h-4 w-4" /> Создать</Button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-theme">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-theme text-left text-xs uppercase tracking-wide text-theme-muted">
                  <th className="px-3 py-2">Код</th>
                  <th className="px-3 py-2 text-right">Баланс</th>
                  <th className="px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {certs.length === 0 ? (
                  <tr><td colSpan={3} className="px-3 py-6 text-center text-theme-muted">Нет сертификатов</td></tr>
                ) : certs.map((c: any) => (
                  <tr key={c.id} className="border-b border-theme">
                    <td className="px-3 py-2 font-semibold text-theme">{c.code}</td>
                    <td className="px-3 py-2 text-right text-theme-secondary">
                      {Number(c.balance).toLocaleString()} сум
                      {!c.is_active ? ' (выкл)' : ''}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => deleteCert(c.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><Archive className="h-5 w-5" /> Архив чеков</span>}>
          <div className="mb-3 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-theme-muted">С</label>
              <input type="date" value={archDateFrom} onChange={(e) => setArchDateFrom(e.target.value)} className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-theme-muted">По</label>
              <input type="date" value={archDateTo} onChange={(e) => setArchDateTo(e.target.value)} className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-theme-muted">Оплата</label>
              <select value={archMethod} onChange={(e) => setArchMethod(e.target.value)} className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white">
                <option value="">Все</option>
                <option value="CASH">Наличными</option>
                <option value="CARD">Карточкой</option>
                <option value="CERTIFICATE">Сертификатом</option>
                <option value="CLOSED_NO_PAYMENT">Закрыт без оплаты</option>
                <option value="REFUND">Возвраты</option>
              </select>
            </div>
            <input
              value={archQuery}
              onChange={(e) => setArchQuery(e.target.value)}
              placeholder="№ чека, кассир, комментарий…"
              className="w-56 rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
            <Button onClick={loadArchive}><RefreshCw className="mr-1 h-4 w-4" /> Показать</Button>
          </div>

          {archLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-white/20" /></div>
          ) : archive.length === 0 ? (
            <p className="py-8 text-center text-theme-muted">Чеки не найдены</p>
          ) : (
            <div className="space-y-2">
              {archive.map((c: any) => {
                const open = expanded === c.id;
                return (
                  <div key={c.id} className="rounded-2xl border border-theme bg-white/5">
                    <button
                      className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left"
                      onClick={() => setExpanded(open ? null : c.id)}
                    >
                      <ChevronDown className={`h-4 w-4 text-theme-muted transition-transform ${open ? 'rotate-180' : ''}`} />
                      <span className="font-bold text-theme">Чек №{c.order_number}</span>
                      <span className="text-sm text-theme-secondary">{c.waiter_name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        c.method === 'CASH' ? 'bg-emerald-500/15 text-emerald-300'
                        : c.method === 'CLOSED_NO_PAYMENT' ? 'bg-red-500/15 text-red-300'
                        : c.method === 'REFUND' ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-sky-500/15 text-sky-300'
                      }`}>
                        {methodLabel(c.method)}
                      </span>
                      <span className="ml-auto font-bold text-theme">{Number(c.total_amount).toLocaleString()} сум</span>
                    </button>
                    {open ? (
                      <div className="border-t border-theme px-4 py-3">
                        <div className="grid gap-1 text-sm text-theme-secondary sm:grid-cols-3">
                          <span>Открыт: {fmtDate(c.opened_at)}</span>
                          <span>Закрыт: {fmtDate(c.closed_at)}</span>
                          <span>Кассир: {c.waiter_name} {c.table_number ? `· стол ${c.table_number}` : ''}</span>
                        </div>
                        <table className="mt-3 w-full text-sm">
                          <thead>
                            <tr className="border-b border-theme text-left text-xs uppercase tracking-wide text-theme-muted">
                              <th className="py-1">Наименование</th>
                              <th className="py-1 text-right">Кол-во</th>
                              <th className="py-1 text-right">Цена</th>
                              <th className="py-1 text-right">Итого</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(c.items || []).map((it: any, i: number) => (
                              <tr key={i} className="border-b border-theme/50">
                                <td className="py-1">{it.name}{it.notes ? <span className="text-theme-muted"> · {it.notes}</span> : null}</td>
                                <td className="py-1 text-right">{it.quantity}</td>
                                <td className="py-1 text-right">{Number(it.price).toLocaleString()}</td>
                                <td className="py-1 text-right font-semibold">{Number(it.total).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {Number(c.discount) > 0 ? (
                          <p className="mt-2 text-sm font-semibold text-emerald-300">Скидка: −{Number(c.discount).toLocaleString()} сум</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <input
                            value={commentDraft[c.id] ?? c.comment ?? ''}
                            onChange={(e) => setCommentDraft({ ...commentDraft, [c.id]: e.target.value })}
                            placeholder="Комментарий к чеку…"
                            className="min-w-0 flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
                          />
                          <Button size="sm" variant="secondary" onClick={() => saveComment(c.id)}>
                            <Check className="mr-1 h-3.5 w-3.5" /> Сохранить
                          </Button>
                        </div>
                        {c.comment ? <p className="mt-2 text-xs text-theme-muted">Комментарий: {c.comment}</p> : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

      </div>
    </AppShell>
  );
}
