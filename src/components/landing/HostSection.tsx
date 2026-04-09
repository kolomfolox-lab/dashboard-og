import { hostRows } from '@/components/landing/data';
import { HostPanel, LandingSection } from '@/components/landing/LandingPrimitives';

export function HostSection() {
  return (
    <LandingSection className="mt-4 bg-[#111111] px-6 py-8 text-white shadow-[0_24px_90px_rgba(17,17,17,0.14)] md:px-8 md:py-9">
      <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/38">Host architecture</div>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] md:text-4xl">
            One brand.
            <br />
            Multiple clear jobs.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-8 text-white/62">
            Each host should have a single obvious purpose. That is how the product stays understandable,
            premium, and fast to use.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {hostRows.map((row) => (
            <HostPanel
              key={row.host}
              host={row.host}
              title={row.title}
              body={row.body}
              icon={row.icon}
            />
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
