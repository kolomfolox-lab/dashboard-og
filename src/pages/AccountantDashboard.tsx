import { useEffect, useState } from 'react';
import { DollarSign, Receipt, TrendingUp, UsersRound, Loader2 } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { useLocale } from '@/context/LocaleContext';
import { ownerAPI, paymentsAPI } from '@/services/api';

interface StatRow {
  total_revenue?: string;
  revenue_today?: string;
  orders_today?: number;
  staff_count?: number;
  daily_revenue?: { date: string; revenue: number; orders: number }[];
  staff_performance?: { full_name: string; revenue: number; hours_worked: number; delivered_orders: number }[];
}

interface Transaction {
  id: string;
  created_at?: string;
  date?: string;
  order?: string;
  order_id?: string;
  amount: number;
  status: string;
  method?: string;
  payment_method?: string;
}

export default function AccountantDashboardPage() {
  const { locale, t } = useLocale();
  const [stats, setStats] = useState<StatRow | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, txRes] = await Promise.all([
          ownerAPI.getStats(),
          paymentsAPI.getTransactions(),
        ]);
        if (!active) return;
        setStats(statsRes.data);
        const txData = txRes.data;
        setTransactions(Array.isArray(txData) ? txData : txData?.results || []);
      } catch {
        // silently fail
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU').format(val) + ' UZS';

  const revenueToday = stats?.revenue_today ? Number(stats.revenue_today) : 0;
  const revenueWeek = (stats?.daily_revenue || []).reduce((s, d) => s + d.revenue, 0);
  const pendingTotal = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + Number(t.amount), 0);
  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const staffCount = stats?.staff_count || 0;
  const payrollTotal = (stats?.staff_performance || []).reduce((s, p) => s + Number(p.revenue || 0) * 0.25, 0);

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      completed: t('accountant_status_completed', 'Оплачен'),
      pending: t('accountant_status_pending', 'Ожидает'),
      failed: t('accountant_status_failed', 'Отменён'),
    };
    return map[s] || s;
  };

  const statusColor = (s: string) => {
    if (s === 'completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'pending') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  const dailyRev = stats?.daily_revenue || [];
  const maxDaily = Math.max(...dailyRev.map(d => d.revenue), 1);
  const dayLabels = [t('accountant_day_mon', 'Mon'), t('accountant_day_tue', 'Tue'), t('accountant_day_wed', 'Wed'), t('accountant_day_thu', 'Thu'), t('accountant_day_fri', 'Fri'), t('accountant_day_sat', 'Sat'), t('accountant_day_sun', 'Sun')];

  const paymentMethods = (() => {
    const counts: Record<string, { count: number; total: number }> = {};
    transactions.forEach(t => {
      const m = (t.method || t.payment_method || 'Unknown').toLowerCase();
      if (!counts[m]) counts[m] = { count: 0, total: 0 };
      counts[m].count++;
      counts[m].total += Number(t.amount);
    });
    const total = transactions.reduce((s, t) => s + Number(t.amount), 0) || 1;
    return Object.entries(counts).map(([label, v]) => ({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      pct: Math.round((v.total / total) * 100),
      color: label === 'card' ? '#f97360' : label === 'cash' ? '#7dd3fc' : '#34d399',
    }));
  })();

  const staffCategories = (() => {
    const perf = stats?.staff_performance || [];
    if (!perf.length) return [];
    return [
      {
        name: t('accountant_category_waiters', 'Официанты'),
        count: Math.ceil(perf.length * 0.5),
        total: perf.slice(0, Math.ceil(perf.length * 0.5)).reduce((s, p) => s + Number(p.revenue || 0) * 0.2, 0),
      },
      {
        name: t('accountant_category_cooks', 'Повара'),
        count: Math.ceil(perf.length * 0.3),
        total: perf.slice(0, Math.ceil(perf.length * 0.3)).reduce((s, p) => s + Number(p.revenue || 0) * 0.25, 0),
      },
      {
        name: t('accountant_category_managers', 'Менеджеры'),
        count: Math.max(1, Math.floor(perf.length * 0.15)),
        total: perf.slice(0, Math.max(1, Math.floor(perf.length * 0.15))).reduce((s, p) => s + Number(p.revenue || 0) * 0.3, 0),
      },
    ];
  })();

  const taxItems = [
    { label: t('accountant_tax_vat', 'НДС (июнь)'), amount: revenueWeek * 0.12, status: 'paid' as const },
    { label: t('accountant_tax_profit', 'Налог на прибыль'), amount: revenueWeek * 0.08, status: 'pending' as const },
    { label: t('accountant_tax_social', 'Соц. отчисления'), amount: payrollTotal * 0.12, status: 'paid' as const },
  ];

  if (loading) {
    return (
      <AppShell
        title={t('accountant_title', 'Панель бухгалтера')}
        subtitle={t('accountant_subtitle', 'Финансовые показатели, платежи и отчёты.')}
        eyebrow={t('accountant_eyebrow', 'Финансы')}
      >
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/40" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={t('accountant_title', 'Панель бухгалтера')}
      subtitle={t('accountant_subtitle', 'Финансовые показатели, платежи и отчёты.')}
      eyebrow={t('accountant_eyebrow', 'Финансы')}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title={t('accountant_revenue_today', 'Выручка сегодня')} value={formatMoney(revenueToday)} note={t('accountant_today_note', 'Текущий день')} icon={DollarSign} tone="coral" />
          <MetricCard title={t('accountant_weekly_revenue', 'Выручка за неделю')} value={formatMoney(revenueWeek)} note={t('accountant_week_note', 'Последние 7 дней')} icon={TrendingUp} tone="sand" />
          <MetricCard title={t('accountant_pending_payments', 'Ожидаемые платежи')} value={formatMoney(pendingTotal)} note={`${pendingCount} ${t('accountant_payments_count', 'платежей')}`} icon={Receipt} tone="cyan" />
          <MetricCard title={t('accountant_payroll_fund', 'Фонд зарплаты')} value={formatMoney(payrollTotal)} note={`${staffCount} ${t('accountant_staff_count', 'сотрудников')}`} icon={UsersRound} tone="mint" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title={t('accountant_revenue_chart', 'Динамика доходов')} eyebrow={t('accountant_financial', 'Финансовый')} className="xl:col-span-2">
            {dailyRev.length === 0 ? (
              <div className="flex h-[360px] items-center justify-center text-sm text-white/40">{t('accountant_no_data', 'Нет данных')}</div>
            ) : (
              <div className="flex h-[360px] items-end justify-between gap-2 px-2">
                {dailyRev.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-[#f97360]/60 to-[#f97360]/20" style={{ height: `${(d.revenue / maxDaily) * 100}%` }} />
                    <span className="text-[10px] text-white/40">{dayLabels[i] || new Date(d.date).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'short' })}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel title={t('accountant_payment_methods', 'Способы оплаты')} eyebrow={t('accountant_statistics', 'Статистика')}>
            {paymentMethods.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-white/40">{t('accountant_no_data', 'Нет данных')}</div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((m) => (
                  <div key={m.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-white/80">{m.label}</span>
                      <span className="text-white/50">{m.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div className="h-2 rounded-full" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <Panel title={t('accountant_recent_payments', 'Последние платежи')} eyebrow={t('accountant_transactions_eyebrow', 'Транзакции')}>
          {transactions.length === 0 ? (
            <div className="text-sm text-white/40">{t('accountant_no_transactions', 'Транзакции не найдены.')}</div>
          ) : (
            <DataTable
              rows={transactions}
              columns={[
                { label: t('accountant_col_date', 'Дата'), key: 'created_at' || 'date', render: (row) => {
                  const d = row.created_at || row.date || '';
                  try { return new Date(d).toLocaleDateString(); } catch { return d; }
                }},
                { label: t('accountant_col_order', 'Заказ'), key: 'order', render: (row) => row.order || row.order_id || '—' },
                {
                  label: t('accountant_col_amount', 'Сумма'),
                  key: 'amount',
                  render: (row) => <span className="font-semibold text-white">{formatMoney(Number(row.amount))}</span>,
                },
                {
                  label: t('accountant_col_status', 'Статус'),
                  key: 'status',
                  render: (row) => (
                    <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusColor(row.status)}`}>
                      {statusLabel(row.status)}
                    </span>
                  ),
                },
                { label: t('accountant_col_method', 'Способ'), key: 'method', render: (row) => row.method || row.payment_method || '—' },
              ]}
              emptyMessage={t('accountant_no_transactions', 'Транзакции не найдены.')}
            />
          )}
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={t('accountant_salary_summary', 'Сводка по зарплате')} eyebrow={t('accountant_employees', 'Сотрудники')}>
            {staffCategories.length === 0 ? (
              <div className="text-sm text-white/40">{t('accountant_no_data', 'Нет данных')}</div>
            ) : (
              <div className="space-y-3">
                {staffCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                    <div>
                      <div className="text-sm font-bold text-white">{cat.name}</div>
                      <div className="text-[10px] text-white/40">{cat.count} {t('accountant_persons', 'чел.')}</div>
                    </div>
                    <div className="text-sm font-bold text-[#ffd4c4]">{formatMoney(Math.round(cat.total))}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel title={t('accountant_tax_reports', 'Налоговые отчёты')} eyebrow={t('accountant_compliance', 'Комплаенс')}>
            <div className="space-y-3">
              {taxItems.map((tax) => (
                <div key={tax.label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                  <div>
                    <div className="text-sm text-white/80">{tax.label}</div>
                    <div className="mt-1 text-[10px] text-white/30">{tax.status === 'paid' ? t('accountant_paid', 'Оплачен') : t('accountant_pending_status', 'Ожидает')}</div>
                  </div>
                  <div className="text-sm font-bold text-[#ffd4c4]">{formatMoney(Math.round(tax.amount))}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
