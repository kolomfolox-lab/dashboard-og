import { useEffect, useMemo, useState } from 'react';
import { ChartSpline, Flame, Layers3, Star, Trophy } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { BarChartBlock, DoughnutChartBlock, LineChartBlock } from '@/components/app/Charts';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { SubscriptionExpired } from '@/components/app/SubscriptionExpired';
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
        if (active) setError(err?.response?.data?.error || (locale === 'uz' ? 'Tahlilni yuklab bo‘lmadi.' : 'Не удалось загрузить аналитику.'));
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
          label: locale === 'uz' ? 'Tushum' : 'Выручка',
          data: (stats?.daily_revenue || []).map((item: any) => Number(item.revenue || 0)),
          borderColor: '#7dd3fc',
          backgroundColor: 'rgba(125,211,252,0.15)',
          fill: true,
          tension: 0.35,
        },
        {
          label: locale === 'uz' ? 'Buyurtmalar' : 'Заказы',
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
          label: locale === 'uz' ? 'Daromad' : 'Доход',
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
          label: locale === 'uz' ? 'Ofitsiant reytingi' : 'Рейтинг официанта',
          data: (stats?.waiter_ratings || []).slice(0, 6).map((item: any) => Number(item.average_waiter_rating || 0)),
          backgroundColor: ['#f59e0b', '#f97360', '#7dd3fc', '#34d399', '#a78bfa', '#f7b267'],
          borderRadius: 12,
        },
      ],
    }),
    [locale, stats],
  );

  if (loading || workspace.loading) {
    return (
      <AppShell
        title={locale === 'uz' ? 'Tahlil' : 'Аналитика'}
        subtitle={locale === 'uz' ? 'Grafiklar va ko‘rsatkichlar yuklanmoqda.' : 'Графики и показатели загружаются.'}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[28px] border border-white/10 bg-white/6" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!isSubscribed) {
    return (
      <AppShell
        title={locale === 'uz' ? 'Tahlil yopiq' : 'Аналитика закрыта'}
        subtitle={locale === 'uz' ? 'Analitikani qayta ochish uchun obuna kalitini faollashtiring.' : 'Активируйте ключ подписки, чтобы снова открыть аналитику.'}
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
        title={locale === 'uz' ? 'Tahlil mavjud emas' : 'Аналитика недоступна'}
        subtitle={locale === 'uz' ? 'So‘rovni bajarib bo‘lmadi.' : 'Не удалось выполнить запрос.'}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>
      </AppShell>
    );
  }

  if (user?.role === 'SUPER_ADMIN') {
    return (
      <AppShell
        title={t('analytics_title_superadmin', 'Аналитика платформы')}
        subtitle={t('analytics_subtitle_superadmin', 'Понятная картина по доходу, сетям и ключам активации.')}
        eyebrow={locale === 'uz' ? 'Rahbariyat ko‘rinishi' : 'Обзор для руководства'}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title={locale === 'uz' ? 'Platforma daromadi' : 'Доход платформы'}
              value={formatMoney(stats?.platform_revenue)}
              note={locale === 'uz' ? 'So‘nggi 30 kun ko‘rsatkichi' : 'Показатель за последние 30 дней'}
              icon={ChartSpline}
              tone="cyan"
            />
            <MetricCard
              title={locale === 'uz' ? 'Eng kuchli tarmoq' : 'Лучшая сеть'}
              value={stats?.top_chains?.[0]?.chain || (locale === 'uz' ? 'Yo‘q' : 'Нет данных')}
              note={locale === 'uz' ? 'Platformaga eng ko‘p tushum bergan tarmoq' : 'Сеть с максимальным вкладом в доход'}
              icon={Trophy}
              tone="sand"
            />
            <MetricCard
              title={locale === 'uz' ? 'Bo‘sh kalitlar' : 'Свободные ключи'}
              value={stats?.unused_keys || 0}
              note={locale === 'uz' ? 'Hali biriktirilmagan aktivatsiyalar' : 'Активации, которые еще не назначены'}
              icon={Layers3}
              tone="coral"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Panel
              title={locale === 'uz' ? 'Tarmoqlar kesimida daromad' : 'Доход по сетям'}
              eyebrow={locale === 'uz' ? 'Asosiy drayverlar' : 'Главные драйверы'}
              description={locale === 'uz' ? 'Qaysi tarmoqlar platformani tortayotganini bir qarashda ko‘rsatadi.' : 'Показывает, какие сети реально тянут платформу вперед.'}
            >
              <div className="h-[360px]"><BarChartBlock data={topItemsData} /></div>
            </Panel>
            <Panel
              title={locale === 'uz' ? 'Holatlar balansi' : 'Баланс состояний'}
              eyebrow={locale === 'uz' ? 'Aralashma' : 'Смешение'}
              description={locale === 'uz' ? 'Aktivlik va buyurtma holatlari nisbatini soddaroq ko‘rsatadi.' : 'Показывает соотношение активности и статусов в одной чистой диаграмме.'}
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
      eyebrow={locale === 'uz' ? 'Restoran ko‘rsatkichlari' : 'Показатели ресторана'}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title={locale === 'uz' ? 'Top taom' : 'Топ-блюдо'}
            value={stats?.top_dishes?.[0]?.name || (locale === 'uz' ? 'Signal yo‘q' : 'Нет данных')}
            note={stats?.top_dishes?.[0] ? formatMoney(stats.top_dishes[0].revenue) : locale === 'uz' ? 'Ma’lumot kutilmoqda' : 'Ждем данные'}
            icon={Flame}
            tone="coral"
          />
          <MetricCard
            title={locale === 'uz' ? 'O‘rtacha чек' : 'Средний чек'}
            value={formatMoney(stats?.avg_check_30_days)}
            note={locale === 'uz' ? 'Yetkazilgan buyurtmalar bazasi' : 'База по доставленным заказам'}
            icon={ChartSpline}
            tone="cyan"
          />
          <MetricCard
            title={locale === 'uz' ? 'Faol buyurtmalar' : 'Активные заказы'}
            value={stats?.active_orders || 0}
            note={locale === 'uz' ? 'Hozirgi ish yuklamasi' : 'Текущая нагрузка прямо сейчас'}
            icon={Layers3}
            tone="mint"
          />
          <MetricCard
            title={locale === 'uz' ? 'Ofitsiantlar reytingi' : 'Рейтинг официантов'}
            value={stats?.waiter_rating_summary?.average_waiter_rating ? `${stats.waiter_rating_summary.average_waiter_rating}★` : '—'}
            note={stats?.waiter_rating_summary?.top_waiter_name || (locale === 'uz' ? 'Hali sharh yo‘q' : 'Пока нет отзывов')}
            icon={Star}
            tone="sand"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
          <Panel
            title={locale === 'uz' ? 'Tushum dinamikasi' : 'Динамика выручки'}
            eyebrow={locale === 'uz' ? 'Ikki haftalik chiziq' : 'Линия за две недели'}
            description={locale === 'uz' ? 'Biznes holatini bir qarashda o‘qish uchun aniq trend.' : 'Чистый тренд, чтобы владелец понимал состояние бизнеса за один взгляд.'}
          >
            <div className="h-[360px]"><LineChartBlock data={revenueData} /></div>
          </Panel>
          <Panel
            title={locale === 'uz' ? 'Buyurtma holatlari' : 'Статусы заказов'}
            eyebrow={locale === 'uz' ? 'Operatsion ko‘rinish' : 'Операционная картина'}
            description={locale === 'uz' ? 'Oshxona yoki yetkazib berishda qayerda tiqilish borligini ko‘rsatadi.' : 'Помогает увидеть, где возникает узкое место: кухня или доставка.'}
          >
            <div className="h-[360px]"><DoughnutChartBlock data={statusData} /></div>
          </Panel>
        </div>

        <Panel
          title={locale === 'uz' ? 'Taomlar bo‘yicha daromad' : 'Доход по блюдам'}
          eyebrow={locale === 'uz' ? 'Menyu g‘oliblari' : 'Победители меню'}
          description={locale === 'uz' ? 'Qaysi pozitsiyalar haqiqatan ham pul ishlayotganini ko‘rsatadi.' : 'Показывает, какие позиции меню реально зарабатывают деньги.'}
        >
          <div className="h-[360px]"><BarChartBlock data={topItemsData} /></div>
        </Panel>

        <Panel
          title={locale === 'uz' ? 'Ofitsiantlar reytingi' : 'Рейтинг официантов'}
          eyebrow={locale === 'uz' ? 'Mehmon bahosi' : 'Оценка гостей'}
          description={locale === 'uz' ? 'Bu blok real guest-reviewlardan hisoblanadi va aynan ofitsiant xizmat sifatini ko‘rsatadi.' : 'Этот блок считается из реальных guest-review и показывает именно качество работы официантов.'}
        >
          <div className="h-[360px]"><BarChartBlock data={waiterRatingData} /></div>
        </Panel>

        <Panel
          title={locale === 'uz' ? 'Jamoa natijalari' : 'Результаты команды'}
          eyebrow={locale === 'uz' ? 'Smena bo‘yicha' : 'По сменам'}
          description={locale === 'uz' ? 'Alohida panelga o‘tmasdan xodimlar ta’sirini ko‘rish mumkin.' : 'Позволяет увидеть вклад команды без перехода в другой раздел.'}
        >
          <DataTable
            rows={stats?.staff_performance || []}
            columns={[
              { label: locale === 'uz' ? 'Xodim' : 'Сотрудник', key: 'full_name', render: (row) => <div className="font-semibold text-white">{row.full_name}</div> },
              { label: locale === 'uz' ? 'Rol' : 'Роль', key: 'role' },
              { label: locale === 'uz' ? 'Soat' : 'Часы', key: 'hours_worked' },
              { label: locale === 'uz' ? 'Smenalar' : 'Смены', key: 'shifts_count' },
              { label: locale === 'uz' ? 'Yetkazildi' : 'Доставлено', key: 'delivered_orders' },
              {
                label: locale === 'uz' ? 'Reyting' : 'Рейтинг',
                key: 'average_waiter_rating',
                render: (row) => row.average_waiter_rating ? `${row.average_waiter_rating}★` : '—',
              },
              { label: locale === 'uz' ? 'Sharhlar' : 'Отзывы', key: 'reviews_count' },
              { label: locale === 'uz' ? 'Tushum' : 'Выручка', key: 'revenue', render: (row) => formatMoney(row.revenue) },
              {
                label: locale === 'uz' ? 'Status' : 'Статус рейтинга',
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
