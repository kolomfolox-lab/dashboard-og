import { useEffect, useMemo, useState } from 'react';
import { DollarSign, KeyRound, Store, Trash2 } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { SubscriptionExpired } from '@/components/app/SubscriptionExpired';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { formatMoney } from '@/lib/utils';
import { adminAPI, ownerAPI } from '@/services/api';

export default function RestaurantsPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const isOwnerWorkspace = user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER';
  const workspace = useOwnerWorkspace(isOwnerWorkspace);
  const [chains, setChains] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [revenueMap, setRevenueMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [error, setError] = useState('');
  const isSubscribed = user?.role === 'SUPER_ADMIN' || workspace.selectedRestaurant?.subscription_active !== false;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      if (user?.role === 'SUPER_ADMIN') {
        const [chainsResponse, restaurantsResponse, keysResponse] = await Promise.all([
          adminAPI.getChains(),
          adminAPI.getRestaurants(),
          adminAPI.getKeys(),
        ]);
        setChains(chainsResponse.data || []);
        setRestaurants(restaurantsResponse.data || []);
        setKeys(keysResponse.data || []);
        setOrders([]);
        return;
      }

      const ownerRestaurants = workspace.restaurants || [];
      if (ownerRestaurants.length === 0) return;

      if (workspace.selectedRestaurantId && workspace.selectedRestaurant?.subscription_active !== false) {
        const [ordersResponse, ...statsResponses] = await Promise.all([
          ownerAPI.getOrders(workspace.selectedRestaurantId, period),
          ...ownerRestaurants.map(r => ownerAPI.getStats(r.id).catch(() => ({ data: {} }))),
        ]);
        setOrders(ordersResponse.data || []);

        const revMap: Record<string, number> = {};
        statsResponses.forEach((res, i) => {
          const data = res.data || {};
          revMap[ownerRestaurants[i].id] = data.total_revenue ?? data.revenue_today ?? 0;
        });
        setRevenueMap(revMap);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || t('restaurants_page_load_error', 'Не удалось загрузить операции ресторанов.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [locale, period, user?.role, workspace.selectedRestaurantId, workspace.selectedRestaurant?.subscription_active]);

  const handleActivateSubscription = async (key: string) => {
    if (!workspace.selectedRestaurantId) throw new Error('No workspace selected');
    await ownerAPI.activateSubscription({ key, restaurant_id: workspace.selectedRestaurantId });
    workspace.reload();
  };

  const handleDeleteChain = async (chain: any) => {
    if (!window.confirm(`${t('restaurants_page_delete_chain', 'Удалить сеть')} ${chain.name}?`)) return;
    setError('');
    try {
      await adminAPI.deleteChain(chain.id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || t('restaurants_page_delete_chain_error', 'Не удалось удалить сеть.'));
    }
  };

  const handleDeleteRestaurant = async (restaurant: any) => {
    if (!window.confirm(`${t('restaurants_page_delete_restaurant', 'Удалить ресторан')} ${restaurant.name}?`)) return;
    setError('');
    try {
      await adminAPI.deleteRestaurant(restaurant.id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || t('restaurants_page_delete_restaurant_error', 'Не удалось удалить ресторан.'));
    }
  };

  const handleRevokeKey = async (key: any) => {
    if (!window.confirm(`${t('restaurants_page_revoke_key', 'Отозвать ключ')} ${key.key}?`)) return;
    setError('');
    try {
      await adminAPI.revokeKey(key.id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || t('restaurants_page_revoke_key_error', 'Не удалось отозвать ключ.'));
    }
  };

  if (user?.role === 'SUPER_ADMIN') {
    return (
      <AppShell
        title={t('restaurants_title_superadmin', 'Сети и рестораны')}
        subtitle={t('restaurants_subtitle_superadmin', 'Управление сетями, ресторанами и ключами подписки в одном месте.')}
        eyebrow={t('restaurants_page_platform_control', 'Управление платформой')}
      >
        <div className="space-y-4">
          {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
          <div className="grid gap-4 md:grid-cols-3">
            <Panel title={`${chains.length}`} eyebrow={t('restaurants_page_chains', 'Сети')} description={t('restaurants_page_chains_desc', 'Группы ресторанов на платформе.')} className="h-full">
              <div className="flex items-center gap-3 text-white/52"><Store className="h-4 w-4 text-[#8fd4ff]" /> {t('restaurants_page_chains_note', 'Все в одном месте.')}</div>
            </Panel>
            <Panel title={`${restaurants.length}`} eyebrow={t('restaurants_page_restaurants', 'Рестораны')} description={t('restaurants_page_restaurants_desc', 'Для управления отдельными точками.')} className="h-full">
              <div className="flex items-center gap-3 text-white/52"><Store className="h-4 w-4 text-[#ffb78f]" /> {t('restaurants_page_restaurants_note', 'Отдельное управление.')}</div>
            </Panel>
            <Panel title={`${keys.length}`} eyebrow={t('restaurants_page_keys', 'Ключи')} description={t('restaurants_page_keys_desc', 'Ключи подписки и их состояние.')} className="h-full">
              <div className="flex items-center gap-3 text-white/52"><KeyRound className="h-4 w-4 text-[#a7f3d0]" /> {t('restaurants_page_keys_note', 'Активные и свободные ключи.')}</div>
            </Panel>
          </div>

          <Panel title={t('restaurants_page_chains', 'Сети')} eyebrow={t('restaurants_page_management', 'Управление')} description={t('restaurants_page_chains_manage', 'Можно удалить сеть целиком или проверить структуру.')}>
            <div className="grid gap-4 xl:grid-cols-2">
              {chains.map((chain) => (
                <div key={chain.id} className="rounded-[24px] border border-white/8 bg-black/12 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl text-white">{chain.name}</div>
                      <div className="mt-2 text-sm text-white/52">{chain.subdomain}.waitly.uz</div>
                      <div className="mt-4 text-sm text-white/48">{t('restaurants_page_owner_label', 'Владелец')}: {chain.owner}</div>
                      <div className="mt-1 text-sm text-white/48">{t('restaurants_page_restaurant_count', 'Количество ресторанов')}: {chain.restaurant_count}</div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteChain(chain)}>
                      <Trash2 className="mr-2 h-4 w-4" /> {t('restaurants_page_delete_chain', 'Удалить сеть')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={t('restaurants_page_restaurants', 'Рестораны')} eyebrow={t('restaurants_page_points', 'Точки')} description={t('restaurants_page_restaurants_manage', 'Можно управлять каждым рестораном отдельно.')}>
            <DataTable
              rows={restaurants}
              columns={[
                { label: t('restaurants_page_col_restaurant', 'Ресторан'), key: 'name', render: (row) => <div><div className="font-semibold text-white">{row.name}</div><div className="text-xs text-white/38">{row.slug}</div></div> },
                { label: t('restaurants_page_col_chain', 'Сеть'), key: 'chain' },
                { label: t('restaurants_page_col_owner', 'Владелец'), key: 'owner' },
                { label: t('restaurants_page_col_subscription', 'Подписка'), key: 'subscription_active', render: (row) => row.subscription_active ? t('restaurants_page_active', 'Активна') : t('restaurants_page_inactive', 'Неактивна') },
                { label: t('restaurants_page_col_action', 'Действие'), key: 'id', render: (row) => <Button variant="outline" size="sm" onClick={() => handleDeleteRestaurant(row)}>{t('restaurants_page_delete', 'Удалить')}</Button> },
              ]}
            />
          </Panel>

          <Panel title={t('restaurants_page_keys_title', 'Ключи подписки')} eyebrow={t('restaurants_page_billing', 'Биллинг')} description={t('restaurants_page_keys_manage', 'Управление ключами и их отзыв.')}>
            <DataTable
              rows={keys}
              columns={[
                { label: t('restaurants_page_col_key', 'Ключ'), key: 'key' },
                { label: t('restaurants_page_col_duration', 'Срок'), key: 'duration_months', render: (row) => `${row.duration_months} ${t('restaurants_page_months', 'мес.')}` },
                { label: t('restaurants_page_col_activated_by', 'Активировавший ресторан'), key: 'activated_by', render: (row) => row.activated_by || '—' },
                { label: t('restaurants_page_col_status', 'Статус'), key: 'is_activated', render: (row) => row.is_activated ? t('restaurants_page_activated', 'Активирован') : t('restaurants_page_free', 'Свободен') },
                { label: t('restaurants_page_col_action', 'Действие'), key: 'id', render: (row) => <Button variant="secondary" size="sm" onClick={() => handleRevokeKey(row)}>{t('restaurants_page_revoke', 'Отозвать')}</Button> },
              ]}
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (!isSubscribed) {
    return (
      <AppShell
        title={t('restaurants_page_operations_closed', 'Операции закрыты')}
        subtitle={t('restaurants_page_activate_hint', 'Активируйте ключ подписки, чтобы продолжить работу.')}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <SubscriptionExpired restaurantId={workspace.selectedRestaurantId} restaurantName={workspace.selectedRestaurant?.name} onActivate={handleActivateSubscription} />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={workspace.selectedRestaurant?.name || t('restaurants_title_owner', 'Операционный контур')}
      subtitle={t('restaurants_subtitle_owner', 'Список ресторанов, история заказов и статус подписки без лишних шагов.')}
      eyebrow={user?.role === 'CHAIN_OWNER' ? t('restaurants_page_chain_ops', 'Операции сети') : t('restaurants_page_restaurant_ops', 'Операции ресторана')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel title={t('restaurants_page_owner_restaurants', 'Список ресторанов')} eyebrow={t('restaurants_page_structure', 'Структура')} description={t('restaurants_page_owner_restaurants_desc', 'Здесь показаны все рестораны, привязанные к аккаунту.')}>
            <div className="grid gap-4 md:grid-cols-2">
              {(workspace.restaurants || []).map((restaurant: any) => (
                <div key={restaurant.id} className={`rounded-[24px] border p-5 ${restaurant.id === workspace.selectedRestaurantId ? 'border-[#8fd4ff]/25 bg-white/[0.04]' : 'border-white/8 bg-black/12'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold text-white">{restaurant.name}</div>
                    <div className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${restaurant.subscription_active ? 'bg-emerald-500/12 text-emerald-200' : 'bg-amber-400/12 text-amber-200'}`}>
                      {restaurant.subscription_active ? t('restaurants_page_active', 'Активна') : t('restaurants_page_inactive', 'Неактивна')}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-white/42">{restaurant.slug}</div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    {revenueMap[restaurant.id] !== undefined
                      ? formatMoney(revenueMap[restaurant.id])
                      : '—'}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={t('restaurants_page_orders_history', 'История заказов')} eyebrow={t('restaurants_page_operations', 'Операции')} description={t('restaurants_page_orders_history_desc', 'Можно смотреть за сегодня, 7 дней, 30 дней или за весь период.')}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {['today', '7d', '30d', 'all'].map((value) => (
                  <Button key={value} variant={period === value ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod(value)}>
                    {value}
                  </Button>
                ))}
              </div>
              {orders.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold text-white">{formatMoney(orders.reduce((s, o) => s + (Number(o.total) || 0), 0))}</span>
                  <span className="text-white/40">· {orders.length} {t('restaurants_page_orders_count', 'заказов')}</span>
                </div>
              ) : null}
            </div>
            <DataTable
              rows={orders}
              maxHeight={420}
              emptyMessage={loading ? t('restaurants_page_loading_orders', 'Загрузка заказов...') : t('restaurants_page_no_orders', 'За выбранный период заказов нет.')}
              columns={[
                { label: t('restaurants_page_col_time', 'Когда'), key: 'created_at_display' },
                { label: t('restaurants_page_col_table', 'Стол'), key: 'table', render: (row) => `${t('restaurants_page_col_table', 'Стол')} ${row.table}` },
                { label: t('restaurants_page_col_waiter', 'Официант'), key: 'waiter' },
                { label: t('restaurants_page_col_status', 'Статус'), key: 'status' },
                { label: t('restaurants_page_col_items', 'Состав'), key: 'items', render: (row) => row.items?.length ? row.items.map((item: any) => `${item.qty}x ${item.dish}`).join(', ') : '—' },
                { label: t('restaurants_page_col_total', 'Итого'), key: 'total', render: (row) => formatMoney(row.total) },
              ]}
            />
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
