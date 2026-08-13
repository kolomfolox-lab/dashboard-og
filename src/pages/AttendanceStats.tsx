import { useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarDays, Clock, Flame, TrendingUp, Users } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { BarChartBlock } from '@/components/app/Charts';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

export default function AttendanceStatsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!workspace.selectedRestaurantId) return;
      setLoading(true);
      setError('');
      try {
        const response = await ownerAPI.getStats(workspace.selectedRestaurantId);
        if (active) setStats(response.data);
      } catch (err: any) {
        if (active) setError(err?.response?.data?.error || t('attendance_error_failed_load', 'Failed to load statistics.'));
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [workspace.selectedRestaurantId]);

  const dailyData = useMemo(() => {
    if (!stats?.daily_guests_total) return [];
    const days = [t('attendance_day_mon', 'Пн'), t('attendance_day_tue', 'Вт'), t('attendance_day_wed', 'Ср'), t('attendance_day_thu', 'Чт'), t('attendance_day_fri', 'Пт'), t('attendance_day_sat', 'Сб'), t('attendance_day_sun', 'Вс')];
    return { labels: days, datasets: [{ label: t('attendance_chart_guests', 'Гости'), data: stats.daily_guests_total, backgroundColor: 'rgba(249,115,96,0.5)', borderColor: '#f97360', borderWidth: 1, borderRadius: 6 }] };
  }, [stats]);

  const peakHours = useMemo(() => {
    if (!stats?.hourly_load) return [];
    const labels = Array.from({ length: 12 }, (_, i) => `${i + 10}:00`);
    return { labels, datasets: [{ label: t('attendance_chart_load_percent', 'Загрузка %'), data: stats.hourly_load, backgroundColor: 'rgba(141,212,255,0.4)', borderColor: '#8fd4ff', borderWidth: 1, borderRadius: 6 }] };
  }, [stats]);

  const totalGuests = stats?.total_guests_today || 0;
  const avgLoad = stats?.average_load || 0;
  const tableTurnover = stats?.table_turnover || 0;
  const peakLabel = stats?.peak_hour_label || '—';

  return (
    <AppShell
      title={t('attendance_title', 'Статистика посещаемости')}
      subtitle={t('attendance_subtitle', 'Аналитика по загрузке зала, пиковым часам и оборачиваемости столов')}
      eyebrow={t('attendance_eyebrow', 'Attendance')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard title={t('attendance_metric_guests_today', 'Гостей сегодня')} value={totalGuests} note={t('attendance_metric_guests_today_note', 'За текущий день')} icon={Users} tone="coral" />
          <MetricCard title={t('attendance_metric_hall_load', 'Загрузка зала')} value={`${avgLoad}%`} note={t('attendance_metric_hall_load_note', 'Средняя за день')} icon={BarChart3} tone="cyan" />
          <MetricCard title={t('attendance_metric_table_turnover', 'Оборот стола')} value={`${tableTurnover} ${t('attendance_minutes', 'мин')}`} note={t('attendance_metric_table_turnover_note', 'Среднее время')} icon={Clock} tone="mint" />
          <MetricCard title={t('attendance_metric_peak_hour', 'Пиковый час')} value={peakLabel} note={t('attendance_metric_peak_hour_note', 'Максимальная загрузка')} icon={Flame} tone="sand" />
        </div>

        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel
            title={t('attendance_panel_guests_by_day', 'Гости по дням')}
            eyebrow={t('attendance_panel_guests_by_day_eyebrow', 'Daily')}
            description={t('attendance_panel_guests_by_day_desc', 'Количество гостей за последние 7 дней')}
            action={
              <div className="flex gap-2">
                {(['week', 'month'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] border transition ${
                      period === p ? 'border-[#f97360]/40 bg-[#f97360]/12 text-white' : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
                    }`}
                  >
                    {p === 'week' ? t('attendance_period_week', 'Неделя') : t('attendance_period_month', 'Месяц')}
                  </button>
                ))}
              </div>
            }
          >
            {loading ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{t('attendance_loading', 'Загрузка...')}</div>
            ) : stats?.daily_guests_total ? <div className="h-64"><BarChartBlock data={dailyData} /></div> : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{t('attendance_no_data_guests', 'Нет данных. Статистика появится после первых визитов.')}</div>
            )}
          </Panel>

          <Panel
            title={t('attendance_panel_hourly_load', 'Загрузка по часам')}
            eyebrow={t('attendance_panel_hourly_load_eyebrow', 'Peak hours')}
            description={t('attendance_panel_hourly_load_desc', 'Распределение гостей в течение дня')}
          >
            {loading ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{t('attendance_loading', 'Загрузка...')}</div>
            ) : stats?.hourly_load ? <div className="h-64"><BarChartBlock data={peakHours} /></div> : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{t('attendance_no_data_hourly', 'Нет данных по часам.')}</div>
            )}
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
          <Panel title={t('attendance_panel_key_metrics', 'Метрики зала')} eyebrow={t('attendance_panel_key_metrics_eyebrow', 'Key metrics')} description={t('attendance_panel_key_metrics_desc', 'Основные показатели эффективности')}>
            <div className="space-y-4">
              {[
                { label: t('attendance_metric_avg_check', 'Средний чек'), value: stats?.average_check ? `${Number(stats.average_check).toLocaleString()} UZS` : '—', icon: TrendingUp },
                { label: t('attendance_metric_avg_visit_duration', 'Среднее время визита'), value: stats?.average_visit_duration ? `${stats.average_visit_duration} ${t('attendance_minutes', 'мин')}` : '—', icon: Clock },
                { label: t('attendance_metric_repeat_visits', 'Повторные визиты'), value: stats?.repeat_visits_percent ? `${stats.repeat_visits_percent}%` : '—', icon: Users },
                { label: t('attendance_metric_peak_load', 'Пик загрузки'), value: peakLabel, icon: Flame },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="flex items-center justify-between rounded-[20px] border border-white/8 bg-black/12 p-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-white/30" />
                      <span className="text-sm text-white/60">{m.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{m.value}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel title={t('attendance_panel_forecast', 'Прогноз загрузки')} eyebrow={t('attendance_panel_forecast_eyebrow', 'Forecast')} description={t('attendance_panel_forecast_desc', 'Ожидаемая загрузка на ближайшие дни')}>
            {loading ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{t('attendance_loading', 'Загрузка...')}</div>
            ) : stats?.forecast?.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                  {stats.forecast.map((day: any) => {
                    const d = new Date(day.date);
                    const load = day.percentage;
                    const noData = day.has_data === false;
                    return (
                      <div key={day.date} className="rounded-[20px] border border-white/8 bg-black/12 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white/50">{d.toLocaleDateString('ru', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          <span className="text-xs font-semibold text-white/30">{noData ? t('attendance_no_data', 'Нет данных') : `${load}%`}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                          {noData ? (
                            <div className="h-full rounded-full bg-white/8" style={{ width: '100%' }} />
                          ) : (
                            <div className={`h-full rounded-full transition-all ${
                              load > 70 ? 'bg-[#ff6b6b]' : load > 50 ? 'bg-[#ff8f8f]' : 'bg-emerald-400'
                            }`} style={{ width: `${load}%` }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{t('attendance_no_data_forecast', 'Недостаточно данных для прогноза.')}</div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
