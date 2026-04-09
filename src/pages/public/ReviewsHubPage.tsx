import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Building2, MapPin, MessageSquare, Phone, RefreshCcw, Route, Search, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { VideoSplashLoader } from '@/components/app/VideoSplashLoader';
import { publicAPI, type PublicRestaurantCard, type PublicReviewEntry, type ReviewsHubResponse } from '@/services/api';

const markerSlots = [
  { top: '12%', left: '16%' },
  { top: '18%', left: '54%' },
  { top: '25%', left: '74%' },
  { top: '39%', left: '28%' },
  { top: '46%', left: '62%' },
  { top: '58%', left: '18%' },
  { top: '68%', left: '48%' },
  { top: '74%', left: '76%' },
  { top: '30%', left: '8%' },
  { top: '12%', left: '84%' },
  { top: '56%', left: '84%' },
  { top: '80%', left: '30%' },
];

export default function ReviewsHubPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const [data, setData] = useState<ReviewsHubResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    publicAPI.reviewsHub(deferredQuery || undefined)
      .then((response) => {
        if (!active) return;
        startTransition(() => {
          setData(response.data);
          setLoading(false);
        });
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.response?.data?.error?.message || 'Failed to load the reviews hub.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [deferredQuery]);

  const restaurants = data?.restaurants || [];
  const featuredReviews = data?.featured_reviews || [];
  const highlightedRestaurants = useMemo(() => restaurants.slice(0, 12), [restaurants]);

  return (
    <div className="min-h-screen bg-[#edf2f6] text-slate-900">
      <div className="mx-auto max-w-[1720px] px-4 py-4 lg:px-6 lg:py-5">
        <header className="rounded-[34px] border border-slate-200/80 bg-white/90 px-5 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:px-7 xl:py-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0f766e]/15 bg-[#0f766e]/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.32em] text-[#0f766e]">
                <Route className="h-4 w-4" />
                Moonlauncher Reviews Atlas
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-slate-950 md:text-[4.25rem]">
                Public review board for restaurants that already shipped real orders.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-[15px]">
                Map-style discovery surface for all published restaurant reviews. No heavy map engine here, just a fast React directory with a familiar navigator feel.
              </p>
            </div>

            <div className="grid gap-3 md:min-w-[360px] md:grid-cols-3 xl:max-w-[520px]">
              <HeroStat label="Published reviews" value={String(data?.hero_stats.total_reviews || 0)} />
              <HeroStat label="Restaurants" value={String(data?.hero_stats.restaurants_count || 0)} />
              <HeroStat label="Average rating" value={`${data?.hero_stats.average_rating || 0}`} accent />
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[410px_minmax(0,1fr)]">
          <aside className="rounded-[30px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.06)] xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:overflow-hidden xl:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Directory</div>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.05em]">Restaurants</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  publicAPI.reviewsHub(deferredQuery || undefined)
                    .then((response) => {
                      setData(response.data);
                      setLoading(false);
                    })
                    .catch((err: any) => {
                      setError(err?.response?.data?.error?.message || 'Refresh failed.');
                      setLoading(false);
                    });
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
            </div>

            <label className="mt-4 flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => setQuery(nextValue));
                }}
                placeholder="Search restaurant by name"
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <InfoBadge icon={Sparkles} label="Fast UI" value="React" tone="emerald" />
              <InfoBadge icon={Building2} label="Places" value={String(restaurants.length)} tone="amber" />
              <InfoBadge icon={MessageSquare} label="Live feed" value={String(featuredReviews.length)} tone="sky" />
            </div>

            <div className="mt-4 space-y-3 xl:max-h-[calc(100vh-22rem)] xl:overflow-y-auto xl:pr-1">
              {loading ? <VideoSplashLoader compact className="min-h-[360px]" title="Loading reviews atlas" subtitle="Pulling restaurant cards, feed, and the public review layer." /> : null}
              {!loading && error ? (
                <div className="rounded-[24px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">{error}</div>
              ) : null}
              {!loading && !error && restaurants.length === 0 ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No restaurants matched this search yet.
                </div>
              ) : null}
              {!loading && !error && restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} compact />
              ))}
            </div>
          </aside>

          <section className="grid gap-4">
            <div className="relative overflow-hidden rounded-[34px] border border-slate-200/80 bg-[linear-gradient(180deg,#f8fbfd_0%,#eef4f7_100%)] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.1),transparent_26%)]" />
              <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)', backgroundSize: '58px 58px' }} />
              <div className="relative">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#0f766e]">Map preview</div>
                    <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-950">A navigator-like board without a real map engine.</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                      The right side behaves like a city review board: pinned restaurants, quick metadata, and a route-oriented visual hierarchy inspired by familiar map products.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/80 bg-white/82 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                    <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Coverage</div>
                    <div className="mt-2 text-3xl font-black tracking-[-0.06em]">{restaurants.length}</div>
                    <div className="mt-1 text-sm text-slate-500">reviewable restaurant surfaces</div>
                  </div>
                </div>

                <div className="relative mt-6 min-h-[460px] overflow-hidden rounded-[28px] border border-white/80 bg-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <div className="absolute left-8 top-8 right-8 flex flex-wrap gap-3">
                    <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white">Review layer</div>
                    <div className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">Static city mode</div>
                    <div className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">No routing engine</div>
                  </div>

                  <div className="absolute inset-0">
                    {highlightedRestaurants.map((restaurant, index) => {
                      const slot = markerSlots[index % markerSlots.length];
                      return (
                        <Link
                          key={restaurant.id}
                          to={restaurant.review_path}
                          className="group absolute"
                          style={slot}
                        >
                          <div className="rounded-[24px] border border-white/90 bg-white px-3 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.12)] transition group-hover:-translate-y-1 group-hover:shadow-[0_18px_48px_rgba(15,23,42,0.18)]">
                            <div className="flex items-start gap-3">
                              <div className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]" style={{ background: `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.secondary_color})` }}>
                                <MapPin className="h-5 w-5" />
                              </div>
                              <div className="min-w-[160px] max-w-[220px]">
                                <div className="text-sm font-black tracking-[-0.03em] text-slate-900">{restaurant.name}</div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                  <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
                                  {restaurant.average_rating}
                                  <span>·</span>
                                  {restaurant.published_reviews_count} reviews
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-[32px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)] md:p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">Latest feed</div>
                    <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">Recent published comments</h3>
                  </div>
                  <div className="text-sm text-slate-500">{featuredReviews.length} cards</div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {featuredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,#15202b_0%,#0f1722_100%)] p-5 text-white shadow-[0_30px_90px_rgba(15,23,42,0.16)]">
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#8fd4ff]">Design note</div>
                <h3 className="mt-3 text-3xl font-black tracking-[-0.05em]">Maps feel, not maps complexity.</h3>
                <p className="mt-4 text-sm leading-7 text-white/64">
                  This public frontend keeps the mental model people know from 2GIS, Yandex Maps, and Google Maps: directory on the left, spatial stage on the right, strong scanability, and fast drill-down.
                </p>

                <div className="mt-5 grid gap-3">
                  <DarkCallout label="Layout" value="Split explorer with list + map board" />
                  <DarkCallout label="Performance" value="React + lightweight JSON APIs" />
                  <DarkCallout label="Data source" value="Restaurants, menu settings, published reviews" />
                </div>

                <div className="mt-5 space-y-3">
                  {highlightedRestaurants.slice(0, 3).map((restaurant) => (
                    <Link key={restaurant.id} to={restaurant.review_path} className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-4 transition hover:bg-white/[0.1]">
                      <div>
                        <div className="text-sm font-bold text-white">{restaurant.name}</div>
                        <div className="mt-1 text-xs text-white/48">{restaurant.chain_name || 'Independent restaurant'}</div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-white/60" />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-[24px] border px-4 py-4 ${accent ? 'border-[#0f766e]/18 bg-[#0f766e]/8' : 'border-slate-200 bg-slate-50'}`}>
      <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-950">{value}</div>
    </div>
  );
}

function InfoBadge({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: 'emerald' | 'amber' | 'sky' }) {
  const toneMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <div className={`rounded-[22px] border px-3 py-3 ${toneMap[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-[0.24em]">{label}</span>
      </div>
      <div className="mt-2 text-lg font-black">{value}</div>
    </div>
  );
}

function RestaurantCard({ restaurant, compact = false }: { restaurant: PublicRestaurantCard; compact?: boolean }) {
  return (
    <Link to={restaurant.review_path} className="block rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
      <div className="flex items-start gap-3">
        <div className="h-20 w-20 overflow-hidden rounded-[20px] bg-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {restaurant.cover_url ? (
            <img src={restaurant.cover_url} alt={restaurant.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-white" style={{ background: `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.secondary_color})` }}>
              <Building2 className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-black tracking-[-0.04em] text-slate-950">{restaurant.name}</div>
              <div className="mt-1 text-xs text-slate-500">{restaurant.chain_name || 'Independent restaurant'}</div>
            </div>
            <ArrowUpRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-400" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
              <Star className="h-3.5 w-3.5 fill-current" />
              {restaurant.average_rating}
            </span>
            <span>{restaurant.published_reviews_count} reviews</span>
          </div>

          <div className={`mt-3 grid gap-2 ${compact ? '' : 'md:grid-cols-2'}`}>
            {restaurant.address ? <MetaLine icon={MapPin} text={restaurant.address} /> : null}
            {restaurant.phone_number ? <MetaLine icon={Phone} text={restaurant.phone_number} /> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ReviewCard({ review }: { review: PublicReviewEntry }) {
  return (
    <Link to={review.restaurant.review_path} className="block rounded-[24px] border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black tracking-[-0.03em] text-slate-950">{review.restaurant.name}</div>
          <div className="mt-1 text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
          <Star className="h-3.5 w-3.5 fill-current" />
          {review.average_rating}
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment}</p>
      <div className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{review.author_name}</div>
    </Link>
  );
}

function DarkCallout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/34">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white/84">{value}</div>
    </div>
  );
}

function MetaLine({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
      <span>{text}</span>
    </div>
  );
}

function RestaurantSkeleton() {
  return <div className="h-[118px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-100" />;
}


