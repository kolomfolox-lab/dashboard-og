import { DollarSign, ShoppingBag, TrendingUp, UsersRound } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { useLocale } from '@/context/LocaleContext';

const revenueData = [4200000, 5100000, 3850000, 6200000, 5800000, 7200000, 6750000];
const ordersData = [42, 51, 38, 62, 58, 72, 67];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AnalystDashboardPage() {
  const { locale } = useLocale();

  const formatMoney = (val: number) =>
    new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU').format(val) + ' UZS';

  const maxRevenue = Math.max(...revenueData);
  const maxOrders = Math.max(...ordersData);

  return (
    <AppShell
      title={locale === 'uz' ? 'Analitik paneli' : 'Панель аналитика'}
      subtitle={locale === 'uz' ? 'Asosiy ko\'rsatkichlar, grafiklar va hisobotlar (faqat o\'qish).' : 'Ключевые метрики, графики и отчёты (только чтение).'}
      eyebrow={locale === 'uz' ? 'Analitika' : 'Аналитика'}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title={locale === 'uz' ? 'Bugungi tushum' : 'Выручка сегодня'} value={formatMoney(6750000)} note={locale === 'uz' ? '+12% haftaga nisbatan' : '+12% к прошлой неделе'} icon={DollarSign} tone="coral" />
          <MetricCard title={locale === 'uz' ? 'Buyurtmalar' : 'Заказы сегодня'} value={67} note={locale === 'uz' ? 'Oxirgi 24 soat' : 'Последние 24ч'} icon={ShoppingBag} tone="cyan" />
          <MetricCard title={locale === 'uz' ? 'O\'rtacha чек' : 'Средний чек'} value={formatMoney(100746)} note={locale === 'uz' ? 'Bu hafta' : 'На этой неделе'} icon={TrendingUp} tone="sand" />
          <MetricCard title={locale === 'uz' ? 'Faol mehmonlar' : 'Активные гости'} value={184} note={locale === 'uz' ? 'Hozir restoranda' : 'Сейчас в ресторане'} icon={UsersRound} tone="mint" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={locale === 'uz' ? 'Haftalik tushum' : 'Еженедельная выручка'} eyebrow={locale === 'uz' ? 'Dinamika' : 'Динамика'}>
            <div className="flex h-[300px] items-end justify-between gap-2 px-2">
              {revenueData.map((val, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] text-white/30">{formatMoney(val)}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-[#7dd3fc]/60 to-[#7dd3fc]/20 transition-all hover:from-[#7dd3fc]/80" style={{ height: `${(val / maxRevenue) * 100}%` }} />
                  <span className="text-[10px] text-white/40">{days[i]}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title={locale === 'uz' ? 'Haftalik buyurtmalar' : 'Еженедельные заказы'} eyebrow={locale === 'uz' ? 'Hajm' : 'Объём'}>
            <div className="flex h-[300px] items-end justify-between gap-2 px-2">
              {ordersData.map((val, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] text-white/30">{val}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-[#34d399]/60 to-[#34d399]/20 transition-all hover:from-[#34d399]/80" style={{ height: `${(val / maxOrders) * 100}%` }} />
                  <span className="text-[10px] text-white/40">{days[i]}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title={locale === 'uz' ? 'Top kategoriyalar' : 'Топ категории'} eyebrow={locale === 'uz' ? 'Mahsulotlar' : 'Продукты'}>
            <div className="space-y-3">
              {[
                { name: locale === 'uz' ? 'Issiq ovqatlar' : 'Горячие блюда', pct: 42, color: '#f97360' },
                { name: locale === 'uz' ? 'Ichimliklar' : 'Напитки', pct: 28, color: '#7dd3fc' },
                { name: locale === 'uz' ? 'Salatlar' : 'Салаты', pct: 18, color: '#34d399' },
                { name: locale === 'uz' ? 'Desertlar' : 'Десерты', pct: 12, color: '#f7b267' },
              ].map((cat) => (
                <div key={cat.name}>
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
          </Panel>
          <Panel title={locale === 'uz' ? 'Eng yuqori soatlar' : 'Часы пик'} eyebrow={locale === 'uz' ? 'Yuklama' : 'Нагрузка'}>
            <div className="flex h-[200px] items-end justify-between gap-2 px-2">
              {[8, 12, 14, 18, 20, 22].map((h) => (
                <div key={h} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-[#f97360]/50 to-[#f97360]/10" style={{ height: `${[30, 55, 70, 90, 100, 65][[8,12,14,18,20,22].indexOf(h)]}%` }} />
                  <span className="text-[10px] text-white/40">{h}:00</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title={locale === 'uz' ? 'O\'rtacha tekshirish' : 'Средний чек по дням'} eyebrow={locale === 'uz' ? 'Analitika' : 'Аналитика'}>
            <div className="space-y-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
                const check = [100000, 98000, 101000, 105000, 120000, 115000, 110000][i];
                return (
                  <div key={d} className="flex items-center gap-4 rounded-xl bg-white/3 px-3 py-2">
                    <span className="w-8 text-[11px] font-bold uppercase text-white/40">{d}</span>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-white/5">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#7dd3fc] to-[#34d399]" style={{ width: `${(check / 120000) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white">{formatMoney(check)}</span>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        <Panel title={locale === 'uz' ? 'Qisqacha xulosa' : 'Краткое резюме'} eyebrow={locale === 'uz' ? 'Hisobot' : 'Отчёт'}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#7dd3fc]">{locale === 'uz' ? 'O\'sish' : 'Рост'}</div>
              <div className="mt-2 text-2xl font-black text-white">+18.5%</div>
              <div className="mt-1 text-xs text-white/40">{locale === 'uz' ? 'Oxirgi oyga nisbatan' : 'По сравнению с прошлым месяцем'}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#f97360]">{locale === 'uz' ? 'O\'rtacha baho' : 'Средняя оценка'}</div>
              <div className="mt-2 text-2xl font-black text-white">4.7</div>
              <div className="mt-1 text-xs text-white/40">{locale === 'uz' ? 'Mehmonlarning fikrlari' : 'Отзывы гостей'}</div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#34d399]">{locale === 'uz' ? 'Qaytish darajasi' : 'Возвращаемость'}</div>
              <div className="mt-2 text-2xl font-black text-white">62%</div>
              <div className="mt-1 text-xs text-white/40">{locale === 'uz' ? 'Takroriy mehmonlar' : 'Повторные гости'}</div>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
