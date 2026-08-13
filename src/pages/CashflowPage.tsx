import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Banknote, CircleDollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { showToast } from '@/lib/toast';

export default function CashflowPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const rid = workspace.selectedRestaurantId;
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!rid) return;
    setLoading(true);
    try {
      const res = await ownerAPI.getCashflow(rid, period);
      setData(res.data);
    } catch { showToast(t('cashflow_error', 'Ошибка загрузки'), 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [rid, period]);

  const periods = [
    { key: 'today', label: t('finances_today', 'Сегодня') },
    { key: 'week', label: t('finances_week', 'Неделя') },
    { key: 'month', label: t('finances_month', 'Месяц') },
  ];

  return (
    <AppShell
      title={t('cashflow_title', 'Cash Flow')}
      subtitle={t('cashflow_subtitle', 'Движение денег: откуда приходят и куда уходят')}
      eyebrow="Cash Flow"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-5">
        <div className="flex gap-2 rounded-2xl border border-white/8 bg-black/10 p-1.5">
          {periods.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key as any)}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${period === p.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>{p.label}</button>
          ))}
        </div>

        {!data ? loading ? (
          <div className="text-center py-10 text-sm text-white/40">{t('loading', '...')}</div>
        ) : null : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard title={t('cashflow_in', 'Пришло')} value={`${data.total_in.toLocaleString()} UZS`} note={t('cashflow_in_note', 'Все поступления')} icon={ArrowDown} tone="mint" />
              <MetricCard title={t('cashflow_out', 'Ушло')} value={`${data.total_out.toLocaleString()} UZS`} note={t('cashflow_out_note', 'Все расходы')} icon={ArrowUp} tone="coral" />
              <MetricCard title={t('cashflow_net', 'Остаток')} value={`${data.net.toLocaleString()} UZS`} note={data.net >= 0 ? 'Положительный' : 'Отрицательный'} icon={Wallet} tone={data.net >= 0 ? 'mint' : 'coral'} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Panel title={t('cashflow_inflows', 'Поступления')} eyebrow={t('cashflow_in', 'IN')}>
                <div className="space-y-3">
                  {data.inflows.map((f: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-2xl border border-emerald-500/10 bg-emerald-500/5 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10"><TrendingUp className="h-5 w-5 text-emerald-300" /></div>
                        <span className="text-sm font-semibold text-white">{f.source}</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-300">+{f.amount.toLocaleString()} UZS</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title={t('cashflow_outflows', 'Расходы')} eyebrow={t('cashflow_out', 'OUT')}>
                <div className="space-y-3">
                  {data.outflows.map((f: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-2xl border border-rose-500/10 bg-rose-500/5 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10"><TrendingDown className="h-5 w-5 text-rose-300" /></div>
                        <div>
                          <div className="text-sm font-semibold text-white">{f.category}</div>
                          <div className="text-xs text-white/30">{f.pct}% от расходов</div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-rose-300">-{f.amount.toLocaleString()} UZS</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
