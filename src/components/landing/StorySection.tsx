import { featureGrid, surfaceCards } from '@/components/landing/data';
import { FeatureTile, SurfaceCard } from '@/components/landing/LandingPrimitives';

export function StorySection() {
  return (
    <section className="mt-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[34px] border border-black/8 bg-white px-6 py-7 shadow-[0_20px_70px_rgba(17,17,17,0.05)] md:px-8 md:py-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/36">Positioning</div>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-[#151515] md:text-4xl">
          Built for operators, not for demo theater.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-black/64">
          Waitly ties together the internal engine of a restaurant and the external perception of that restaurant.
          That is the whole point: operational clarity inside, trust and taste outside.
        </p>

        <div className="mt-6 grid gap-3">
          {featureGrid.map((item) => (
            <FeatureTile key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {surfaceCards.map((card) => (
          <SurfaceCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            body={card.body}
            href={card.href}
            cta={card.cta}
            accent={card.accent}
          />
        ))}
      </div>
    </section>
  );
}
