import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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
const setupEase = [0.22, 1, 0.36, 1] as const;
const setupEnter = { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: setupEase } };
const setupSpring = { type: 'spring', stiffness: 420, damping: 22 } as const;

export default function OwnerSetupPage() {
  const { locale, t } = useLocale();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>(defaultAnswers);
  const [chainName, setChainName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [botToken, setBotToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const meta = STEP_META[step];

  const handleNext = () => {
    setError('');
    if (step === 1 && !answers.restaurant_type) {
      setError(t('ownerSetup_select_type')); return;
    }
    if (step === 2 && !answers.tables_count) {
      setError(t('ownerSetup_select_tables')); return;
    }
    if (step === 3 && !answers.staff_count) {
      setError(t('ownerSetup_select_staff')); return;
    }
    if (step === 5 && !chainName.trim()) {
      setError(t('ownerSetup_enter_chain')); return;
    }
    if (step === 6 && !restaurantName.trim()) {
      setError(t('ownerSetup_enter_restaurant')); return;
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
      const payload = err?.response?.data;
      const messages = payload && typeof payload === 'object'
        ? Object.values(payload).flatMap((value: any) => Array.isArray(value) ? value : [value]).filter((value) => typeof value === 'string')
        : [];
      const msg = messages.join('. ') || err?.message || t('ownerSetup_save_error');
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
        <motion.div className="space-y-4" {...setupEnter}>
          {RESTAURANT_TYPES.map((rt, index) => (
            <motion.button key={rt.value} type="button" onClick={() => { selectOption('restaurant_type', rt.value); setTimeout(() => setStep(2), 200); }}
              className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                answers.restaurant_type === rt.value
                  ? 'border-[#f97360] bg-[#f97360]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/90'
              }`} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...setupEnter.transition, delay: index * 0.08 }} whileHover={{ x: 8, scale: 1.015 }} whileTap={{ scale: 0.96 }}>
              <motion.span animate={answers.restaurant_type === rt.value ? { rotate: [0, -8, 8, 0], scale: [1, 1.12, 1] } : {}} transition={{ duration: 0.45 }}><Store className="h-5 w-5 text-[#8fd4ff]" /></motion.span>
              <span className="flex-1 font-semibold">{locale === 'uz' ? rt.label_uz : rt.label_ru}</span>
              <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.2 }}><ArrowRight className="h-4 w-4 text-white/25" /></motion.span>
            </motion.button>
          ))}
        </motion.div>
      );
    }

    if (step === 2) {
      return (
        <motion.div className="grid grid-cols-2 gap-3" {...setupEnter}>
          {TABLE_RANGES.map((tr, index) => (
            <motion.button key={tr.value} type="button" onClick={() => { selectOption('tables_count', tr.value); setStep(3); }}
              className={`rounded-2xl border px-5 py-6 text-center text-lg font-bold transition ${
                answers.tables_count === tr.value
                  ? 'border-[#f97360] bg-[#f97360]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
              }`} initial={{ opacity: 0, scale: 0.8, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ ...setupSpring, delay: index * 0.08 }} whileHover={{ y: -7, rotate: index % 2 ? 1 : -1 }} whileTap={{ scale: 0.92 }}>
              <motion.span animate={answers.tables_count === tr.value ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.4 }}>{tr.value}</motion.span>
            </motion.button>
          ))}
        </motion.div>
      );
    }

    if (step === 3) {
      return (
        <motion.div className="grid grid-cols-2 gap-3" {...setupEnter}>
          {STAFF_RANGES.map((sr, index) => (
            <motion.button key={sr.value} type="button" onClick={() => { selectOption('staff_count', sr.value); setStep(4); }}
              className={`rounded-2xl border px-5 py-6 text-center text-lg font-bold transition ${
                answers.staff_count === sr.value
                  ? 'border-[#f97360] bg-[#f97360]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
              }`} initial={{ opacity: 0, scale: 0.8, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ ...setupSpring, delay: index * 0.08 }} whileHover={{ y: -7, rotate: index % 2 ? -1 : 1 }} whileTap={{ scale: 0.92 }}>
              <motion.span animate={answers.staff_count === sr.value ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.4 }}>{sr.value}</motion.span>
            </motion.button>
          ))}
        </motion.div>
      );
    }

    if (step === 4) {
      return (
        <motion.div className="space-y-3" {...setupEnter}>
          {FEATURES.map((f, index) => (
            <motion.button key={f.value} type="button" onClick={() => toggleFeature(f.value)}
              className={`flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition ${
                answers.features.includes(f.value)
                  ? 'border-[#8fd4ff]/30 bg-[#8fd4ff]/10 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80'
              }`} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ ...setupEnter.transition, delay: index * 0.07 }} whileHover={{ x: 7, scale: 1.01 }} whileTap={{ scale: 0.97 }}>
              <motion.span animate={answers.features.includes(f.value) ? { rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.45 }}><CheckSquare className={`h-5 w-5 shrink-0 ${answers.features.includes(f.value) ? 'text-[#8fd4ff]' : 'text-white/20'}`} /></motion.span>
              <span className="font-semibold">{locale === 'uz' ? f.label_uz : f.label_ru}</span>
              {answers.features.includes(f.value) ? <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={setupSpring} className="ml-auto text-[#8fd4ff]">✓</motion.span> : null}
            </motion.button>
          ))}
          <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}><Button onClick={handleNext} className="mt-2 w-full">
            {t('ownerSetup_next')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button></motion.div>
        </motion.div>
      );
    }

    if (step === 5) {
      return (
        <motion.div className="space-y-4" {...setupEnter}>
          <motion.input whileFocus={{ scale: 1.015, borderColor: '#f97360' }} transition={setupSpring} value={chainName} onChange={e => setChainName(e.target.value)}
            placeholder={t('ownerSetup_chain_placeholder')}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
            autoFocus />
          <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}><Button onClick={handleNext} className="w-full">
            {t('ownerSetup_next')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button></motion.div>
        </motion.div>
      );
    }

    if (step === 6) {
      return (
        <motion.div className="space-y-4" {...setupEnter}>
          <motion.input whileFocus={{ scale: 1.015, borderColor: '#f97360' }} transition={setupSpring} value={restaurantName} onChange={e => setRestaurantName(e.target.value)}
            placeholder={t('ownerSetup_restaurant_placeholder')}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
            autoFocus />
          <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}><Button onClick={handleNext} className="w-full">
            {t('ownerSetup_next')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button></motion.div>
        </motion.div>
      );
    }

    if (step === 7) {
      return (
        <motion.div className="space-y-4" {...setupEnter}>
          <motion.input whileFocus={{ scale: 1.015, borderColor: '#f97360' }} transition={setupSpring} value={botToken} onChange={e => setBotToken(e.target.value)}
            placeholder="123456:ABCdef..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-mono text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
            autoFocus />
          <div className="flex gap-3">
            <motion.div className="flex-1" whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}><Button onClick={() => handleSubmit(true)} variant="secondary" className="w-full" disabled={loading}>
              <SkipForward className="mr-2 h-4 w-4" />{t('ownerSetup_skip')}
            </Button></motion.div>
            <motion.div className="flex-1" whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}><Button onClick={() => handleSubmit(false)} className="w-full" disabled={loading || !botToken.trim()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('ownerSetup_ready')}
            </Button></motion.div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <motion.div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_22%),linear-gradient(180deg,#07111a,#08131f_55%,#06101b)] px-4 py-10" style={{ fontFamily: "'Manrope', sans-serif" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
      <motion.div className="pointer-events-none fixed -left-24 -top-24 h-80 w-80 rounded-full bg-[#8fd4ff]/10 blur-3xl" animate={{ x: [0, 30, 0], y: [0, 22, 0], scale: [1, 1.14, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="pointer-events-none fixed -bottom-28 -right-20 h-96 w-96 rounded-full bg-[#f97360]/10 blur-3xl" animate={{ x: [0, -24, 0], scale: [1, 0.88, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg items-center justify-center" initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} transition={{ duration: 0.7, ease: setupEase }}>
        <motion.div className="w-full overflow-hidden rounded-[36px] border border-white/10 bg-[#0b1622]/95 shadow-[0_30px_80px_rgba(0,0,0,0.55)]" whileHover={{ boxShadow: '0 35px 100px rgba(0,0,0,0.62)' }}>
          <div className="p-8">
            <motion.div className="mb-8 flex items-center justify-between gap-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...setupEnter.transition, delay: 0.15 }}>
              <BrandMark />
              <motion.button type="button" onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/50 transition hover:border-white/20 hover:text-white" whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                <ArrowLeft className="h-3.5 w-3.5" /> Назад
              </motion.button>
            </motion.div>

            <div className="mb-6 flex gap-1.5">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(i => (
                <motion.div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[#f97360]' : 'bg-white/10'}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ ...setupSpring, delay: i * 0.06 }} />
              ))}
            </div>

            <AnimatePresence mode="wait">{error ? <motion.div key={error} className="mb-4 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100" initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }}>{error}</motion.div> : null}</AnimatePresence>

            <div className="space-y-5">
              <motion.div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#8fd4ff]/15" animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity }}>
                <HelpCircle className="h-6 w-6 text-[#8fd4ff]" />
              </motion.div>
              <motion.div key={step} {...setupEnter}><h2 className="text-2xl font-bold text-white">{locale === 'uz' ? meta.title_uz : meta.title_ru}</h2><p className="mt-2 text-sm leading-7 text-white/52">{locale === 'uz' ? meta.desc_uz : meta.desc_ru}</p></motion.div>

              <AnimatePresence mode="wait" initial={false}><motion.div key={step} className="min-w-0" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.3 }}>{renderStep()}</motion.div></AnimatePresence>

              {step > 1 && step < 5 && (
                <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.97 }}><Button variant="ghost" onClick={() => setStep(s => s - 1)} className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />{t('ownerSetup_back')}
                </Button></motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
