import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, CheckCircle, Loader2, SkipForward, Store } from 'lucide-react';

import { BrandMark } from '@/components/app/BrandMark';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { authAPI } from '@/services/api';

export default function OwnerSetupPage() {
  const { locale } = useLocale();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [chainName, setChainName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [botToken, setBotToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setError('');
    if (step === 1 && !chainName.trim()) {
      setError(locale === 'uz' ? 'Tarmoq nomini kiriting.' : 'Введите название сети.');
      return;
    }
    if (step === 2 && !restaurantName.trim()) {
      setError(locale === 'uz' ? 'Restoran nomini kiriting.' : 'Введите название ресторана.');
      return;
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
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || (locale === 'uz' ? 'Saqlab bo‘lmadi.' : 'Ошибка сохранения.');
      setError(msg);
    } finally {
      setLoading(false);
    }
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
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-[#f97360]' : 'bg-white/10'}`} />
              ))}
            </div>

            {error ? <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}

            {step === 1 && (
              <div className="space-y-5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f97360]/15">
                  <Store className="h-6 w-6 text-[#f97360]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{locale === 'uz' ? 'Tarmoq nomi' : 'Название сети'}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/52">{locale === 'uz' ? 'Masalan: "Oshxona №1" yoki "Grand Restaurants"' : 'Например: «Oshxona №1» или «Grand Restaurants»'}</p>
                </div>
                <input
                  value={chainName}
                  onChange={e => setChainName(e.target.value)}
                  placeholder={locale === 'uz' ? 'Tarmoq nomi' : 'Название сети'}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
                  autoFocus
                />
                <Button onClick={handleNext} className="w-full">{locale === 'uz' ? 'Davom etish' : 'Продолжить'} <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f97360]/15">
                  <Store className="h-6 w-6 text-[#f97360]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{locale === 'uz' ? 'Birinchi restoran' : 'Первый ресторан'}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/52">{locale === 'uz' ? 'Tarmoqdagi birinchi restoran nomi.' : 'Название первого ресторана в сети.'}</p>
                </div>
                <input
                  value={restaurantName}
                  onChange={e => setRestaurantName(e.target.value)}
                  placeholder={locale === 'uz' ? 'Restoran nomi' : 'Название ресторана'}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" />{locale === 'uz' ? 'Orqaga' : 'Назад'}</Button>
                  <Button onClick={handleNext} className="flex-1">{locale === 'uz' ? 'Davom etish' : 'Продолжить'} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/15">
                  <Bot className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{locale === 'uz' ? 'Bot token (ixtiyoriy)' : 'Bot token (необязательно)'}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/52">{locale === 'uz' ? 'Telegram bot tokeni orqali ofitsiantlar va oshxona xabarlarni olishi mumkin.' : 'Через Telegram бот официанты и кухня смогут получать уведомления.'}</p>
                </div>
                <input
                  value={botToken}
                  onChange={e => setBotToken(e.target.value)}
                  placeholder="123456:ABCdef..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="mr-2 h-4 w-4" />{locale === 'uz' ? 'Orqaga' : 'Назад'}</Button>
                  <Button onClick={() => handleSubmit(true)} variant="secondary" className="flex-1" disabled={loading}>
                    <SkipForward className="mr-2 h-4 w-4" />{locale === 'uz' ? 'O‘tkazib yuborish' : 'Пропустить'}
                  </Button>
                  <Button onClick={() => handleSubmit(false)} className="flex-1" disabled={loading || !botToken.trim()}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    {locale === 'uz' ? 'Tayyor' : 'Готово'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
