import { useEffect, useMemo, useState } from 'react';
import { Activity, DollarSign, KeyRound, Percent, ShoppingBag, Star, Store, UsersRound, Sparkles, CreditCard, ArrowUpRight, Coffee, UtensilsCrossed, PartyPopper, Pizza, Plus, ClipboardList, Share2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { useNavigate } from 'react-router-dom';

import { AppShell } from '@/components/app/AppShell';
import { BarChartBlock, DoughnutChartBlock, LineChartBlock } from '@/components/app/Charts';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { OwnerComparisonStrip, type OwnerComparisonItem } from '@/components/app/OwnerComparisonStrip';
import { Panel } from '@/components/app/Panel';
import { SubscriptionExpired } from '@/components/app/SubscriptionExpired';
import { VideoSplashLoader } from '@/components/app/VideoSplashLoader';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { cn, formatCompactNumber, formatDateTime, formatMoney } from '@/lib/utils';
import { adminAPI, ownerAPI } from '@/services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const navigate = useNavigate();
  const isOwner = user?.role === 'RESTAURANT_OWNER';
  const workspace = useOwnerWorkspace(isOwner || user?.role === 'CHAIN_OWNER');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [foodCost, setFoodCost] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);

  const isSubscribed = useMemo(() => {
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'CHAIN_OWNER') return true;
    return workspace.selectedRestaurant?.subscription_active !== false;
  }, [user?.role, workspace.selectedRestaurant]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (user?.role === 'SUPER_ADMIN') {
          const response = await adminAPI.getSuperAdminStats();
          if (active) {
            setStats(response.data);
            setOrders([]);
          }
          return;
        }

        if ((user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER') && workspace.selectedRestaurantId) {
          if (user?.role === 'RESTAURANT_OWNER' && workspace.selectedRestaurant?.subscription_active === false) {
            if (active) {
              setStats(null);
              setOrders([]);
            }
            return;
          }

          const [statsResponse, ordersResponse, foodCostResponse, funnelResponse] = await Promise.all([
            ownerAPI.getStats(workspace.selectedRestaurantId),
            ownerAPI.getOrders(workspace.selectedRestaurantId, 'all'),
            ownerAPI.getFoodCost(workspace.selectedRestaurantId, 'today').catch(() => null),
            ownerAPI.getOrderFunnel(workspace.selectedRestaurantId).catch(() => null),
          ]);

          if (active) {
            setStats(statsResponse.data);
            setOrders(ordersResponse.data || []);
            setFoodCost(foodCostResponse?.data || null);
            setFunnel(funnelResponse?.data?.funnel || []);
          }
          return;
        }
      } catch (err: any) {
        if (active) {
          setError(err?.response?.data?.error || t('dashboard_error_load', 'Не удалось загрузить данные дашборда.'));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [locale, user?.role, workspace.selectedRestaurant?.subscription_active, workspace.selectedRestaurantId]);

  const ownerRevenueData = useMemo(
    () => ({
      labels: (stats?.daily_revenue || []).map((item: any) =>
        new Date(item.date).toLocaleDateString(locale === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'short', day: 'numeric' }),
      ),
      datasets: [
        {
          label: t('dashboard_revenue', 'Выручка'),
          data: (stats?.daily_revenue || []).map((item: any) => Number(item.revenue || 0)),
          borderColor: '#f97360',
          backgroundColor: 'rgba(249,115,96,0.22)',
          fill: true,
          tension: 0.35,
        },
        {
          label: t('dashboard_orders', 'Заказы'),
          data: (stats?.daily_revenue || []).map((item: any) => Number(item.orders || 0)),
          borderColor: '#7dd3fc',
          backgroundColor: 'rgba(125,211,252,0.08)',
          fill: false,
          tension: 0.3,
        },
      ],
    }),
    [locale, stats],
  );

  const ownerStatusData = useMemo(
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

  const ownerStaffData = useMemo(
    () => ({
      labels: (stats?.staff_performance || []).slice(0, 6).map((item: any) => item.full_name),
      datasets: [
        {
          label: t('dashboard_revenue', 'Выручка'),
          data: (stats?.staff_performance || []).slice(0, 6).map((item: any) => Number(item.revenue || 0)),
          backgroundColor: 'rgba(125,211,252,0.84)',
          borderRadius: 12,
        },
        {
          label: t('dashboard_hours', 'Часы'),
          data: (stats?.staff_performance || []).slice(0, 6).map((item: any) => Number(item.hours_worked || 0)),
          backgroundColor: 'rgba(249,115,96,0.64)',
          borderRadius: 12,
        },
      ],
    }),
    [locale, stats],
  );

  const waiterRatingData = useMemo(
    () => ({
      labels: (stats?.waiter_ratings || []).slice(0, 6).map((item: any) => item.full_name),
      datasets: [
        {
          label: t('dashboard_waiter_rating', 'Рейтинг официанта'),
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
    const topStaff = stats?.staff_performance?.[0];

    return [
      {
        label: t('dashboard_today_vs_yesterday', 'Сегодня vs вчера'),
        value: formatMoney(revenueToday),
        detail: `${formatMoney(revenueYesterday)} вчера`,
        delta: percentDelta(revenueToday, revenueYesterday),
        tone: 'coral',
      },
      {
        label: t('dashboard_today_vs_average', 'Сегодня vs среднее'),
        value: formatMoney(revenueToday),
        detail: `${formatMoney(revenueAverage)} среднее за день`,
        delta: percentDelta(revenueToday, revenueAverage),
        tone: 'sand',
      },
      {
        label: t('dashboard_orders', 'Заказы'),
        value: ordersToday,
        detail: `${ordersAverage.toFixed(1)} среднее за день`,
        delta: percentDelta(ordersToday, ordersAverage),
        tone: 'cyan',
      },
      {
        label: t('dashboard_top_employee', 'Топ сотрудник'),
        value: topStaff?.full_name || t('dashboard_none_yet', 'Пока нет'),
        detail: topStaff ? `${formatMoney(topStaff.revenue)} · ${topStaff.delivered_orders || 0} ${t('dashboard_orders_count', 'заказов')}` : t('dashboard_shift_data_pending', 'Ждем данные по сменам'),
        delta: percentDelta(Number(topStaff?.revenue || 0), Number(stats?.revenue_30_days || 0) / Math.max(Number(stats?.staff_count || 1), 1)),
        tone: 'mint',
      },
    ];
  }, [locale, stats]);

  const platformChainData = useMemo(
    () => ({
      labels: (stats?.top_chains || []).map((item: any) => item.chain),
      datasets: [
        {
          label: t('dashboard_revenue', 'Выручка'),
          data: (stats?.top_chains || []).map((item: any) => Number(item.revenue || 0)),
          backgroundColor: ['#f97360', '#7dd3fc', '#34d399', '#f7b267', '#a78bfa'],
          borderRadius: 12,
        },
      ],
    }),
    [locale, stats],
  );

  const platformKeyData = useMemo(
    () => ({
      labels: [t('dashboard_active', 'Активные'), t('dashboard_expired', 'Истекшие'), t('dashboard_free', 'Свободные')],
      datasets: [
        {
          data: [Number(stats?.active_keys || 0), Number(stats?.expired_keys || 0), Number(stats?.unused_keys || 0)],
          backgroundColor: ['#34d399', '#f97360', '#94a3b8'],
          borderWidth: 0,
        },
      ],
    }),
    [locale, stats],
  );

  const ownerRows = (stats?.staff_performance || []).map((person: any) => ({
    ...person,
    revenue_display: formatMoney(person.revenue),
    waiter_rating_display: person.average_waiter_rating ? `${person.average_waiter_rating}★` : '—',
    active_label: person.active_shift ? t('dashboard_on_shift', 'На смене') : t('dashboard_offline', 'Не в смене'),
  }));

  const handleActivateSubscription = async (key: string) => {
    if (!workspace.selectedRestaurantId) throw new Error('No workspace selected');
    await ownerAPI.activateSubscription({ key, restaurant_id: workspace.selectedRestaurantId });
    workspace.reload();
  };

  if (loading || workspace.loading) {
    return (
      <AppShell
        title={t('dashboard_loading', 'Загрузка...')}
        subtitle={t('dashboard_updating', 'Waitly обновляет данные.')}
      >
        <VideoSplashLoader compact className="min-h-[420px]" title={t('dashboard_loading_title', 'Дашборд загружается')} subtitle={t('dashboard_loading_subtitle', 'Подготавливаем метрики и данные выбранного ресторана.')} />
      </AppShell>
    );
  }

  if (!isSubscribed) {
    return (
      <AppShell
        title={t('dashboard_access_restricted', 'Доступ ограничен')}
        subtitle={t('dashboard_subscription_inactive_msg', 'Пока подписка не активирована, этот раздел закрыт.')}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <SubscriptionExpired restaurantId={workspace.selectedRestaurantId} restaurantName={workspace.selectedRestaurant?.name} onActivate={handleActivateSubscription} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell
        title={t('dashboard_unavailable', 'Дашборд недоступен')}
        subtitle={t('dashboard_error_loading_data', 'Не удалось загрузить данные.')}
      >
        <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-100">{error}</div>
      </AppShell>
    );
  }

  if (user?.role === 'SUPER_ADMIN') {
    return (
      <AppShell
        title={t('dashboard_title_superadmin', 'Контроль платформы')}
        subtitle={t('dashboard_subtitle_superadmin', 'Главные показатели платформы, сети, ключи и общая активность без лишней перегрузки.')}
        eyebrow={t('dashboard_control_center', 'Центр контроля')}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title={t('dashboard_total_chains', 'Всего сетей')} value={stats?.total_chains || 0} icon={Store} tone="coral" trend={{ direction: 'up', label: t('dashboard_ecosystem_growth', 'Рост экосистемы') }} />
            <MetricCard title={t('dashboard_keys_issued', 'Выданные ключи')} value={stats?.active_keys || 0} icon={KeyRound} tone="mint" note={`${stats?.unused_keys || 0} ${t('dashboard_keys_pending', 'ожидают')}`} />
            <MetricCard title={t('dashboard_total_revenue', 'Общая выручка')} value={formatMoney(stats?.platform_revenue)} icon={DollarSign} tone="sand" note={t('dashboard_last_30_days', 'За 30 дней')} />
            <MetricCard title={t('dashboard_system_load', 'Нагрузка системы')} value={formatCompactNumber(stats?.total_orders)} icon={ShoppingBag} tone="cyan" trend={{ direction: 'up', label: t('dashboard_transactions', 'Транзакции') }} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <Panel title={t('dashboard_chain_revenue', 'Доход по сетям')} eyebrow={t('dashboard_growth', 'Рост')} description={t('dashboard_chain_revenue_desc', 'Показывает, какие сети дают основной рост платформы.')}>
              <div className="h-[400px]"><BarChartBlock data={platformChainData} /></div>
            </Panel>
            <Panel title={t('dashboard_key_status', 'Состояние ключей')} eyebrow={t('dashboard_audit', 'Аудит')} description={t('dashboard_key_status_desc', 'Распределение активных, истекших и свободных ключей.')}>
              <div className="h-[400px]"><DoughnutChartBlock data={platformKeyData} /></div>
            </Panel>
          </div>

          <Panel title={t('dashboard_top_chains', 'Самые активные сети')} eyebrow={t('dashboard_platform', 'Платформа')} description={t('dashboard_top_chains_desc', 'Краткий обзор ключевых сетей на платформе.')}>
            <DataTable
              rows={stats?.top_chains || []}
              columns={[
                { label: t('dashboard_chain', 'Сеть'), key: 'chain', render: (row) => <div className="font-semibold text-white">{row.chain}</div> },
                { label: t('dashboard_revenue', 'Выручка'), key: 'revenue', render: (row) => formatMoney(row.revenue) },
                { label: t('dashboard_status', 'Статус'), key: 'status', render: () => <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{t('dashboard_active_status', 'Активен')}</span> },
              ]}
              emptyMessage={t('dashboard_no_activity', 'Пока нет данных по активности платформы.')}
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (user?.role === 'CHAIN_OWNER') {
    return (
      <AppShell
        title={workspace.profile?.chains?.[0]?.name || t('dashboard_chain_hub_fallback', 'Chain Hub')}
        subtitle={t('dashboard_chain_subtitle', 'Смотрите филиалы, продажи и ритм команды из одного интерфейса.')}
        eyebrow={t('dashboard_chain_management', 'Управление сетью')}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title={t('dashboard_branches', 'Филиалы')} value={workspace.restaurants.length || 0} icon={Store} tone="coral" trend={{ direction: 'up', label: t('dashboard_network_points', 'Точек в сети') }} />
            <MetricCard title={t('dashboard_revenue', 'Выручка')} value={formatMoney(stats?.revenue_today)} icon={DollarSign} tone="sand" note={workspace.selectedRestaurant?.name || t('dashboard_selected_restaurant', 'Выбранный ресторан')} />
            <MetricCard title={t('dashboard_orders', 'Заказы')} value={stats?.orders_today || 0} icon={ShoppingBag} tone="cyan" trend={stats?.orders_today > 0 ? { direction: 'up', label: t('dashboard_today_flow', 'Сегодняшний поток') } : undefined} />
            <MetricCard title={t('dashboard_on_shift', 'На смене')} value={stats?.active_staff_now || 0} icon={UsersRound} tone="mint" note={t('dashboard_on_shift_now', 'Сейчас на смене')} />
          </div>

          <OwnerComparisonStrip items={ownerComparisonItems} />

          <div className="grid gap-6 xl:grid-cols-3">
            <Panel title={t('dashboard_branch_dynamics', 'Динамика выбранного филиала')} eyebrow={t('dashboard_sales', 'Продажи')} className="xl:col-span-2">
              <div className="h-[360px]"><LineChartBlock data={ownerRevenueData} /></div>
            </Panel>
            <Panel title={t('dashboard_order_statuses', 'Статусы заказов')} eyebrow={t('dashboard_process', 'Процесс')}>
              <div className="h-[360px]"><DoughnutChartBlock data={ownerStatusData} /></div>
            </Panel>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(workspace.restaurants || []).map((restaurant: any) => (
              <Panel key={restaurant.id} title={restaurant.name} eyebrow={t('dashboard_branch', 'Филиал')} description={`Slug: ${restaurant.slug}`} className="h-full">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 text-sm">
                    <span className="text-white/40 font-medium">{t('dashboard_subscription_status', 'Статус подписки')}</span>
                    <span className={restaurant.subscription_active ? 'text-emerald-400 font-bold uppercase tracking-widest text-[10px]' : 'text-red-400 font-bold uppercase tracking-widest text-[10px]'}>
                      {restaurant.subscription_active ? t('dashboard_subscription_active', 'Активна') : t('dashboard_subscription_inactive', 'Неактивна')}
                    </span>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={stats?.restaurant_name || workspace.selectedRestaurant?.name || t('dashboard_title_owner', 'Обзор бизнеса')}
      subtitle={t('dashboard_subtitle_owner', 'Понятный обзор выручки, заказов, команды и текущей загрузки ресторана.')}
      eyebrow={t('dashboard_restaurant_operations', 'Операции ресторана')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title={t('dashboard_revenue_today', 'Выручка сегодня')} value={formatMoney(stats?.revenue_today)} icon={DollarSign} tone="coral" trend={stats?.revenue_today_trend != null ? { direction: stats.revenue_today_trend >= 0 ? 'up' : 'down', label: `${Math.abs(stats.revenue_today_trend)}%` } : undefined} />
          <MetricCard title={t('dashboard_revenue_30_days', 'Выручка за 30 дней')} value={formatMoney(stats?.revenue_30_days)} icon={Activity} tone="sand" />
          <MetricCard title={t('dashboard_avg_check', 'Средний чек')} value={formatMoney(stats?.avg_check_30_days)} icon={ShoppingBag} tone="cyan" />
          <MetricCard title={t('dashboard_orders_today', 'Заказы сегодня')} value={stats?.orders_today || 0} icon={Coffee} tone="mint" />
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => {
              const url = `https://${workspace.selectedRestaurant?.full_url || `${workspace.selectedRestaurant?.subdomain || ''}.waitly.uz`}/menu`;
              navigator.clipboard.writeText(url);
              showToast('Ссылка на меню скопирована', 'success');
            }}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
          >
            <Share2 className="h-4 w-4" /> Поделиться меню
          </button>
          <button
            onClick={() => navigate('/expenses')}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
          >
            <Plus className="h-4 w-4" /> Добавить расход
          </button>
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/16"
          >
            <ClipboardList className="h-4 w-4" /> Меню
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title={t('dashboard_active_staff', 'Активный staff')} value={stats?.active_staff_now || 0} icon={UsersRound} tone="mint" />
          <MetricCard
            title={t('dashboard_waiter_ratings', 'Рейтинг официантов')}
            value={stats?.waiter_rating_summary?.average_waiter_rating ? `${stats.waiter_rating_summary.average_waiter_rating}★` : '—'}
            icon={Star}
            tone="sand"
          />
          <MetricCard
            title={t('dashboard_food_cost', 'Фудкост')}
            value={foodCost?.food_cost_pct != null ? `${foodCost.food_cost_pct}%` : '—'}
            icon={Percent}
            tone={foodCost?.food_cost_pct > 40 ? 'coral' : foodCost?.food_cost_pct > 25 ? 'sand' : 'mint'}
          />
        </div>

        <OwnerComparisonStrip items={ownerComparisonItems} />

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title={t('dashboard_revenue_dynamics', 'Динамика выручки')} eyebrow={t('dashboard_sales', 'Продажи')} className="xl:col-span-2">
            <div className="h-[400px]"><LineChartBlock data={ownerRevenueData} /></div>
          </Panel>
          <Panel title={t('dashboard_order_statuses', 'Статусы заказов')} eyebrow={t('dashboard_process', 'Процесс')}>
            <div className="h-[400px]"><DoughnutChartBlock data={ownerStatusData} /></div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={t('dashboard_strong_employees', 'Сильные сотрудники')} eyebrow={t('dashboard_team', 'Команда')}>
            <div className="h-[400px]"><BarChartBlock data={ownerStaffData} /></div>
          </Panel>
          <Panel title={t('dashboard_waiter_ratings', 'Рейтинг официантов')} eyebrow={t('dashboard_guest_rating', 'Оценка гостей')}>
            <div className="h-[400px]"><BarChartBlock data={waiterRatingData} /></div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={t('dashboard_recent_orders', 'Последние заказы')} eyebrow={t('dashboard_live_feed', 'Живая лента')}>
            <div className="space-y-3">
              {(orders || []).slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4 transition-colors hover:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-xs font-bold text-white">T{order.table}</div>
                    <div>
                      <div className="text-sm font-bold text-white">{t('dashboard_table', 'Стол')} {order.table}</div>
                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8fd4ff]">{order.status}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#ffd4c4]">{formatMoney(order.total)}</div>
                    <div className="mt-0.5 text-[10px] text-white/30">{order.created_at_display || formatDateTime(order.created_at)}</div>
                  </div>
                </div>
              ))}
              {!orders.length ? <div className="rounded-3xl border border-dashed border-white/10 px-4 py-20 text-center text-sm text-white/30">{t('dashboard_no_orders', 'Пока нет новых заказов.')}</div> : null}
            </div>
          </Panel>
          <Panel title={t('dashboard_top_waiters', 'Топ официанты')} eyebrow={t('dashboard_rating', 'Рейтинг')}>
            <div className="space-y-3">
              {(stats?.waiter_ratings || []).slice(0, 5).map((waiter: any) => (
                <div key={waiter.staff_id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4 transition-colors hover:bg-white/5">
                  <div>
                    <div className="text-sm font-bold text-white">{waiter.full_name}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#8fd4ff]">{waiter.waiter_rating_label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#ffd4c4]">{waiter.average_waiter_rating ? `${waiter.average_waiter_rating}★` : '—'}</div>
                    <div className="mt-0.5 text-[10px] text-white/30">{waiter.reviews_count || 0} {t('dashboard_reviews', 'отзывов')}</div>
                  </div>
                </div>
              ))}
              {!(stats?.waiter_ratings || []).length ? <div className="rounded-3xl border border-dashed border-white/10 px-4 py-20 text-center text-sm text-white/30">{t('dashboard_no_ratings', 'Пока нет рейтингов официантов.')}</div> : null}
            </div>
          </Panel>
        </div>

        {funnel.length > 0 && (
          <Panel title={t('dashboard_funnel', 'Воронка заказов')} eyebrow={t('dashboard_funnel_eyebrow', 'Сегодня')}>
            <div className="flex items-end gap-2">
              {funnel.map((f: any, i: number) => (
                <div key={f.key} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-white/30">{f.count}</div>
                  <div className={`w-full rounded-xl transition-all ${i === 0 ? 'bg-[#8fd4ff]' : i === funnel.length - 1 ? 'bg-emerald-400' : 'bg-white/20'}`} 
                    style={{ height: `${Math.max(8, (f.count / Math.max(1, funnel[0].count)) * 120)}px` }} />
                  <div className="text-[10px] text-white/40 text-center">{f.stage}</div>
                </div>
              ))}
            </div>
          </Panel>
        )}

            <Panel title={t('dashboard_team_efficiency', 'Эффективность команды')} eyebrow={t('dashboard_employees', 'Сотрудники')} description={t('dashboard_team_desc', 'Показывает, кто сколько работает и сколько приносит выручки.')}>
              <DataTable
                rows={ownerRows}
                columns={[
                  { label: t('dashboard_employee', 'Сотрудник'), key: 'full_name', render: (row) => <div className="font-semibold text-white">{row.full_name}</div> },
                  { label: t('dashboard_role', 'Роль'), key: 'role' },
                  { label: t('dashboard_shifts', 'Смены'), key: 'shifts_count' },
                  { label: t('dashboard_hours', 'Часы'), key: 'hours_worked' },
                  { label: t('dashboard_orders', 'Заказы'), key: 'delivered_orders' },
                  { label: t('dashboard_rating', 'Рейтинг'), key: 'waiter_rating_display' },
                  { label: t('dashboard_reviews', 'Отзывы'), key: 'reviews_count' },
                  { label: t('dashboard_revenue', 'Выручка'), key: 'revenue_display' },
                  { label: t('dashboard_rating_tier', 'Уровень рейтинга'), key: 'waiter_rating_label' },
                  { label: t('dashboard_status', 'Статус'), key: 'active_label', render: (row: any) => <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest', row.active_shift ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/30 border border-white/10')}>{row.active_label}</span> },
                ]}
                emptyMessage={t('dashboard_no_team_data', 'Пока нет данных по команде.')}
              />
            </Panel>

            <ModuleUpsellStrip activeSubscriptions={workspace.selectedRestaurant?.active_plan_slugs} restaurantId={workspace.selectedRestaurantId} />
      </div>
    </AppShell>
  );
}


function percentDelta(current: number, baseline: number) {
  if (!baseline) return current ? 100 : null;
  return ((current - baseline) / Math.abs(baseline)) * 100;
}


const PLAN_INFO = [
  { slug: 'coffee', name: 'Для кофейни', desc: 'Бронирование, меню, CRM, лояльность', icon: Coffee, price: '300 000 сум/мес' },
  { slug: 'street_food', name: 'Для стритфуда', desc: 'Меню, очередь, CRM, лояльность', icon: Pizza, price: '200 000 сум/мес' },
  { slug: 'banquet', name: 'Для банкетного зала', desc: 'Бронирование, схема залов, CRM', icon: PartyPopper, price: '450 000 сум/мес' },
  { slug: 'restaurant', name: 'Для ресторана', desc: 'Всё включено: залы, CRM, аналитика', icon: UtensilsCrossed, price: '550 000 сум/мес' },
];

const PLAN_BG: Record<string, string> = { coffee: 'bg-emerald-500/10', street_food: 'bg-rose-500/10', banquet: 'bg-amber-500/10', restaurant: 'bg-indigo-500/10' };
const PLAN_TEXT: Record<string, string> = { coffee: 'text-emerald-400', street_food: 'text-rose-400', banquet: 'text-amber-400', restaurant: 'text-indigo-400' };

function ModuleUpsellStrip(_props: { activeSubscriptions?: string[]; restaurantId?: string }) {
  return null; // beta — все бесплатно
}




