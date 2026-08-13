import { Sparkles, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticleTextEffect } from '@/components/ui/particle-text-effect';
import { useLocale } from '@/context/LocaleContext';

export function OwnerWelcomeDialog({ ownerName, workspaceName, onComplete }: { ownerName?: string; workspaceName?: string; onComplete: () => void }) {
  const { t } = useLocale();

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
              {t('ownerWelcome_new_workspace', 'Новый workspace')}
            </div>

            <h1 className="mt-5 font-display text-4xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl">
              {t('ownerWelcome_welcome_title', 'Welcome to Waitly')}
            </h1>

            <p className="mt-5 text-base leading-8 text-white/62">
              {t('ownerWelcome_description', `${ownerName || 'Владелец'}, это центр управления для ${workspaceName || 'ресторана'}. Меню, QR столиков, сотрудники, склад и аналитика теперь здесь.`)}
            </p>

            <div className="mt-7 grid gap-3">
              <WelcomePoint text={t('ownerWelcome_point_1', 'Управляй рестораном и филиалами из одного места.')} />
              <WelcomePoint text={t('ownerWelcome_point_2', 'QR столиков и online menu готовы для гостей.')} />
              <WelcomePoint text={t('ownerWelcome_point_3', 'Аналитика сразу показывает владельцу сравнения и диаграммы.')} />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={onComplete} size="lg" className="min-w-[210px]">
                <WandSparkles className="mr-2 h-4 w-4" />
                {t('ownerWelcome_open_workspace', 'Открыть workspace')}
              </Button>
              <Button variant="outline" size="lg" onClick={onComplete}>
                {t('ownerWelcome_skip', 'Пропустить')}
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
