import { useEffect, useMemo, useState } from 'react';
import { ChartSpline, Flame, Layers3, Star, TriangleAlert, Trophy } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { BarChartBlock, DoughnutChartBlock, LineChartBlock } from '@/components/app/Charts';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { OwnerComparisonStrip, type OwnerComparisonItem } from '@/components/app/OwnerComparisonStrip';
import { Panel } from '@/components/app/Panel';
import { SubscriptionExpired } from '@/components/app/SubscriptionExpired';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { formatMoney } from '@/lib/utils';
import { adminAPI, ownerAPI } from '@/services/api';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isSubscribed = user?.role !== 'RESTAURANT_OWNER' || workspace.selectedRestaurant?.subscription_active !== false;

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (user?.role === 'SUPER_ADMIN') {
          const response = await adminAPI.getSuperAdminStats();
          if (active) setStats(response.data);
          return;
        }

        if (user?.role === 'RESTAURANT_OWNER' && workspace.selectedRestaurantId) {
          if (workspace.selectedRestaurant?.subscription_active === false) {
            if (active) setStats(null);
            return;
          }
          const response = await ownerAPI.getStats(workspace.selectedRestaurantId);
          if (active) setStats(response.data);
        }
      } catch (err: any) {
        if (active) setError(err?.response?.data?.error || t('analytics_error_load', 'Не удалось загрузить аналитику.'));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [locale, user?.role, workspace.selectedRestaurant?.subscription_active, workspace.selectedRestaurantId]);

  const handleActivateSubscription = async (key: string) => {
    if (!workspace.selectedRestaurantId) {
      throw new Error('No workspace selected');
    }

    await ownerAPI.activateSubscription({
      key,
      restaurant_id: workspace.selectedRestaurantId,
    });
    workspace.reload();
  };

  const revenueData = useMemo(
    () => ({
      labels: (stats?.daily_revenue || []).map((item: any) =>
        new Date(item.date).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'short', day: 'numeric' }),
      ),
      datasets: [
        {
          label: t('analytics_revenue_label', 'Выручка'),
          data: (stats?.daily_revenue || []).map((item: any) => Number(item.revenue || 0)),
          borderColor: '#7dd3fc',
          backgroundColor: 'rgba(125,211,252,0.15)',
          fill: true,
          tension: 0.35,
        },
        {
          label: t('analytics_orders_label', 'Заказы'),
          data: (stats?.daily_revenue || []).map((item: any) => Number(item.orders || 0)),
          borderColor: '#f97360',
          backgroundColor: 'rgba(249,115,96,0.08)',
          fill: false,
          tension: 0.25,
        },
      ],
    }),
    [locale, stats],
  );

  const topItemsData = useMemo(
    () => ({
      labels: (stats?.top_dishes || stats?.top_chains || []).map((item: any) => item.name || item.chain || item.dish),
      datasets: [
        {
          label: t('analytics_income_label', 'Доход'),
          data: (stats?.top_dishes || stats?.top_chains || []).map((item: any) => Number(item.revenue || 0)),
          backgroundColor: ['#f97360', '#7dd3fc', '#34d399', '#f7b267', '#a78bfa'],
          borderRadius: 12,
        },
      ],
    }),
    [locale, stats],
  );

  const statusData = useMemo(
    () => ({
      labels: (stats?.status_breakdown || []).map((item: any) => item.status),
      datasets: [
        {
          data: (stats?.status_breakdown || []).map((item: any) => Number(item.count || 0)),
          backgroundColor: ['#f97360', '#7dd3fc', '#34d399', '#f7b267', '#a78bfa', '#f43f5e'],
          borderWidth: 0,
        },
      ],
    }),
    [stats],
  );

  const waiterRatingData = useMemo(
    () => ({
      labels: (stats?.waiter_ratings || []).slice(0, 6).map((item: any) => item.full_name),
      datasets: [
        {
          label: t('analytics_waiter_rating_label', 'Рейтинг официанта'),
          data: (stats?.waiter_ratings || []).slice(0, 6).map((item: any) => Number(item.average_waiter_rating || 0)),
          backgroundColor: ['#f59e0b', '#f97360', '#7dd3fc', '#34d399', '#a78bfa', '#f7b267'],
          borderRadius: 12,
        },
      ],
    }),
    [locale, stats],
  );

  const ownerComparisonItems = useMemo<OwnerComparisonItem[]>(() => {
    const days = stats?.daily_revenue || [];
    const lastDay = days[days.length - 1] || {};
    const previousDay = days[days.length - 2] || {};
    const revenueToday = Number(stats?.revenue_today ?? lastDay.revenue ?? 0);
    const revenueYesterday = Number(previousDay.revenue || 0);
    const revenueAverage = Number(stats?.revenue_30_days || 0) / 30;
    const ordersToday = Number(stats?.orders_today || lastDay.orders || 0);
    const ordersAverage = Number(stats?.orders_30_days || 0) / 30;
    const topDish = stats?.top_dishes?.[0];

    return [
      {
        label: t('analytics_sales_momentum', 'Импульс продаж'),
        value: formatMoney(revenueToday),
        detail: t('analytics_yesterday', `${formatMoney(revenueYesterday)} вчера`),
        delta: percentDelta(revenueToday, revenueYesterday),
        tone: 'coral',
      },
      {
        label: t('analytics_daily_norm', 'Дневная норма'),
        value: formatMoney(revenueAverage),
        detail: t('analytics_calculated_from_30d', 'Считается от выручки за 30 дней'),
        delta: percentDelta(revenueToday, revenueAverage),
        tone: 'sand',
      },
      {
        label: t('analytics_order_rhythm', 'Ритм заказов'),
        value: ordersToday,
        detail: t('analytics_daily_avg', `${ordersAverage.toFixed(1)} среднее за день`),
        delta: percentDelta(ordersToday, ordersAverage),
        tone: 'cyan',
      },
      {
        label: t('analytics_menu_leader', 'Лидер меню'),
        value: topDish?.name || t('analytics_no_leader', 'Пока нет'),
        detail: topDish ? `${formatMoney(topDish.revenue)} · ${topDish.quantity || 0} ${t('analytics_sold', 'продано')}` : t('analytics_waiting_orders', 'Ждем первые продажи'),
        delta: percentDelta(Number(topDish?.revenue || 0), Number(stats?.revenue_30_days || 0) / 5),
        tone: 'mint',
      },
    ];
  }, [locale, stats]);

  if (loading || workspace.loading) {
    return (
      <AppShell
        title={t('analytics_loading_title', 'Аналитика')}
        subtitle={t('analytics_loading_subtitle', 'Графики и показатели загружаются.')}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-theme bg-[var(--panel-bg)]">
              <CardHeader>
                <Skeleton className="h-3.5 w-28 bg-white/8" />
                <Skeleton className="mt-3 h-9 w-24 bg-white/8" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-44 w-full rounded-2xl bg-white/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      </AppShell>
    );
  }

  if (!isSubscribed) {
    return (
      <AppShell
        title={t('analytics_closed_title', 'Аналитика закрыта')}
        subtitle={t('analytics_closed_subtitle', 'Активируйте ключ подписки, чтобы снова открыть аналитику.')}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <SubscriptionExpired
          restaurantId={workspace.selectedRestaurantId}
          restaurantName={workspace.selectedRestaurant?.name}
          onActivate={handleActivateSubscription}
        />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell
        title={t('analytics_error_title', 'Аналитика недоступна')}
        subtitle={t('analytics_error_subtitle', 'Не удалось выполнить запрос.')}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <Card className="border-red-500/20 bg-red-500/[0.06]">
          <CardContent>
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              {error}
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (user?.role === 'SUPER_ADMIN') {
    return (
      <AppShell
        title={t('analytics_title_superadmin', 'Аналитика платформы')}
        subtitle={t('analytics_subtitle_superadmin', 'Понятная картина по доходу, сетям и ключам активации.')}
        eyebrow={t('analytics_superadmin_eyebrow', 'Обзор для руководства')}
      >
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem><span className="text-theme-secondary">Waitly</span></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('analytics_title_superadmin', 'Аналитика платформы')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title={t('analytics_platform_revenue', 'Доход платформы')}
              value={formatMoney(stats?.platform_revenue)}
              note={t('analytics_platform_revenue_note', 'Показатель за последние 30 дней')}
              icon={ChartSpline}
              tone="cyan"
            />
            <MetricCard
              title={t('analytics_best_chain', 'Лучшая сеть')}
              value={stats?.top_chains?.[0]?.chain || t('analytics_no_data', 'Нет данных')}
              note={t('analytics_best_chain_note', 'Сеть с максимальным вкладом в доход')}
              icon={Trophy}
              tone="sand"
            />
            <MetricCard
              title={t('analytics_free_keys', 'Свободные ключи')}
              value={stats?.unused_keys || 0}
              note={t('analytics_free_keys_note', 'Активации, которые еще не назначены')}
              icon={Layers3}
              tone="coral"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Panel
              title={t('analytics_revenue_by_chain', 'Доход по сетям')}
              eyebrow={t('analytics_revenue_by_chain_eyebrow', 'Главные драйверы')}
              description={t('analytics_revenue_by_chain_desc', 'Показывает, какие сети реально тянут платформу вперед.')}
            >
              <div className="h-[360px]"><BarChartBlock data={topItemsData} /></div>
            </Panel>
            <Panel
              title={t('analytics_status_balance', 'Баланс состояний')}
              eyebrow={t('analytics_status_balance_eyebrow', 'Смешение')}
              description={t('analytics_status_balance_desc', 'Показывает соотношение активности и статусов в одной чистой диаграмме.')}
            >
              <div className="h-[360px]"><DoughnutChartBlock data={statusData} /></div>
            </Panel>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={workspace.selectedRestaurant?.name || t('analytics_title_owner', 'Аналитика ресторана')}
      subtitle={t('analytics_subtitle_owner', 'Ключевые показатели ресторана: выручка, блюда, статусы заказов и команда.')}
      eyebrow={t('analytics_owner_eyebrow', 'Показатели ресторана')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><span className="text-theme-secondary">Waitly</span></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{workspace.selectedRestaurant?.name || t('analytics_title_owner', 'Аналитика ресторана')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title={t('analytics_top_dish', 'Топ-блюдо')}
            value={stats?.top_dishes?.[0]?.name || t('analytics_no_data_short', 'Нет данных')}
            note={stats?.top_dishes?.[0] ? formatMoney(stats.top_dishes[0].revenue) : t('analytics_waiting_data', 'Ждем данные')}
            icon={Flame}
            tone="coral"
          />
          <MetricCard
            title={t('analytics_avg_check', 'Средний чек')}
            value={formatMoney(stats?.avg_check_30_days)}
            note={t('analytics_avg_check_note', 'База по доставленным заказам')}
            icon={ChartSpline}
            tone="cyan"
          />
          <MetricCard
            title={t('analytics_active_orders', 'Активные заказы')}
            value={stats?.active_orders || 0}
            note={t('analytics_active_orders_note', 'Текущая нагрузка прямо сейчас')}
            icon={Layers3}
            tone="mint"
          />
          <MetricCard
            title={t('analytics_waiter_rating', 'Рейтинг официантов')}
            value={stats?.waiter_rating_summary?.average_waiter_rating ? `${stats.waiter_rating_summary.average_waiter_rating}★` : '—'}
            note={stats?.waiter_rating_summary?.top_waiter_name || t('analytics_no_reviews', 'Пока нет отзывов')}
            icon={Star}
            tone="sand"
          />
        </div>

        <OwnerComparisonStrip items={ownerComparisonItems} />

        <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
          <Panel
            title={t('analytics_revenue_dynamics', 'Динамика выручки')}
            eyebrow={t('analytics_revenue_dynamics_eyebrow', 'Линия за две недели')}
            description={t('analytics_revenue_dynamics_desc', 'Чистый тренд, чтобы владелец понимал состояние бизнеса за один взгляд.')}
          >
            <div className="h-[360px]"><LineChartBlock data={revenueData} /></div>
          </Panel>
          <Panel
            title={t('analytics_order_statuses', 'Статусы заказов')}
            eyebrow={t('analytics_order_statuses_eyebrow', 'Операционная картина')}
            description={t('analytics_order_statuses_desc', 'Помогает увидеть, где возникает узкое место: кухня или доставка.')}
          >
            <div className="h-[360px]"><DoughnutChartBlock data={statusData} /></div>
          </Panel>
        </div>

        <Panel
          title={t('analytics_dish_revenue', 'Доход по блюдам')}
          eyebrow={t('analytics_dish_revenue_eyebrow', 'Победители меню')}
          description={t('analytics_dish_revenue_desc', 'Показывает, какие позиции меню реально зарабатывают деньги.')}
        >
          <div className="h-[360px]"><BarChartBlock data={topItemsData} /></div>
        </Panel>

        <Panel
          title={t('analytics_waiter_rating_panel', 'Рейтинг официантов')}
          eyebrow={t('analytics_waiter_rating_eyebrow', 'Оценка гостей')}
          description={t('analytics_waiter_rating_desc', 'Этот блок считается из реальных guest-review и показывает именно качество работы официантов.')}
        >
          <div className="h-[360px]"><BarChartBlock data={waiterRatingData} /></div>
        </Panel>

        <Panel
          title={t('analytics_team_results', 'Результаты команды')}
          eyebrow={t('analytics_team_results_eyebrow', 'По сменам')}
          description={t('analytics_team_results_desc', 'Позволяет увидеть вклад команды без перехода в другой раздел.')}
        >
          <DataTable
            rows={stats?.staff_performance || []}
            columns={[
              { label: t('analytics_col_employee', 'Сотрудник'), key: 'full_name', render: (row) => <div className="font-semibold text-theme">{row.full_name}</div> },
              { label: t('analytics_col_role', 'Роль'), key: 'role' },
              { label: t('analytics_col_hours', 'Часы'), key: 'hours_worked' },
              { label: t('analytics_col_shifts', 'Смены'), key: 'shifts_count' },
              { label: t('analytics_col_delivered', 'Доставлено'), key: 'delivered_orders' },
              {
                label: t('analytics_col_rating', 'Рейтинг'),
                key: 'average_waiter_rating',
                render: (row) => row.average_waiter_rating ? `${row.average_waiter_rating}★` : '—',
              },
              { label: t('analytics_col_reviews', 'Отзывы'), key: 'reviews_count' },
              { label: t('analytics_col_revenue', 'Выручка'), key: 'revenue', render: (row) => formatMoney(row.revenue) },
              {
                label: t('analytics_col_status', 'Статус рейтинга'),
                key: 'waiter_rating_label',
                render: (row) => row.waiter_rating_label || '—',
              },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}

function percentDelta(current: number, baseline: number) {
  if (!baseline) return current ? 100 : null;
  return ((current - baseline) / Math.abs(baseline)) * 100;
}
