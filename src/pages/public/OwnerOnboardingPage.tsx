import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, CheckCircle, Hash, Store, Bot, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BrandMark } from '@/components/app/BrandMark';
import { Button } from '@/components/ui/button';

const BASE = import.meta.env.VITE_API_BASE_URL || '';

type OnboardingStep = 'welcome' | 'name' | 'chain' | 'bot_token' | 'success';

interface InviteData {
  full_name: string;
  email: string;
}

export default function OwnerOnboardingPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState('');
  const [isChain, setIsChain] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [botName, setBotName] = useState('');
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${BASE}/api/owner/onboarding/${token}/`, { headers: { Accept: 'application/json' } })
      .then((r) => {
        if (!r.ok) throw new Error('Invalid or expired link');
        return r.json();
      })
      .then((data: InviteData) => {
        setInvite(data);
        setLoading(false);
      })
      .catch(() => {
        setError('This invitation link is invalid or expired.');
        setLoading(false);
      });
  }, [token]);

  const submitOnboarding = async () => {
    if (!token || !restaurantName) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${BASE}/api/owner/onboarding/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          restaurant_name: restaurantName,
          is_chain: isChain,
          staff_bot_token: botToken,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Something went wrong');
      if (data.bot_name) setBotName(data.bot_name);
      setStep('success');
    } catch (e: any) {
      setError(e.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111d]">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (error && !invite) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111d] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-red-500/20 bg-[#0d1825] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-red-500/20 bg-red-500/10">
            <Hash className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="mt-6 text-2xl font-black tracking-[-0.05em] text-white">Link Expired or Invalid</h1>
          <p className="mt-3 text-sm leading-7 text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111d] text-white">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-12">
        <BrandMark className="mb-12" />

        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="flex flex-1 flex-col justify-center">
              <div className="rounded-[32px] border border-white/10 bg-[#0d1825] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                  <CheckCircle className="h-7 w-7 text-emerald-400" />
                </div>
                <h1 className="mt-6 text-2xl font-black tracking-[-0.05em]">
                  Welcome, {invite?.full_name || 'Owner'}!
                </h1>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  You've been invited to join <strong className="text-white/90">Waitly</strong>. Let's set up your restaurant in just a few steps.
                </p>
                <p className="mt-2 text-sm text-white/40">
                  Invited as: <span className="text-white/70">{invite?.email}</span>
                </p>
                <Button onClick={() => setStep('name')} className="mt-8 w-full rounded-2xl py-6 text-base font-semibold">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'name' && (
            <motion.div key="name" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="flex flex-1 flex-col justify-center">
              <div className="rounded-[32px] border border-white/10 bg-[#0d1825] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-sky-500/20 bg-sky-500/10">
                  <Store className="h-7 w-7 text-sky-400" />
                </div>
                <h1 className="mt-6 text-2xl font-black tracking-[-0.05em]">What's your restaurant called?</h1>
                <p className="mt-3 text-sm leading-7 text-white/60">This will appear on your online menu, QR codes, and in the Waitly dashboard.</p>
                <div className="mt-6">
                  <input
                    autoFocus
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && restaurantName && setStep('chain')}
                    placeholder="e.g. Tokyo Ramen House"
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-lg outline-none transition focus:border-sky-500/50 focus:bg-black/50"
                  />
                </div>
                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
                <div className="mt-8 flex gap-3">
                  <Button variant="ghost" onClick={() => setStep('welcome')} className="rounded-2xl px-5">Back</Button>
                  <Button
                    disabled={!restaurantName}
                    onClick={() => setStep('chain')}
                    className="flex-1 rounded-2xl py-6 text-base font-semibold"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'chain' && (
            <motion.div key="chain" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="flex flex-1 flex-col justify-center">
              <div className="rounded-[32px] border border-white/10 bg-[#0d1825] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
                  <Hash className="h-7 w-7 text-violet-400" />
                </div>
                <h1 className="mt-6 text-2xl font-black tracking-[-0.05em]">Single restaurant or a chain?</h1>
                <p className="mt-3 text-sm leading-7 text-white/60">Is this a single location, or will you manage multiple branches?</p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setIsChain(false); setStep('bot_token'); }}
                    className={`rounded-2xl border p-6 text-left transition ${
                      !isChain ? 'border-sky-500/50 bg-sky-500/10' : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <Store className={`h-6 w-6 ${!isChain ? 'text-sky-400' : 'text-white/40'}`} />
                    <div className="mt-3 text-sm font-semibold">Single Restaurant</div>
                    <div className="mt-1 text-xs text-white/40">Just one location</div>
                  </button>
                  <button
                    onClick={() => { setIsChain(true); setStep('bot_token'); }}
                    className={`rounded-2xl border p-6 text-left transition ${
                      isChain ? 'border-sky-500/50 bg-sky-500/10' : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                  >
                    <Hash className={`h-6 w-6 ${isChain ? 'text-sky-400' : 'text-white/40'}`} />
                    <div className="mt-3 text-sm font-semibold">Chain</div>
                    <div className="mt-1 text-xs text-white/40">Multiple branches</div>
                  </button>
                </div>
                <div className="mt-4">
                  <Button variant="ghost" onClick={() => setStep('name')} className="rounded-2xl px-5">Back</Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'bot_token' && (
            <motion.div key="bot_token" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} className="flex flex-1 flex-col justify-center">
              <div className="rounded-[32px] border border-white/10 bg-[#0d1825] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                  <Bot className="h-7 w-7 text-emerald-400" />
                </div>
                <h1 className="mt-6 text-2xl font-black tracking-[-0.05em]">Staff Bot Token</h1>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  Create any bot on Telegram via <strong className="text-white/80">@BotFather</strong> and paste its token here. Waitly will automatically configure it.
                </p>
                <div className="mt-6">
                  <input
                    autoFocus
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && botToken}
                    placeholder="1234567890:AA..."
                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm outline-none transition focus:border-emerald-500/50 focus:bg-black/50"
                  />
                </div>
                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
                <div className="mt-8 flex gap-3">
                  <Button variant="ghost" onClick={() => setStep('chain')} className="rounded-2xl px-5">Back</Button>
                  <Button
                    disabled={!botToken || submitting}
                    onClick={submitOnboarding}
                    className="flex-1 rounded-2xl py-6 text-base font-semibold"
                  >
                    {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <>Complete Setup <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-1 flex-col justify-center">
              <div className="rounded-[32px] border border-emerald-500/20 bg-[#0d1825] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                  <Check className="h-8 w-8 text-emerald-400" />
                </div>
                <h1 className="mt-6 text-3xl font-black tracking-[-0.05em]">You're all set!</h1>
                <p className="mt-3 text-sm leading-7 text-white/60">
                  <strong className="text-white/90">{restaurantName}</strong> is ready to go.
                </p>
                {botName && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3">
                    <Bot className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-300">{botName}</span>
                  </div>
                )}
                <p className="mt-6 text-sm text-white/40">You can now log in to the admin panel with your phone number.</p>
                <Button onClick={() => navigate('/login')} className="mt-6 w-full rounded-2xl py-6 text-base font-semibold">
                  Go to Login
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto pt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            {['welcome', 'name', 'chain', 'bot_token'].map((s, i) => {
              const steps = ['welcome', 'name', 'chain', 'bot_token'];
              const currentIdx = steps.indexOf(step);
              const idx = steps.indexOf(s);
              return (
                <div
                  key={s}
                  className={`rounded-full transition-all duration-300 ${
                    idx < currentIdx ? 'h-1.5 w-1.5 bg-emerald-400' : idx === currentIdx ? 'h-1.5 w-6 bg-sky-400' : 'h-1.5 w-1.5 bg-white/10'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
