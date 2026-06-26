import { DollarSign, Receipt, TrendingUp, UsersRound } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { useLocale } from '@/context/LocaleContext';

const mockTransactions = [
  { id: '1', date: '2026-06-26', order: '#ORD-001', amount: 245000, status: 'completed', method: 'Card' },
  { id: '2', date: '2026-06-26', order: '#ORD-002', amount: 128000, status: 'completed', method: 'Cash' },
  { id: '3', date: '2026-06-25', order: '#ORD-003', amount: 560000, status: 'pending', method: 'Card' },
  { id: '4', date: '2026-06-25', order: '#ORD-004', amount: 89000, status: 'completed', method: 'Transfer' },
  { id: '5', date: '2026-06-24', order: '#ORD-005', amount: 312000, status: 'failed', method: 'Card' },
  { id: '6', date: '2026-06-24', order: '#ORD-006', amount: 175000, status: 'completed', method: 'Cash' },
  { id: '7', date: '2026-06-23', order: '#ORD-007', amount: 420000, status: 'pending', method: 'Transfer' },
  { id: '8', date: '2026-06-23', order: '#ORD-008', amount: 95000, status: 'completed', method: 'Card' },
];

export default function AccountantDashboardPage() {
  const { locale } = useLocale();

  const formatMoney = (val: number) =>
    new Intl.NumberFormat(locale === 'uz' ? 'uz-UZ' : 'ru-RU').format(val) + ' UZS';

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      completed: locale === 'uz' ? 'To\'langan' : 'Оплачен',
      pending: locale === 'uz' ? 'Kutilmoqda' : 'Ожидает',
      failed: locale === 'uz' ? 'Bekor' : 'Отменён',
    };
    return map[s] || s;
  };

  const statusColor = (s: string) => {
    if (s === 'completed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'pending') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border-red-500/20';
  };

  return (
    <AppShell
      title={locale === 'uz' ? 'Buxgalteriya paneli' : 'Панель бухгалтера'}
      subtitle={locale === 'uz' ? 'Moliyaviy ko\'rsatkichlar, to\'lovlar va hisobotlar.' : 'Финансовые показатели, платежи и отчёты.'}
      eyebrow={locale === 'uz' ? 'Moliya' : 'Финансы'}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title={locale === 'uz' ? 'Bugungi tushum' : 'Выручка сегодня'} value={formatMoney(5840000)} note={locale === 'uz' ? 'Joriy kun' : 'Текущий день'} icon={DollarSign} tone="coral" />
          <MetricCard title={locale === 'uz' ? 'Haftalik tushum' : 'Выручка за неделю'} value={formatMoney(32100000)} note={locale === 'uz' ? 'Oxirgi 7 kun' : 'Последние 7 дней'} icon={TrendingUp} tone="sand" />
          <MetricCard title={locale === 'uz' ? 'Kutilayotgan to\'lovlar' : 'Ожидаемые платежи'} value={formatMoney(980000)} note={locale === 'uz' ? '3 ta to\'lov' : '3 платежа'} icon={Receipt} tone="cyan" />
          <MetricCard title={locale === 'uz' ? 'Ish haqi fondi' : 'Фонд зарплаты'} value={formatMoney(15200000)} note={locale === 'uz' ? '12 xodim' : '12 сотрудников'} icon={UsersRound} tone="mint" />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title={locale === 'uz' ? 'Daromad dinamikasi' : 'Динамика доходов'} eyebrow={locale === 'uz' ? 'Moliyaviy' : 'Финансовый'} className="xl:col-span-2">
            <div className="flex h-[360px] items-end justify-between gap-2 px-2">
              {[65, 78, 52, 89, 94, 72, 83].map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-[#f97360]/60 to-[#f97360]/20" style={{ height: `${h}%` }} />
                  <span className="text-[10px] text-white/40">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title={locale === 'uz' ? 'To\'lov usullari' : 'Способы оплаты'} eyebrow={locale === 'uz' ? 'Statistika' : 'Статистика'}>
            <div className="space-y-3">
              {[
                { label: 'Card', pct: 52, color: '#f97360' },
                { label: 'Cash', pct: 28, color: '#7dd3fc' },
                { label: 'Transfer', pct: 20, color: '#34d399' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-white/80">{m.label}</span>
                    <span className="text-white/50">{m.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div className="h-2 rounded-full" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title={locale === 'uz' ? 'So\'nggi to\'lovlar' : 'Последние платежи'} eyebrow={locale === 'uz' ? 'Tranzaksiyalar' : 'Транзакции'}>
          <DataTable
            rows={mockTransactions}
            columns={[
              { label: locale === 'uz' ? 'Sana' : 'Дата', key: 'date' },
              { label: locale === 'uz' ? 'Buyurtma' : 'Заказ', key: 'order' },
              {
                label: locale === 'uz' ? 'Summa' : 'Сумма',
                key: 'amount',
                render: (row) => <span className="font-semibold text-white">{formatMoney(row.amount)}</span>,
              },
              {
                label: locale === 'uz' ? 'Holat' : 'Статус',
                key: 'status',
                render: (row) => (
                  <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusColor(row.status)}`}>
                    {statusLabel(row.status)}
                  </span>
                ),
              },
              { label: locale === 'uz' ? 'Usul' : 'Способ', key: 'method' },
            ]}
            emptyMessage={locale === 'uz' ? 'Tranzaksiyalar topilmadi.' : 'Транзакции не найдены.'}
          />
        </Panel>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={locale === 'uz' ? 'Ish haqi xulosasi' : 'Сводка по зарплате'} eyebrow={locale === 'uz' ? 'Xodimlar' : 'Сотрудники'}>
            <div className="space-y-3">
              {[
                { name: locale === 'uz' ? 'Ofitsiantlar' : 'Официанты', count: 6, total: 6800000 },
                { name: locale === 'uz' ? 'Oshpazlar' : 'Повара', count: 3, total: 5200000 },
                { name: locale === 'uz' ? 'Menejerlar' : 'Менеджеры', count: 2, total: 2400000 },
                { name: locale === 'uz' ? 'Boshqa' : 'Прочие', count: 1, total: 800000 },
              ].map((cat) => (
                <div key={cat.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                  <div>
                    <div className="text-sm font-bold text-white">{cat.name}</div>
                    <div className="text-[10px] text-white/40">{cat.count} {locale === 'uz' ? 'kishi' : 'чел.'}</div>
                  </div>
                  <div className="text-sm font-bold text-[#ffd4c4]">{formatMoney(cat.total)}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title={locale === 'uz' ? 'Soliq hisobotlari' : 'Налоговые отчёты'} eyebrow={locale === 'uz' ? 'Komplayens' : 'Комплаенс'}>
            <div className="space-y-3">
              {[
                { label: locale === 'uz' ? 'QQS (iyun)' : 'НДС (июнь)', amount: 1240000, status: 'paid' },
                { label: locale === 'uz' ? 'Foydali soliq' : 'Налог на прибыль', amount: 890000, status: 'pending' },
                { label: locale === 'uz' ? 'Ijtimoiy to\'lov' : 'Соц. отчисления', amount: 560000, status: 'paid' },
              ].map((tax) => (
                <div key={tax.label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                  <div>
                    <div className="text-sm text-white/80">{tax.label}</div>
                    <div className="mt-1 text-[10px] text-white/30">{tax.status === 'paid' ? (locale === 'uz' ? 'To\'langan' : 'Оплачен') : (locale === 'uz' ? 'Kutilmoqda' : 'Ожидает')}</div>
                  </div>
                  <div className="text-sm font-bold text-[#ffd4c4]">{formatMoney(tax.amount)}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
