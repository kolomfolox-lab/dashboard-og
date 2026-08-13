import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Banknote, ChartPie, Coins, ShoppingCart, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { showToast } from '@/lib/toast';

export default function FinancesPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const rid = workspace.selectedRestaurantId;

  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(false);

  const load = async (p: string) => {
    if (!rid) return;
    setLoading(true);
    try {
      const res = await ownerAPI.getFinances(rid, p as any);
      setData(res.data);
    } catch { showToast(t('finances_error', 'Ошибка загрузки'), 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(period); }, [rid, period]);

  const periods = [
    { key: 'today', label: t('finances_today', 'Сегодня') },
    { key: 'week', label: t('finances_week', 'Неделя') },
    { key: 'month', label: t('finances_month', 'Месяц') },
  ];

  return (
    <AppShell
      title={t('finances_title', 'Финансы')}
      subtitle={data ? `${t('finances_from', 'с')} ${data.from} ${t('finances_to', 'по')} ${data.to}` : ''}
      eyebrow={t('finances_eyebrow', 'Finance')}
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

        {!data ? (
          <div className="rounded-3xl border border-white/8 bg-black/12 p-10 text-center text-sm text-white/40">
            {loading ? t('loading', '...') : t('finances_no_data', 'Нет данных')}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard title={t('finances_revenue', 'Выручка')} value={`${data.revenue.toLocaleString()} UZS`} note={`${data.order_count} ${t('finances_orders', 'заказов')}`} icon={Banknote} tone="mint" />
              <MetricCard title={t('finances_expenses', 'Расходы')} value={`${data.total_expenses.toLocaleString()} UZS`} note={t('finances_expenses_detail', 'продукты + зп + закупки')} icon={TrendingDown} tone="coral" />
              <MetricCard title={t('finances_net_profit', 'Чистая прибыль')} value={`${data.net_profit.toLocaleString()} UZS`} note={t('finances_margin', `Маржа ${data.net_margin}%`)} icon={Wallet} tone={data.net_margin > 20 ? 'mint' : data.net_margin > 5 ? 'sand' : 'coral'} />
            </div>

            <Panel title={t('finances_breakdown', 'Детализация')} eyebrow={t('finances_breakdown_eyebrow', 'Расходы')}>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500/10"><ShoppingCart className="h-5 w-5 text-rose-300" /></div>
                    <div><div className="text-sm font-semibold text-white">{t('finances_food_cost', 'Себестоимость блюд')}</div><div className="text-xs text-white/40">{t('finances_food_cost_desc', 'Ингредиенты по техкартам')}</div></div>
                  </div>
                  <div className="text-right"><div className="text-sm font-semibold text-white">{data.food_cost.toLocaleString()} UZS</div><div className="text-xs text-white/40">{data.food_cost_pct}% от выручки</div></div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10"><Users className="h-5 w-5 text-blue-300" /></div>
                    <div><div className="text-sm font-semibold text-white">{t('finances_payroll', 'Зарплата')}</div><div className="text-xs text-white/40">{data.payroll_employees} {t('finances_employees', 'сотрудников')}</div></div>
                  </div>
                  <div className="text-right"><div className="text-sm font-semibold text-white">{data.payroll.toLocaleString()} UZS</div></div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10"><Coins className="h-5 w-5 text-amber-300" /></div>
                    <div><div className="text-sm font-semibold text-white">{t('finances_purchases', 'Закупки')}</div><div className="text-xs text-white/40">{t('finances_purchases_desc', 'Поставщики, приход на склад')}</div></div>
                  </div>
                  <div className="text-right"><div className="text-sm font-semibold text-white">{data.purchases.toLocaleString()} UZS</div></div>
                </div>

                <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10"><Wallet className="h-5 w-5 text-emerald-300" /></div>
                      <div><div className="text-sm font-semibold text-white">{t('finances_total', 'Итого')}</div><div className="text-xs text-white/40">{t('finances_net', 'Выручка − Расходы')}</div></div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${data.net_profit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {data.net_profit >= 0 ? '+' : ''}{data.net_profit.toLocaleString()} UZS
                      </div>
                      <div className={`text-xs ${data.net_margin > 20 ? 'text-emerald-400' : data.net_margin > 5 ? 'text-amber-400' : 'text-red-400'}`}>
                        {t('finances_margin', 'Маржа')} {data.net_margin}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </>
        )}
      </div>
    </AppShell>
  );
}
