import { Menu, X } from 'lucide-react';

import waitlyLogo from '@/assets/waitly-logo.svg';
import { navItems } from '@/components/landing/moonlauncher/data';
import { Button } from '@/components/ui/button';

type Props = {
  mobileOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export function WaitlyHeader({ mobileOpen, onToggle, onClose }: Props) {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4 md:px-6">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-white/10 bg-[#081320]/84 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl md:px-5">
        <div className="flex items-center justify-between gap-4">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))]">
              <img src={waitlyLogo} alt="Waitly" className="h-7 w-7 object-contain" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black uppercase tracking-[0.28em] text-white/88">Waitly</div>
              <div className="truncate text-xs text-white/46">Restaurant operating system</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="text-sm text-white/62 transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="ghost" size="sm">
              <a href="https://reviews.moonlauncher.org" target="_blank" rel="noreferrer">
                Reviews Hub
              </a>
            </Button>
            <Button asChild size="sm">
              <a href="https://app.moonlauncher.org" target="_blank" rel="noreferrer">
                Open Waitly Control
              </a>
            </Button>
          </div>

          <button
            type="button"
            onClick={onToggle}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/6 text-white md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="mt-4 border-t border-white/10 pt-4 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/72"
                >
                  {item.label}
                </a>
              ))}
              <Button asChild variant="ghost">
                <a href="https://reviews.moonlauncher.org" target="_blank" rel="noreferrer">
                  Reviews Hub
                </a>
              </Button>
              <Button asChild>
                <a href="https://app.moonlauncher.org" target="_blank" rel="noreferrer">
                  Open Waitly Control
                </a>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
