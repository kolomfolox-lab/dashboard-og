import { useEffect, useState } from 'react';
import { KeyRound, Store, Trash2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [error, setError] = useState('');
  const isSubscribed = user?.role !== 'RESTAURANT_OWNER' || workspace.selectedRestaurant?.subscription_active !== false;

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

      if (workspace.selectedRestaurantId && user?.role === 'RESTAURANT_OWNER') {
        if (workspace.selectedRestaurant?.subscription_active === false) {
          setOrders([]);
          return;
        }
        const ordersResponse = await ownerAPI.getOrders(workspace.selectedRestaurantId, period);
        setOrders(ordersResponse.data || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Restoran operatsiyalarini yuklab bo‘lmadi.' : 'Не удалось загрузить операции ресторанов.'));
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
    if (!window.confirm(`${locale === 'uz' ? 'Tarmoq o‘chirilsinmi' : 'Удалить сеть'} ${chain.name}?`)) return;
    await adminAPI.deleteChain(chain.id);
    await load();
  };

  const handleDeleteRestaurant = async (restaurant: any) => {
    if (!window.confirm(`${locale === 'uz' ? 'Restoran o‘chirilsinmi' : 'Удалить ресторан'} ${restaurant.name}?`)) return;
    await adminAPI.deleteRestaurant(restaurant.id);
    await load();
  };

  const handleRevokeKey = async (key: any) => {
    if (!window.confirm(`${locale === 'uz' ? 'Kalit bekor qilinsinmi' : 'Отозвать ключ'} ${key.key}?`)) return;
    await adminAPI.revokeKey(key.id);
    await load();
  };

  if (user?.role === 'SUPER_ADMIN') {
    return (
      <AppShell
        title={t('restaurants_title_superadmin', 'Сети и рестораны')}
        subtitle={t('restaurants_subtitle_superadmin', 'Управление сетями, ресторанами и ключами подписки в одном месте.')}
        eyebrow={locale === 'uz' ? 'Platforma boshqaruvi' : 'Управление платформой'}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel title={`${chains.length}`} eyebrow={locale === 'uz' ? 'Tarmoqlar' : 'Сети'} description={locale === 'uz' ? 'Platformadagi restoran guruhlari.' : 'Группы ресторанов на платформе.'} className="h-full">
              <div className="flex items-center gap-3 text-white/52"><Store className="h-4 w-4 text-[#8fd4ff]" /> {locale === 'uz' ? 'Hammasi bir joyda.' : 'Все в одном месте.'}</div>
            </Panel>
            <Panel title={`${restaurants.length}`} eyebrow={locale === 'uz' ? 'Restoranlar' : 'Рестораны'} description={locale === 'uz' ? 'Alohida nuqtalarni boshqarish uchun.' : 'Для управления отдельными точками.'} className="h-full">
              <div className="flex items-center gap-3 text-white/52"><Store className="h-4 w-4 text-[#ffb78f]" /> {locale === 'uz' ? 'Alohida boshqaruv.' : 'Отдельное управление.'}</div>
            </Panel>
            <Panel title={`${keys.length}`} eyebrow={locale === 'uz' ? 'Kalitlar' : 'Ключи'} description={locale === 'uz' ? 'Obuna kalitlari va ularning holati.' : 'Ключи подписки и их состояние.'} className="h-full">
              <div className="flex items-center gap-3 text-white/52"><KeyRound className="h-4 w-4 text-[#a7f3d0]" /> {locale === 'uz' ? 'Faol va bo‘sh kalitlar.' : 'Активные и свободные ключи.'}</div>
            </Panel>
          </div>

          <Panel title={locale === 'uz' ? 'Tarmoqlar' : 'Сети'} eyebrow={locale === 'uz' ? 'Boshqaruv' : 'Управление'} description={locale === 'uz' ? 'Tarmoqni to‘liq o‘chirish yoki tuzilmani tekshirish mumkin.' : 'Можно удалить сеть целиком или проверить структуру.'}>
            <div className="grid gap-4 xl:grid-cols-2">
              {chains.map((chain) => (
                <div key={chain.id} className="rounded-[24px] border border-white/8 bg-black/12 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display text-2xl text-white">{chain.name}</div>
                      <div className="mt-2 text-sm text-white/52">{chain.subdomain}.moonlauncher.org</div>
                      <div className="mt-4 text-sm text-white/48">{locale === 'uz' ? 'Ega' : 'Владелец'}: {chain.owner}</div>
                      <div className="mt-1 text-sm text-white/48">{locale === 'uz' ? 'Restoranlar soni' : 'Количество ресторанов'}: {chain.restaurant_count}</div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteChain(chain)}>
                      <Trash2 className="mr-2 h-4 w-4" /> {locale === 'uz' ? 'Tarmoqni o‘chirish' : 'Удалить сеть'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={locale === 'uz' ? 'Restoranlar' : 'Рестораны'} eyebrow={locale === 'uz' ? 'Nuqtalar' : 'Точки'} description={locale === 'uz' ? 'Har bir restoranni alohida boshqarish mumkin.' : 'Можно управлять каждым рестораном отдельно.'}>
            <DataTable
              rows={restaurants}
              columns={[
                { label: locale === 'uz' ? 'Restoran' : 'Ресторан', key: 'name', render: (row) => <div><div className="font-semibold text-white">{row.name}</div><div className="text-xs text-white/38">{row.slug}</div></div> },
                { label: locale === 'uz' ? 'Tarmoq' : 'Сеть', key: 'chain' },
                { label: locale === 'uz' ? 'Ega' : 'Владелец', key: 'owner' },
                { label: locale === 'uz' ? 'Obuna' : 'Подписка', key: 'subscription_active', render: (row) => row.subscription_active ? (locale === 'uz' ? 'Faol' : 'Активна') : (locale === 'uz' ? 'Nofaol' : 'Неактивна') },
                { label: locale === 'uz' ? 'Amal' : 'Действие', key: 'id', render: (row) => <Button variant="outline" size="sm" onClick={() => handleDeleteRestaurant(row)}>{locale === 'uz' ? 'O‘chirish' : 'Удалить'}</Button> },
              ]}
            />
          </Panel>

          <Panel title={locale === 'uz' ? 'Obuna kalitlari' : 'Ключи подписки'} eyebrow={locale === 'uz' ? 'Billing' : 'Биллинг'} description={locale === 'uz' ? 'Kalitlarni boshqarish va bekor qilish.' : 'Управление ключами и их отзыв.'}>
            <DataTable
              rows={keys}
              columns={[
                { label: locale === 'uz' ? 'Kalit' : 'Ключ', key: 'key' },
                { label: locale === 'uz' ? 'Muddat' : 'Срок', key: 'duration_months', render: (row) => `${row.duration_months} ${locale === 'uz' ? 'oy' : 'мес.'}` },
                { label: locale === 'uz' ? 'Faollashtirgan restoran' : 'Активировавший ресторан', key: 'activated_by', render: (row) => row.activated_by || '—' },
                { label: locale === 'uz' ? 'Holat' : 'Статус', key: 'is_activated', render: (row) => row.is_activated ? (locale === 'uz' ? 'Faollashtirilgan' : 'Активирован') : (locale === 'uz' ? 'Bo‘sh' : 'Свободен') },
                { label: locale === 'uz' ? 'Amal' : 'Действие', key: 'id', render: (row) => <Button variant="secondary" size="sm" onClick={() => handleRevokeKey(row)}>{locale === 'uz' ? 'Bekor qilish' : 'Отозвать'}</Button> },
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
        title={locale === 'uz' ? 'Operatsiyalar yopiq' : 'Операции закрыты'}
        subtitle={locale === 'uz' ? 'Ishni davom ettirish uchun obuna kalitini faollashtiring.' : 'Активируйте ключ подписки, чтобы продолжить работу.'}
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
      eyebrow={user?.role === 'CHAIN_OWNER' ? (locale === 'uz' ? 'Tarmoq operatsiyasi' : 'Операции сети') : (locale === 'uz' ? 'Restoran operatsiyasi' : 'Операции ресторана')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Panel title={locale === 'uz' ? 'Restoranlar ro‘yxati' : 'Список ресторанов'} eyebrow={locale === 'uz' ? 'Tuzilma' : 'Структура'} description={locale === 'uz' ? 'Hisobga bog‘langan barcha restoranlar shu yerda.' : 'Здесь показаны все рестораны, привязанные к аккаунту.'}>
            <div className="grid gap-4 md:grid-cols-2">
              {(workspace.restaurants || []).map((restaurant: any) => (
                <div key={restaurant.id} className="rounded-[24px] border border-white/8 bg-black/12 p-5">
                  <div className="font-semibold text-white">{restaurant.name}</div>
                  <div className="mt-1 text-sm text-white/42">{restaurant.slug}</div>
                  <div className="mt-4 text-sm text-white/52">{locale === 'uz' ? 'Obuna' : 'Подписка'}: {restaurant.subscription_active ? (locale === 'uz' ? 'Faol' : 'Активна') : (locale === 'uz' ? 'Nofaol' : 'Неактивна')}</div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={locale === 'uz' ? 'Buyurtmalar tarixi' : 'История заказов'} eyebrow={locale === 'uz' ? 'Operatsiyalar' : 'Операции'} description={locale === 'uz' ? 'Bugun, 7 kun, 30 kun yoki barcha davr bo‘yicha ko‘rish mumkin.' : 'Можно смотреть за сегодня, 7 дней, 30 дней или за весь период.'}>
            <div className="mb-4 flex flex-wrap gap-2">
              {['today', '7d', '30d', 'all'].map((value) => (
                <Button key={value} variant={period === value ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod(value)}>
                  {value}
                </Button>
              ))}
            </div>
            <DataTable
              rows={orders}
              emptyMessage={loading ? (locale === 'uz' ? 'Buyurtmalar yuklanmoqda...' : 'Загрузка заказов...') : (locale === 'uz' ? 'Bu davr uchun buyurtmalar yo‘q.' : 'За выбранный период заказов нет.')}
              columns={[
                { label: locale === 'uz' ? 'Vaqt' : 'Когда', key: 'created_at_display' },
                { label: locale === 'uz' ? 'Stol' : 'Стол', key: 'table', render: (row) => `${locale === 'uz' ? 'Stol' : 'Стол'} ${row.table}` },
                { label: locale === 'uz' ? 'Ofitsiant' : 'Официант', key: 'waiter' },
                { label: locale === 'uz' ? 'Holat' : 'Статус', key: 'status' },
                { label: locale === 'uz' ? 'Tarkib' : 'Состав', key: 'items', render: (row) => row.items?.length ? row.items.map((item: any) => `${item.qty}x ${item.dish}`).join(', ') : '—' },
                { label: locale === 'uz' ? 'Jami' : 'Итого', key: 'total', render: (row) => formatMoney(row.total) },
              ]}
            />
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
