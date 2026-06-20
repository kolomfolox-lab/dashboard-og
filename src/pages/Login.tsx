import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Loader2, Lock, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

import { BrandMark } from '@/components/app/BrandMark';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { authAPI } from '@/services/api';

type AuthMode = 'password' | 'code' | 'forgot';
type FlowStep = 'input' | 'verify' | 'reset';

export default function LoginPage() {
  const { loginWithPassword, sendOtp, verifyOtp, setPassword } = useAuth();
  const { t, locale, setLocale } = useLocale();
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

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      authAPI.googleLogin({ credential: tokenResponse.access_token })
        .then((response) => {
          localStorage.setItem('token', response.data.access);
          if (response.data.refresh) localStorage.setItem('refresh', response.data.refresh);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          window.location.href = '/dashboard';
        })
        .catch((err) => setError(err?.response?.data?.error || 'Google auth failed.'));
    },
    onError: () => setError('Google auth cancelled or failed.'),
  });

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
        if (step === 'input') {
          await loginWithPassword({ phone_number: identifier.trim(), password: pwd });
          navigate('/dashboard', { replace: true });
        }
      } else if (mode === 'code') {
        if (step === 'input') {
          const response = await sendOtp(identifier.trim());
          setStep('verify');
          setInfo(response?.debug_code ? `SMTP fallback code: ${response.debug_code}` : (locale === 'uz' ? 'Kod emailga yuborildi.' : 'Код отправлен на email.'));
        } else if (step === 'verify') {
          const response = await verifyOtp({ email: identifier.trim(), code: otp.trim() });
          navigate('/dashboard', { replace: true });
        }
      } else {
        // forgot password flow
        if (step === 'input') {
          const response = await sendOtp(identifier.trim());
          setStep('verify');
          setInfo(response?.debug_code ? `SMTP fallback code: ${response.debug_code}` : (locale === 'uz' ? 'Kod emailga yuborildi.' : 'Код отправлен на email.'));
        } else if (step === 'verify') {
          if (otp.length === 6) {
            setStep('reset');
            setInfo(locale === 'uz' ? "Kod tasdiqlandi. Yangi parol kiriting." : 'Код подтвержден. Введите новый пароль.');
            setOtp('');
          }
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
          await setPassword({ identifier: identifier.trim(), code: otp.trim(), new_password: newPwd });
          setInfo(locale === 'uz' ? 'Parol yangilandi! Kiring.' : 'Пароль обновлен! Войдите.');
          resetFlow('password');
          setPwd(newPwd);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || (locale === 'uz' ? 'Xatolik.' : 'Ошибка.'));
    } finally {
      setLoading(false);
    }
  };

  const isForgot = step === 'reset' || (mode === 'password' && step === 'input');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_22%),linear-gradient(180deg,#07111a,#08131f_55%,#06101b)] px-4 py-10" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-white/10 bg-[#0b1622]/95 shadow-[0_30px_80px_rgba(0,0,0,0.55)] lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-8 lg:border-b-0 lg:border-r lg:border-r-white/8 lg:p-10">
            <div className="absolute top-4 right-4">
              <div className="relative inline-flex">
                <select value={locale} onChange={(e) => setLocale(e.target.value as 'ru' | 'en' | 'uz')} className="appearance-none rounded-lg border border-white/8 bg-white/5 px-3 py-1.5 pr-7 text-xs text-white/60 outline-none">
                  <option value="ru">RU</option>
                  <option value="en">EN</option>
                  <option value="uz">UZ</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/30" />
              </div>
            </div>
            <div className="mb-10 flex justify-start">
              <BrandMark />
            </div>
            <div className="max-w-md space-y-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fd4ff]">{t('owner_access', 'Owner access')}</div>
                <h1 className="mt-3 text-4xl font-bold leading-tight text-white">{t('login_title', 'Панель управления Waitly')}</h1>
                <p className="mt-4 text-sm leading-7 text-white/58">{t('login_subtitle', 'Вход по паролю или по коду из email.')}</p>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-[28px] border border-white/8 bg-black/12 p-6">
              {step !== 'input' || mode === 'forgot' ? (
                <button type="button" onClick={() => { setStep('input'); setOtp(''); setError(''); setInfo(''); if (mode === 'forgot') setMode('password'); }} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-white/44 transition hover:text-white">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {locale === 'uz' ? 'Orqaga' : 'Назад'}
                </button>
              ) : null}

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {step === 'reset'
                    ? (locale === 'uz' ? 'Yangi parol' : 'Новый пароль')
                    : step === 'verify'
                    ? (locale === 'uz' ? 'Kodni kiriting' : 'Введите код')
                    : (mode === 'forgot' ? (locale === 'uz' ? 'Parolni tiklash' : 'Восстановление пароля') : (locale === 'uz' ? 'Kirish' : 'Вход'))}
                </h2>
                <p className="mt-2 text-sm leading-7 text-white/52">
                  {step === 'reset'
                    ? (locale === 'uz' ? 'Yangi parolni kiriting.' : 'Введите новый пароль.')
                    : step === 'verify'
                    ? (locale === 'uz' ? 'Emailga yuborilgan 6 xonali kodni kiriting.' : 'Введите 6-значный код из email.')
                    : (mode === 'forgot' ? (locale === 'uz' ? 'Emailingizni kiriting.' : 'Введите ваш email.') : (locale === 'uz' ? 'Telefon/email va parolni kiriting.' : 'Введите телефон/email и пароль.'))}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={`${mode}-${step}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode !== 'forgot' && step === 'input' ? (
                      // Normal login (password or code mode)
                      <>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={locale === 'uz' ? 'Telefon yoki email' : 'Телефон или email'} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
                        </div>

                        {mode === 'password' ? (
                          <>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                              <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder={locale === 'uz' ? 'Parol' : 'Пароль'} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
                            </div>
                            <button type="button" onClick={() => { setMode('forgot'); setStep('input'); setIdentifier(''); setError(''); setInfo(''); }} className="text-right text-xs text-white/40 hover:text-[#f97360] transition">
                              {locale === 'uz' ? 'Parolni unutdingizmi?' : 'Забыли пароль?'}
                            </button>
                          </>
                        ) : null}

                        <button type="submit" disabled={loading || !identifier || (mode === 'password' && !pwd)} className="w-full rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-50">
                          {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('working', 'Working...')}</span> : mode === 'password' ? (locale === 'uz' ? 'Kirish' : 'Войти') : (locale === 'uz' ? 'Kod yuborish' : 'Отправить код')}
                        </button>

                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                          <div className="relative flex justify-center text-xs"><span className="bg-[#0b1622] px-3 text-white/40">{locale === 'uz' ? 'yoki' : 'или'}</span></div>
                        </div>

                        <div className="space-y-3">
                          <button type="button" onClick={() => googleLogin()} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white">
                            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Google
                          </button>
                          <button type="button" onClick={() => resetFlow('code')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white">
                            <Mail className="h-4 w-4" />
                            {locale === 'uz' ? 'Kod orqali kirish' : 'По коду из email'}
                          </button>
                        </div>
                      </>
                    ) : step === 'reset' ? (
                      // New password form
                      <>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder={locale === 'uz' ? 'Yangi parol' : 'Новый пароль'} minLength={6} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                          <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder={locale === 'uz' ? 'Parolni tasdiqlang' : 'Подтвердите пароль'} minLength={6} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
                        </div>

                        <button type="submit" disabled={loading || newPwd.length < 6 || newPwd !== confirmPwd} className="w-full rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-50">
                          {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('working', 'Working...')}</span> : (locale === 'uz' ? 'Parolni saqlash' : 'Сохранить пароль')}
                        </button>
                      </>
                    ) : (
                      // Forgot password - step input or verify
                      <>
                        {step === 'input' ? (
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={locale === 'uz' ? 'Email' : 'Email'} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
                          </div>
                        ) : (
                          <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold tracking-[0.4em] text-white placeholder:text-white/12 focus:border-[#f97360] focus:outline-none" />
                        )}

                        <button type="submit" disabled={loading || (step === 'input' ? !identifier : otp.length < 6)} className="w-full rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-50">
                          {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('working', 'Working...')}</span> : (step === 'input' ? (locale === 'uz' ? 'Kod yuborish' : 'Отправить код') : (locale === 'uz' ? 'Tasdiqlash' : 'Подтвердить'))}
                        </button>

                        {step === 'verify' ? (
                          <button type="button" onClick={async () => {
                            setError('');
                            setLoading(true);
                            try {
                              const response = await sendOtp(identifier.trim());
                              if (response?.debug_code) {
                                setInfo(`SMTP fallback code: ${response.debug_code}`);
                              } else {
                                setInfo(locale === 'uz' ? 'Yangi kod yuborildi.' : 'Новый код отправлен.');
                              }
                              setOtp('');
                            } catch (err: any) {
                              setError(err?.response?.data?.error || 'Error');
                            } finally {
                              setLoading(false);
                            }
                          }} disabled={loading} className="w-full text-center text-sm font-medium text-white/46 transition hover:text-[#f97360]">
                            {locale === 'uz' ? 'Kodni qayta yuborish' : 'Отправить код повторно'}
                          </button>
                        ) : null}
                      </>
                    )}

                    {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
                    {info ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{info}</div> : null}

                    <div className="text-center text-sm text-white/46">
                      {locale === 'uz' ? "Akkauntingiz yo'qmi?" : 'Нет аккаунта?'}{' '}
                      <Link to="/register" className="font-semibold text-[#f97360] hover:underline">{locale === 'uz' ? "Ro'yxatdan o'tish" : 'Регистрация'}</Link>
                    </div>
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
