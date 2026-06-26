import { Gift, Megaphone, MessageSquareText, Percent, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';

const mockPromos = [
  { code: 'WELCOME20', discount: '20%', uses: 145, expires: '2026-07-15' },
  { code: 'HALFDRINK', discount: '50%', uses: 67, expires: '2026-07-10' },
  { code: 'FREESHIP', discount: '100%', uses: 23, expires: '2026-06-30' },
  { code: 'LOYAL10', discount: '10%', uses: 89, expires: '2026-08-01' },
  { code: 'PASTALOVE', discount: '15%', uses: 12, expires: '2026-06-28' },
];

export default function MarketerDashboardPage() {
  const { locale } = useLocale();
  const navigate = useNavigate();

  const mockCampaigns = [
    { name: locale === 'uz' ? 'Ertalabki eslatma' : 'Утреннее напоминание', status: 'active', sent: 1240, template: 'morning_greeting' },
    { name: locale === 'uz' ? 'Tug\'ilgan kun' : 'День рождения', status: 'active', sent: 320, template: 'birthday' },
    { name: locale === 'uz' ? 'Qayta jalb' : 'Re-engagement', status: 'paused', sent: 560, template: 'we_miss_you' },
  ];

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'paused') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-white/5 text-white/30 border-white/10';
  };

  return (
    <AppShell
      title={locale === 'uz' ? 'Marketing paneli' : 'Панель маркетолога'}
      subtitle={locale === 'uz' ? 'Promo-kodlar, avtomatik xabarlar va obunachilar.' : 'Промо-коды, автоматические рассылки и подписчики.'}
      eyebrow={locale === 'uz' ? 'Marketing' : 'Маркетинг'}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title={locale === 'uz' ? 'Faol promolar' : 'Активные промо'} value={8} note={locale === 'uz' ? 'Joriy aksiyalar' : 'Текущие акции'} icon={Gift} tone="coral" />
          <MetricCard title={locale === 'uz' ? 'Obunachilar' : 'Подписчики'} value={2840} note={locale === 'uz' ? 'Telegram kanallar' : 'Telegram-каналы'} icon={UsersRound} tone="cyan" />
          <MetricCard title={locale === 'uz' ? 'Kampaniyalar' : 'Кампании'} value={5} note={locale === 'uz' ? 'Avto-xabarlar' : 'Авто-рассылки'} icon={Megaphone} tone="sand" />
          <MetricCard title={locale === 'uz' ? 'Konversiya' : 'Конверсия'} value="12.4%" note={locale === 'uz' ? 'Promo kodlar' : 'Промо-коды'} icon={Percent} tone="mint" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={locale === 'uz' ? 'So\'nggi promo-kodlar' : 'Последние промо-коды'} eyebrow={locale === 'uz' ? 'Aksiyalar' : 'Акции'}>
            <DataTable
              rows={mockPromos}
              columns={[
                { label: 'Code', key: 'code', render: (row) => <span className="font-mono font-bold text-white">{row.code}</span> },
                { label: locale === 'uz' ? 'Chegirma' : 'Скидка', key: 'discount' },
                { label: locale === 'uz' ? 'Foydalanish' : 'Использовано', key: 'uses' },
                { label: locale === 'uz' ? 'Muddat' : 'Срок', key: 'expires' },
              ]}
              emptyMessage={locale === 'uz' ? 'Promo-kodlar topilmadi.' : 'Промо-коды не найдены.'}
            />
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={() => navigate('/promo')}>
                {locale === 'uz' ? 'Barcha promolar' : 'Все промо'}
              </Button>
            </div>
          </Panel>
          <Panel title={locale === 'uz' ? 'Avto-xabarlar' : 'Авто-рассылки'} eyebrow={locale === 'uz' ? 'Kampaniyalar' : 'Кампании'}>
            <div className="space-y-3">
              {mockCampaigns.map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                  <div>
                    <div className="text-sm font-bold text-white">{c.name}</div>
                    <div className="mt-0.5 text-[10px] text-white/40">{c.sent} {locale === 'uz' ? 'yuborilgan' : 'отправлено'}</div>
                  </div>
                  <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusColor(c.status)}`}>
                    {c.status === 'active' ? (locale === 'uz' ? 'Faol' : 'Активна') : locale === 'uz' ? 'Pauza' : 'Пауза'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={() => navigate('/auto-notify')}>
                {locale === 'uz' ? 'Barcha kampaniyalar' : 'Все кампании'}
              </Button>
            </div>
          </Panel>
        </div>

        <Panel title={locale === 'uz' ? 'Shablonlar' : 'Шаблоны уведомлений'} eyebrow={locale === 'uz' ? 'Content' : 'Контент'}>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'morning_greeting', label: locale === 'uz' ? 'Ertalabki salom' : 'Утреннее приветствие', preview: 'Assalomu alaykum! Sizni...' },
              { name: 'birthday', label: locale === 'uz' ? 'Tug\'ilgan kun' : 'День рождения', preview: 'Tug\'ilgan kuningiz bilan!...' },
              { name: 'we_miss_you', label: locale === 'uz' ? 'Sog\'indik' : 'Мы скучаем', preview: 'Uzoq vaqt ko\'rinmadingiz...' },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/5 bg-white/2 p-4 transition-colors hover:bg-white/5">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-[#7dd3fc]" />
                  <span className="text-sm font-bold text-white">{t.label}</span>
                </div>
                <div className="mt-2 text-xs text-white/40 italic">&ldquo;{t.preview}&rdquo;</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
