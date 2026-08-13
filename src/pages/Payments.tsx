import { CreditCard, Plus, Smartphone, Building, Trash2, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  { value: 'UZKASSA', label: 'UzKassa' },
  { value: 'ATLAS', label: 'Atlas' },
  { value: 'SOLARLAB', label: 'Solarlab' },
];

type Tab = 'merchants' | 'fiscal';

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-theme bg-black/10">
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: cols }).map((_, i) => (
              <TableHead key={i}><Skeleton className="h-3 w-20 bg-white/6" /></TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={cols}><Skeleton className="h-5 w-full bg-white/6" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

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
  const [fiscalForm, setFiscalForm] = useState({ provider: '', api_key: '', terminal_id: '', tin: '', is_active: false });
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
      setError(err?.response?.data?.detail || err?.message || t('payments_load_error', 'Failed to load payment data.'));
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
          provider: list[0].provider || '',
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
      setError(err?.response?.data?.detail || err?.message || t('payments_save_merchant_error', 'Failed to save merchant config.'));
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
    catch (err: any) { setError(err?.response?.data?.detail || err?.message || t('payments_delete_error', 'Failed to delete.')); }
  };

  const deleteFiscal = async () => {
    if (!fiscalConfig?.id) return;
    try {
      await paymentsAPI.deleteFiscalConfig(fiscalConfig.id);
      setFiscalConfig(null);
      setFiscalForm({ provider: '', api_key: '', terminal_id: '', tin: '', is_active: false });
      await loadFiscal();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || t('payments_delete_fiscal_error', 'Failed to delete fiscal config.'));
    }
  };

  const saveFiscal = async () => {
    if (!workspace.selectedRestaurantId) return;
    if (!fiscalForm.provider) { setError(t('payments_fiscal_provider_required', 'Please select a fiscal provider.')); return; }
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
      setError(err?.response?.data?.detail || err?.message || t('payments_save_fiscal_error', 'Failed to save fiscal settings.'));
    }
    finally { setSavingFiscal(false); }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'merchants', label: t('payments_tab_merchants', 'Merchant Configs') },
    { key: 'fiscal', label: t('payments_tab_fiscal', 'Fiscal (GNC)') },
  ];

  return (
    <AppShell title={t('payments_app_title', 'Payments')} subtitle={t('payments_app_subtitle', 'Configure payment providers, fiscalization and view transactions.')} eyebrow={t('payments_app_eyebrow', 'Waitly Finance')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="mb-5 flex w-fit gap-1 rounded-2xl border border-theme bg-[var(--panel-bg)] p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${tab === t.key ? 'bg-[#f97360] text-white shadow-lg' : 'text-theme-secondary hover:text-theme'}`}
          >{t.label}</button>
        ))}
      </div>

      {error ? <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm text-red-300">{error}</div> : null}

      {tab === 'merchants' ? (
        <>
          <Card className="border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{t('payments_merchant_eyebrow', 'Payment providers')}</div>
                  <CardTitle className="mt-2 text-xl text-theme">{t('payments_merchant_title', 'Merchant configs')}</CardTitle>
                  <CardDescription className="mt-1 text-theme-secondary">{t('payments_merchant_description', 'Payme, Click or Uzum merchant credentials for online payments.')}</CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={() => { setShowForm(!showForm); if (showForm) { setEditingId(null); setForm({ provider: 'PAYME', merchant_id: '', merchant_key: '', terminal_id: '', is_active: true }); } }}>
                  <Plus className="mr-1 h-4 w-4" />{showForm ? t('payments_cancel', 'Cancel') : t('payments_add_provider', 'Add provider')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showForm ? (
                <div className="mb-5 grid gap-4 rounded-2xl border border-theme bg-black/10 p-5 md:grid-cols-2">
                  <div className="md:col-span-2 text-sm font-semibold text-theme">{editingId ? t('payments_edit_config', 'Edit {provider} config').replace('{provider}', form.provider) : t('payments_add_payment_provider', 'Add payment provider')}</div>
                  <div className="space-y-2">
                    <Label htmlFor="pay-provider" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('payments_provider_label', 'Provider')}</Label>
                    <select id="pay-provider" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                      className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
                      {PROVIDERS.map(p => <option key={p.value} value={p.value} className="bg-[#09131e]">{t('payments_provider_' + p.value, p.label)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay-merchant-id" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('payments_merchant_id_label', 'Merchant ID')}</Label>
                    <InputGroup>
                      <InputGroupInput id="pay-merchant-id" value={form.merchant_id} onChange={e => setForm(f => ({ ...f, merchant_id: e.target.value }))} />
                    </InputGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay-merchant-key" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('payments_merchant_key_label', 'Merchant Key')}</Label>
                    <InputGroup>
                      <InputGroupInput id="pay-merchant-key" value={form.merchant_key} onChange={e => setForm(f => ({ ...f, merchant_key: e.target.value }))} />
                    </InputGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pay-terminal-id" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('payments_terminal_id_label', 'Terminal ID')}</Label>
                    <InputGroup>
                      <InputGroupInput id="pay-terminal-id" value={form.terminal_id} onChange={e => setForm(f => ({ ...f, terminal_id: e.target.value }))} />
                    </InputGroup>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={create} className="w-full"><Smartphone className="mr-2 h-4 w-4" />{t('payments_save_config', 'Save config')}</Button>
                  </div>
                </div>
              ) : null}

              {loading ? (
                <TableSkeleton rows={4} cols={4} />
              ) : (
                <DataTable
                  columns={[
                    { label: t('payments_col_provider', 'Provider'), key: 'provider', render: (row) => {
                      const p = PROVIDERS.find(x => x.value === row.provider);
                      const Icon = p?.icon || CreditCard;
                      return <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${p?.color || ''}`} /><span className="text-theme">{t('payments_provider_' + row.provider, p?.label || row.provider)}</span></div>;
                    }},
                    { label: t('payments_col_merchant_id', 'Merchant ID'), key: 'merchant_id', render: (row) => <span className="font-mono text-xs">{row.merchant_id || '—'}</span> },
                    { label: t('payments_col_active', 'Active'), key: 'is_active', render: (row) => row.is_active
                      ? <span className="inline-flex rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400">{t('payments_yes', 'Yes')}</span>
                      : <span className="inline-flex rounded-full bg-red-500/12 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-red-400">{t('payments_no', 'No')}</span> },
                    { label: '', key: 'id', render: (row) => (
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => edit(row)} aria-label={t('payments_edit', 'Edit')}>
                              <Smartphone className="h-3.5 w-3.5 text-[#8fd4ff]" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('payments_edit', 'Edit')}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => remove(row.id)} aria-label={t('payments_delete', 'Delete')}>
                              <Trash2 className="h-3.5 w-3.5 text-[#f97360]" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{t('payments_delete', 'Delete')}</TooltipContent>
                        </Tooltip>
                      </div>
                    )},
                  ]}
                  rows={configs}
                  emptyMessage={t('payments_merchant_empty', 'No merchant configs yet. Add Payme, Click, or Uzum.')}
                />
              )}
            </CardContent>
          </Card>

          <Card className="mt-5 border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{t('payments_tx_eyebrow', 'Payments')}</div>
                <CardTitle className="mt-2 text-xl text-theme">{t('payments_tx_title', 'Transaction history')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={4} cols={5} />
              ) : (
                <DataTable
                  columns={[
                    { label: t('payments_col_provider', 'Provider'), key: 'provider', render: (row) => {
                      const p = PROVIDERS.find(x => x.value === row.provider);
                      return <span className="text-theme">{p?.label || row.provider || '—'}</span>;
                    }},
                    { label: t('payments_col_amount', 'Amount'), key: 'amount', render: (row) => <span className="font-semibold text-theme">{Number(row.amount).toLocaleString()} UZS</span> },
                    { label: t('payments_col_fiscal', 'Fiscal'), key: 'fiscal_sign', render: (row) => row.fiscal_sign ? <span className="text-xs text-emerald-400">{t('payments_receipt_label', 'Receipt #{number}').replace('{number}', row.fiscal_number)}</span> : <span className="text-xs text-[#ffd28d]">{t('payments_no_receipt', 'No receipt')}</span> },
                    { label: t('payments_col_status', 'Status'), key: 'status', render: (row) => {
                      const colors: Record<string, string> = { PAID: 'bg-emerald-500/12 text-emerald-400', FAILED: 'bg-red-500/12 text-red-400', PENDING: 'bg-[#ffd28d]/15 text-[#ffd28d]', REFUNDED: 'bg-[#8fd4ff]/12 text-[#8fd4ff]' };
                      return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${colors[row.status] || 'bg-white/6 text-theme-secondary'}`}>{row.status}</span>;
                    }},
                    { label: t('payments_col_date', 'Date'), key: 'created_at', render: (row) => new Date(row.created_at).toLocaleString('ru-RU') },
                  ]}
                  rows={transactions}
                  emptyMessage={t('payments_tx_empty', 'No transactions yet.')}
                />
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card className="border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{t('payments_fiscal_eyebrow', 'Online KKM')}</div>
                <CardTitle className="mt-2 text-xl text-theme">{t('payments_fiscal_title', 'Fiscalization settings')}</CardTitle>
                <CardDescription className="mt-1 text-theme-secondary">{t('payments_fiscal_description', 'Configure fiscal receipt generation for GNC Uzbekistan. All payments will be automatically fiscalized.')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fisc-provider" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('payments_fiscal_provider_label', 'Fiscal provider')}</Label>
                  <select id="fisc-provider" value={fiscalForm.provider} onChange={e => setFiscalForm(f => ({ ...f, provider: e.target.value }))}
                    className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60">
                    <option value="" className="bg-[#09131e]">{t('payments_fiscal_select_provider', 'Select provider')}</option>
                    {FISCAL_PROVIDERS.map(p => <option key={p.value} value={p.value} className="bg-[#09131e]">{t('payments_fiscal_provider_' + p.value, p.label)}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fisc-api-key" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('payments_api_key_label', 'API Key')}</Label>
                  <InputGroup>
                    <InputGroupInput id="fisc-api-key" value={fiscalForm.api_key} onChange={e => setFiscalForm(f => ({ ...f, api_key: e.target.value }))} />
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fisc-terminal" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('payments_terminal_id_label', 'Terminal ID')}</Label>
                  <InputGroup>
                    <InputGroupInput id="fisc-terminal" value={fiscalForm.terminal_id} onChange={e => setFiscalForm(f => ({ ...f, terminal_id: e.target.value }))} />
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fisc-tin" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">{t('payments_tin_label', 'Organization TIN')}</Label>
                  <InputGroup>
                    <InputGroupInput id="fisc-tin" value={fiscalForm.tin} onChange={e => setFiscalForm(f => ({ ...f, tin: e.target.value }))} placeholder="304567890" />
                  </InputGroup>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" checked={fiscalForm.is_active} onChange={e => setFiscalForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="peer sr-only" />
                  <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-theme bg-white/8 transition after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:border-transparent peer-checked:bg-[#f97360] after:peer-checked:translate-x-5" />
                  <span className="text-sm text-theme-secondary">{t('payments_active_fiscal_label', 'Active (fiscalization enabled)')}</span>
                </label>
                <Button onClick={saveFiscal} disabled={savingFiscal}>
                  {savingFiscal ? <Spinner className="mr-2 h-4 w-4" /> : <Receipt className="mr-2 h-4 w-4" />}{savingFiscal ? t('payments_saving', 'Saving...') : t('payments_save_fiscal', 'Save fiscal settings')}
                </Button>
                {fiscalConfig?.id ? (
                  <Button variant="ghost" onClick={deleteFiscal}><Trash2 className="mr-2 h-4 w-4 text-[#f97360]" />{t('payments_delete_config', 'Delete config')}</Button>
                ) : null}
              </div>
              {fiscalConfig?.is_active ? (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                  {t('payments_fiscal_active_msg', 'Fiscalization is active. Every successful payment will generate a fiscal receipt.')}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
                  {t('payments_fiscal_inactive_msg', 'Fiscalization is inactive. Enable it and add your TIN to comply with GNC requirements.')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-5 border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{t('payments_receipts_eyebrow', 'GNC logs')}</div>
                <CardTitle className="mt-2 text-xl text-theme">{t('payments_receipts_title', 'Fiscal receipts')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { label: t('payments_col_receipt', 'Receipt #'), key: 'fiscal_number', render: (row) => <span className="font-mono text-xs text-theme">{row.fiscal_number || row.id?.slice(0, 8)}</span> },
                  { label: t('payments_col_fiscal_sign', 'Fiscal sign'), key: 'fiscal_sign', render: (row) => <span className="font-mono text-[10px] text-theme-secondary">{row.fiscal_sign?.slice(0, 16) || '\u2014'}...</span> },
                  { label: t('payments_col_status', 'Status'), key: 'status', render: (row) => {
                    const cls = row.status === 'SUCCESS' ? 'bg-emerald-500/12 text-emerald-400' : 'bg-red-500/12 text-red-400';
                    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest ${cls}`}>{row.status}</span>;
                  }},
                  { label: t('payments_col_date', 'Date'), key: 'created_at', render: (row) => new Date(row.created_at).toLocaleString('ru-RU') },
                ]}
                rows={fiscalReceipts}
                emptyMessage={t('payments_receipts_empty', 'No fiscal receipts yet. Make a payment to generate one.')}
              />
            </CardContent>
          </Card>
        </>
      )}
    </AppShell>
  );
}
