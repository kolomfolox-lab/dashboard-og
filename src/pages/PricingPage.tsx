import { useEffect, useState } from 'react';
import { Check, X, CreditCard, Sparkles, Star } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { subscriptionAPI, type SubscriptionPlanResponse } from '@/services/api';

const BENEFITS: Record<string, { icon: any; label: string }> = {
  kiosk_ordering: { icon: Check, label: 'QR-меню и заказ' },
  online_menu: { icon: Check, label: 'Онлайн-меню' },
  guest_reviews: { icon: Check, label: 'Отзывы гостей' },
  push_notifications: { icon: Check, label: 'Push-уведомления' },
  telegram_notifications: { icon: Check, label: 'Уведомления в Telegram' },
  whatsapp_notifications: { icon: Check, label: 'WhatsApp-уведомления' },
  sms_notifications: { icon: Check, label: 'SMS-уведомления' },
  ai_review_analysis: { icon: Sparkles, label: 'AI-анализ отзывов' },
  loyalty_program: { icon: Star, label: 'Программа лояльности' },
  public_api: { icon: Check, label: 'Публичное API' },
  white_label: { icon: Check, label: 'White Label' },
  checklists: { icon: Check, label: 'Чек-листы' },
  hr_module: { icon: Check, label: 'HR-модуль' },
  suppliers_module: { icon: Check, label: 'Модуль поставщиков' },
  advanced_analytics: { icon: Check, label: 'Расширенная аналитика' },
  multi_restaurant: { icon: Check, label: 'Несколько ресторанов' },
};

export default function PricingPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    subscriptionAPI.getPlans()
      .then(res => setPlans(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async (planSlug: string) => {
    setSelectedPlan(planSlug);
    setPurchasing(true);
    try {
      const res = await subscriptionAPI.purchase({
        plan_slug: planSlug,
        duration_months: 1,
        payment_method: 'payme',
      });
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        alert('Счёт создан. Оплатите через Payme.');
        workspace.reload();
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Ошибка при оформлении');
    }
    setPurchasing(false);
    setSelectedPlan(null);
  };

  return (
    <AppShell
      title="Тарифы"
      subtitle="Выберите подходящий план для вашего ресторана"
      eyebrow="Waitly Control"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}>
        <div className="space-y-6">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Не знаете, какой тариф выбрать? Большинство ресторанов с 1 залом выбирают <strong className="text-white">Start</strong>,
          а сети с 3+ точками — <strong className="text-white">Enterprise</strong>. <strong className="text-indigo-400">Business</strong> — универсальный выбор
          для растущего бизнеса {workspace.selectedRestaurantId && <span className="text-indigo-400">✓</span>}.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map(plan => {
            const enabledFeatures = Object.entries(plan.features).filter(([, v]) => v);
            const disabledFeatures = Object.entries(plan.features).filter(([, v]) => !v);
            const pricePerMonth = plan.price_uzs > 0 ? `${(plan.price_uzs / 100).toLocaleString()} сум/мес` : 'Бесплатно';
            const isPopular = plan.slug === 'business';

            return (
              <div key={plan.slug} className={`relative flex flex-col rounded-3xl border p-6 transition-all ${
                isPopular ? 'border-indigo-400 bg-indigo-500/5 shadow-lg shadow-indigo-500/10' : 'border-[var(--panel-border)] bg-[var(--panel-bg)]'
              }`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-xs font-semibold text-white shadow-md">
                    Популярный
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{plan.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-[var(--text-primary)]">{pricePerMonth}</span>
                </div>
                <div className="mb-6 space-y-2.5">
                  {enabledFeatures.map(([key]) => {
                    const benefit = BENEFITS[key as keyof typeof BENEFITS];
                    if (!benefit) return null;
                    const Icon = benefit.icon;
                    return (
                      <div key={key} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                        <Icon className="h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{benefit.label}</span>
                      </div>
                    );
                  })}
                  {disabledFeatures.map(([key]) => {
                    const benefit = BENEFITS[key as keyof typeof BENEFITS];
                    if (!benefit) return null;
                    return (
                      <div key={key} className="flex items-center gap-2 text-sm text-[var(--text-secondary)] opacity-50">
                        <X className="h-4 w-4 shrink-0" />
                        <span>{benefit.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-auto">
                  {plan.price_uzs === 0 ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Текущий план
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? 'primary' : 'secondary'}
                      className="w-full"
                      onClick={() => handlePurchase(plan.slug)}
                      disabled={purchasing && selectedPlan === plan.slug}
                    >
                      {purchasing && selectedPlan === plan.slug ? 'Оформление...' : <><CreditCard className="mr-2 h-4 w-4" />Оформить</>}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/8 bg-black/10 px-6 py-4 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Без скрытых платежей</span>
          <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Отмена в 1 клик</span>
          <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Перенос данных при переходе</span>
        </div>
      </div>
    </AppShell>
  );
}
