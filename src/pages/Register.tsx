import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Phone } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

import { BrandMark } from '@/components/app/BrandMark';
import { useLocale } from '@/context/LocaleContext';
import { authAPI } from '@/services/api';

type RegMode = 'email' | 'google';

export default function RegisterPage() {
  const { t, locale } = useLocale();
  const navigate = useNavigate();

  const [mode, setMode] = useState<RegMode | null>(null);
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
    <div className="min-h-screen bg-[#07111a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <BrandMark compact />
        </div>

        <div className="rounded-xl border border-white/8 bg-[#0b1622]/90 p-5">
          {mode === 'email' ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">{locale === 'uz' ? "Ro'yxatdan o'tish" : 'Регистрация'}</h2>
                  <p className="text-xs text-white/38">{locale === 'uz' ? "Ma'lumotlaringizni kiriting." : 'Введите свои данные.'}</p>
                </div>
                <button type="button" onClick={() => { setMode(null); setError(''); }} className="text-xs text-white/40 hover:text-white transition">{locale === 'uz' ? 'Orqaga' : 'Назад'}</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={locale === 'uz' ? 'To‘liq ism' : 'Полное имя'} className="w-full rounded-lg border border-white/8 bg-white/4 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#f97360] focus:outline-none" required />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
                  <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+998901234567" className="w-full rounded-lg border border-white/8 bg-white/4 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#f97360] focus:outline-none" required />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={locale === 'uz' ? 'Email (ixtiyoriy)' : 'Email (необязательно)'} className="w-full rounded-lg border border-white/8 bg-white/4 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#f97360] focus:outline-none" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={locale === 'uz' ? 'Parol' : 'Пароль'} minLength={6} className="w-full rounded-lg border border-white/8 bg-white/4 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#f97360] focus:outline-none" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
                  <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder={locale === 'uz' ? 'Parolni tasdiqlang' : 'Подтвердите пароль'} minLength={6} className="w-full rounded-lg border border-white/8 bg-white/4 pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:border-[#f97360] focus:outline-none" required />
                </div>

                <button type="submit" disabled={loading || !fullName || !phoneNumber || !password || password !== passwordConfirm} className="w-full rounded-lg bg-[#f97360] py-2 text-sm font-medium text-white transition hover:bg-[#e56350] disabled:opacity-50">
                  {loading ? <span className="inline-flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t('working', 'Working...')}</span> : (locale === 'uz' ? "Ro'yxatdan o'tish" : 'Зарегистрироваться')}
                </button>

                {error ? <div className="rounded-lg border border-red-500/15 bg-red-500/8 px-3 py-2 text-xs text-red-200">{error}</div> : null}

                <div className="text-center text-xs text-white/38">
                  {locale === 'uz' ? 'Akkauntingiz bormi?' : 'Уже есть аккаунт?'}{' '}
                  <Link to="/login" className="font-medium text-[#f97360] hover:underline">{locale === 'uz' ? 'Kirish' : 'Войти'}</Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-base font-semibold text-white">{locale === 'uz' ? "Ro'yxatdan o'tish" : 'Регистрация'}</h2>
              <p className="mt-1 text-xs text-white/38">{locale === 'uz' ? "Akkaunt yaratish usulini tanlang." : 'Выберите способ регистрации.'}</p>

              <div className="mt-5 space-y-2.5">
                <button type="button" onClick={() => setMode('email')} className="flex w-full items-center gap-3 rounded-lg border border-white/8 bg-white/4 px-3.5 py-2.5 text-sm text-white/70 hover:border-white/16 hover:text-white transition">
                  <Mail className="h-4 w-4 text-[#f97360]" />
                  <span>{locale === 'uz' ? 'Email orqali' : 'По Email'}</span>
                </button>

                <div className="flex justify-center">
                  <GoogleLogin
                    theme="outline"
                    size="medium"
                    shape="pill"
                    text="signup_with"
                    onSuccess={(r) => r.credential && handleGoogleSuccess(r.credential)}
                    onError={() => setError('Google auth cancelled.')}
                  />
                </div>
              </div>

              {error ? <div className="mt-3 rounded-lg border border-red-500/15 bg-red-500/8 px-3 py-2 text-xs text-red-200">{error}</div> : null}

              <div className="mt-4 text-center text-xs text-white/38">
                {locale === 'uz' ? 'Akkauntingiz bormi?' : 'Уже есть аккаунт?'}{' '}
                <Link to="/login" className="font-medium text-[#f97360] hover:underline">{locale === 'uz' ? 'Kirish' : 'Войти'}</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
