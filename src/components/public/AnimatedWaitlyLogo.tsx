import waitlyLogo from '@/assets/waitly-logo.webp';

export function AnimatedWaitlyLogo({ label = 'Powered by Waitly' }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/92 px-3 py-2 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <style>{`@keyframes waitlyLogoFloat { 0% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-4px) scale(1.03); } 100% { transform: translateY(0px) scale(1); } } @keyframes waitlyLogoPulse { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.22); } 70% { box-shadow: 0 0 0 12px rgba(37,99,235,0); } 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); } }`}</style>
      <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_top,#60a5fa,#1d4ed8_58%,#0f172a)]" style={{ animation: 'waitlyLogoPulse 3.2s ease-out infinite' }}>
        <img src={waitlyLogo} alt="Waitly" className="h-10 w-10 object-contain" style={{ animation: 'waitlyLogoFloat 4.8s ease-in-out infinite' }} />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Waitly</div>
        <div className="text-sm font-semibold text-slate-700">{label}</div>
      </div>
    </div>
  );
}
