import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, Building2, CheckSquare, HelpCircle, Loader2, SkipForward, Store, Users } from 'lucide-react';
import { BrandMark } from '@/components/app/BrandMark';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { authAPI } from '@/services/api';

const RESTAURANT_TYPES = [
  { value: 'cafe', label_ru: 'Кафе', label_uz: 'Kafe' },
  { value: 'restaurant', label_ru: 'Ресторан', label_uz: 'Restoran' },
  { value: 'fast_food', label_ru: 'Фаст-фуд', label_uz: 'Fast food' },
  { value: 'bar', label_ru: 'Бар', label_uz: 'Bar' },
  { value: 'other', label_ru: 'Другое', label_uz: 'Boshqa' },
];

const TABLE_RANGES = [
  { value: '<5', label_ru: 'Меньше 5', label_uz: "5'dan kam" },
  { value: '5-10', label_ru: '5-10', label_uz: '5-10' },
  { value: '10-20', label_ru: '10-20', label_uz: '10-20' },
  { value: '20+', label_ru: 'Больше 20', label_uz: "20'dan ko'p" },
];

const STAFF_RANGES = [
  { value: '<5', label_ru: 'Меньше 5', label_uz: "5'dan kam" },
  { value: '5-15', label_ru: '5-15', label_uz: '5-15' },
  { value: '15-30', label_ru: '15-30', label_uz: '15-30' },
  { value: '30+', label_ru: 'Больше 30', label_uz: "30'dan ko'p" },
];

const FEATURES = [
  { value: 'kds', label_ru: 'Экран кухни (KDS)', label_uz: 'Oshxona ekrani (KDS)' },
  { value: 'online_menu', label_ru: 'Меню онлайн', label_uz: 'Online menyu' },
  { value: 'booking', label_ru: 'Бронь столиков', label_uz: "Stol bronlash" },
  { value: 'loyalty', label_ru: 'Программа лояльности', label_uz: "Loyallik dasturi" },
  { value: 'delivery', label_ru: 'Интеграция с доставкой', label_uz: "Yetkazib berish integratsiyasi" },
  { value: 'analytics', label_ru: 'Аналитика и отчёты', label_uz: 'Analitika va hisobotlar' },
];

type OnboardingAnswers = {
  restaurant_type: string;
  tables_count: string;
  staff_count: string;
  features: string[];
};

const defaultAnswers: OnboardingAnswers = {
  restaurant_type: '',
  tables_count: '',
  staff_count: '',
  features: [],
};

type StepConfig = {
  title_ru: string;
  title_uz: string;
  desc_ru: string;
  desc_uz: string;
};

const STEP_META: Record<number, StepConfig> = {
  1: { title_ru: 'Тип заведения', title_uz: 'Muassasa turi', desc_ru: 'Какой у вас бизнес?', desc_uz: "Qanday biznesingiz bor?" },
  2: { title_ru: 'Количество столов', title_uz: 'Stollar soni', desc_ru: 'Сколько столов в зале?', desc_uz: "Zalda nechta stol bor?" },
  3: { title_ru: 'Количество сотрудников', title_uz: 'Xodimlar soni', desc_ru: 'Сколько человек работает?', desc_uz: "Necha kishi ishlaydi?" },
  4: { title_ru: 'Интересующие функции', title_uz: 'Kerakli funksiyalar', desc_ru: 'Что вам пригодится?', desc_uz: "Sizga nima kerak?" },
  5: { title_ru: 'Название сети', title_uz: 'Tarmoq nomi', desc_ru: 'Как назовём сеть?', desc_uz: "Tarmoq nomi nima?" },
  6: { title_ru: 'Название ресторана', title_uz: 'Restoran nomi', desc_ru: 'Как назовём первый ресторан?', desc_uz: "Birinchi restoran nomi?" },
  7: { title_ru: 'Bot token', title_uz: 'Bot token', desc_ru: 'Telegram бот для уведомлений (необязательно)', desc_uz: 'Telegram bot xabarlar uchun (ixtiyoriy)' },
};

const TOTAL_STEPS = 7;

export default function OwnerSetupPage() {
  const { locale } = useLocale();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>(defaultAnswers);
  const [chainName, setChainName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [botToken, setBotToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = (ru: string, uz: string) => locale === 'uz' ? uz : ru;
  const meta = STEP_META[step];

  const handleNext = () => {
    setError('');
    if (step === 1 && !answers.restaurant_type) {
      setError(t('Выберите тип заведения.', 'Muassasa turini tanlang.')); return;
    }
    if (step === 2 && !answers.tables_count) {
      setError(t('Выберите количество столов.', 'Stollar sonini tanlang.')); return;
    }
    if (step === 3 && !answers.staff_count) {
      setError(t('Выберите количество сотрудников.', 'Xodimlar sonini tanlang.')); return;
    }
    if (step === 5 && !chainName.trim()) {
      setError(t('Введите название сети.', 'Tarmoq nomini kiriting.')); return;
    }
    if (step === 6 && !restaurantName.trim()) {
      setError(t('Введите название ресторана.', 'Restoran nomini kiriting.')); return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (skipBot = false) => {
    setLoading(true);
    setError('');
    try {
      await authAPI.onboarding({
        chain_name: chainName.trim(),
        restaurant_name: restaurantName.trim(),
        staff_bot_token: skipBot ? '' : botToken.trim(),
        onboarding_answers: answers,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || t('Ошибка сохранения.', 'Saqlab bo‘lmadi.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (value: string) => {
    setAnswers(a => ({
      ...a,
      features: a.features.includes(value)
        ? a.features.filter(f => f !== value)
        : [...a.features, value],
    }));
  };

  const selectOption = (field: keyof OnboardingAnswers, value: string) => {
    setAnswers(a => ({ ...a, [field]: value }));
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-4">
          {RESTAURANT_TYPES.map(rt => (
            <button key={rt.value} type="button" onClick={() => { selectOption('restaurant_type', rt.value); setTimeout(() => setStep(2), 200); }}
              className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                answers.restaurant_type === rt.value
                  ? 'border-[#f97360] bg-[#f97360]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/90'
              }`}>
              <span className="font-semibold">{locale === 'uz' ? rt.label_uz : rt.label_ru}</span>
            </button>
          ))}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {TABLE_RANGES.map(tr => (
            <button key={tr.value} type="button" onClick={() => { selectOption('tables_count', tr.value); setStep(3); }}
              className={`rounded-2xl border px-5 py-6 text-center text-lg font-bold transition ${
                answers.tables_count === tr.value
                  ? 'border-[#f97360] bg-[#f97360]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
              }`}>
              {tr.value}
            </button>
          ))}
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {STAFF_RANGES.map(sr => (
            <button key={sr.value} type="button" onClick={() => { selectOption('staff_count', sr.value); setStep(4); }}
              className={`rounded-2xl border px-5 py-6 text-center text-lg font-bold transition ${
                answers.staff_count === sr.value
                  ? 'border-[#f97360] bg-[#f97360]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
              }`}>
              {sr.value}
            </button>
          ))}
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="space-y-3">
          {FEATURES.map(f => (
            <button key={f.value} type="button" onClick={() => toggleFeature(f.value)}
              className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                answers.features.includes(f.value)
                  ? 'border-[#8fd4ff]/30 bg-[#8fd4ff]/10 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
              }`}>
              <CheckSquare className={`h-5 w-5 shrink-0 ${answers.features.includes(f.value) ? 'text-[#8fd4ff]' : 'text-white/20'}`} />
              <span className="font-semibold">{locale === 'uz' ? f.label_uz : f.label_ru}</span>
            </button>
          ))}
          <Button onClick={handleNext} className="mt-2 w-full">
            {t('Далее', 'Keyingi')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className="space-y-4">
          <input value={chainName} onChange={e => setChainName(e.target.value)}
            placeholder={t('Например: Oshxona №1', 'Masalan: Oshxona №1')}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
            autoFocus />
          <Button onClick={handleNext} className="w-full">
            {t('Далее', 'Keyingi')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (step === 6) {
      return (
        <div className="space-y-4">
          <input value={restaurantName} onChange={e => setRestaurantName(e.target.value)}
            placeholder={t('Название ресторана', 'Restoran nomi')}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
            autoFocus />
          <Button onClick={handleNext} className="w-full">
            {t('Далее', 'Keyingi')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (step === 7) {
      return (
        <div className="space-y-4">
          <input value={botToken} onChange={e => setBotToken(e.target.value)}
            placeholder="123456:ABCdef..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-mono text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
            autoFocus />
          <div className="flex gap-3">
            <Button onClick={() => handleSubmit(true)} variant="secondary" className="flex-1" disabled={loading}>
              <SkipForward className="mr-2 h-4 w-4" />{t('Пропустить', "O'tkazib yuborish")}
            </Button>
            <Button onClick={() => handleSubmit(false)} className="flex-1" disabled={loading || !botToken.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('Готово', 'Tayyor')}
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_22%),linear-gradient(180deg,#07111a,#08131f_55%,#06101b)] px-4 py-10" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg items-center justify-center">
        <div className="w-full overflow-hidden rounded-[36px] border border-white/10 bg-[#0b1622]/95 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <div className="p-8">
            <div className="mb-8 flex justify-start">
              <BrandMark />
            </div>

            <div className="mb-6 flex gap-1.5">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[#f97360]' : 'bg-white/10'}`} />
              ))}
            </div>

            {error ? <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

            <div className="space-y-5">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#8fd4ff]/15">
                <HelpCircle className="h-6 w-6 text-[#8fd4ff]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{locale === 'uz' ? meta.title_uz : meta.title_ru}</h2>
                <p className="mt-2 text-sm leading-7 text-white/52">{locale === 'uz' ? meta.desc_uz : meta.desc_ru}</p>
              </div>

              {renderStep()}

              {step > 1 && step < 5 && (
                <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />{t('Назад', 'Orqaga')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
