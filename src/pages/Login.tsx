import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Loader2, Lock, Mail, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { BrandMark } from '@/components/app/BrandMark';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';

type AuthMode = 'password' | 'telegram' | 'code' | 'forgot';
type FlowStep = 'input' | 'verify' | 'reset';

export default function LoginPage() {
  const { loginWithPassword, requestTelegramOtp, verifyTelegramOtp, sendOtp, verifyOtp, requestTelegramPasswordReset, verifyResetOtp, confirmTelegramPasswordReset } = useAuth();
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>('password');
  const [step, setStep] = useState<FlowStep>('input');
  const [identifier, setIdentifier] = useState('');
  const [pwd, setPwd] = useState('');
  const [otp, setOtp] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const resetFlow = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStep('input');
    setOtp('');
    setPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setError('');
    setInfo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (mode === 'password') {
        await loginWithPassword({ phone_number: identifier.trim(), password: pwd });
        navigate('/dashboard', { replace: true });
      } else if (mode === 'telegram') {
        if (step === 'input') {
          await requestTelegramOtp(identifier.trim());
          setStep('verify');
          setInfo(locale === 'uz' ? 'Kod Telegramga yuborildi.' : 'Код отправлен в Telegram.');
        } else {
          await verifyTelegramOtp({ identifier: identifier.trim(), code: otp.trim() });
          navigate('/dashboard', { replace: true });
        }
      } else if (mode === 'code') {
        if (step === 'input') {
          const response = await sendOtp(identifier.trim());
          setStep('verify');
          setInfo(response?.debug_code ? `SMTP fallback code: ${response.debug_code}` : (locale === 'uz' ? 'Kod emailga yuborildi.' : 'Код отправлен на email.'));
        } else {
          await verifyOtp({ email: identifier.trim(), code: otp.trim() });
          navigate('/dashboard', { replace: true });
        }
      } else {
        if (step === 'input') {
          await requestTelegramPasswordReset(identifier.trim());
          setStep('verify');
          setInfo(locale === 'uz' ? 'Kod Telegramga yuborildi.' : 'Код отправлен в Telegram.');
        } else if (step === 'verify') {
          await verifyResetOtp({ identifier: identifier.trim(), code: otp.trim() });
          setStep('reset');
          setInfo(locale === 'uz' ? 'Kod tasdiqlandi. Yangi parol kiriting.' : 'Код подтвержден. Введите новый пароль.');
        } else {
          if (newPwd.length < 6) {
            setError(locale === 'uz' ? 'Parol kamida 6 belgi.' : 'Пароль минимум 6 символов.');
            setLoading(false);
            return;
          }
          if (newPwd !== confirmPwd) {
            setError(locale === 'uz' ? 'Parollar mos emas.' : 'Пароли не совпадают.');
            setLoading(false);
            return;
          }
          await confirmTelegramPasswordReset({ identifier: identifier.trim(), code: otp.trim(), new_password: newPwd });
          setInfo(locale === 'uz' ? 'Parol yangilandi! Kiring.' : 'Пароль обновлен! Войдите.');
          resetFlow('password');
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || (locale === 'uz' ? 'Xatolik.' : 'Ошибка.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_22%),linear-gradient(180deg,#07111a,#08131f_55%,#06101b)] px-4 py-10" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-white/10 bg-[#0b1622]/95 shadow-[0_30px_80px_rgba(0,0,0,0.55)] lg:grid-cols-[0.92fr_1.08fr]">
          <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-8 lg:border-b-0 lg:border-r lg:border-r-white/8 lg:p-10">
            <div className="mb-10 flex justify-start">
              <BrandMark />
            </div>
            <div className="max-w-md space-y-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fd4ff]">{t('owner_access', 'Owner access')}</div>
                <h1 className="mt-3 text-4xl font-bold leading-tight text-white">{t('login_title', 'Панель управления Waitly')}</h1>
                <p className="mt-4 text-sm leading-7 text-white/58">{t('login_subtitle', 'Вход по паролю, через Telegram или по коду.')}</p>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-[28px] border border-white/8 bg-black/12 p-6">
              {step !== 'input' ? (
                <button type="button" onClick={() => { setStep('input'); setOtp(''); setError(''); setInfo(''); }} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-white/44 transition hover:text-white">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {locale === 'uz' ? 'Orqaga' : 'Назад'}
                </button>
              ) : null}

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'forgot' && step === 'reset'
                    ? (locale === 'uz' ? 'Yangi parol' : 'Новый пароль')
                    : step === 'verify'
                    ? (locale === 'uz' ? 'Kodni kiriting' : 'Введите код')
                    : (locale === 'uz' ? 'Kirish' : 'Вход')}
                </h2>
                <p className="mt-2 text-sm leading-7 text-white/52">
                  {mode === 'forgot' && step === 'reset'
                    ? (locale === 'uz' ? 'Yangi parolni kiriting.' : 'Введите новый пароль.')
                    : step === 'verify'
                    ? (locale === 'uz' ? 'Telegramga yuborilgan 6 xonali kodni kiriting.' : 'Введите 6-значный код из Telegram.')
                    : (locale === 'uz' ? 'Telefon/email va parolni kiriting.' : 'Введите телефон/email и пароль.')}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={`${mode}-${step}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 'input' ? (
                      <>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                          <input
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder={locale === 'uz' ? 'Telefon yoki email' : 'Телефон или email'}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
                          />
                        </div>

                        {mode === 'password' ? (
                          <>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                              <input
                                type="password"
                                value={pwd}
                                onChange={(e) => setPwd(e.target.value)}
                                placeholder={locale === 'uz' ? 'Parol' : 'Пароль'}
                                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
                              />
                            </div>
                            <button type="button" onClick={() => resetFlow('forgot')} className="text-right text-xs text-white/40 hover:text-[#f97360] transition">
                              {locale === 'uz' ? 'Parolni unutdingizmi?' : 'Забыли пароль?'}
                            </button>
                          </>
                        ) : null}

                        <button type="submit" disabled={loading || !identifier || (mode === 'password' && !pwd)} className="w-full rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-50">
                          {loading ? (
                            <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('working', 'Working...')}</span>
                          ) : mode === 'password'
                            ? (locale === 'uz' ? 'Kirish' : 'Войти')
                            : (locale === 'uz' ? 'Kod yuborish' : 'Отправить код')}
                        </button>

                        {mode !== 'forgot' ? (
                          <>
                            <div className="relative my-4">
                              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                              <div className="relative flex justify-center text-xs"><span className="bg-[#0b1622] px-3 text-white/40">{locale === 'uz' ? 'yoki' : 'или'}</span></div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => resetFlow('telegram')}
                                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${mode === 'telegram' ? 'border-[#f97360] bg-[#f97360]/10 text-[#f97360]' : 'border-white/10 text-white/60 hover:border-white/20 hover:text-white'}`}
                              >
                                <MessageSquare className="h-4 w-4" />
                                Telegram
                              </button>
                              <button
                                type="button"
                                onClick={() => resetFlow('code')}
                                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${mode === 'code' ? 'border-[#f97360] bg-[#f97360]/10 text-[#f97360]' : 'border-white/10 text-white/60 hover:border-white/20 hover:text-white'}`}
                              >
                                <Mail className="h-4 w-4" />
                                {locale === 'uz' ? 'Kod orqali' : 'По коду'}
                              </button>
                            </div>
                          </>
                        ) : null}
                      </>
                    ) : step === 'verify' ? (
                      <>
                        <input
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold tracking-[0.4em] text-white placeholder:text-white/12 focus:border-[#f97360] focus:outline-none"
                        />

                        <button type="submit" disabled={loading || otp.length < 6} className="w-full rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-50">
                          {loading ? (
                            <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('working', 'Working...')}</span>
                          ) : (locale === 'uz' ? 'Tasdiqlash' : 'Подтвердить')}
                        </button>

                        <button type="button" onClick={async () => {
                          setError('');
                          setLoading(true);
                          try {
                            if (mode === 'telegram') await requestTelegramOtp(identifier.trim());
                            else if (mode === 'forgot') await requestTelegramPasswordReset(identifier.trim());
                            else {
                              const response = await sendOtp(identifier.trim());
                              if (response?.debug_code) {
                                setInfo(`SMTP fallback code: ${response.debug_code}`);
                                setOtp('');
                                return;
                              }
                            }
                            setInfo(locale === 'uz' ? 'Yangi kod yuborildi.' : 'Новый код отправлен.');
                            setOtp('');
                          } catch (err: any) {
                            setError(err?.response?.data?.error || 'Error');
                          } finally {
                            setLoading(false);
                          }
                        }} disabled={loading} className="w-full text-center text-sm font-medium text-white/46 transition hover:text-[#f97360]">
                          {locale === 'uz' ? 'Kodni qayta yuborish' : 'Отправить код повторно'}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder={locale === 'uz' ? 'Yangi parol' : 'Новый пароль'} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                          <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder={locale === 'uz' ? 'Parolni tasdiqlang' : 'Подтвердите пароль'} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
                        </div>
                        {newPwd && confirmPwd && newPwd !== confirmPwd ? (
                          <p className="text-xs text-red-400">{locale === 'uz' ? 'Parollar mos emas' : 'Пароли не совпадают'}</p>
                        ) : null}

                        <button type="submit" disabled={loading || newPwd.length < 6 || newPwd !== confirmPwd} className="w-full rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-50">
                          {loading ? (
                            <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('working', 'Working...')}</span>
                          ) : (locale === 'uz' ? 'Parolni saqlash' : 'Сохранить пароль')}
                        </button>
                      </>
                    )}

                    {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
                    {info ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{info}</div> : null}
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
