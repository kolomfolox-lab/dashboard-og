import { surfaces } from '@/components/landing/moonlauncher/data';
import { SectionEyebrow } from '@/components/landing/moonlauncher/SectionEyebrow';
import { SurfaceCard } from '@/components/landing/moonlauncher/SurfaceCard';

export function MoonlauncherSurfaces() {
  return (
    <section id="surfaces" className="grid gap-5 rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <SectionEyebrow>Product surfaces</SectionEyebrow>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white md:text-5xl">
            Each route should have one obvious job.
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-white/64">
          That is how Moonlauncher avoids feeling like generic restaurant software.
          The system stays premium when marketing, operations, public trust, and developer reference do not compete in the same interface.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {surfaces.map((surface) => (
          <SurfaceCard key={surface.host} {...surface} />
        ))}
      </div>
    </section>
  );
}
