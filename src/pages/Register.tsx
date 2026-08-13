import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bike,
  Building2,
  CalendarCheck2,
  Check,
  Coffee,
  Globe2,
  HeartHandshake,
  Loader2,
  Lock,
  Mail,
  Martini,
  MonitorCog,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  Sandwich,
  Table2,
  User,
  UsersRound,
  Utensils,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BrandMark } from '@/components/app/BrandMark';
import { hasGoogleOAuth } from '@/lib/google';
import { useLocale } from '@/context/LocaleContext';
import { authAPI } from '@/services/api';

const STEPS = [
  { key: 'type', label: 'Тип заведения' },
  { key: 'details', label: 'Детали' },
  { key: 'account', label: 'Контакты' },
  { key: 'password', label: 'Пароль' },
];

const BIZ_TYPES = [
  { value: 'cafe', icon: Coffee, label: 'Кофейня', desc: 'То-гоу, self-service или полноценная кофейня' },
  { value: 'restaurant', icon: Utensils, label: 'Ресторан', desc: 'С официантами и бронью столиков' },
  { value: 'fast_food', icon: Sandwich, label: 'Фаст-фуд', desc: 'Быстрое питание, доставка' },
  { value: 'bar', icon: Martini, label: 'Бар / Лаунж', desc: 'Ночной клуб, кальянная' },
  { value: 'other', icon: Store, label: 'Другое', desc: 'Пекарня, кейтеринг, столовая' },
];

const STAFF_RANGES = [
  { value: '<5', icon: User, label: 'До 5' },
  { value: '5-15', icon: UsersRound, label: '5–15' },
  { value: '15-30', icon: UsersRound, label: '15–30' },
  { value: '30+', icon: Building2, label: 'Более 30' },
];

const TABLE_RANGES = [
  { value: '<5', label: 'До 5' },
  { value: '5-10', label: '5–10' },
  { value: '10-20', label: '10–20' },
  { value: '20+', label: 'Более 20' },
];

const FEATURE_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'kds', label: 'Экран кухни (KDS)', icon: MonitorCog },
  { value: 'online_menu', label: 'Меню онлайн', icon: Globe2 },
  { value: 'booking', label: 'Бронь столиков', icon: CalendarCheck2 },
  { value: 'loyalty', label: 'Лояльность', icon: HeartHandshake },
  { value: 'delivery', label: 'Доставка', icon: Bike },
  { value: 'analytics', label: 'Аналитика', icon: BarChart3 },
];

const ease = [0.22, 1, 0.36, 1] as const;
const rise = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.65, ease } };
const spring = { type: 'spring', stiffness: 420, damping: 24 } as const;

export default function RegisterPage() {
  const { locale, setLocale } = useLocale();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'email' | 'google' | null>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [bizType, setBizType] = useState('');
  const [cafeFormat, setCafeFormat] = useState('');
  const [staffCount, setStaffCount] = useState('');
  const [tableCount, setTableCount] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [chainName, setChainName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [googleCredential, setGoogleCredential] = useState('');
  const [googlePhone, setGooglePhone] = useState('');

  const toggleFeature = (f: string) =>
    setFeatures(p => p.includes(f) ? p.filter(x => x !== f) : [...p, f]);

  const doOnboarding = async () => {
    await authAPI.onboarding({
      chain_name: chainName.trim() || fullName.trim(),
      restaurant_name: chainName.trim() || fullName.trim(),
      staff_bot_token: '',
      onboarding_answers: {
        restaurant_type: bizType,
        cafe_format: cafeFormat || null,
        tables_count: tableCount,
        staff_count: staffCount,
        features,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) { setError('Пароли не совпадают'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        password, password_confirm: passwordConfirm,
      });
      localStorage.setItem('token', res.data.access);
      if (res.data.refresh) localStorage.setItem('refresh', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      await doOnboarding();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        const msgs: string[] = [];
        Object.values(data).forEach((v: any) => {
          if (Array.isArray(v)) msgs.push(v[0]);
          else if (typeof v === 'string') msgs.push(v);
        });
        setError(msgs.join('. ') || 'Ошибка регистрации');
      } else setError(err?.message || 'Ошибка регистрации');
    } finally { setLoading(false); }
  };

  const handleGoogleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.registerGoogle({
        credential: googleCredential,
        phone_number: googlePhone.trim(),
      });
      localStorage.setItem('token', res.data.access);
      if (res.data.refresh) localStorage.setItem('refresh', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      await doOnboarding();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Ошибка регистрации');
    } finally { setLoading(false); }
  };

  if (!mode) {
    return (
      <motion.div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(143,212,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(249,115,96,0.14),transparent_30%),#06111c] px-4 py-6 lg:px-8 lg:py-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <motion.div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0a1724]/95 shadow-[0_30px_100px_rgba(0,0,0,0.45)] lg:grid-cols-[0.92fr_1.08fr]" initial={{ opacity: 0, scale: 0.96, y: 18 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
          <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[linear-gradient(145deg,rgba(249,115,96,0.18),rgba(143,212,255,0.06)_48%,transparent)] p-10 lg:flex lg:flex-col lg:justify-between lg:p-14">
            <motion.div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#8fd4ff]/10 blur-3xl" animate={{ x: [0, 28, 0], y: [0, 20, 0], scale: [1, 1.16, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.div className="absolute -bottom-28 left-10 h-56 w-56 rounded-full bg-[#f97360]/10 blur-3xl" animate={{ x: [0, -22, 0], scale: [1, 0.86, 1] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
            <div className="relative">
              <motion.div {...rise}><BrandMark /></motion.div>
              <motion.div className="mt-24 max-w-sm" {...rise} transition={{ ...rise.transition, delay: 0.2 }}>
                <motion.div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-[#8fd4ff]" animate={{ letterSpacing: ['0.28em', '0.34em', '0.28em'] }} transition={{ duration: 4, repeat: Infinity }}><Sparkles className="h-3.5 w-3.5" /> Waitly Control</motion.div>
                <motion.h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.06em] text-white" {...rise} transition={{ ...rise.transition, delay: 0.32 }}>Соберите свой ресторан в одну систему.</motion.h1>
                 <motion.p className="mt-6 max-w-xs text-sm leading-7 text-white/55" {...rise} transition={{ ...rise.transition, delay: 0.44 }}>Брони, команда, меню и операционные процессы уже будут готовы к работе.</motion.p>
               </motion.div>
            </div>
            <div className="relative space-y-3">
              {[['01', 'Настройка за несколько минут'], ['02', 'Подсказки под ваш формат'], ['03', 'Данные всегда под рукой']].map(([number, label]) => (
                <motion.div key={number} className="flex items-center gap-3 text-sm text-white/65" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ ...rise.transition, delay: Number(number) * 0.14 + 0.5 }} whileHover={{ x: 8, color: '#ffffff' }}><motion.span className="font-mono text-xs text-[#f97360]" animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 2.4, repeat: Infinity, delay: Number(number) * 0.3 }}>{number}</motion.span><span>{label}</span></motion.div>
              ))}
            </div>
          </aside>
          <motion.main className="flex flex-col justify-center p-7 sm:p-10 lg:p-14" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2, ease }}>
            <div className="flex items-center justify-between">
              <motion.div className="lg:hidden" initial={{ rotate: -12, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={spring}><BrandMark compact /></motion.div>
              <motion.span className="ml-auto text-[11px] font-bold uppercase tracking-[0.24em] text-white/35" animate={{ opacity: [0.35, 0.7, 0.35] }} transition={{ duration: 3, repeat: Infinity }}>Регистрация</motion.span>
              <motion.select whileHover={{ y: -2 }} whileFocus={{ scale: 1.03 }} transition={spring} value={locale} onChange={(e) => setLocale(e.target.value as any)} className="ml-5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 outline-none">
                <option value="ru">RU</option><option value="en">EN</option><option value="uz">UZ</option>
              </motion.select>
            </div>
            <div className="mt-16 max-w-md">
              <motion.h2 className="text-4xl font-black tracking-[-0.05em] text-white" {...rise} transition={{ ...rise.transition, delay: 0.35 }}>Добро пожаловать в Waitly</motion.h2>
              <motion.p className="mt-4 text-sm leading-7 text-white/50" {...rise} transition={{ ...rise.transition, delay: 0.48 }}>Начните с привычного способа входа. Остальное настроим вместе.</motion.p>
            </div>
            <div className="mt-10 max-w-md space-y-3">
              <motion.button type="button" onClick={() => setMode('email')} className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-[#f97360]/50 hover:bg-[#f97360]/[0.07]" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...rise.transition, delay: 0.62 }} whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                <motion.span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f97360]/15 text-[#f97360]" whileHover={{ rotate: 12, scale: 1.1 }} transition={spring}><Mail className="h-5 w-5" /></motion.span>
                <span className="flex-1"><span className="block text-sm font-bold text-white">По номеру телефона</span><span className="mt-1 block text-xs text-white/40">Пароль и быстрый вход в Waitly Control</span></span><ArrowRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-[#f97360]" />
              </motion.button>
              <motion.button type="button" onClick={() => { if (!hasGoogleOAuth) { setError('Google auth не настроен'); return; } setMode('google'); }} className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-[#8fd4ff]/50 hover:bg-[#8fd4ff]/[0.06]" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ ...rise.transition, delay: 0.76 }} whileHover={{ y: -5, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                <motion.span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-white" whileHover={{ rotate: -12, scale: 1.1 }} transition={spring}><span className="text-lg font-black">G</span></motion.span>
                <span className="flex-1"><span className="block text-sm font-bold text-white">Продолжить с Google</span><span className="mt-1 block text-xs text-white/40">Быстрый вход в аккаунт</span></span><ArrowRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-[#8fd4ff]" />
              </motion.button>
            </div>
            <AnimatePresence mode="wait">{error && <motion.div key={error} className="mt-5 max-w-md overflow-hidden rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100" initial={{ opacity: 0, height: 0, y: -8 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>{error}</motion.div>}</AnimatePresence>
            <motion.p className="mt-8 text-sm text-white/40" {...rise} transition={{ ...rise.transition, delay: 0.9 }}>Уже есть аккаунт? <Link to="/login" className="font-bold text-[#f97360] transition hover:text-[#ff9a88]">Войти</Link></motion.p>
            <motion.div className="mt-12 flex items-center gap-2 text-xs text-white/30" animate={{ opacity: [0.35, 0.75, 0.35] }} transition={{ duration: 3.5, repeat: Infinity }}><ShieldCheck className="h-4 w-4 text-[#8fd4ff]" /> Бесплатная настройка без обязательств</motion.div>
          </motion.main>
        </motion.div>
      </motion.div>
    );
  }

  const stepData = mode === 'email' ? STEPS : STEPS.slice(0, 3);

  return (
    <motion.div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(143,212,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(249,115,96,0.14),transparent_30%),#06111c] px-4 py-6 lg:px-8 lg:py-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.65 }}>
      <motion.div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0a1724]/95 shadow-[0_30px_100px_rgba(0,0,0,0.45)] lg:grid-cols-[0.72fr_1.28fr]" initial={{ opacity: 0, scale: 0.97, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
        <aside className="relative hidden overflow-hidden border-r border-white/10 bg-[linear-gradient(145deg,rgba(249,115,96,0.18),rgba(143,212,255,0.06)_48%,transparent)] p-10 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <motion.div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#f97360]/10 blur-3xl" animate={{ x: [0, 24, 0], y: [0, -14, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="relative" {...rise}><BrandMark /><div className="mt-20"><motion.div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8fd4ff]" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>Ваш рабочий профиль</motion.div><motion.h1 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.06em] text-white" {...rise} transition={{ ...rise.transition, delay: 0.2 }}>Настроим Waitly под ваш бизнес.</motion.h1><motion.p className="mt-5 text-sm leading-7 text-white/50" {...rise} transition={{ ...rise.transition, delay: 0.32 }}>Ответьте на несколько вопросов. Рекомендации и нужные инструменты появятся автоматически.</motion.p></div></motion.div>
          <motion.div className="relative rounded-2xl border border-white/10 bg-black/10 p-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...rise.transition, delay: 0.5 }} whileHover={{ y: -4, borderColor: 'rgba(143,212,255,0.35)' }}><div className="flex items-center gap-3"><motion.div className="grid h-9 w-9 place-items-center rounded-xl bg-[#8fd4ff]/10 text-[#8fd4ff]" animate={{ rotate: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity }}><Sparkles className="h-4 w-4" /></motion.div><div><div className="text-sm font-bold text-white">Персональная настройка</div><div className="mt-1 text-xs text-white/40">Без лишних шагов и сложных терминов</div></div></div></motion.div>
        </aside>
        <motion.main className="flex flex-col justify-center p-7 sm:p-10 lg:p-14" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.15, ease }}>
          <div className="mb-8 flex items-center justify-between"><motion.div className="lg:hidden" initial={{ scale: 0.7, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={spring}><BrandMark compact /></motion.div><motion.button type="button" onClick={() => { setMode(null); setStep(0); setError(''); }} className="ml-auto text-sm text-white/45 transition hover:text-white" whileHover={{ x: -4 }} whileTap={{ scale: 0.96 }}>Вернуться к способу входа</motion.button></div>

          {/* progress */}
          <div className="mb-10 flex items-center gap-2">
            {stepData.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: i * 0.12 }} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  i < step ? 'bg-emerald-500/20 text-emerald-300' :
                  i === step ? 'bg-[#f97360]/20 text-[#f97360]' :
                  'border-white/10 bg-white/5 text-white/30'
                }`}>
                  {i < step ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
                  {s.label}
                </motion.div>
                {i < stepData.length - 1 && <div className="h-px w-6 bg-white/10" />}
              </div>
            ))}
          </div>

          {/* Step 0 — тип */}
          {step === 0 && (
            <motion.div key="type" {...rise}>
              <motion.h2 className="text-2xl font-bold text-white" animate={{ x: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity }}>Для чего вам это?</motion.h2>
              <motion.p className="mt-2 mb-6 text-sm text-white/50" {...rise} transition={{ ...rise.transition, delay: 0.12 }}>Выберите тип вашего заведения</motion.p>
              <div className="grid gap-3">
                {BIZ_TYPES.map(bt => (
                  <motion.button key={bt.value} type="button" onClick={() => { setBizType(bt.value); setCafeFormat(''); }}
                    className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      bizType === bt.value
                        ? 'border-[#f97360] bg-[#f97360]/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                     }`} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ ...rise.transition, delay: BIZ_TYPES.indexOf(bt) * 0.08 }} whileHover={{ x: 7, scale: 1.01 }} whileTap={{ scale: 0.985 }}>
                    <motion.span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${bizType === bt.value ? 'bg-[#f97360]/15 text-[#f97360]' : 'bg-white/5 text-white/45'}`} animate={bizType === bt.value ? { rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.5 }}><bt.icon className="h-5 w-5" /></motion.span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{bt.label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{bt.desc}</div>
                    </div>
                    {bizType === bt.value && <Check className="h-5 w-5 text-[#f97360]" />}
                  </motion.button>
                ))}
              </div>
              {bizType === 'cafe' && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-white/40">Уточните формат кофейни</p>
                  {[
                    { value: 'to_go', label: 'То-гоу', desc: 'на вынос, без столиков' },
                    { value: 'self_service', label: 'Self-service', desc: 'есть столики, самообслуживание' },
                    { value: 'full_service', label: 'Полноценная', desc: 'кухня + официанты' },
                  ].map(f => (
                    <button key={f.value} type="button" onClick={() => setCafeFormat(f.value)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm w-full text-left transition ${
                        cafeFormat === f.value
                          ? 'border-[#f97360] bg-[#f97360]/10 text-[#f97360]'
                          : 'border-white/8 bg-white/3 text-white/60 hover:border-white/16'
                      }`}>
                      <span>{f.label} — <span className="text-white/40">{f.desc}</span></span>
                      {cafeFormat === f.value && <Check className="h-4 w-4" />}
                    </button>
                   ))}
                 </div>
              )}
              <motion.button type="button" disabled={!bizType || (bizType === 'cafe' && !cafeFormat)}
                onClick={() => setStep(1)}
                 className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-40" whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(249,115,96,0.24)' }} whileTap={{ scale: 0.97 }}>
                Далее <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight className="h-4 w-4" /></motion.span>
              </motion.button>
            </motion.div>
          )}

          {/* Step 1 — детали */}
          {step === 1 && (
            <motion.div key="details" {...rise}>
              <motion.h2 className="text-2xl font-bold text-white" animate={{ letterSpacing: ['-0.02em', '-0.04em', '-0.02em'] }} transition={{ duration: 4, repeat: Infinity }}>Детали бизнеса</motion.h2>
              <motion.p className="mt-2 mb-6 text-sm text-white/50" {...rise} transition={{ ...rise.transition, delay: 0.12 }}>Чтобы настроить всё под вас</motion.p>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block">Название сети или заведения</label>
                  <input value={chainName} onChange={e => setChainName(e.target.value)}
                    placeholder="Например: Coffee Boom"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block">Сколько сотрудников?</label>
                  <div className="flex gap-2 flex-wrap">
                    {STAFF_RANGES.map(r => (
                      <motion.button key={r.value} type="button" onClick={() => setStaffCount(r.value)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm transition ${
                          staffCount === r.value
                            ? 'border-[#f97360] bg-[#f97360]/10 text-[#f97360]'
                            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                         }`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...rise.transition, delay: STAFF_RANGES.indexOf(r) * 0.08 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}>
                        <motion.span animate={staffCount === r.value ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.45 }}><r.icon className="h-4 w-4" /></motion.span> {r.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block">Сколько столов?</label>
                  <div className="flex gap-2 flex-wrap">
                    {TABLE_RANGES.map(r => (
                      <motion.button key={r.value} type="button" onClick={() => setTableCount(r.value)}
                        className={`rounded-xl border px-3.5 py-2 text-sm transition ${
                          tableCount === r.value
                            ? 'border-[#f97360] bg-[#f97360]/10 text-[#f97360]'
                            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                         }`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...rise.transition, delay: TABLE_RANGES.indexOf(r) * 0.08 + 0.15 }} whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}>
                        <motion.span className="mr-1.5 inline-flex text-white/30" animate={tableCount === r.value ? { rotate: [0, -10, 10, 0] } : {}} transition={{ duration: 0.45 }}><Table2 className="h-4 w-4" /></motion.span>{r.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block">Какие функции нужны?</label>
                  <div className="flex gap-2 flex-wrap">
                    {FEATURE_OPTIONS.map(f => {
                      const FeatureIcon = f.icon;
                      return (
                      <motion.button key={f.value} type="button" onClick={() => toggleFeature(f.value)}
                        className={`rounded-xl border px-3.5 py-2 text-sm transition ${
                          features.includes(f.value)
                            ? 'border-[#f97360] bg-[#f97360]/10 text-[#f97360]'
                            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                        }`} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...rise.transition, delay: FEATURE_OPTIONS.indexOf(f) * 0.07 + 0.25 }} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                        <motion.span animate={features.includes(f.value) ? { rotate: [0, -8, 8, 0] } : {}} transition={{ duration: 0.45 }}><FeatureIcon className="mr-1.5 inline h-4 w-4" /></motion.span>{f.label} {features.includes(f.value) && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="ml-1 inline h-3.5 w-3.5" /></motion.span>}
                      </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <motion.button type="button" onClick={() => setStep(0)}
                  className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:text-white" whileHover={{ x: -4 }} whileTap={{ scale: 0.97 }}>
                  Назад
                </motion.button>
                <motion.button type="button" onClick={() => setStep(2)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350]" whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(249,115,96,0.22)' }} whileTap={{ scale: 0.97 }}>
                  {mode === 'email' ? 'Создать аккаунт' : 'Завершить'} <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}><ArrowRight className="h-4 w-4" /></motion.span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — контакты */}
          {step === 2 && mode === 'email' && (
            <motion.form key="contacts" onSubmit={(event) => { event.preventDefault(); setStep(3); }} className="space-y-4" {...rise}>
              <motion.h2 className="text-2xl font-bold text-white" animate={{ x: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity }}>Ваши контакты</motion.h2>
              <p className="mt-1 mb-6 text-sm text-white/50">Имя и телефон — этого достаточно, чтобы начать.</p>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Имя и фамилия" required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+998901234567" required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
              </div>
              <div className="mt-8 flex gap-3">
                <motion.button type="button" onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:text-white" whileHover={{ x: -4 }} whileTap={{ scale: 0.97 }}>
                  Назад
                </motion.button>
                <motion.button type="submit" disabled={!fullName || !phoneNumber}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-40" whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
                  Далее <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Step 3 — пароль */}
          {step === 3 && mode === 'email' && (
            <motion.form key="password" onSubmit={handleSubmit} className="space-y-4" {...rise}>
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-[#f97360]/15 text-[#f97360]"><Lock className="h-5 w-5" /></div>
              <h2 className="text-2xl font-bold text-white">Придумайте пароль</h2>
              <p className="mb-6 text-sm leading-6 text-white/50">Он понадобится для входа по номеру телефона. Минимум 8 символов.</p>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" minLength={8} required autoFocus className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Повторите пароль" minLength={8} required className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
              </div>
              {error && <motion.div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.div>}
              <div className="mt-8 flex gap-3">
                <motion.button type="button" onClick={() => setStep(2)} className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:text-white" whileHover={{ x: -4 }} whileTap={{ scale: 0.97 }}>Назад</motion.button>
                <motion.button type="submit" disabled={loading || !password || password !== passwordConfirm} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-40" whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Создать аккаунт <ArrowRight className="h-4 w-4" /></>}
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Google step 2 — просто телефон + подтверждение */}
          {step === 2 && mode === 'google' && (
            <form onSubmit={handleGoogleRegister} className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Подтвердите номер</h2>
              <p className="mt-1 text-sm text-white/50 mb-4">Привяжите номер телефона к аккаунту Google</p>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                <input value={googlePhone} onChange={e => setGooglePhone(e.target.value)}
                  placeholder="+998901234567" required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
              </div>
              {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div>}
              <button type="submit" disabled={loading || !googlePhone}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Завершить регистрацию'}
              </button>
            </form>
          )}
        </motion.main>
      </motion.div>
    </motion.div>
  );
}
