import { Gift, Plus, Percent, Trash2, Ticket, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { marketingAPI, ownerAPI } from '@/services/api';

export default function PromoPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [tab, setTab] = useState<'promo' | 'certs'>('promo');
  const [promos, setPromos] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [certForm, setCertForm] = useState({ code: '', amount: '' });
  const [form, setForm] = useState({ code: '', discount_type: 'PERCENT', discount_value: 0, min_order_amount: 0, max_uses: 0, valid_from: '', valid_until: '' });

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const [promoRes, certRes] = await Promise.all([
        marketingAPI.getPromoCodes(workspace.selectedRestaurantId),
        ownerAPI.getPosCertificates(workspace.selectedRestaurantId).catch(() => ({ data: [] })),
      ]);
      setPromos(promoRes.data.results || promoRes.data || []);
      setCerts(Array.isArray(certRes.data) ? certRes.data : (certRes.data.results || []));
    } catch { setPromos([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const createCert = async () => {
    if (!certForm.code.trim() || !certForm.amount) return;
    try {
      await ownerAPI.createPosCertificate({ code: certForm.code.trim().toUpperCase(), amount: Number(certForm.amount), restaurant_id: workspace.selectedRestaurantId });
      setCertForm({ code: '', amount: '' });
      await load();
    } catch {}
  };
  const removeCert = async (id: string) => {
    try { await ownerAPI.deletePosCertificate(id); await load(); } catch {}
  };

  const create = async () => {
    try {
      await marketingAPI.createPromoCode({ ...form, restaurant: workspace.selectedRestaurantId });
      setShowForm(false);
      setForm({ code: '', discount_type: 'PERCENT', discount_value: 0, min_order_amount: 0, max_uses: 0, valid_from: '', valid_until: '' });
      await load();
    } catch {}
  };

  const remove = async (id: string) => {
    try { await marketingAPI.deletePromoCode(id); await load(); } catch {}
  };

  return (
    <AppShell title={t('promo_title', 'Акции')} subtitle={t('promo_subtitle', 'Промокоды и подарочные сертификаты — всё для Касса (POS) в одном месте')} eyebrow={t('promo_eyebrow', 'Waitly Marketing')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="flex gap-2 rounded-2xl border border-white/8 bg-black/10 p-1.5 w-fit mb-4">
        <button onClick={() => setTab('promo')} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${tab === 'promo' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'}`}><Percent className="inline h-4 w-4 mr-1.5" />Промокоды</button>
        <button onClick={() => setTab('certs')} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${tab === 'certs' ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'}`}><Ticket className="inline h-4 w-4 mr-1.5" />Сертификаты</button>
      </div>
      {tab === 'promo' ? (
      <Panel title={t('promo_codes_title', 'Promo codes')} eyebrow={t('promo_codes_eyebrow', 'Discounts')} action={
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-1 h-4 w-4" />{showForm ? t('promo_cancel', 'Cancel') : t('promo_new', 'New promo')}
        </Button>
      }>
        {showForm ? (
          <div className="mb-5 grid gap-4 rounded-[24px] border border-theme bg-theme-panel p-5 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-theme-secondary">{t('promo_field_code', 'Code')}</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary">{t('promo_field_type', 'Type')}</label>
              <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none">
                <option value="PERCENT">{t('promo_type_percent', 'Percent (%)')}</option>
                <option value="FIXED">{t('promo_type_fixed', 'Fixed amount')}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary">{t('promo_field_value', 'Value')}</label>
              <input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: +e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary">{t('promo_field_min_order', 'Min order')}</label>
              <input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: +e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary">{t('promo_field_max_uses', 'Max uses')}</label>
              <input type="number" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: +e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
            </div>
            <div className="flex items-end">
              <Button onClick={create} className="w-full"><Gift className="mr-2 h-4 w-4" />{t('promo_create', 'Create')}</Button>
            </div>
          </div>
        ) : null}

        <DataTable
          columns={[
            { label: t('promo_col_code', 'Code'), key: 'code', render: (row) => <span className="font-mono font-bold text-theme">{row.code}</span> },
            { label: t('promo_col_discount', 'Discount'), key: 'discount_value', render: (row) => row.discount_type === 'PERCENT' ? `${row.discount_value}%` : `${Number(row.discount_value).toLocaleString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US')} UZS` },
            { label: t('promo_col_uses', 'Uses'), key: 'used_count', render: (row) => `${row.used_count}${row.max_uses > 0 ? `/${row.max_uses}` : ''}` },
            { label: t('promo_col_active', 'Active'), key: 'is_active', render: (row) => row.is_active ? <span className="text-emerald-400">{t('promo_yes', 'Yes')}</span> : <span className="text-red-400">{t('promo_no', 'No')}</span> },
            { label: t('promo_col_valid_until', 'Valid until'), key: 'valid_until', render: (row) => row.valid_until ? new Date(row.valid_until).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US') : t('promo_dash', '—') },
            { label: '', key: 'id', render: (row) => (
              <Button variant="ghost" size="sm" onClick={() => remove(row.id)}><Trash2 className="h-3 w-3 text-red-400" /></Button>
            )},
          ]}
          rows={promos}
          emptyMessage={t('promo_empty', 'No promo codes yet.')}
        />
      </Panel>
      ) : (
      <Panel title="Подарочные сертификаты" eyebrow="Для POS" description="Создайте сертификат с кодом и номиналом — гость оплатит им в Касса (POS) методом «Сертификат»" action={<Button variant="secondary" size="sm" onClick={() => setCertForm({ code: '', amount: '' })}><Wallet className="mr-1 h-4 w-4" />Очистить</Button>}>
        <div className="mb-4 grid gap-3 rounded-2xl border border-theme bg-theme-panel p-4 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="text-xs font-semibold text-theme-secondary">Код</label>
            <input value={certForm.code} onChange={e => setCertForm({ ...certForm, code: e.target.value.toUpperCase() })} placeholder="WC-XXXX" className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none font-mono" />
          </div>
          <div>
            <label className="text-xs font-semibold text-theme-secondary">Сумма (сум)</label>
            <input type="number" value={certForm.amount} onChange={e => setCertForm({ ...certForm, amount: e.target.value })} placeholder="100000" className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
          </div>
          <div className="flex items-end"><Button onClick={createCert} disabled={!certForm.code.trim() || !certForm.amount} className="w-full"><Ticket className="mr-2 h-4 w-4" />Создать сертификат</Button></div>
        </div>
        <DataTable columns={[
          { label: 'Код', key: 'code', render: (row) => <span className="font-mono font-bold text-theme">{row.code}</span> },
          { label: 'Номинал', key: 'initial_balance', render: (row) => `${Number(row.initial_balance).toLocaleString()} UZS` },
          { label: 'Баланс', key: 'balance', render: (row) => <span className={Number(row.balance) > 0 ? 'text-emerald-400 font-bold' : 'text-red-400'}>{Number(row.balance).toLocaleString()} UZS</span> },
          { label: 'Активен', key: 'is_active', render: (row) => row.is_active ? <span className="text-emerald-400">Да</span> : <span className="text-zinc-500">Нет</span> },
          { label: '', key: 'id', render: (row) => <Button variant="ghost" size="sm" onClick={() => removeCert(row.id)}><Trash2 className="h-3 w-3 text-red-400" /></Button> },
        ]} rows={certs} emptyMessage="Сертификатов пока нет — создайте для оплаты в Касса (POS) методом «Сертификат»" />
        <div className="mt-3 text-xs text-theme-muted">На кассе: <code>Оплата → Сертификат → код</code> — спишет с баланса, остаток сохранится</div>
      </Panel>
      )}
    </AppShell>
  );
}
