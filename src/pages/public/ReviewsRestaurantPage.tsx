import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Camera, ChevronLeft, ChevronRight, Clock3, ExternalLink, MapPin, MessageCircle, Phone, Send, Share2, Sparkles, Star, Store } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { VideoSplashLoader } from '@/components/app/VideoSplashLoader';
import { AnimatedWaitlyLogo } from '@/components/public/AnimatedWaitlyLogo';
import { SmartImage } from '@/components/public/SmartImage';
import { publicAPI, type PublicGalleryItem, type PublicMenuPreviewItem, type PublicReviewEntry, type ReviewsRestaurantResponse } from '@/services/api';

const scoreRows = [
  { key: 'food', label: 'Food' },
  { key: 'service_speed', label: 'Service speed' },
  { key: 'waiter', label: 'Waiter' },
  { key: 'waitly', label: 'Waitly' },
] as const;

const tabs = ['overview', 'menu', 'photos', 'reviews', 'features'] as const;
type TabId = typeof tabs[number];

function parseIngredients(value?: string | null) {
  return (value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export default function ReviewsRestaurantPage() {
  const { restaurantSubdomain, chainSubdomain, restaurantSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const [data, setData] = useState<ReviewsRestaurantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared'>('idle');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    const request = restaurantSubdomain
      ? publicAPI.reviewsRestaurantBySubdomain(restaurantSubdomain, page)
      : publicAPI.reviewsRestaurantByChain(chainSubdomain || '', restaurantSlug || '', page);

    request
      .then((response) => {
        if (!active) return;
        setData(response.data);
        setLoading(false);
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.response?.data?.error?.message || 'Failed to load restaurant reviews.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [restaurantSubdomain, chainSubdomain, restaurantSlug, page]);

  const restaurant = data?.restaurant;
  const reviews = data?.reviews || [];
  const pagination = data?.pagination;
  const breakdown = data?.rating_breakdown;
  const menuPreview = data?.menu_preview || [];
  const gallery = data?.gallery || [];

  const averageBreakdown = useMemo(() => {
    if (!breakdown) return [];
    return scoreRows.map((row) => ({
      ...row,
      value: breakdown[row.key],
    }));
  }, [breakdown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id && tabs.includes(visible.target.id as TabId)) {
          setActiveTab(visible.target.id as TabId);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.45, 0.7] },
    );

    tabs.forEach((tab) => {
      const element = document.getElementById(tab);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [restaurant?.id, gallery.length, menuPreview.length, reviews.length]);

  const coverUrl = restaurant?.cover_url;

  const handleShare = async () => {
    if (!restaurant) return;
    const shareUrl = restaurant.review_url || window.location.href;
    const shareData = {
      title: restaurant.name,
      text: restaurant.review_short_description || `${restaurant.name} on Waitly reviews`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareState('shared');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareState('copied');
      } else {
        window.prompt('Copy this link', shareUrl);
        setShareState('copied');
      }
      window.setTimeout(() => setShareState('idle'), 2200);
    } catch (shareError: any) {
      if (shareError?.name === 'AbortError') return;
      setShareState('copied');
      window.setTimeout(() => setShareState('idle'), 2200);
    }
  };

  const jumpTo = (section: TabId) => {
    setActiveTab(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[#eef2f5] text-slate-900">
      <div className="mx-auto max-w-[1340px] px-4 py-4 lg:px-6 lg:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.04)] transition hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            Back to reviews hub
          </Link>
          <AnimatedWaitlyLogo label="Maps-style review layer" />
        </div>

        {loading ? <VideoSplashLoader compact className="mt-4 min-h-[420px]" title="Loading restaurant review card" subtitle="Preparing the hero card, menu preview, gallery, and published feedback." /> : null}
        {!loading && error ? <div className="mt-4 rounded-[28px] border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700">{error}</div> : null}

        {!loading && restaurant ? (
          <>
            <section className="mt-4 overflow-hidden rounded-[36px] border border-slate-200/80 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.08)]">
              <div className="relative h-[250px] md:h-[320px]">
                <SmartImage
                  src={coverUrl}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                  fallback={<div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.secondary_color})` }} />}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.72))]" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div className="flex flex-col gap-4 rounded-[30px] border border-white/15 bg-white/96 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)] md:flex-row md:items-end md:justify-between md:p-5">
                    <div className="flex items-start gap-4">
                      <div className="h-22 w-22 flex-shrink-0 overflow-hidden rounded-[26px] border border-slate-200 bg-slate-100 shadow-[0_20px_40px_rgba(15,23,42,0.12)] md:h-24 md:w-24">
                        <SmartImage
                          src={restaurant.logo_url}
                          alt={restaurant.name}
                          className="h-full w-full object-cover"
                          fallback={<div className="grid h-full w-full place-items-center text-white" style={{ background: `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.secondary_color})` }}><Store className="h-8 w-8" /></div>}
                        />
                      </div>

                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#2563eb]">{restaurant.review_category || 'Restaurant profile'}</div>
                        <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950 md:text-4xl">{restaurant.name}</h1>
                        <div className="mt-2 text-sm text-slate-500">{restaurant.review_short_description || restaurant.chain_name || 'Restaurant profile in the reviews atlas'}</div>
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-700">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {restaurant.average_rating.toFixed(1)}
                          </span>
                          <span>{restaurant.published_reviews_count} reviews</span>
                          {restaurant.working_hours_text ? <span>{restaurant.working_hours_text}</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {restaurant.menu_url ? <a href={restaurant.menu_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"><Store className="h-4 w-4" /> Menu</a> : null}
                      <button type="button" onClick={() => void handleShare()} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                        <Share2 className="h-4 w-4" />
                        {shareState === 'copied' ? 'Link copied' : shareState === 'shared' ? 'Shared' : 'Share'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 px-4 py-3 md:px-6">
                <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-600">
                  <TabButton active={activeTab === 'overview'} onClick={() => jumpTo('overview')}>Overview</TabButton>
                  <TabButton active={activeTab === 'menu'} onClick={() => jumpTo('menu')}>Menu</TabButton>
                  <TabButton active={activeTab === 'photos'} onClick={() => jumpTo('photos')}>Photos {gallery.length ? <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{gallery.length}</span> : null}</TabButton>
                  <TabButton active={activeTab === 'reviews'} onClick={() => jumpTo('reviews')}>Reviews {pagination?.total_reviews ? <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{pagination.total_reviews}</span> : null}</TabButton>
                  <TabButton active={activeTab === 'features'} onClick={() => jumpTo('features')}>Features</TabButton>
                </div>
              </div>
            </section>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-4">
                <div id="overview"><BusinessOverview restaurant={restaurant} /></div>
                <div id="menu"><MenuSection items={menuPreview} menuUrl={restaurant.menu_url} /></div>
                <div id="photos"><GallerySection items={gallery} /></div>
                <InfoSection restaurant={restaurant} />
                <div id="features"><FeaturesSection features={restaurant.features || []} /></div>
              </section>

              <aside id="reviews" className="space-y-4 xl:sticky xl:top-4 xl:self-start">
                <MapCard restaurant={restaurant} />
                <section className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                  <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">Rating breakdown</div>
                  <div className="mt-4 space-y-3">
                    {averageBreakdown.map((row) => (
                      <div key={row.key}>
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                          <span>{row.label}</span>
                          <span>{row.value.toFixed(1)}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#38bdf8)]" style={{ width: `${Math.min(100, (row.value / 5) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">Guest reviews</div>
                      <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">Published comments</h2>
                    </div>
                    {pagination ? <div className="text-sm text-slate-500">{pagination.total_reviews}</div> : null}
                  </div>

                  <div className="mt-4 space-y-3">
                    {reviews.length ? reviews.map((review) => <ReviewDetailCard key={review.id} review={review} compact />) : <EmptyBlock label="No published reviews yet" description="When customers leave reviews after delivered orders, they will appear here." />}
                  </div>

                  {pagination ? (
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={!pagination.has_previous}
                        onClick={() => setSearchParams(pagination.has_previous ? { page: String(page - 1) } : searchParams)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" /> Prev
                      </button>
                      <div className="text-sm text-slate-500">{pagination.page}/{pagination.pages}</div>
                      <button
                        type="button"
                        disabled={!pagination.has_next}
                        onClick={() => setSearchParams(pagination.has_next ? { page: String(page + 1) } : searchParams)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </section>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={`pb-2 transition ${active ? 'border-b-2 border-[#2563eb] text-[#2563eb]' : 'hover:text-slate-900'}`}>{children}</button>;
}

function BusinessOverview({ restaurant }: { restaurant: ReviewsRestaurantResponse['restaurant'] }) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="grid gap-4 md:grid-cols-3">
        <MiniStat label="Rating" value={`${restaurant.average_rating.toFixed(1)} / 5`} />
        <MiniStat label="Reviews" value={String(restaurant.published_reviews_count)} />
        <MiniStat label="Average check" value={restaurant.average_check_text || 'Not set'} />
      </div>
      <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600">
        {restaurant.review_short_description || 'This restaurant profile is manually curated by the owner for the public reviews hub.'}
      </div>
    </section>
  );
}

function GallerySection({ items }: { items: PublicGalleryItem[] }) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">Photos</div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">Gallery</h2>
        </div>
        <div className="text-sm text-slate-500">{items.length} photos</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.length ? items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
            <SmartImage src={item.image_url} alt={item.name} className="h-36 w-full object-cover" fallback={<div className="grid h-36 place-items-center bg-slate-100 text-slate-400"><Camera className="h-6 w-6" /></div>} />
            <div className="px-3 py-3 text-sm font-semibold text-slate-700">{item.name}</div>
          </div>
        )) : <EmptyBlock label="No gallery yet" description="Dish photos will appear here when the owner uploads menu images." />}
      </div>
    </section>
  );
}

function MenuSection({ items, menuUrl }: { items: PublicMenuPreviewItem[]; menuUrl?: string | null }) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">Menu</div>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">Popular dishes</h2>
        </div>
        {menuUrl ? <a href={menuUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb]"><ExternalLink className="h-4 w-4" /> Open full menu</a> : null}
      </div>
      <div className="mt-4 grid gap-3">
        {items.length ? items.slice(0, 4).map((item) => (
          <div key={item.id} className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-[190px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[20px] bg-slate-100">
              <SmartImage src={item.image_url} alt={item.name} className="h-32 w-full object-cover" fallback={<div className="grid h-32 place-items-center text-slate-400"><Store className="h-6 w-6" /></div>} />
            </div>
            <div>
              <div className="text-xl font-black tracking-[-0.04em] text-slate-950">{item.name}</div>
              <div className="mt-2 text-sm text-slate-500">{item.description || 'Menu preview item from this restaurant.'}</div>
              <IngredientChips ingredients={item.ingredients} />
              <div className="mt-4 text-lg font-bold text-slate-950">{item.price} so'm</div>
            </div>
          </div>
        )) : <EmptyBlock label="Menu preview is empty" description="As soon as the owner adds dishes or photos, this block will start looking like a maps business card." />}
      </div>
    </section>
  );
}

function InfoSection({ restaurant }: { restaurant: ReviewsRestaurantResponse['restaurant'] }) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">Details</div>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">Contacts and address</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoCard icon={MapPin} title="Address" value={restaurant.address || 'Address not set yet'} actionHref={restaurant.map_link || ''} actionLabel={restaurant.map_link ? 'Open map' : ''} />
        <InfoCard icon={Phone} title="Contacts" value={restaurant.phone_number || 'Phone not set yet'} actionHref={restaurant.phone_number ? `tel:${restaurant.phone_number}` : ''} actionLabel={restaurant.phone_number ? 'Call' : ''} />
        <InfoCard icon={Clock3} title="Working hours" value={restaurant.working_hours_text || 'Hours not set yet'} />
        <InfoCard icon={Sparkles} title="About" value={restaurant.review_category || 'Restaurant profile'} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {restaurant.telegram_url ? <SocialPill href={restaurant.telegram_url} icon={Send} label="Telegram" /> : null}
        {restaurant.whatsapp_url ? <SocialPill href={restaurant.whatsapp_url} icon={MessageCircle} label="WhatsApp" /> : null}
        {restaurant.instagram_url ? <SocialPill href={restaurant.instagram_url} icon={Camera} label="Instagram" /> : null}
      </div>
    </section>
  );
}

function FeaturesSection({ features }: { features: string[] }) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">Features</div>
      <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">What guests should know</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {features.length ? features.map((feature) => (
          <div key={feature} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">{feature}</div>
        )) : <EmptyBlock label="No features yet" description="Owner can manually add delivery, coffee to go, pet friendly and other details." />}
      </div>
    </section>
  );
}

function MapCard({ restaurant }: { restaurant: ReviewsRestaurantResponse['restaurant'] }) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="relative h-[250px] bg-[linear-gradient(180deg,#f7fafc_0%,#e9eff4_100%)]">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-[26px] border border-white bg-white px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.secondary_color})` }}>
                <MapPin className="h-5 w-5" />
              </div>
              <div className="max-w-[180px]">
                <div className="text-sm font-black tracking-[-0.03em] text-slate-950">{restaurant.name}</div>
                <div className="mt-1 text-xs text-slate-500">{restaurant.address || 'Address not set yet'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-slate-400">Map preview</div>
        <div className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">Business pin</div>
        <div className="mt-3 text-sm leading-7 text-slate-600">The page keeps the maps feeling, but without a heavy map engine or routing widget.</div>
        {restaurant.map_link ? <a href={restaurant.map_link} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white"><ExternalLink className="h-4 w-4" /> Open location</a> : null}
      </div>
    </section>
  );
}

function IngredientChips({ ingredients }: { ingredients?: string | null }) {
  const items = parseIngredients(ingredients);
  if (!items.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">{item}</span>
      ))}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</div>
      <div className="mt-3 text-2xl font-black tracking-[-0.05em] text-slate-950">{value}</div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, actionHref, actionLabel }: { icon: any; title: string; value: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <div className="text-[11px] font-bold uppercase tracking-[0.24em]">{title}</div>
      </div>
      <div className="mt-3 text-sm leading-7 text-slate-700">{value}</div>
      {actionHref && actionLabel ? <a href={actionHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb]">{actionLabel}</a> : null}
    </div>
  );
}

function SocialPill({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
}

function ReviewDetailCard({ review, compact = false }: { review: PublicReviewEntry; compact?: boolean }) {
  return (
    <article className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-black tracking-[-0.04em] text-slate-950">{review.author_name}</div>
          <div className="mt-1 text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
          <Star className="h-3.5 w-3.5 fill-current" />
          {review.average_rating}
        </div>
      </div>

      <p className={`mt-4 text-sm leading-7 text-slate-600 ${compact ? 'line-clamp-5' : ''}`}>{review.comment}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 md:grid-cols-4">
        <TinyMetric label="Food" value={review.ratings.food} />
        <TinyMetric label="Speed" value={review.ratings.service_speed} />
        <TinyMetric label="Waiter" value={review.ratings.waiter} />
        <TinyMetric label="Waitly" value={review.ratings.waitly} />
      </div>
    </article>
  );
}

function TinyMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-3 py-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-2 text-base font-black text-slate-900">{value}.0</div>
    </div>
  );
}

function EmptyBlock({ label, description }: { label: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
      <div className="font-semibold text-slate-700">{label}</div>
      <div className="mt-2 leading-7">{description}</div>
    </div>
  );
}




