import { useEffect, useMemo, useState } from 'react';
import { Check, CreditCard, Sparkles, Star, ShoppingCart, Crown, Rocket, Zap } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, subscriptionAPI, type SubscriptionPlanResponse } from '@/services/api';

interface ModuleDef {
  slug: string;
  name: string;
  description: string;
  price_uzs: number;
  commission_per_order: number | null;
  badge: string;
  features: string[];
}

const FEATURE_LABELS: Record<string, string> = {
  kiosk_ordering: 'QR-меню и заказ',
  online_menu: 'Онлайн-меню',
  guest_reviews: 'Отзывы гостей',
  push_notifications: 'Push-уведомления',
  telegram_notifications: 'Уведомления в Telegram',
  whatsapp_notifications: 'WhatsApp-уведомления',
  sms_notifications: 'SMS-уведомления',
  ai_review_analysis: 'AI-анализ отзывов',
  loyalty_program: 'Программа лояльности',
  hr_module: 'HR-модуль',
  suppliers_module: 'Модуль поставщиков',
  advanced_analytics: 'Расширенная аналитика',
  fintech_payments: 'QR-оплата через Telegram',
  public_api: 'Публичное API',
  white_label: 'White Label',
  checklists: 'Чек-листы',
};

const ADDON_ICONS: Record<string, any> = {
  crm_retention: Star,
  fintech: CreditCard,
};

const ADDON_COLORS: Record<string, string> = {
  crm_retention: 'border-indigo-500/30 bg-indigo-500/5',
  fintech: 'border-amber-500/30 bg-amber-500/5',
};

const ADDON_ACCENT: Record<string, string> = {
  crm_retention: 'text-indigo-400',
  fintech: 'text-amber-400',
};

const ADDON_BG: Record<string, string> = {
  crm_retention: 'bg-indigo-500/10',
  fintech: 'bg-amber-500/10',
};

const PLAN_ICONS: Record<string, any> = {
  start: ShoppingCart,
  business: Rocket,
  enterprise: Crown,
};

export default function PricingPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [addonDefs, setAddonDefs] = useState<ModuleDef[]>([]);
  const [activeModSlugs, setActiveModSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const restaurantId = workspace.selectedRestaurantId;

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    Promise.all([
      subscriptionAPI.getPlans(),
      ownerAPI.getModules(),
      ownerAPI.getModuleStatus(restaurantId),
    ])
      .then(([plansRes, modsRes, statusRes]) => {
        setPlans(plansRes.data);
        setAddonDefs(modsRes.data.filter((m: ModuleDef) => m.slug !== 'hostess_queue'));
        setActiveModSlugs(new Set(statusRes.data.active_modules.map((m: any) => m.slug)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleToggleModule = async (slug: string, enable: boolean) => {
    if (!restaurantId) return;
    setToggling(slug);
    try {
      await ownerAPI.toggleModule({ module_slug: slug, restaurant_id: restaurantId, enable });
      setActiveModSlugs(prev => {
        const next = new Set(prev);
        if (enable) next.add(slug);
        else next.delete(slug);
        return next;
      });
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Ошибка');
    }
    setToggling(null);
  };

  const hostessActive = activeModSlugs.has('hostess_queue');

  return (
    <AppShell
      title="Тарифы и модули"
      subtitle="Выберите базовый тариф и добавляйте модули по мере роста"
      eyebrow="Waitly Control"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-theme-secondary">Загрузка...</div>
        ) : (
          <>
            {/* === Land & Expand блок === */}
            <div className="rounded-[28px] border border-theme bg-theme-panel p-5">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-500/10">
                  <ShoppingCart className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400">Стратегия</div>
                  <div className="mt-1 font-display text-xl text-theme">Land & Expand</div>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-theme-secondary">
                    Начните с базового тарифа — очередь и учёт гостей. Когда накопите базу — подключите CRM и возвращайте ушедших.
                    Финтех-модуль без фикса, только комиссия с успешных транзакций.
                  </p>
                </div>
              </div>
            </div>

            {/* === Тарифы === */}
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-theme-secondary">
                <Sparkles className="h-3.5 w-3.5" />
                Базовый тариф
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {plans.map(plan => {
                  const Icon = PLAN_ICONS[plan.slug] || ShoppingCart;
                  const isPopular = plan.slug === 'business';
                  const priceDisplay = plan.price_uzs > 0 ? `${plan.price_uzs.toLocaleString()} сум/мес` : 'Бесплатно';
                  const enabledFeatures = Object.entries(plan.features).filter(([, v]) => v);

                  return (
                    <div key={plan.slug} className={`relative flex flex-col rounded-3xl border p-6 transition-all ${
                      isPopular ? 'border-indigo-400 bg-indigo-500/5 shadow-lg shadow-indigo-500/10' : 'border-theme bg-theme-panel'
                    }`}>
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-4 py-1 text-xs font-semibold text-white shadow-md">
                          Популярный
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`grid h-10 w-10 place-items-center rounded-xl ${isPopular ? 'bg-indigo-500/10' : 'bg-white/5'}`}>
                          <Icon className={`h-5 w-5 ${isPopular ? 'text-indigo-400' : 'text-theme-secondary'}`} />
                        </div>
                        <div>
                          <h3 className="font-display text-lg text-theme">{plan.name}</h3>
                          <span className="text-xs text-theme-secondary">{priceDisplay}</span>
                        </div>
                      </div>
                      {plan.description ? (
                        <p className="mt-3 text-sm leading-relaxed text-theme-secondary">{plan.description}</p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {enabledFeatures.map(([key]) => (
                          <span key={key} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
                            <Check className="h-3 w-3" />{FEATURE_LABELS[key] || key}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6">
                        {hostessActive ? (
                          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center">
                            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">Активен</div>
                          </div>
                        ) : (
                          <Button variant={isPopular ? 'primary' : 'secondary'} className="w-full" onClick={() => handleToggleModule('hostess_queue', true)} disabled={toggling === 'hostess_queue'}>
                            {toggling === 'hostess_queue' ? 'Активация...' : 'Активировать'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* === Доп. модули === */}
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-theme-secondary">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Дополнительные модули
              </div>
              <p className="mb-4 text-sm text-theme-secondary">Подключайте к любому тарифу. Оплата только за те модули, которые используете.</p>
              <div className="grid gap-5 md:grid-cols-2">
                {addonDefs.map(mod => {
                  const isActive = activeModSlugs.has(mod.slug);
                  const Icon = ADDON_ICONS[mod.slug] || Sparkles;
                  const color = ADDON_COLORS[mod.slug] || 'border-theme bg-theme-panel';
                  const accentCls = ADDON_ACCENT[mod.slug] || 'text-theme';
                  const bgAccent = ADDON_BG[mod.slug] || 'bg-white/5';

                  return (
                    <div key={mod.slug} className={`relative flex flex-col rounded-3xl border p-6 transition-all ${isActive ? color : 'border-theme bg-theme-panel opacity-70 hover:opacity-100'}`}>
                      <div className="flex items-start justify-between">
                        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${bgAccent}`}>
                          <Icon className={`h-5 w-5 ${accentCls}`} />
                        </div>
                        <span className={`rounded-full ${bgAccent} px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${accentCls}`}>
                          {mod.badge}
                        </span>
                      </div>
                      <div className="mt-4 flex-1">
                        <h3 className="font-display text-xl text-theme">{mod.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-theme-secondary">{mod.description}</p>
                        <div className="mt-3">
                          {mod.price_uzs > 0 ? (
                            <span className="text-2xl font-bold text-theme">{mod.price_uzs.toLocaleString()} <span className="text-sm font-normal text-theme-secondary">сум/мес</span></span>
                          ) : mod.commission_per_order ? (
                            <span className="text-2xl font-bold text-theme">0 сум <span className="text-sm font-normal text-theme-secondary">+ {mod.commission_per_order.toLocaleString()} сум/чека</span></span>
                          ) : null}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {mod.features.map(f => (
                            <span key={f} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${isActive ? `${bgAccent} ${accentCls}` : 'bg-white/5 text-theme-secondary'}`}>
                              <Check className={`h-3 w-3 ${isActive ? accentCls : 'text-theme-muted'}`} />{FEATURE_LABELS[f] || f}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6">
                        {isActive ? (
                          <Button variant="secondary" className="w-full border-red-400/30 text-red-400 hover:bg-red-500/10" onClick={() => handleToggleModule(mod.slug, false)} disabled={toggling === mod.slug}>
                            {toggling === mod.slug ? 'Отключение...' : 'Отключить модуль'}
                          </Button>
                        ) : (
                          <Button variant="primary" className="w-full" onClick={() => handleToggleModule(mod.slug, true)} disabled={toggling === mod.slug}>
                            {toggling === mod.slug ? 'Включение...' : <><CreditCard className="mr-2 h-4 w-4" />Подключить модуль</>}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/8 bg-black/10 px-6 py-4 text-xs text-theme-secondary">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Никаких скрытых платежей</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Отключение в 1 клик</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400" /> Перенос данных при переходе</span>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
