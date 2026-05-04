import { useEffect, useMemo, useState } from 'react';
import { Activity, DollarSign, KeyRound, ShoppingBag, Star, Store, UsersRound } from 'lucide-react';

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
  const isOwner = user?.role === 'RESTAURANT_OWNER';
  const workspace = useOwnerWorkspace(isOwner || user?.role === 'CHAIN_OWNER');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

          const [statsResponse, ordersResponse] = await Promise.all([
            ownerAPI.getStats(workspace.selectedRestaurantId),
            ownerAPI.getOrders(workspace.selectedRestaurantId, 'all'),
          ]);

          if (active) {
            setStats(statsResponse.data);
            setOrders(ordersResponse.data || []);
          }
          return;
        }
      } catch (err: any) {
        if (active) {
          setError(err?.response?.data?.error || (locale === 'uz' ? 'Dashboard ma\'lumotlarini yuklab bo\'lmadi.' : 'Не удалось загрузить данные дашборда.'));
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
          label: locale === 'uz' ? 'Tushum' : 'Выручка',
          data: (stats?.daily_revenue || []).map((item: any) => Number(item.revenue || 0)),
          borderColor: '#f97360',
          backgroundColor: 'rgba(249,115,96,0.22)',
          fill: true,
          tension: 0.35,
        },
        {
          label: locale === 'uz' ? 'Buyurtmalar' : 'Заказы',
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
          label: locale === 'uz' ? 'Tushum' : 'Выручка',
          data: (stats?.staff_performance || []).slice(0, 6).map((item: any) => Number(item.revenue || 0)),
          backgroundColor: 'rgba(125,211,252,0.84)',
          borderRadius: 12,
        },
        {
          label: locale === 'uz' ? 'Soatlar' : 'Часы',
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
          label: locale === 'uz' ? 'Ofitsiant reytingi' : 'Рейтинг официанта',
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
        label: locale === 'uz' ? 'Bugun vs kecha' : 'Сегодня vs вчера',
        value: formatMoney(revenueToday),
        detail: locale === 'uz' ? `${formatMoney(revenueYesterday)} kecha` : `${formatMoney(revenueYesterday)} вчера`,
        delta: percentDelta(revenueToday, revenueYesterday),
        tone: 'coral',
      },
      {
        label: locale === 'uz' ? 'Bugun vs o`rtacha' : 'Сегодня vs среднее',
        value: formatMoney(revenueToday),
        detail: locale === 'uz' ? `${formatMoney(revenueAverage)} kunlik o'rtacha` : `${formatMoney(revenueAverage)} среднее за день`,
        delta: percentDelta(revenueToday, revenueAverage),
        tone: 'sand',
      },
      {
        label: locale === 'uz' ? 'Buyurtmalar' : 'Заказы',
        value: ordersToday,
        detail: locale === 'uz' ? `${ordersAverage.toFixed(1)} kunlik o'rtacha` : `${ordersAverage.toFixed(1)} среднее за день`,
        delta: percentDelta(ordersToday, ordersAverage),
        tone: 'cyan',
      },
      {
        label: locale === 'uz' ? 'Top xodim' : 'Топ сотрудник',
        value: topStaff?.full_name || (locale === 'uz' ? 'Hali yo`q' : 'Пока нет'),
        detail: topStaff ? `${formatMoney(topStaff.revenue)} · ${topStaff.delivered_orders || 0} ${locale === 'uz' ? 'buyurtma' : 'заказов'}` : (locale === 'uz' ? 'Smena ma`lumotlari kutilmoqda' : 'Ждем данные по сменам'),
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
          label: locale === 'uz' ? 'Tushum' : 'Выручка',
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
      labels: locale === 'uz' ? ['Faol', 'Tugagan', 'Bo\'sh'] : ['Активные', 'Истекшие', 'Свободные'],
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
    active_label: person.active_shift ? (locale === 'uz' ? 'Faol' : 'На смене') : locale === 'uz' ? 'Offline' : 'Не в смене',
  }));

  const handleActivateSubscription = async (key: string) => {
    if (!workspace.selectedRestaurantId) throw new Error('No workspace selected');
    await ownerAPI.activateSubscription({ key, restaurant_id: workspace.selectedRestaurantId });
    workspace.reload();
  };

  if (loading || workspace.loading) {
    return (
      <AppShell
        title={locale === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...'}
        subtitle={locale === 'uz' ? 'Waitly ma\'lumotlarni yangilamoqda.' : 'Waitly обновляет данные.'}
      >
        <VideoSplashLoader compact className="min-h-[420px]" title={locale === 'uz' ? 'Dashboard yuklanmoqda' : 'Дашборд загружается'} subtitle={locale === 'uz' ? "Asosiy metrikalar va joriy restoran ma'lumotlari tayyorlanmoqda." : 'Подготавливаем метрики и данные выбранного ресторана.'} />
      </AppShell>
    );
  }

  if (!isSubscribed) {
    return (
      <AppShell
        title={locale === 'uz' ? 'Kirish cheklangan' : 'Доступ ограничен'}
        subtitle={locale === 'uz' ? 'Obuna faollashtirilmaguncha bu bo\'lim yopiq.' : 'Пока подписка не активирована, этот раздел закрыт.'}
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
        title={locale === 'uz' ? 'Dashboard mavjud emas' : 'Дашборд недоступен'}
        subtitle={locale === 'uz' ? 'Ma\'lumotlarni olishda xatolik yuz berdi.' : 'Не удалось загрузить данные.'}
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
        eyebrow={locale === 'uz' ? 'Nazorat markazi' : 'Центр контроля'}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title={locale === 'uz' ? 'Jami tarmoqlar' : 'Всего сетей'} value={stats?.total_chains || 0} note={locale === 'uz' ? 'Faol tarmoqlar' : 'Активные сети'} icon={Store} tone="coral" />
            <MetricCard title={locale === 'uz' ? 'Berilgan kalitlar' : 'Выданные ключи'} value={stats?.active_keys || 0} note={`${stats?.unused_keys || 0} ${locale === 'uz' ? 'kutilmoqda' : 'ожидают'}`} icon={KeyRound} tone="mint" />
            <MetricCard title={locale === 'uz' ? 'Umumiy tushum' : 'Общая выручка'} value={formatMoney(stats?.platform_revenue)} note={locale === 'uz' ? 'Oxirgi 30 kun' : 'За 30 дней'} icon={DollarSign} tone="sand" />
            <MetricCard title={locale === 'uz' ? 'Tizim yuki' : 'Нагрузка системы'} value={formatCompactNumber(stats?.total_orders)} note={locale === 'uz' ? 'Tranzaksiyalar' : 'Транзакции'} icon={ShoppingBag} tone="cyan" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
            <Panel title={locale === 'uz' ? 'Tarmoqlar daromadi' : 'Доход по сетям'} eyebrow={locale === 'uz' ? 'O\'sish' : 'Рост'} description={locale === 'uz' ? 'Qaysi tarmoqlar platformaga asosiy tushum olib kelayotganini ko\'rsatadi.' : 'Показывает, какие сети дают основной рост платформы.'}>
              <div className="h-[400px]"><BarChartBlock data={platformChainData} /></div>
            </Panel>
            <Panel title={locale === 'uz' ? 'Kalitlar holati' : 'Состояние ключей'} eyebrow={locale === 'uz' ? 'Audit' : 'Аудит'} description={locale === 'uz' ? 'Faol, tugagan va bo\'sh kalitlar taqsimoti.' : 'Распределение активных, истекших и свободных ключей.'}>
              <div className="h-[400px]"><DoughnutChartBlock data={platformKeyData} /></div>
            </Panel>
          </div>

          <Panel title={locale === 'uz' ? 'Eng faol tarmoqlar' : 'Самые активные сети'} eyebrow={locale === 'uz' ? 'Platforma' : 'Платформа'} description={locale === 'uz' ? 'Platformadagi asosiy tarmoqlar bo\'yicha qisqa ko\'rinish.' : 'Краткий обзор ключевых сетей на платформе.'}>
            <DataTable
              rows={stats?.top_chains || []}
              columns={[
                { label: locale === 'uz' ? 'Tarmoq' : 'Сеть', key: 'chain', render: (row) => <div className="font-semibold text-white">{row.chain}</div> },
                { label: locale === 'uz' ? 'Tushum' : 'Выручка', key: 'revenue', render: (row) => formatMoney(row.revenue) },
                { label: locale === 'uz' ? 'Status' : 'Статус', key: 'status', render: () => <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">{locale === 'uz' ? 'Faol' : 'Активен'}</span> },
              ]}
              emptyMessage={locale === 'uz' ? 'Hozircha platforma faolligi topilmadi.' : 'Пока нет данных по активности платформы.'}
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (user?.role === 'CHAIN_OWNER') {
    return (
      <AppShell
        title={workspace.profile?.chains?.[0]?.name || 'Chain Hub'}
        subtitle={locale === 'uz' ? 'Bir oynadan filiallar, sotuvlar va jamoa ritmini ko`ring.' : 'Смотрите филиалы, продажи и ритм команды из одного интерфейса.'}
        eyebrow={locale === 'uz' ? 'Tarmoq boshqaruvi' : 'Управление сетью'}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title={locale === 'uz' ? 'Filiallar' : 'Филиалы'} value={workspace.restaurants.length || 0} note={locale === 'uz' ? 'Tarmoq ichidagi nuqtalar' : 'Точки внутри сети'} icon={Store} tone="coral" />
            <MetricCard title={locale === 'uz' ? 'Tanlangan tushum' : 'Выручка выбранного'} value={formatMoney(stats?.revenue_today)} note={locale === 'uz' ? 'Bugungi restoran' : 'Сегодня по ресторану'} icon={DollarSign} tone="sand" />
            <MetricCard title={locale === 'uz' ? 'Buyurtmalar' : 'Заказы'} value={stats?.orders_today || 0} note={locale === 'uz' ? 'Bugungi oqim' : 'Сегодняшний поток'} icon={ShoppingBag} tone="cyan" />
            <MetricCard title={locale === 'uz' ? 'Smenada' : 'На смене'} value={stats?.active_staff_now || 0} note={workspace.selectedRestaurant?.name || (locale === 'uz' ? 'Tanlangan restoran' : 'Выбранный ресторан')} icon={UsersRound} tone="mint" />
          </div>

          <OwnerComparisonStrip items={ownerComparisonItems} />

          <div className="grid gap-6 xl:grid-cols-3">
            <Panel title={locale === 'uz' ? 'Tanlangan filial dinamikasi' : 'Динамика выбранного филиала'} eyebrow={locale === 'uz' ? 'Savdo' : 'Продажи'} className="xl:col-span-2">
              <div className="h-[360px]"><LineChartBlock data={ownerRevenueData} /></div>
            </Panel>
            <Panel title={locale === 'uz' ? 'Buyurtma holatlari' : 'Статусы заказов'} eyebrow={locale === 'uz' ? 'Jarayon' : 'Процесс'}>
              <div className="h-[360px]"><DoughnutChartBlock data={ownerStatusData} /></div>
            </Panel>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(workspace.restaurants || []).map((restaurant: any) => (
              <Panel key={restaurant.id} title={restaurant.name} eyebrow={locale === 'uz' ? 'Filial' : 'Филиал'} description={`Slug: ${restaurant.slug}`} className="h-full">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 text-sm">
                    <span className="text-white/40 font-medium">{locale === 'uz' ? 'Obuna holati' : 'Статус подписки'}</span>
                    <span className={restaurant.subscription_active ? 'text-emerald-400 font-bold uppercase tracking-widest text-[10px]' : 'text-red-400 font-bold uppercase tracking-widest text-[10px]'}>
                      {restaurant.subscription_active ? (locale === 'uz' ? 'Faol' : 'Активна') : locale === 'uz' ? 'Tugagan' : 'Неактивна'}
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
      eyebrow={locale === 'uz' ? 'Restoran nazorati' : 'Операции ресторана'}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title={locale === 'uz' ? 'Bugungi tushum' : 'Выручка сегодня'} value={formatMoney(stats?.revenue_today)} note={locale === 'uz' ? 'Barcha smenalar bo\'yicha' : 'По всем сменам'} icon={DollarSign} tone="coral" />
          <MetricCard title={locale === 'uz' ? '30 kunlik tushum' : 'Выручка за 30 дней'} value={formatMoney(stats?.revenue_30_days)} note={locale === 'uz' ? 'So\'nggi oy' : 'Последний месяц'} icon={Activity} tone="sand" />
          <MetricCard title={locale === 'uz' ? 'O\'rtacha чек' : 'Средний чек'} value={formatMoney(stats?.avg_check_30_days)} note={locale === 'uz' ? 'Buyurtma o\'rtachasi' : 'Средняя сумма заказа'} icon={ShoppingBag} tone="cyan" />
          <MetricCard title={locale === 'uz' ? 'Faol staff' : 'Активный staff'} value={stats?.active_staff_now || 0} note={locale === 'uz' ? 'Hozir smenada' : 'Сейчас на смене'} icon={UsersRound} tone="mint" />
          <MetricCard
            title={locale === 'uz' ? 'Ofitsiantlar reytingi' : 'Рейтинг официантов'}
            value={stats?.waiter_rating_summary?.average_waiter_rating ? `${stats.waiter_rating_summary.average_waiter_rating}★` : '—'}
            note={stats?.waiter_rating_summary?.top_waiter_name || (locale === 'uz' ? 'Hali sharh yo‘q' : 'Пока нет отзывов')}
            icon={Star}
            tone="sand"
          />
        </div>

        <OwnerComparisonStrip items={ownerComparisonItems} />

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title={locale === 'uz' ? 'Tushum dinamikasi' : 'Динамика выручки'} eyebrow={locale === 'uz' ? 'Savdo' : 'Продажи'} className="xl:col-span-2">
            <div className="h-[400px]"><LineChartBlock data={ownerRevenueData} /></div>
          </Panel>
          <Panel title={locale === 'uz' ? 'Buyurtma holatlari' : 'Статусы заказов'} eyebrow={locale === 'uz' ? 'Jarayon' : 'Процесс'}>
            <div className="h-[400px]"><DoughnutChartBlock data={ownerStatusData} /></div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={locale === 'uz' ? 'Eng kuchli xodimlar' : 'Сильные сотрудники'} eyebrow={locale === 'uz' ? 'Jamoa' : 'Команда'}>
            <div className="h-[400px]"><BarChartBlock data={ownerStaffData} /></div>
          </Panel>
          <Panel title={locale === 'uz' ? 'Ofitsiantlar reytingi' : 'Рейтинг официантов'} eyebrow={locale === 'uz' ? 'Mehmon bahosi' : 'Оценка гостей'}>
            <div className="h-[400px]"><BarChartBlock data={waiterRatingData} /></div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={locale === 'uz' ? 'So\'nggi buyurtmalar' : 'Последние заказы'} eyebrow={locale === 'uz' ? 'Jonli lenta' : 'Живая лента'}>
            <div className="space-y-3">
              {(orders || []).slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4 transition-colors hover:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-xs font-bold text-white">T{order.table}</div>
                    <div>
                      <div className="text-sm font-bold text-white">{locale === 'uz' ? 'Stol' : 'Стол'} {order.table}</div>
                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#8fd4ff]">{order.status}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#ffd4c4]">{formatMoney(order.total)}</div>
                    <div className="mt-0.5 text-[10px] text-white/30">{order.created_at_display || formatDateTime(order.created_at)}</div>
                  </div>
                </div>
              ))}
              {!orders.length ? <div className="rounded-3xl border border-dashed border-white/10 px-4 py-20 text-center text-sm text-white/30">{locale === 'uz' ? 'Hozircha buyurtmalar yo\'q.' : 'Пока нет новых заказов.'}</div> : null}
            </div>
          </Panel>
          <Panel title={locale === 'uz' ? 'Top ofitsiantlar' : 'Топ официанты'} eyebrow={locale === 'uz' ? 'Reyting' : 'Рейтинг'}>
            <div className="space-y-3">
              {(stats?.waiter_ratings || []).slice(0, 5).map((waiter: any) => (
                <div key={waiter.staff_id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4 transition-colors hover:bg-white/5">
                  <div>
                    <div className="text-sm font-bold text-white">{waiter.full_name}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#8fd4ff]">{waiter.waiter_rating_label}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#ffd4c4]">{waiter.average_waiter_rating ? `${waiter.average_waiter_rating}★` : '—'}</div>
                    <div className="mt-0.5 text-[10px] text-white/30">{waiter.reviews_count || 0} {locale === 'uz' ? 'sharh' : 'отзывов'}</div>
                  </div>
                </div>
              ))}
              {!(stats?.waiter_ratings || []).length ? <div className="rounded-3xl border border-dashed border-white/10 px-4 py-20 text-center text-sm text-white/30">{locale === 'uz' ? 'Ofitsiant reytinglari hali yo‘q.' : 'Пока нет рейтингов официантов.'}</div> : null}
            </div>
          </Panel>
        </div>

        <Panel title={locale === 'uz' ? 'Jamoa samaradorligi' : 'Эффективность команды'} eyebrow={locale === 'uz' ? 'Xodimlar' : 'Сотрудники'} description={locale === 'uz' ? 'Kim qancha ishlayotgani va qancha tushum olib kelayotganini ko\'rsatadi.' : 'Показывает, кто сколько работает и сколько приносит выручки.'}>
          <DataTable
            rows={ownerRows}
            columns={[
              { label: locale === 'uz' ? 'Xodim' : 'Сотрудник', key: 'full_name', render: (row) => <div className="font-semibold text-white">{row.full_name}</div> },
              { label: locale === 'uz' ? 'Rol' : 'Роль', key: 'role' },
              { label: locale === 'uz' ? 'Smenalar' : 'Смены', key: 'shifts_count' },
              { label: locale === 'uz' ? 'Soatlar' : 'Часы', key: 'hours_worked' },
              { label: locale === 'uz' ? 'Buyurtmalar' : 'Заказы', key: 'delivered_orders' },
              { label: locale === 'uz' ? 'Reyting' : 'Рейтинг', key: 'waiter_rating_display' },
              { label: locale === 'uz' ? 'Sharhlar' : 'Отзывы', key: 'reviews_count' },
              { label: locale === 'uz' ? 'Tushum' : 'Выручка', key: 'revenue_display' },
              { label: locale === 'uz' ? 'Rating tier' : 'Уровень рейтинга', key: 'waiter_rating_label' },
              { label: locale === 'uz' ? 'Holat' : 'Статус', key: 'active_label', render: (row: any) => <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest', row.active_shift ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/30 border border-white/10')}>{row.active_label}</span> },
            ]}
            emptyMessage={locale === 'uz' ? 'Jamoa ma\'lumotlari hali yo\'q.' : 'Пока нет данных по команде.'}
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



