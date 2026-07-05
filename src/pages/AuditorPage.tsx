import { Smartphone, Download, FileSearch, UserCheck, CreditCard } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { AppShell } from '@/components/app/AppShell';

const screens = [
  {
    icon: FileSearch,
    ru: 'Журнал аудита',
    uz: 'Audit jurnali',
    descRu: 'Просмотр и анализ всех действий в системе с фильтрацией',
    descUz: 'Filtrlash bilan tizimdagi barcha harakatlarni ko\'rish va tahlil qilish',
  },
  {
    icon: UserCheck,
    ru: 'Действия пользователей',
    uz: 'Foydalanuvchi harakatlari',
    descRu: 'Детальная запись действий каждого пользователя платформы',
    descUz: 'Platformadagi har bir foydalanuvchi harakatlarining batafsil yozuvi',
  },
  {
    icon: CreditCard,
    ru: 'Транзакции',
    uz: 'Tranzaksiyalar',
    descRu: 'Аудит финансовых транзакций и платежных операций',
    descUz: 'Moliyaviy tranzaksiyalar va to\'lov operatsiyalari auditi',
  },
];

export default function AuditorPage() {
  const { locale } = useLocale();
  const t = (ru: string, uz: string) => (locale === 'uz' ? uz : ru);

  return (
    <AppShell
      title={t('Аудитор', 'Auditor')}
      subtitle={t('Панель аудитора', 'Auditor paneli')}
      eyebrow={t('Проверка', 'Tekshiruv')}
    >
      <div className="mb-8 rounded-[32px] border border-rose-500/10 bg-gradient-to-br from-rose-500/12 via-pink-500/6 to-transparent p-6 md:p-8">
        <div className="flex flex-col items-start gap-5 md:flex-row">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-rose-400/20 bg-gradient-to-br from-rose-400/20 to-pink-400/10">
            <Smartphone className="h-7 w-7 text-rose-300" />
          </div>
          <div>
            <h2 className="font-display text-xl text-white">
              {t('Мобильное рабочее место', 'Mobil ish joyi')}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
              {t(
                'Все функции аудитора доступны в мобильном приложении Waitly. Проверяйте журнал аудита, действия пользователей и транзакции со смартфона.',
                "Auditorning barcha funksiyalari Waitly mobil ilovasida mavjud. Audit jurnali, foydalanuvchi harakatlari va tranzaksiyalarni smartfoningizdan tekshiring.",
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
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-rose-400/15 bg-gradient-to-br from-rose-400/20 to-pink-400/10">
              <screen.icon className="h-5 w-5 text-rose-300" />
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
                'Загрузите мобильное приложение Waitly из официального магазина приложений и получите доступ ко всем функциям аудитора на вашем смартфоне.',
                "Waitly mobil ilovasini rasmiy ilovalar do'konidan yuklab oling va smartfoningizda auditorning barcha funksiyalariga kirish huquqiga ega bo'ling.",
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