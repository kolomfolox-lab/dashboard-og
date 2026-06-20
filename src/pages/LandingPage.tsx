import { useState } from 'react';

import { WaitlyArchitecture } from '@/components/landing/moonlauncher/MoonlauncherArchitecture';
import { WaitlyFinalCta } from '@/components/landing/moonlauncher/MoonlauncherFinalCta';
import { WaitlyHeader } from '@/components/landing/moonlauncher/MoonlauncherHeader';
import { WaitlyHero } from '@/components/landing/moonlauncher/MoonlauncherHero';
import { WaitlyMetrics } from '@/components/landing/moonlauncher/MoonlauncherMetrics';
import { WaitlyProof } from '@/components/landing/moonlauncher/MoonlauncherProof';
import { WaitlySurfaces } from '@/components/landing/moonlauncher/MoonlauncherSurfaces';

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#06111c] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,146,99,0.22),transparent_28%),radial-gradient(circle_at_80%_12%,rgba(81,182,255,0.18),transparent_20%),linear-gradient(180deg,#06111c_0%,#091623_32%,#08131d_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35 [mask-image:radial-gradient(circle_at_center,black_44%,transparent_100%)]" />
      </div>

      <WaitlyHeader
        mobileOpen={mobileOpen}
        onToggle={() => setMobileOpen((value) => !value)}
        onClose={() => setMobileOpen(false)}
      />

      <main id="top" className="relative mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-10 pt-5 md:px-6 md:pb-16 md:pt-8">
        <WaitlyHero />
        <WaitlyMetrics />
        <WaitlySurfaces />
        <WaitlyArchitecture />
        <WaitlyProof />
        <WaitlyFinalCta />
      </main>
    </div>
  );
}
