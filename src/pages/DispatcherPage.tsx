import { AppShell } from '@/components/app/AppShell';
export default function DispatcherPage(){
 return (
  <AppShell title="Диспетчер" subtitle="Распределение заказов курьерам и контроль доставки" eyebrow="Dispatcher">
    <div className="grid gap-4 md:grid-cols-2">
      <a href="/crm" className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme">Заказы на доставку</div><p className="text-sm text-theme-secondary mt-1">Фильтр channel=DELIVERY</p></a>
      <a href="/analytics" className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme">Аналитика доставки</div><p className="text-sm text-theme-secondary mt-1">Время, задержки</p></a>
    </div>
    <div className="mt-6 rounded-[28px] border border-theme bg-theme-panel p-6"><p className="text-theme-secondary text-sm">TODO: подключить /api/orders?channel=DELIVERY и курьерский сокет</p></div>
  </AppShell>
 );
}
