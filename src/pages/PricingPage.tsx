import { useEffect, useState } from 'react';
import { Check, Gift } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { AppShell } from '@/components/app/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { subscriptionAPI, type SubscriptionPlanResponse } from '@/services/api';

const FEATURE_LABELS: Record<string, string> = {
  kiosk_ordering: 'Киоск самообслуживания',
  online_menu: 'Меню онлайн',
  guest_reviews: 'Отзывы гостей',
  push_notifications: 'Push-уведомления',
  telegram_notifications: 'Telegram-уведомления',
  whatsapp_notifications: 'WhatsApp-рассылки',
  sms_notifications: 'SMS-рассылки',
  ai_review_analysis: 'AI-анализ отзывов',
  guest_crm: 'CRM гостей с сегментацией',
  advanced_analytics: 'Расширенная аналитика',
  loyalty_program: 'Программа лояльности',
  public_api: 'Публичное API',
  white_label: 'White Label',
  checklists: 'Чек-листы',
  hr_module: 'HR-модуль',
  suppliers_module: 'Модуль поставщиков',
  multi_restaurant: 'Мульти-ресторан',
  hall_management: 'Управление залом',
  table_management: 'Схема столов',
};

const ALL_FEATURES = Object.keys(FEATURE_LABELS);

export default function PricingPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [plan, setPlan] = useState<SubscriptionPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLocale();

  const restaurantId = workspace.selectedRestaurantId;

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    subscriptionAPI.getPlans()
      .then(plansRes => {
        const items = Array.isArray(plansRes.data) ? plansRes.data : (plansRes.data.results || []);
        setPlan(items[0] || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const features = plan
    ? Object.entries(plan.features || {}).filter(([, v]) => v)
    : ALL_FEATURES.map(k => [k, true] as [string, boolean]);

  return (
    <AppShell
      title={t('pricingPage_title', 'Бета-доступ')}
      subtitle={t('pricingPage_subtitle', 'На время бета-тестирования все функции доступны бесплатно.')}
      eyebrow={t('pricingPage_eyebrow', 'Waitly Control')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="space-y-6">

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-theme-secondary">{t('pricingPage_loading', 'Загрузка...')}</div>
        ) : (
          <>
            <div className="mx-auto max-w-2xl">
              <div className="relative flex flex-col rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-8 shadow-lg">
                <div className="absolute -top-3 right-6 rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white">
                  {t('pricingPage_beta', 'BETA')}
                </div>
                <div className="flex items-start gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-emerald-500/10">
                    <Gift className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-2xl text-white">{plan?.name || t('pricingPage_beta_plan', 'Beta — Все включено')}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{plan?.description || t('pricingPage_beta_desc', 'Все функции платформы без ограничений. Бесплатно на время тестирования.')}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-white">{t('pricingPage_free', 'Бесплатно')}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {features.map(([key]) => (
                    <div key={key} className="flex items-start gap-3 text-sm text-white/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{FEATURE_LABELS[key] || key}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-4 text-center">
                  <div className="text-sm font-semibold text-emerald-300">
                    {t('pricingPage_active', 'Активен')} — {t('pricingPage_beta_period', 'бета-доступ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/8 bg-black/10 px-6 py-4 text-xs text-theme-secondary">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> {t('pricingPage_noHiddenFees', 'Без скрытых платежей')}</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> {t('pricingPage_allFeatures', 'Все функции включены')}</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> {t('pricingPage_beta_feedback', 'Помогите нам стать лучше')}</span>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
