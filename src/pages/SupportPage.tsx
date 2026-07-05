import { Smartphone, Download, MessageCircle, Server, Clock } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { AppShell } from '@/components/app/AppShell';

const screens = [
  {
    icon: MessageCircle,
    ru: 'Активные обращения',
    uz: 'Faol murojaatlar',
    descRu: 'Список активных обращений от пользователей и заведений',
    descUz: "Foydalanuvchilar va muassasalarning faol murojaatlari ro'yxati",
  },
  {
    icon: Server,
    ru: 'Системный статус',
    uz: 'Tizim holati',
    descRu: 'Мониторинг состояния сервисов и уведомления о сбоях',
    descUz: 'Xizmatlar holatini kuzatish va nosozliklar haqida bildirishnomalar',
  },
  {
    icon: Clock,
    ru: 'История',
    uz: 'Tarix',
    descRu: 'Архив обработанных обращений и выполненных операций',
    descUz: "Qayta ishlangan murojaatlar va bajarilgan operatsiyalar arxivi",
  },
];

export default function SupportPage() {
  const { locale } = useLocale();
  const t = (ru: string, uz: string) => (locale === 'uz' ? uz : ru);

  return (
    <AppShell
      title={t('Поддержка', "Qo'llab-quvvatlash")}
      subtitle={t('Панель поддержки', "Qo'llab-quvvatlash paneli")}
      eyebrow={t('Помощь', 'Yordam')}
    >
      <div className="mb-8 rounded-[32px] border border-emerald-500/10 bg-gradient-to-br from-emerald-500/12 via-green-500/6 to-transparent p-6 md:p-8">
        <div className="flex flex-col items-start gap-5 md:flex-row">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 to-green-400/10">
            <Smartphone className="h-7 w-7 text-emerald-300" />
          </div>
          <div>
            <h2 className="font-display text-xl text-white">
              {t('Мобильное рабочее место', 'Mobil ish joyi')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
              {t(
                'Все функции поддержки доступны в мобильном приложении Waitly. Отвечайте на обращения, следите за системным статусом и просматривайте историю со смартфона.',
                "Qo'llab-quvvatlashning barcha funksiyalari Waitly mobil ilovasida mavjud. Murojaatlarga javob bering, tizim holatini kuzating va tarixni smartfoningizdan ko'ring.",
              )}
            </p>
          </div>
        </div>
      </div>

      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fd4ff]">
        {t('Экраны мобильного приложения', 'Mobil ilova ekranlari')}
      </h3>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {screens.map((screen, i) => (
          <div
            key={i}
            className="group rounded-[28px] border border-white/5 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 backdrop-blur-2xl transition-all duration-300 hover:border-white/15 hover:from-white/[0.09] hover:to-white/[0.04] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-400/20 to-green-400/10">
              <screen.icon className="h-5 w-5 text-emerald-300" />
            </div>
            <h4 className="font-display text-base text-white">{screen[locale === 'uz' ? 'uz' : 'ru']}</h4>
            <p className="mt-2 text-xs leading-relaxed text-white/40">{screen[locale === 'uz' ? 'descUz' : 'descRu']}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[32px] border border-emerald-500/10 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 md:p-8">
        <div className="flex flex-col items-start gap-5 md:flex-row">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/20 to-teal-400/10">
            <Download className="h-7 w-7 text-emerald-300" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl text-white">
              {t('Скачать приложение', 'Ilovani yuklab olish')}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
              {t(
                'Загрузите мобильное приложение Waitly из официального магазина приложений и получите доступ ко всем функциям поддержки на вашем смартфоне.',
                "Waitly mobil ilovasini rasmiy ilovalar do'konidan yuklab oling va smartfoningizda qo'llab-quvvatlashning barcha funksiyalariga kirish huquqiga ega bo'ling.",
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-2xl">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">App Store</div>
                <div className="mt-1 text-sm font-semibold text-white/70">{t('Скоро', 'Tez orada')}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-2xl">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">Google Play</div>
                <div className="mt-1 text-sm font-semibold text-white/70">{t('Скоро', 'Tez orada')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}