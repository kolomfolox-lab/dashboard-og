import { useEffect, useState } from 'react';
import { DollarSign, Loader2, ShoppingBag, TrendingUp, UsersRound } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { useLocale } from '@/context/LocaleContext';
import { ownerAPI } from '@/services/api';

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface StatsPayload {
  daily_revenue?: DailyRevenue[];
  status_breakdown?: { status: string; count: number }[];
  orders_by_hour?: { hour: number; count: number }[];
  top_dishes?: { name: string; count: number; revenue?: number }[];
  revenue_today?: string;
  orders_today?: number;
  revenue_30_days?: string;
  orders_30_days?: number;
  staff_performance?: { full_name: string; revenue: number; hours_worked: number; delivered_orders: number }[];
  guests_count?: number;
}

export default function AnalystDashboardPage() {
  const { locale, t } = useLocale();
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await ownerAPI.getStats();
        if (active) setStats(res.data);
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

  const revenueData = (stats?.daily_revenue || []).map(d => d.revenue);
  const ordersData = (stats?.daily_revenue || []).map(d => d.orders);
  const days = (stats?.daily_revenue || []).map(d =>
    new Date(d.date).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : 'ru-RU', { weekday: 'short' }),
  );
  const fallbackDays = [t('analyst_day_mon', 'Mon'), t('analyst_day_tue', 'Tue'), t('analyst_day_wed', 'Wed'), t('analyst_day_thu', 'Thu'), t('analyst_day_fri', 'Fri'), t('analyst_day_sat', 'Sat'), t('analyst_day_sun', 'Sun')];

  const maxRevenue = Math.max(...revenueData, 1);
  const maxOrders = Math.max(...ordersData, 1);

  const revenueToday = stats?.revenue_today ? Number(stats.revenue_today) : (revenueData[revenueData.length - 1] || 0);
  const ordersToday = stats?.orders_today ?? (ordersData[ordersData.length - 1] || 0);
  const avgCheck = ordersToday > 0 ? Math.round(revenueToday / ordersToday) : 0;
  const activeGuests = stats?.guests_count || 0;

  const statusBreakdown = stats?.status_breakdown || [];
  const categoryColors = ['#f97360', '#7dd3fc', '#34d399', '#f7b267', '#a78bfa', '#f43f5e'];
  const topCategories = statusBreakdown.length > 0
    ? statusBreakdown.map((s, i) => ({
        name: s.status,
        pct: Math.round((s.count / Math.max(...statusBreakdown.map(x => x.count), 1)) * 100),
        color: categoryColors[i % categoryColors.length],
      }))
    : [];

  const ordersByHour = stats?.orders_by_hour || [];
  const defaultHours = [8, 12, 14, 18, 20, 22];
  const defaultHeights: Record<number, number> = { 8: 30, 12: 55, 14: 70, 18: 90, 20: 100, 22: 65 };
  const maxHourCount = Math.max(...ordersByHour.map(o => o.count), 1);

  const avgCheckByDay = (stats?.daily_revenue || []).map(d =>
    d.orders > 0 ? Math.round(d.revenue / d.orders) : 0,
  );
  const maxAvgCheck = Math.max(...avgCheckByDay, 1);

  if (loading) {
    return (
      <AppShell
        title={t('analyst_title', 'Панель аналитика')}
        subtitle={t('analyst_subtitle', 'Ключевые метрики, графики и отчёты (только чтение).')}
        eyebrow={t('analyst_eyebrow', 'Аналитика')}
      >
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/40" />
        </div>
      </AppShell>
    );
  }

  const hasRevenueData = revenueData.length > 0;
  const hasHourData = ordersByHour.length > 0;

  return (
    <AppShell
      title={t('analyst_title', 'Панель аналитика')}
      subtitle={t('analyst_subtitle', 'Ключевые метрики, графики и отчёты (только чтение).')}
      eyebrow={t('analyst_eyebrow', 'Аналитика')}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title={t('analyst_revenue_today', 'Выручка сегодня')} value={formatMoney(revenueToday)} note={t('analyst_week_compare', '+12% к прошлой неделе')} icon={DollarSign} tone="coral" />
          <MetricCard title={t('analyst_orders_today', 'Заказы сегодня')} value={ordersToday} note={t('analyst_last_24h', 'Последние 24ч')} icon={ShoppingBag} tone="cyan" />
          <MetricCard title={t('analyst_avg_check', 'Средний чек')} value={formatMoney(avgCheck)} note={t('analyst_this_week', 'На этой неделе')} icon={TrendingUp} tone="sand" />
          <MetricCard title={t('analyst_active_guests', 'Активные гости')} value={activeGuests} note={t('analyst_now_in_restaurant', 'Сейчас в ресторане')} icon={UsersRound} tone="mint" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={t('analyst_weekly_revenue', 'Еженедельная выручка')} eyebrow={t('analyst_dynamics', 'Динамика')}>
            {!hasRevenueData ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-white/40">{t('analyst_no_data', 'Нет данных')}</div>
            ) : (
              <div className="flex h-[300px] items-end justify-between gap-2 px-2">
                {revenueData.map((val, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[9px] text-white/30">{formatMoney(val)}</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-[#7dd3fc]/60 to-[#7dd3fc]/20 transition-all hover:from-[#7dd3fc]/80" style={{ height: `${(val / maxRevenue) * 100}%` }} />
                    <span className="text-[10px] text-white/40">{days[i] || fallbackDays[i] || ''}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel title={t('analyst_weekly_orders', 'Еженедельные заказы')} eyebrow={t('analyst_volume', 'Объём')}>
            {!hasRevenueData ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-white/40">{t('analyst_no_data', 'Нет данных')}</div>
            ) : (
              <div className="flex h-[300px] items-end justify-between gap-2 px-2">
                {ordersData.map((val, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[9px] text-white/30">{val}</span>
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-[#34d399]/60 to-[#34d399]/20 transition-all hover:from-[#34d399]/80" style={{ height: `${(val / maxOrders) * 100}%` }} />
                    <span className="text-[10px] text-white/40">{days[i] || fallbackDays[i] || ''}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title={t('analyst_top_categories', 'Топ категории')} eyebrow={t('analyst_products', 'Продукты')}>
            {topCategories.length === 0 ? (
              <div className="text-sm text-white/40">{t('analyst_no_data', 'Нет данных')}</div>
            ) : (
              <div className="space-y-3">
                {topCategories.slice(0, 4).map((cat, i) => (
                  <div key={i}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-white/80">{cat.name}</span>
                      <span className="text-white/50">{cat.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div className="h-2 rounded-full" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel title={t('analyst_peak_hours', 'Часы пик')} eyebrow={t('analyst_load', 'Нагрузка')}>
            {!hasHourData ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-white/40">{t('analyst_no_data', 'Нет данных')}</div>
            ) : (
              <div className="flex h-[200px] items-end justify-between gap-2 px-2">
                {ordersByHour.map((o, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-[#f97360]/50 to-[#f97360]/10" style={{ height: `${(o.count / maxHourCount) * 100}%` }} />
                    <span className="text-[10px] text-white/40">{o.hour}:00</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel title={t('analyst_avg_check_by_day', 'Средний чек по дням')} eyebrow={t('analyst_analytics', 'Аналитика')}>
            {avgCheckByDay.length === 0 ? (
              <div className="text-sm text-white/40">{t('analyst_no_data', 'Нет данных')}</div>
            ) : (
              <div className="space-y-2">
                {avgCheckByDay.map((check, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl bg-white/3 px-3 py-2">
                    <span className="w-8 text-[11px] font-bold uppercase text-white/40">{days[i] || fallbackDays[i] || ''}</span>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-white/5">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#7dd3fc] to-[#34d399]" style={{ width: `${(check / maxAvgCheck) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white">{formatMoney(check)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <Panel title={t('analyst_summary', 'Краткое резюме')} eyebrow={t('analyst_report', 'Отчёт')}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#7dd3fc]">{t('analyst_growth', 'Рост')}</div>
              <div className="mt-2 text-2xl font-black text-white">
                {revenueData.length > 1
                  ? `+${((revenueData[revenueData.length - 1] / revenueData[revenueData.length - 2] - 1) * 100).toFixed(1)}%`
                  : '—'}
              </div>
              <div className="mt-1 text-xs text-white/40">{t('analyst_vs_last_month', 'По сравнению с прошлым месяцем')}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#f97360]">{t('analyst_avg_rating', 'Средняя оценка')}</div>
              <div className="mt-2 text-2xl font-black text-white">4.7</div>
              <div className="mt-1 text-xs text-white/40">{t('analyst_guest_reviews', 'Отзывы гостей')}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#34d399]">{t('analyst_return_rate', 'Возвращаемость')}</div>
              <div className="mt-2 text-2xl font-black text-white">62%</div>
              <div className="mt-1 text-xs text-white/40">{t('analyst_returning_guests', 'Повторные гости')}</div>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
