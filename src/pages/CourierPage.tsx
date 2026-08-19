import { AppShell } from '@/components/app/AppShell';
export default function CourierPage(){
 return (
  <AppShell title="Курьер" subtitle="Мои доставки и маршрут" eyebrow="Courier">
    <div className="rounded-[28px] border border-theme bg-theme-panel p-8 text-center"><div className="text-5xl mb-3">🛵</div><p className="text-theme-secondary">Мобильное приложение — основной интерфейс курьера. Веб-панель показывает только историю.</p><a href="/analytics" className="mt-4 inline-flex rounded-xl bg-white text-black px-5 py-2 text-sm font-bold">К аналитике</a></div>
  </AppShell>
 );
}
