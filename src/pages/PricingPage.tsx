import { useEffect, useState } from 'react';
import { Check, Coffee, UtensilsCrossed, PartyPopper, Pizza, Sparkles, MessageSquare } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, subscriptionAPI, type SubscriptionPlanResponse } from '@/services/api';

const PLAN_ICONS: Record<string, any> = {
  coffee: Coffee,
  restaurant: UtensilsCrossed,
  banquet: PartyPopper,
  street_food: Pizza,
};

const PLAN_COLORS: Record<string, string> = {
  coffee: 'border-emerald-500/30 bg-emerald-500/5',
  restaurant: 'border-indigo-500/30 bg-indigo-500/5',
  banquet: 'border-amber-500/30 bg-amber-500/5',
  street_food: 'border-rose-500/30 bg-rose-500/5',
};

const PLAN_ACCENT: Record<string, string> = {
  coffee: 'text-emerald-400',
  restaurant: 'text-indigo-400',
  banquet: 'text-amber-400',
  street_food: 'text-rose-400',
};

const PLAN_BG: Record<string, string> = {
  coffee: 'bg-emerald-500/10',
  restaurant: 'bg-indigo-500/10',
  banquet: 'bg-amber-500/10',
  street_food: 'bg-rose-500/10',
};

const FEATURE_LABELS: Record<string, string> = {
  kiosk_ordering: 'Бронирование через Telegram',
  online_menu: 'Меню онлайн',
  guest_reviews: 'Отзывы гостей',
  push_notifications: 'Push-уведомления',
  telegram_notifications: 'Telegram-уведомления',
  whatsapp_notifications: 'WhatsApp-рассылки',
  sms_notifications: 'SMS-рассылки',
  guest_crm: 'CRM гостей с сегментацией',
  advanced_analytics: 'Расширенная аналитика',
  loyalty_program: 'Программа лояльности',
  hall_management: 'Управление залом',
  table_management: 'Схема столов',
};

export default function PricingPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [activeSlugs, setActiveSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const restaurantId = workspace.selectedRestaurantId;

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    Promise.all([
      subscriptionAPI.getPlans(),
      ownerAPI.getActiveSubscriptions(restaurantId),
    ])
      .then(([plansRes, activeRes]) => {
        setPlans(plansRes.data);
        setActiveSlugs(new Set(activeRes.data.active_plan_slugs));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  return (
    <AppShell
      title="Подписки"
      subtitle="Выберите подписку под ваш тип бизнеса"
      eyebrow="Waitly Control"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="space-y-6">

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-theme-secondary">Загрузка...</div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {plans.map(plan => {
                const Icon = PLAN_ICONS[plan.slug] || Sparkles;
                const color = PLAN_COLORS[plan.slug] || 'border-theme bg-theme-panel';
                const accentCls = PLAN_ACCENT[plan.slug] || 'text-theme';
                const bgAccent = PLAN_BG[plan.slug] || 'bg-white/5';
                const isActive = activeSlugs.has(plan.slug);
                const features = Object.entries(plan.features).filter(([, v]) => v);

                return (
                  <div key={plan.slug} className={`relative flex flex-col rounded-3xl border p-6 transition-all ${isActive ? `${color} shadow-lg` : 'border-theme bg-theme-panel hover:border-white/20'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${bgAccent}`}>
                        <Icon className={`h-7 w-7 ${accentCls}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-xl text-theme">{plan.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-theme-secondary">{plan.description}</p>
                        <div className="mt-3">
                          <span className="text-3xl font-bold text-theme">{plan.price_uzs.toLocaleString()}</span>
                          <span className="text-sm text-theme-secondary"> UZS / мес</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex-1 space-y-2.5">
                      {features.map(([key]) => (
                        <div key={key} className="flex items-start gap-2.5 text-sm text-theme">
                          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accentCls}`} />
                          <span>{FEATURE_LABELS[key] || key}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      {isActive ? (
                        <div className={`rounded-xl border ${color} px-4 py-3 text-center`}>
                          <div className={`text-xs font-bold uppercase tracking-widest ${accentCls}`}>Активна</div>
                        </div>
                      ) : (
                        <a
                          href="https://t.me/Business_SolutionsUz"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b6b] px-4 py-3 text-sm font-bold text-white transition hover:brightness-105"
                        >
                          <MessageSquare className="h-4 w-4" />Написать в Telegram
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/8 bg-black/10 px-6 py-4 text-xs text-theme-secondary">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Без скрытых платежей</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Отмена в 1 клик</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Всё работает в Telegram</span>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
