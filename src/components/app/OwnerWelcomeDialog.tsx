import { Sparkles, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticleTextEffect } from '@/components/ui/particle-text-effect';
import { useLocale } from '@/context/LocaleContext';

export function OwnerWelcomeDialog({ ownerName, workspaceName, onComplete }: { ownerName?: string; workspaceName?: string; onComplete: () => void }) {
  const { locale } = useLocale();

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-[#02060b]/86 px-4 py-6 backdrop-blur-2xl">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[38px] border border-white/12 bg-[linear-gradient(145deg,rgba(9,19,31,0.98),rgba(12,24,36,0.94))] shadow-[0_40px_150px_rgba(0,0,0,0.62)]">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#f97360]/18 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#7dd3fc]/14 blur-3xl" />

        <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="p-5 sm:p-6 lg:p-7">
            <ParticleTextEffect words={['WELCOME', 'TO', 'WAITLY']} height={340} className="shadow-[0_24px_90px_rgba(0,0,0,0.34)]" />
          </section>

          <section className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#f97360]/24 bg-[#f97360]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.26em] text-[#ffd7c4]">
              <Sparkles className="h-3.5 w-3.5" />
              {locale === 'uz' ? 'Yangi workspace' : locale === 'en' ? 'New workspace' : 'Новый workspace'}
            </div>

            <h1 className="mt-5 font-display text-4xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl">
              {locale === 'uz' ? 'Waitlyʼga xush kelibsiz' : locale === 'en' ? 'Welcome to Waitly' : 'Welcome to Waitly'}
            </h1>

            <p className="mt-5 text-base leading-8 text-white/62">
              {locale === 'uz'
                ? `${ownerName || 'Owner'}, bu ${workspaceName || 'restoran'} uchun boshqaruv paneli. Menyu, stol QR, xodimlar, sklad va analitika shu yerdan yuradi.`
                : locale === 'en'
                ? `${ownerName || 'Owner'}, this is the control room for ${workspaceName || 'your restaurant'}. Menu, table QR, staff, inventory, and analytics live here.`
                : `${ownerName || 'Владелец'}, это центр управления для ${workspaceName || 'ресторана'}. Меню, QR столиков, сотрудники, склад и аналитика теперь здесь.`}
            </p>

            <div className="mt-7 grid gap-3">
              <WelcomePoint text={locale === 'uz' ? 'Restoran va filiallarni bir joydan boshqarish.' : locale === 'en' ? 'Manage restaurants and branches from one place.' : 'Управляй рестораном и филиалами из одного места.'} />
              <WelcomePoint text={locale === 'uz' ? 'QR stoliklar va online menu mehmonlar uchun tayyor.' : locale === 'en' ? 'Table QR and online menu are ready for guests.' : 'QR столиков и online menu готовы для гостей.'} />
              <WelcomePoint text={locale === 'uz' ? 'Analitika egaga darhol taqqoslash va diagrammalar beradi.' : locale === 'en' ? 'Analytics gives the owner instant comparisons and charts.' : 'Аналитика сразу показывает владельцу сравнения и диаграммы.'} />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={onComplete} size="lg" className="min-w-[210px]">
                <WandSparkles className="mr-2 h-4 w-4" />
                {locale === 'uz' ? 'Workspace ochish' : locale === 'en' ? 'Open workspace' : 'Открыть workspace'}
              </Button>
              <Button variant="outline" size="lg" onClick={onComplete}>
                {locale === 'uz' ? 'Keyinroq' : locale === 'en' ? 'Skip for now' : 'Пропустить'}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function WelcomePoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-white/68">
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#f97360] shadow-[0_0_20px_rgba(249,115,96,0.8)]" />
      {text}
    </div>
  );
}
