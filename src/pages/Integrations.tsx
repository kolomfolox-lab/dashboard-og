import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, paymentSettingsAPI } from '@/services/api';
import { showToast } from '@/lib/toast';
import { CreditCard, KeyRound, Loader2, Save, RefreshCw, Building2, ShieldCheck, MonitorSmartphone, Copy } from 'lucide-react';

export default function IntegrationsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [iiko, setIiko] = useState<any>({ api_key: '', org_id: '' });
  const [payments, setPayments] = useState<any>({});
  const [pos, setPos] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingPos, setSavingPos] = useState(false);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const [iikoRes, payRes, posRes] = await Promise.allSettled([
        ownerAPI.getIikoSettings(workspace.selectedRestaurantId),
        paymentSettingsAPI.get(workspace.selectedRestaurantId),
        ownerAPI.getPosSettings(workspace.selectedRestaurantId),
      ]);
      setIiko(iikoRes.status === 'fulfilled' ? (iikoRes.value.data || { api_key: '', org_id: '' }) : { api_key: '', org_id: '' });
      setPayments(payRes.status === 'fulfilled' ? (payRes.value.data || {}) : {});
      setPos(posRes.status === 'fulfilled' ? (posRes.value.data || {}) : {});
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const saveIiko = async () => {
    try {
      await ownerAPI.updateIikoSettings({ restaurant_id: workspace.selectedRestaurantId, ...iiko });
      showToast('iikoCloud saved', 'success');
    } catch { showToast('Failed', 'error'); }
  };

  const syncIiko = async () => {
    try { setSyncing(true); await ownerAPI.syncIikoMenu({ restaurant_id: workspace.selectedRestaurantId }); showToast('Sync started', 'success'); }
    catch { showToast('Failed', 'error'); }
    finally { setSyncing(false); }
  };

  const savePayments = async (field: string, value: any) => {
    try {
      await paymentSettingsAPI.update({ restaurant_id: workspace.selectedRestaurantId, [field]: value });
      setPayments((p: any) => ({ ...p, [field]: value }));
      showToast('Saved', 'success');
    } catch { showToast('Failed', 'error'); }
  };

  const updatePos = async (patch: any) => {
    try {
      setSavingPos(true);
      const res = await ownerAPI.updatePosSettings({ restaurant_id: workspace.selectedRestaurantId, ...patch });
      setPos(res.data);
      showToast('POS saved', 'success');
    } catch { showToast('Failed', 'error'); }
    finally { setSavingPos(false); }
  };

  const copyPosLink = () => {
    navigator.clipboard?.writeText(pos.pos_url || '').then(() => showToast('Ссылка скопирована', 'success'));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-white/20" /></div>;

  return (
    <AppShell
      title="Интеграции"
      subtitle="Платёжные системы, POS и внешние сервисы"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.selectRestaurant}
    >
      <div className="space-y-4">

        <Panel title={<span className="flex items-center gap-2"><Building2 className="h-5 w-5" /> ИНН</span>}>
          <p className="text-sm text-white/50 mb-3">ИНН для фискальных чеков и интеграции с налоговой</p>
          <div className="flex gap-3">
            <input
              placeholder="Введите ИНН (12 цифр)"
              maxLength={20}
              className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={payments.inn || ''}
              onChange={e => setPayments((p: any) => ({ ...p, inn: e.target.value }))}
            />
            <Button onClick={() => savePayments('inn', payments.inn)}><Save className="mr-1 h-4 w-4" /> Сохранить</Button>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><MonitorSmartphone className="h-5 w-5" /> Касса (POS PWA)</span>}>
          <p className="text-sm text-white/50 mb-3">
            Приложение-касса для планшета. Вход по 4-значному PIN — по нему определяется, кто выполнил действие.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
              <span className="text-sm text-white/60">
                {pos.pin_policy_fixed
                  ? 'PIN обязателен (кофейня)'
                  : pos.pin_required
                    ? 'PIN вход включён'
                    : 'PIN вход выключен (ресторан)'}
              </span>
              <button
                disabled={pos.pin_policy_fixed || savingPos}
                onClick={() => updatePos({ pin_required: !pos.pin_required })}
                className={`relative h-7 w-12 rounded-full transition-colors ${pos.pin_required ? 'bg-emerald-500' : 'bg-white/15'} disabled:opacity-40`}
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${pos.pin_required ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-xl bg-white/5 px-3 py-2 text-xs text-emerald-300">{pos.pos_url || '—'}</code>
              <Button size="sm" variant="secondary" onClick={copyPosLink}><Copy className="mr-1 h-3.5 w-3.5" /> Копировать</Button>
            </div>
            <p className="text-xs text-white/35">
              Откройте ссылку на планшете — она добавится на главный экран как приложение (PWA). PIN сотрудникам задаётся в разделе «Команда».
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { if (confirm('Сгенерировать новый секрет кассы? Старая ссылка перестанет работать.')) updatePos({ regenerate_secret: true }); }}
              disabled={savingPos}
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" /> Перевыпустить ссылку
            </Button>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Payme</span>}>
          <p className="text-sm text-white/50 mb-3">Приём платежей через Payme (payme.uz)</p>
          <div className="space-y-3">
            <input placeholder="Merchant ID" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={payments.payme_merchant_id || ''} onChange={e => setPayments((p: any) => ({ ...p, payme_merchant_id: e.target.value }))} />
            <input placeholder="KEY (пароль кассы)" type="password" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={payments.payme_key || ''} onChange={e => setPayments((p: any) => ({ ...p, payme_key: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={payments.payme_test_mode !== false} onChange={e => setPayments((p: any) => ({ ...p, payme_test_mode: e.target.checked }))} />
              Тестовый режим
            </label>
            <Button onClick={() => { savePayments('payme_merchant_id', payments.payme_merchant_id); savePayments('payme_key', payments.payme_key); savePayments('payme_test_mode', payments.payme_test_mode); }}>
              <ShieldCheck className="mr-1 h-4 w-4" /> Сохранить Payme
            </Button>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> UzKassa (ГНК)</span>}>
          <p className="text-sm text-white/50 mb-3">Интеграция с Государственным Налоговым Комитетом через UzKassa</p>
          <div className="space-y-3">
            <input placeholder="Логин" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={payments.uzkassa_login || ''} onChange={e => setPayments((p: any) => ({ ...p, uzkassa_login: e.target.value }))} />
            <input placeholder="Пароль" type="password" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={payments.uzkassa_password || ''} onChange={e => setPayments((p: any) => ({ ...p, uzkassa_password: e.target.value }))} />
            <input placeholder="Terminal ID" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={payments.uzkassa_terminal_id || ''} onChange={e => setPayments((p: any) => ({ ...p, uzkassa_terminal_id: e.target.value }))} />
            <Button onClick={() => { savePayments('uzkassa_login', payments.uzkassa_login); savePayments('uzkassa_password', payments.uzkassa_password); savePayments('uzkassa_terminal_id', payments.uzkassa_terminal_id); }}>
              <ShieldCheck className="mr-1 h-4 w-4" /> Сохранить UzKassa
            </Button>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><RefreshCw className="h-5 w-5" /> iikoCloud</span>}>
          <p className="text-sm text-white/50 mb-3">Синхронизация меню и заказов с iiko</p>
          <div className="space-y-3">
            <input placeholder="API Key" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={iiko.api_key || ''} onChange={e => setIiko((p: any) => ({ ...p, api_key: e.target.value }))} />
            <input placeholder="Organization ID" className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30"
              value={iiko.org_id || ''} onChange={e => setIiko((p: any) => ({ ...p, org_id: e.target.value }))} />
            <div className="flex gap-3">
              <Button onClick={saveIiko}><Save className="mr-1 h-4 w-4" /> Сохранить</Button>
              <Button onClick={syncIiko} disabled={syncing}>
                {syncing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
                Синхронизировать меню
              </Button>
            </div>
          </div>
        </Panel>

      </div>
    </AppShell>
  );
}
