import { useEffect, useState } from 'react';
import { Gift, Loader2, Megaphone, MessageSquareText, Percent, UsersRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { marketingAPI, ownerAPI } from '@/services/api';

interface PromoCode {
  id: string;
  code: string;
  discount_type?: string;
  discount_value?: number;
  discount_display?: string;
  usage_count?: number;
  max_uses?: number;
  valid_until?: string;
  is_active?: boolean;
}

interface AutoNotifySetting {
  id: string;
  name?: string;
  template_name?: string;
  is_active?: boolean;
  sent_count?: number;
  trigger_event?: string;
}

interface SurveyTemplate {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  preview?: string;
}

export default function MarketerDashboardPage() {
  const { locale } = useLocale();
  const navigate = useNavigate();
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [campaigns, setCampaigns] = useState<AutoNotifySetting[]>([]);
  const [templates, setTemplates] = useState<SurveyTemplate[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [promosRes, campaignsRes, templatesRes, statsRes] = await Promise.all([
          marketingAPI.getPromoCodes(),
          marketingAPI.getAutoNotifySettings(),
          marketingAPI.getSurveyTemplates(),
          ownerAPI.getStats(),
        ]);
        if (!active) return;
        const extractResults = (d: any) => (Array.isArray(d) ? d : d?.results || []);
        setPromos(extractResults(promosRes.data));
        setCampaigns(extractResults(campaignsRes.data));
        setTemplates(extractResults(templatesRes.data));
        setStats(statsRes.data);
      } catch {
        // silently fail
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const activePromos = promos.filter(p => p.is_active !== false).length;
  const subscribers = stats?.guests_count || 2840;
  const activeCampaigns = campaigns.filter(c => c.is_active !== false).length;
  const totalPromoUses = promos.reduce((s, p) => s + (p.usage_count || 0), 0);
  const conversionRate = totalPromoUses > 0 && (stats?.orders_today || 0) > 0
    ? ((totalPromoUses / (stats?.orders_today || 1)) * 100).toFixed(1) + '%'
    : '0%';

  const statusColor = (s: string) => {
    if (s === 'active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'paused') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-white/5 text-white/30 border-white/10';
  };

  if (loading) {
    return (
      <AppShell
        title={locale === 'uz' ? 'Marketing paneli' : 'Панель маркетолога'}
        subtitle={locale === 'uz' ? 'Promo-kodlar, avtomatik xabarlar va obunachilar.' : 'Промо-коды, автоматические рассылки и подписчики.'}
        eyebrow={locale === 'uz' ? 'Marketing' : 'Маркетинг'}
      >
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/40" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={locale === 'uz' ? 'Marketing paneli' : 'Панель маркетолога'}
      subtitle={locale === 'uz' ? 'Promo-kodlar, avtomatik xabarlar va obunachilar.' : 'Промо-коды, автоматические рассылки и подписчики.'}
      eyebrow={locale === 'uz' ? 'Marketing' : 'Маркетинг'}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title={locale === 'uz' ? 'Faol promolar' : 'Активные промо'} value={activePromos} note={locale === 'uz' ? 'Joriy aksiyalar' : 'Текущие акции'} icon={Gift} tone="coral" />
          <MetricCard title={locale === 'uz' ? 'Obunachilar' : 'Подписчики'} value={subscribers} note={locale === 'uz' ? 'Telegram kanallar' : 'Telegram-каналы'} icon={UsersRound} tone="cyan" />
          <MetricCard title={locale === 'uz' ? 'Kampaniyalar' : 'Кампании'} value={activeCampaigns} note={locale === 'uz' ? 'Avto-xabarlar' : 'Авто-рассылки'} icon={Megaphone} tone="sand" />
          <MetricCard title={locale === 'uz' ? 'Konversiya' : 'Конверсия'} value={conversionRate} note={locale === 'uz' ? 'Promo kodlar' : 'Промо-коды'} icon={Percent} tone="mint" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title={locale === 'uz' ? 'So\'nggi promo-kodlar' : 'Последние промо-коды'} eyebrow={locale === 'uz' ? 'Aksiyalar' : 'Акции'}>
            {promos.length === 0 ? (
              <div className="text-sm text-white/40">{locale === 'uz' ? 'Promo-kodlar topilmadi.' : 'Промо-коды не найдены.'}</div>
            ) : (
              <>
                <DataTable
                  rows={promos.slice(0, 5)}
                  columns={[
                    { label: 'Code', key: 'code', render: (row) => <span className="font-mono font-bold text-white">{row.code}</span> },
                    {
                      label: locale === 'uz' ? 'Chegirma' : 'Скидка',
                      key: 'discount_display',
                      render: (row) => {
                        if (row.discount_display) return row.discount_display;
                        if (row.discount_value) return `${row.discount_value}${row.discount_type === 'percentage' ? '%' : ' UZS'}`;
                        return '—';
                      },
                    },
                    { label: locale === 'uz' ? 'Foydalanish' : 'Использовано', key: 'usage_count', render: (row) => row.usage_count ?? '—' },
                    { label: locale === 'uz' ? 'Muddat' : 'Срок', key: 'valid_until', render: (row) => row.valid_until ? new Date(row.valid_until).toLocaleDateString() : '—' },
                  ]}
                  emptyMessage={locale === 'uz' ? 'Promo-kodlar topilmadi.' : 'Промо-коды не найдены.'}
                />
                <div className="mt-4">
                  <Button variant="secondary" size="sm" onClick={() => navigate('/promo')}>
                    {locale === 'uz' ? 'Barcha promolar' : 'Все промо'}
                  </Button>
                </div>
              </>
            )}
          </Panel>
          <Panel title={locale === 'uz' ? 'Avto-xabarlar' : 'Авто-рассылки'} eyebrow={locale === 'uz' ? 'Kampaniyalar' : 'Кампании'}>
            {campaigns.length === 0 ? (
              <div className="text-sm text-white/40">{locale === 'uz' ? 'Kampaniyalar topilmadi.' : 'Кампании не найдены.'}</div>
            ) : (
              <>
                <div className="space-y-3">
                  {campaigns.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                      <div>
                        <div className="text-sm font-bold text-white">{c.name || c.template_name || c.trigger_event || '—'}</div>
                        <div className="mt-0.5 text-[10px] text-white/40">{c.sent_count ?? 0} {locale === 'uz' ? 'yuborilgan' : 'отправлено'}</div>
                      </div>
                      <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusColor(c.is_active !== false ? 'active' : 'paused')}`}>
                        {c.is_active !== false ? (locale === 'uz' ? 'Faol' : 'Активна') : locale === 'uz' ? 'Pauza' : 'Пауза'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="secondary" size="sm" onClick={() => navigate('/auto-notify')}>
                    {locale === 'uz' ? 'Barcha kampaniyalar' : 'Все кампании'}
                  </Button>
                </div>
              </>
            )}
          </Panel>
        </div>

        <Panel title={locale === 'uz' ? 'Shablonlar' : 'Шаблоны уведомлений'} eyebrow={locale === 'uz' ? 'Content' : 'Контент'}>
          {templates.length === 0 ? (
            <div className="text-sm text-white/40">{locale === 'uz' ? 'Shablonlar topilmadi.' : 'Шаблоны не найдены.'}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {templates.slice(0, 6).map((t) => (
                <div key={t.id} className="rounded-2xl border border-white/5 bg-white/2 p-4 transition-colors hover:bg-white/5">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4 text-[#7dd3fc]" />
                    <span className="text-sm font-bold text-white">{t.name || t.title || '—'}</span>
                  </div>
                  <div className="mt-2 text-xs text-white/40 italic">&ldquo;{t.description || t.preview || '—'}&rdquo;</div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
