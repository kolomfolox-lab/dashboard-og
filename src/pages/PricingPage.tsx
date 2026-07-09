import { useEffect, useMemo, useState } from 'react';
import { Check, X, CreditCard, Sparkles, Star, ShoppingCart, ArrowUpRight } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

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

const MODULE_ICONS: Record<string, any> = {
  hostess_queue: ShoppingCart,
  crm_retention: Star,
  fintech: CreditCard,
};

const MODULE_COLORS: Record<string, string> = {
  hostess_queue: 'border-emerald-500/30 bg-emerald-500/5',
  crm_retention: 'border-indigo-500/30 bg-indigo-500/5',
  fintech: 'border-amber-500/30 bg-amber-500/5',
};

const MODULE_ACCENT: Record<string, string> = {
  hostess_queue: 'text-emerald-400',
  crm_retention: 'text-indigo-400',
  fintech: 'text-amber-400',
};

const MODULE_BG_ACCENT: Record<string, string> = {
  hostess_queue: 'bg-emerald-500/10',
  crm_retention: 'bg-indigo-500/10',
  fintech: 'bg-amber-500/10',
};

export default function PricingPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [modules, setModules] = useState<ModuleDef[]>([]);
  const [activeSlugs, setActiveSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const restaurantId = workspace.selectedRestaurantId;

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    Promise.all([
      ownerAPI.getModules(),
      ownerAPI.getModuleStatus(restaurantId),
    ])
      .then(([defsRes, statusRes]) => {
        setModules(defsRes.data);
        setActiveSlugs(new Set(statusRes.data.active_modules.map((m: any) => m.slug)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleToggle = async (slug: string, enable: boolean) => {
    if (!restaurantId) return;
    setToggling(slug);
    try {
      await ownerAPI.toggleModule({ module_slug: slug, restaurant_id: restaurantId, enable });
      setActiveSlugs(prev => {
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

  const baseModule = modules.find(m => m.slug === 'hostess_queue');
  const addonModules = modules.filter(m => m.slug !== 'hostess_queue');

  return (
    <AppShell
      title="Модули"
      subtitle="Включайте функции по мере роста бизнеса"
      eyebrow="Waitly Control"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-theme bg-theme-panel p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-500/10">
              <ShoppingCart className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-400">Стратегия</div>
              <div className="mt-1 font-display text-xl text-theme">Land & Expand</div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-theme-secondary">
                Начните с базового модуля «Хостес & Очередь» — бесплатно или за стоимость чашки кофе в день.
                Когда увидите первые 1000 гостей в базе — включите CRM, чтобы вернуть ушедших.
                Финтех-модуль подключается без фиксированной платы — вы платите только за успешные транзакции.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-theme-secondary">Загрузка модулей...</div>
        ) : (
          <>
            {baseModule && (
              <div className={`rounded-3xl border p-6 ${MODULE_COLORS['hostess_queue']}`}>
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full ${MODULE_BG_ACCENT['hostess_queue']} px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${MODULE_ACCENT['hostess_queue']}`}>
                        {baseModule.badge}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-theme-secondary">
                        {baseModule.price_uzs > 0 ? `${(baseModule.price_uzs).toLocaleString()} сум/мес` : 'Бесплатно'}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-2xl text-theme">{baseModule.name}</h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-theme-secondary">{baseModule.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {baseModule.features.map(f => (
                        <span key={f} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                          <Check className="h-3 w-3" />{FEATURE_LABELS[f] || f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {activeSlugs.has('hostess_queue') ? (
                      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center">
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">Активен</div>
                        <div className="mt-1 text-[10px] text-theme-secondary">Базовый уровень включён</div>
                      </div>
                    ) : (
                      <Button variant="primary" className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleToggle('hostess_queue', true)} disabled={toggling === 'hostess_queue'}>
                        {toggling === 'hostess_queue' ? 'Включение...' : 'Активировать'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {addonModules.map(mod => {
                const isActive = activeSlugs.has(mod.slug);
                const Icon = MODULE_ICONS[mod.slug] || Sparkles;
                const color = MODULE_COLORS[mod.slug] || 'border-theme bg-theme-panel';
                const accent = MODULE_ACCENT[mod.slug] || 'text-theme';
                const bgAccent = MODULE_BG_ACCENT[mod.slug] || 'bg-white/5';

                return (
                  <div key={mod.slug} className={`relative flex flex-col rounded-3xl border p-6 transition-all ${isActive ? `${color} shadow-lg` : 'border-theme bg-theme-panel opacity-70 hover:opacity-100'}`}>
                    <div className="flex items-start justify-between">
                      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${bgAccent}`}>
                        <Icon className={`h-5 w-5 ${accent}`} />
                      </div>
                      <span className={`rounded-full ${bgAccent} px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${accent}`}>
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
                          <span key={f} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${isActive ? `${bgAccent} ${accent}` : 'bg-white/5 text-theme-secondary'}`}>
                            <Check className={`h-3 w-3 ${isActive ? accent : 'text-theme-muted'}`} />{FEATURE_LABELS[f] || f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6">
                      {isActive ? (
                        <Button variant="secondary" className="w-full border-red-400/30 text-red-400 hover:bg-red-500/10" onClick={() => handleToggle(mod.slug, false)} disabled={toggling === mod.slug}>
                          {toggling === mod.slug ? 'Отключение...' : 'Отключить модуль'}
                        </Button>
                      ) : (
                        <Button variant="primary" className="w-full" onClick={() => handleToggle(mod.slug, true)} disabled={toggling === mod.slug}>
                          {toggling === mod.slug ? 'Включение...' : <><CreditCard className="mr-2 h-4 w-4" />Включить модуль</>}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/8 bg-black/10 px-6 py-4 text-xs text-[var(--text-secondary)]">
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
