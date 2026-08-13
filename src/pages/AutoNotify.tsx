import { Bell, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { marketingAPI } from '@/services/api';

const TRIGGERS = [
  { value: 'BIRTHDAY', label: 'Guest birthday' },
  { value: 'BOOKING_REMINDER', label: 'Booking reminder' },
  { value: 'VISIT_FOLLOWUP', label: 'Post-visit follow-up' },
  { value: 'LOYALTY_MILESTONE', label: 'Loyalty milestone' },
];

export default function AutoNotifyPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ trigger: 'BIRTHDAY', channel: 'TELEGRAM', template: '', send_before_minutes: 0 });

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const res = await marketingAPI.getAutoNotifySettings(workspace.selectedRestaurantId);
      setSettings(res.data.results || res.data || []);
    } catch { setSettings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const create = async () => {
    try {
      await marketingAPI.createAutoNotifySetting({ ...form, restaurant: workspace.selectedRestaurantId });
      setShowForm(false);
      setForm({ trigger: 'BIRTHDAY', channel: 'TELEGRAM', template: '', send_before_minutes: 0 });
      await load();
    } catch {}
  };

  const remove = async (id: string) => {
    try { await marketingAPI.deleteAutoNotifySetting(id); await load(); } catch {}
  };

  const getTriggerLabel = (val: string) => {
    const tr = TRIGGERS.find(x => x.value === val);
    return tr ? t(`autoNotify_trigger_${val.toLowerCase()}`, tr.label) : val;
  };

  return (
    <AppShell title={t('autoNotify_title', 'Auto Notify')} subtitle={t('autoNotify_subtitle', 'Automated notifications for guests via SMS or Telegram.')} eyebrow={t('autoNotify_eyebrow', 'Waitly Marketing')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2">
          <div className="text-xs text-white/40">{t('autoNotify_metric_total', 'Всего правил')}</div>
          <div className="text-lg font-bold text-white">{settings.length}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2">
          <div className="text-xs text-white/40">{t('autoNotify_metric_active', 'Активных')}</div>
          <div className="text-lg font-bold text-emerald-400">{settings.filter(s => s.is_active).length}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-2">
          <div className="text-xs text-white/40">{t('autoNotify_metric_sent', 'Уведомлений отправлено')}</div>
          <div className="text-lg font-bold text-[#8fd4ff]">{settings.reduce((sum, s) => sum + (s.sent_count || 0), 0).toLocaleString()}</div>
        </div>
      </div>
      <Panel title={t('autoNotify_rules_title', 'Notification rules')} eyebrow={t('autoNotify_rules_eyebrow', 'Auto-notify')} action={
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" />{showForm ? t('autoNotify_cancel', 'Cancel') : t('autoNotify_new_rule', 'New rule')}
        </Button>
      }>
        {showForm ? (
          <div className="mb-5 grid gap-4 rounded-[24px] border border-theme bg-theme-panel p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-theme-secondary">{t('autoNotify_trigger_label', 'Trigger')}</label>
                <select value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none">
                  {TRIGGERS.map(tr => <option key={tr.value} value={tr.value}>{t(`autoNotify_trigger_${tr.value.toLowerCase()}`, tr.label)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-theme-secondary">{t('autoNotify_channel_label', 'Channel')}</label>
                <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none">
                  <option value="TELEGRAM">{t('autoNotify_channel_telegram', 'Telegram')}</option>
                  <option value="SMS">{t('autoNotify_channel_sms', 'SMS')}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-theme-secondary">{t('autoNotify_send_before', 'Send before (min)')}</label>
                <input type="number" value={form.send_before_minutes} onChange={e => setForm(f => ({ ...f, send_before_minutes: +e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary">{t('autoNotify_template_label', 'Template')}</label>
              <textarea value={form.template} onChange={e => setForm(f => ({ ...f, template: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" rows={3}
                placeholder={t('autoNotify_template_placeholder', 'Hello {guest_name}, reminder about your booking at {restaurant_name}!')} />
            </div>
            <div>
              <Button onClick={create}><Bell className="mr-2 h-4 w-4" />{t('autoNotify_create_rule', 'Create rule')}</Button>
            </div>
          </div>
        ) : null}

        <DataTable
          columns={[
            { label: t('autoNotify_col_trigger', 'Trigger'), key: 'trigger', render: (row) => getTriggerLabel(row.trigger) },
            { label: t('autoNotify_col_channel', 'Channel'), key: 'channel' },
            { label: t('autoNotify_col_template', 'Template'), key: 'template', render: (row) => <span className="text-xs">{row.template?.substring(0, 60)}...</span> },
            { label: t('autoNotify_col_before', 'Before'), key: 'send_before_minutes', render: (row) => row.send_before_minutes ? `${row.send_before_minutes} ${t('autoNotify_min', 'min')}` : t('autoNotify_dash', '—') },
            { label: t('autoNotify_col_sent', 'Sent'), key: 'sent_count', render: (row) => row.sent_count ?? 0 },
            { label: t('autoNotify_col_last_triggered', 'Last triggered'), key: 'last_triggered', render: (row) => row.last_triggered ? new Date(row.last_triggered).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'en' ? 'en-US' : 'ru-RU') : t('autoNotify_dash', '—') },
            { label: '', key: 'id', render: (row) => (
              <Button variant="ghost" size="sm" onClick={() => remove(row.id)}><Trash2 className="h-3 w-3 text-red-400" /></Button>
            )},
          ]}
          rows={settings}
          emptyMessage={t('autoNotify_empty', 'No notification rules yet.')}
        />
      </Panel>
    </AppShell>
  );
}
