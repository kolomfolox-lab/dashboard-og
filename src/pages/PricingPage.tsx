import { useEffect, useState } from 'react';
import { Check, CreditCard, MessageSquare, Users, Star, LayoutGrid, BarChart3, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, subscriptionAPI, type SubscriptionPlanResponse } from '@/services/api';

const PLAN_ICONS: Record<string, any> = {
  telegram_mini_app: MessageSquare,
  guest_crm: Users,
  loyalty: Star,
  hall_scheme: LayoutGrid,
  visit_stats: BarChart3,
};

const PLAN_COLORS: Record<string, string> = {
  telegram_mini_app: 'border-emerald-500/30 bg-emerald-500/5',
  guest_crm: 'border-blue-500/30 bg-blue-500/5',
  loyalty: 'border-amber-500/30 bg-amber-500/5',
  hall_scheme: 'border-purple-500/30 bg-purple-500/5',
  visit_stats: 'border-cyan-500/30 bg-cyan-500/5',
};

const PLAN_ACCENT: Record<string, string> = {
  telegram_mini_app: 'text-emerald-400',
  guest_crm: 'text-blue-400',
  loyalty: 'text-amber-400',
  hall_scheme: 'text-purple-400',
  visit_stats: 'text-cyan-400',
};

const PLAN_BG: Record<string, string> = {
  telegram_mini_app: 'bg-emerald-500/10',
  guest_crm: 'bg-blue-500/10',
  loyalty: 'bg-amber-500/10',
  hall_scheme: 'bg-purple-500/10',
  visit_stats: 'bg-cyan-500/10',
};

const FEATURE_LABELS: Record<string, string> = {
  kiosk_ordering: 'Бронирование через Telegram',
  online_menu: 'Меню онлайн',
  guest_reviews: 'Отзывы гостей',
  push_notifications: 'Push-уведомления',
  telegram_notifications: 'Telegram-уведомления',
  whatsapp_notifications: 'WhatsApp-рассылки',
  sms_notifications: 'SMS-рассылки',
  guest_crm: 'База гостей с сегментацией',
  advanced_analytics: 'Расширенная аналитика',
  loyalty_program: 'Бонусная система',
  hall_management: 'Управление залом',
  table_management: 'Схема столов',
};

export default function PricingPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [activeSlugs, setActiveSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

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

  const handleSubscribe = async (planSlug: string) => {
    if (!restaurantId) return;
    setSubscribing(planSlug);
    try {
      await ownerAPI.subscribeToPlan({ plan_slug: planSlug, restaurant_id: restaurantId });
      setActiveSlugs(prev => new Set(prev).add(planSlug));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Ошибка при подключении');
    }
    setSubscribing(null);
  };

  return (
    <AppShell
      title="Подписки"
      subtitle="Выбирайте и подключайте нужные сервисы. Всё работает внутри Telegram."
      eyebrow="Waitly Control"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-theme bg-theme-panel p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-500/10">
              <MessageSquare className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400">Telegram Mini-App</div>
              <div className="mt-1 font-display text-xl text-theme">Всё внутри Telegram</div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-theme-secondary">
                Все модули работают внутри Telegram — без установки приложения.
                Гость бронирует стол через бота, хостес управляет залом, а владелец получает статистику в реальном времени.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-theme-secondary">Загрузка тарифов...</div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${bgAccent}`}>
                        <Icon className={`h-5 w-5 ${accentCls}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg text-theme">{plan.name}</h3>
                        <div className="mt-1">
                          <span className="text-2xl font-bold text-theme">{plan.price_uzs.toLocaleString()}</span>
                          <span className="text-sm text-theme-secondary"> UZS / мес</span>
                        </div>
                      </div>
                    </div>
                    {plan.description ? (
                      <p className="mt-3 text-sm leading-relaxed text-theme-secondary">{plan.description}</p>
                    ) : null}
                    <div className="mt-4 flex-1 space-y-2">
                      {features.map(([key]) => (
                        <div key={key} className="flex items-start gap-2 text-sm text-theme">
                          <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accentCls}`} />
                          <span>{FEATURE_LABELS[key] || key}</span>
                        </div>
                      ))}
                      {features.length === 0 ? (
                        <div className="text-sm text-theme-muted">Нет дополнительных функций</div>
                      ) : null}
                    </div>
                    <div className="mt-6">
                      {isActive ? (
                        <div className={`rounded-xl border ${color} px-4 py-3 text-center`}>
                          <div className={`text-xs font-bold uppercase tracking-widest ${accentCls}`}>Активна</div>
                        </div>
                      ) : (
                        <Button variant="primary" className="w-full" onClick={() => handleSubscribe(plan.slug)} disabled={subscribing === plan.slug}>
                          {subscribing === plan.slug ? 'Подключение...' : <><CreditCard className="mr-2 h-4 w-4" />Подписаться</>}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/8 bg-black/10 px-6 py-4 text-xs text-theme-secondary">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Без скрытых платежей</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Отмена в 1 клик</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Всё внутри Telegram</span>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
