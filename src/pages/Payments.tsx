import { CreditCard, Plus, Smartphone, Building, Trash2, Receipt, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { paymentsAPI } from '@/services/api';

const PROVIDERS = [
  { value: 'PAYME', label: 'Payme', icon: Smartphone, color: 'text-[#33b56d]' },
  { value: 'CLICK', label: 'Click', icon: Building, color: 'text-[#00a3e0]' },
  { value: 'UZUM', label: 'Uzum', icon: CreditCard, color: 'text-[#fc5a3a]' },
];

const FISCAL_PROVIDERS = [
  { value: 'MOCK', label: 'Mock (test mode)' },
  { value: 'UZKASSA', label: 'UzKassa' },
  { value: 'ATLAS', label: 'Atlas' },
  { value: 'SOLARLAB', label: 'Solarlab' },
];

type Tab = 'merchants' | 'fiscal';

export default function PaymentsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [tab, setTab] = useState<Tab>('merchants');

  const [configs, setConfigs] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ provider: 'PAYME', merchant_id: '', merchant_key: '', terminal_id: '', is_active: true });

  // Fiscal state
  const [fiscalConfig, setFiscalConfig] = useState<any>(null);
  const [fiscalReceipts, setFiscalReceipts] = useState<any[]>([]);
  const [fiscalForm, setFiscalForm] = useState({ provider: 'MOCK', api_key: '', terminal_id: '', tin: '', is_active: false });
  const [savingFiscal, setSavingFiscal] = useState(false);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    setError('');
    try {
      const [cfgRes, txRes] = await Promise.all([
        paymentsAPI.getMerchantConfigs(workspace.selectedRestaurantId),
        paymentsAPI.getTransactions(workspace.selectedRestaurantId),
      ]);
      setConfigs(cfgRes.data.results || cfgRes.data || []);
      setTransactions(txRes.data.results || txRes.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load payment data.');
    }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const loadFiscal = async () => {
    if (!workspace.selectedRestaurantId) return;
    try {
      const [cfgRes, recRes] = await Promise.all([
        paymentsAPI.getFiscalConfigs(workspace.selectedRestaurantId),
        paymentsAPI.getFiscalReceipts(workspace.selectedRestaurantId),
      ]);
      const list = cfgRes.data.results || cfgRes.data || [];
      if (list.length > 0) {
        setFiscalConfig(list[0]);
        setFiscalForm({
          provider: list[0].provider || 'MOCK',
          api_key: list[0].api_key || '',
          terminal_id: list[0].terminal_id || '',
          tin: list[0].tin || '',
          is_active: list[0].is_active || false,
        });
      }
      setFiscalReceipts(recRes.data.results || recRes.data || []);
    } catch {}
  };

  useEffect(() => { if (tab === 'fiscal') void loadFiscal(); }, [workspace.selectedRestaurantId, tab]);

  const create = async () => {
    try {
      if (editingId) {
        await paymentsAPI.updateMerchantConfig(editingId, form);
      } else {
        await paymentsAPI.createMerchantConfig({ ...form, restaurant: workspace.selectedRestaurantId });
      }
      setShowForm(false);
      setEditingId(null);
      setError('');
      setForm({ provider: 'PAYME', merchant_id: '', merchant_key: '', terminal_id: '', is_active: true });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save merchant config.');
    }
  };

  const edit = async (cfg: any) => {
    setEditingId(cfg.id);
    setForm({
      provider: cfg.provider,
      merchant_id: cfg.merchant_id || '',
      merchant_key: cfg.merchant_key || '',
      terminal_id: cfg.terminal_id || '',
      is_active: cfg.is_active,
    });
    setShowForm(true);
  };

  const remove = async (id: string) => {
    try { await paymentsAPI.deleteMerchantConfig(id); setError(''); await load(); }
    catch (err: any) { setError(err?.response?.data?.detail || err?.message || 'Failed to delete.'); }
  };

  const deleteFiscal = async () => {
    if (!fiscalConfig?.id) return;
    try {
      await paymentsAPI.deleteFiscalConfig(fiscalConfig.id);
      setFiscalConfig(null);
      setFiscalForm({ provider: 'MOCK', api_key: '', terminal_id: '', tin: '', is_active: false });
      await loadFiscal();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to delete fiscal config.');
    }
  };

  const saveFiscal = async () => {
    if (!workspace.selectedRestaurantId) return;
    setSavingFiscal(true);
    setError('');
    try {
      if (fiscalConfig?.id) {
        await paymentsAPI.updateFiscalConfig(fiscalConfig.id, fiscalForm);
      } else {
        await paymentsAPI.createFiscalConfig({ ...fiscalForm, restaurant: workspace.selectedRestaurantId });
      }
      await loadFiscal();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save fiscal settings.');
    }
    finally { setSavingFiscal(false); }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'merchants', label: 'Merchant Configs' },
    { key: 'fiscal', label: 'Fiscal (GNC)' },
  ];

  return (
    <AppShell title="Payments" subtitle="Configure payment providers, fiscalization and view transactions." eyebrow="Waitly Finance"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="mb-5 flex gap-1 rounded-2xl border border-theme bg-theme-panel p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${tab === t.key ? 'bg-[#f97360] text-white shadow-lg' : 'text-theme-secondary hover:text-theme'}`}
          >{t.label}</button>
        ))}
      </div>

      {error ? <div className="mb-4 rounded-[24px] border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-200">{error}</div> : null}

      {tab === 'merchants' ? (
        <>
          <Panel title="Merchant configs" eyebrow="Payment providers" action={
            <Button variant="secondary" size="sm" onClick={() => { setShowForm(!showForm); if (showForm) { setEditingId(null); setForm({ provider: 'PAYME', merchant_id: '', merchant_key: '', terminal_id: '', is_active: true }); } }}>
              <Plus className="mr-1 h-4 w-4" />{showForm ? 'Cancel' : 'Add provider'}
            </Button>
          }>
            {showForm ? (
              <div className="mb-5 grid gap-4 rounded-[24px] border border-theme bg-theme-panel p-5 md:grid-cols-2">
                <div className="md:col-span-2 text-sm font-semibold text-theme">{editingId ? `Edit ${form.provider} config` : 'Add payment provider'}</div>
                <div>
                  <label className="text-xs font-semibold text-theme-secondary">Provider</label>
                  <select value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none">
                    {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-theme-secondary">Merchant ID</label>
                  <input value={form.merchant_id} onChange={e => setForm(f => ({ ...f, merchant_id: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-theme-secondary">Merchant Key</label>
                  <input value={form.merchant_key} onChange={e => setForm(f => ({ ...f, merchant_key: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-theme-secondary">Terminal ID</label>
                  <input value={form.terminal_id} onChange={e => setForm(f => ({ ...f, terminal_id: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
                </div>
                <div className="flex items-end">
                  <Button onClick={create} className="w-full"><Smartphone className="mr-2 h-4 w-4" />Save config</Button>
                </div>
              </div>
            ) : null}

            <DataTable
              columns={[
                { label: 'Provider', key: 'provider', render: (row) => {
                  const p = PROVIDERS.find(x => x.value === row.provider);
                  const Icon = p?.icon || CreditCard;
                  return <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${p?.color || ''}`} /><span>{p?.label || row.provider}</span></div>;
                }},
                { label: 'Merchant ID', key: 'merchant_id' },
                { label: 'Active', key: 'is_active', render: (row) => row.is_active ? <span className="text-emerald-400">Yes</span> : <span className="text-red-400">No</span> },
                { label: '', key: 'id', render: (row) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => edit(row)}><Smartphone className="h-3 w-3 text-blue-400" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(row.id)}><Trash2 className="h-3 w-3 text-red-400" /></Button>
                  </div>
                )},
              ]}
              rows={configs}
              emptyMessage="No merchant configs yet. Add Payme, Click, or Uzum."
            />
          </Panel>

          <Panel title="Transaction history" eyebrow="Payments" className="mt-5">
            <DataTable
              columns={[
                { label: 'Provider', key: 'provider' },
                { label: 'Amount', key: 'amount', render: (row) => `${Number(row.amount).toLocaleString()} UZS` },
                { label: 'Fiscal', key: 'fiscal_sign', render: (row) => row.fiscal_sign ? <span className="text-emerald-400 text-xs">Receipt #{row.fiscal_number}</span> : <span className="text-amber-400 text-xs">No receipt</span> },
                { label: 'Status', key: 'status', render: (row) => {
                  const colors: Record<string, string> = { PAID: 'text-emerald-400', FAILED: 'text-red-400', PENDING: 'text-amber-300', REFUNDED: 'text-blue-300' };
                  return <span className={colors[row.status] || ''}>{row.status}</span>;
                }},
                { label: 'Date', key: 'created_at', render: (row) => new Date(row.created_at).toLocaleString('ru-RU') },
              ]}
              rows={transactions}
              emptyMessage="No transactions yet."
            />
          </Panel>
        </>
      ) : (
        <>
          <Panel title="Fiscalization settings" eyebrow="Online KKM" description="Configure fiscal receipt generation for GNC Uzbekistan. All payments will be automatically fiscalized.">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-theme-secondary">Fiscal provider</label>
                <select value={fiscalForm.provider} onChange={e => setFiscalForm(f => ({ ...f, provider: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none">
                  {FISCAL_PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-theme-secondary">API Key</label>
                <input value={fiscalForm.api_key} onChange={e => setFiscalForm(f => ({ ...f, api_key: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-theme-secondary">Terminal ID</label>
                <input value={fiscalForm.terminal_id} onChange={e => setFiscalForm(f => ({ ...f, terminal_id: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-theme-secondary">ИНН организации</label>
                <input value={fiscalForm.tin} onChange={e => setFiscalForm(f => ({ ...f, tin: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" placeholder="304567890" />
              </div>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-theme-secondary">
                <input type="checkbox" checked={fiscalForm.is_active} onChange={e => setFiscalForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-theme bg-[var(--input-bg)] text-[#f97360]" />
                Active (fiscalization enabled)
              </label>
              <Button onClick={saveFiscal} disabled={savingFiscal}>
                <Receipt className="mr-2 h-4 w-4" />{savingFiscal ? 'Saving...' : 'Save fiscal settings'}
              </Button>
              {fiscalConfig?.id ? (
                <Button variant="ghost" onClick={deleteFiscal}><Trash2 className="mr-2 h-4 w-4 text-red-400" />Delete config</Button>
              ) : null}
            </div>
            {fiscalConfig?.is_active ? (
              <div className="mt-4 rounded-[20px] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                Fiscalization is active. Every successful payment will generate a fiscal receipt.
              </div>
            ) : (
              <div className="mt-4 rounded-[20px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
                Fiscalization is inactive. Enable it and add your ИНН to comply with GNC requirements.
              </div>
            )}
          </Panel>

          <Panel title="Fiscal receipts" eyebrow="GNC logs" className="mt-5">
            <DataTable
              columns={[
                { label: 'Receipt #', key: 'fiscal_number', render: (row) => <span className="font-mono text-xs">{row.fiscal_number || row.id?.slice(0, 8)}</span> },
                { label: 'Fiscal sign', key: 'fiscal_sign', render: (row) => <span className="font-mono text-[10px] text-theme-secondary">{row.fiscal_sign?.slice(0, 16) || '—'}...</span> },
                { label: 'Status', key: 'status', render: (row) => {
                  const cls = row.status === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400';
                  return <span className={cls}>{row.status}</span>;
                }},
                { label: 'Date', key: 'created_at', render: (row) => new Date(row.created_at).toLocaleString('ru-RU') },
              ]}
              rows={fiscalReceipts}
              emptyMessage="No fiscal receipts yet. Make a payment to generate one."
            />
          </Panel>
        </>
      )}
    </AppShell>
  );
}
