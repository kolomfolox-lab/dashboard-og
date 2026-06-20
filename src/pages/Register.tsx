import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

import { BrandMark } from '@/components/app/BrandMark';
import { useLocale } from '@/context/LocaleContext';
import { authAPI } from '@/services/api';

type RegMode = 'email' | null;

export default function RegisterPage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  const [mode, setMode] = useState<RegMode>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credential: string) => {
    try {
      const response = await authAPI.googleLogin({ credential });
      localStorage.setItem('token', response.data.access);
      if (response.data.refresh) localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Google auth failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError(locale === 'uz' ? 'Parollar mos kelmadi.' : 'Пароли не совпадают.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        email: email.trim(),
        password,
        password_confirm: passwordConfirm,
      });
      localStorage.setItem('token', response.data.access);
      if (response.data.refresh) localStorage.setItem('refresh', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/setup', { replace: true });
    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        const messages: string[] = [];
        Object.values(data).forEach((v: any) => {
          if (Array.isArray(v)) messages.push(v[0]);
          else if (typeof v === 'string') messages.push(v);
        });
        setError(messages.join('. ') || (locale === 'uz' ? 'Ro‘yxatdan o‘tib bo‘lmadi.' : 'Ошибка регистрации.'));
      } else {
        setError(err?.message || (locale === 'uz' ? 'Ro‘yxatdan o‘tib bo‘lmadi.' : 'Ошибка регистрации.'));
      }
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
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8fd4ff]">{locale === 'uz' ? "Ro'yxatdan o'tish" : 'Регистрация'}</div>
                <h1 className="mt-3 text-4xl font-bold leading-tight text-white">{locale === 'uz' ? 'Waitly boshqaruv paneliga xush kelibsiz' : 'Добро пожаловать в панель управления Waitly'}</h1>
                <p className="mt-4 text-sm leading-7 text-white/58">{locale === 'uz' ? 'Akkaunt yarating va restoranlaringizni boshqaring.' : 'Создайте аккаунт и управляйте своими ресторанами.'}</p>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-[28px] border border-white/8 bg-black/12 p-6">
              {mode === 'email' ? (
                <button type="button" onClick={() => { setMode(null); setError(''); }} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-white/44 transition hover:text-white">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {locale === 'uz' ? 'Orqaga' : 'Назад'}
                </button>
              ) : null}

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'email' ? (locale === 'uz' ? "Ro'yxatdan o'tish" : 'Регистрация') : (locale === 'uz' ? "Ro'yxatdan o'tish" : 'Регистрация')}
                </h2>
                <p className="mt-2 text-sm leading-7 text-white/52">
                  {mode === 'email'
                    ? (locale === 'uz' ? "Ma'lumotlaringizni kiriting." : 'Введите свои данные.')
                    : (locale === 'uz' ? "Usulni tanlang." : 'Выберите способ.')}
                </p>
              </div>

              {mode === 'email' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={locale === 'uz' ? 'To‘liq ism' : 'Полное имя'} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" required />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                    <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+998901234567" className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" required />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={locale === 'uz' ? 'Email (ixtiyoriy)' : 'Email (необязательно)'} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={locale === 'uz' ? 'Parol' : 'Пароль'} minLength={6} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                    <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder={locale === 'uz' ? 'Parolni tasdiqlang' : 'Подтвердите пароль'} minLength={6} className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none" required />
                  </div>

                  <button type="submit" disabled={loading || !fullName || !phoneNumber || !password || password !== passwordConfirm} className="w-full rounded-2xl bg-[#f97360] px-4 py-3 font-semibold text-white transition hover:bg-[#e56350] disabled:opacity-50">
                    {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t('working', 'Working...')}</span> : (locale === 'uz' ? "Ro'yxatdan o'tish" : 'Зарегистрироваться')}
                  </button>

                  {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

                  <div className="text-center text-sm text-white/46">
                    {locale === 'uz' ? 'Akkauntingiz bormi?' : 'Уже есть аккаунт?'}{' '}
                    <Link to="/login" className="font-semibold text-[#f97360] hover:underline">{locale === 'uz' ? 'Kirish' : 'Войти'}</Link>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <button type="button" onClick={() => setMode('email')} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:border-white/20 hover:text-white">
                    <Mail className="h-4 w-4" />
                    {locale === 'uz' ? 'Email orqali' : 'По Email'}
                  </button>

                  <div className="flex justify-center">
                    <GoogleLogin
                      theme="filled_black"
                      size="large"
                      shape="pill"
                      text="signup_with"
                      onSuccess={(r) => r.credential && handleGoogleSuccess(r.credential)}
                      onError={() => setError('Google auth cancelled or failed.')}
                    />
                  </div>

                  {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

                  <div className="text-center text-sm text-white/46">
                    {locale === 'uz' ? 'Akkauntingiz bormi?' : 'Уже есть аккаунт?'}{' '}
                    <Link to="/login" className="font-semibold text-[#f97360] hover:underline">{locale === 'uz' ? 'Kirish' : 'Войти'}</Link>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
