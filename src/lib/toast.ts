let toastId = 0;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const id = `waitly-toast-${++toastId}`;
  const colors = {
    success: { border: 'border-emerald-500/25', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', dot: 'bg-emerald-400' },
    error: { border: 'border-red-500/25', bg: 'bg-red-500/10', icon: 'text-red-400', dot: 'bg-red-400' },
    info: { border: 'border-[#8fd4ff]/25', bg: 'bg-[#8fd4ff]/10', icon: 'text-[#8fd4ff]', dot: 'bg-[#8fd4ff]' },
  };
  const c = colors[type];
  const el = document.createElement('div');
  el.id = id;
  el.className = `pointer-events-auto fixed bottom-8 right-8 z-[200] flex w-80 items-start gap-4 rounded-3xl border ${c.border} ${c.bg} p-5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out translate-y-4 opacity-0`;
  el.innerHTML = `<div class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-current/20 ${c.icon}"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div><div class="text-xs font-bold uppercase tracking-widest text-white/50">Waitly.uz</div><p class="mt-1 text-sm leading-relaxed text-white/80">${message}</p></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.remove('translate-y-4', 'opacity-0');
    el.classList.add('translate-y-0', 'opacity-100');
  });
  setTimeout(() => {
    el.classList.remove('translate-y-0', 'opacity-100');
    el.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => el.remove(), 500);
  }, 4000);
}
