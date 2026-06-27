import { Smartphone } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { AppShell } from '@/components/app/AppShell';

export default function ShiftLeaderPage() {
  const { locale } = useLocale();
  return (
    <AppShell
      title={locale === 'uz' ? 'Kuryer' : 'Курьер'}
      subtitle={locale === 'uz' ? 'Kuryer paneli' : 'Панель курьера'}
      eyebrow={locale === 'uz' ? 'Yetkazish' : 'Доставка'}
    >
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <Smartphone className="mx-auto h-16 w-16 text-white/20" />
          <p className="mt-4 text-lg text-white/60">
            {locale === 'uz'
              ? 'Kuryer vazifalari mobil ilova orqali bajariladi.'
              : 'Функции курьера выполняются через мобильное приложение.'}
          </p>
          <p className="mt-2 text-sm text-white/30">
            {locale === 'uz' ? "Iltimos, mobil qurilmangizda Waitly ilovasini oching." : 'Пожалуйста, откройте приложение Waitly на вашем мобильном устройстве.'}
          </p>
        </div>
      </div>
    </AppShell>
  );
}