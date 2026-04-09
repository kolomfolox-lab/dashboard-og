import {
  CalendarDays,
  Clock3,
  Instagram,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AnimatedWaitlyLogo } from '@/components/public/AnimatedWaitlyLogo';
import { SmartImage } from '@/components/public/SmartImage';
import { Button } from '@/components/ui/button';
import { getHostname, isLocalHost } from '@/lib/publicHost';
import { cn } from '@/lib/utils';
import { publicAPI, type PublicBookingState, type PublicMenuPageResponse } from '@/services/api';

function formatMenuPrice(value: string | number | undefined) {
  return `${Number(value || 0).toLocaleString('ru-RU')} sum`;
}

function parseIngredients(value?: string | null) {
  return (value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function getScopeParams() {
  const search = new URLSearchParams(window.location.search);
  const scopeSubdomain = search.get('scope_subdomain');
  const scopeChainSubdomain = search.get('scope_chain_subdomain');
  if (scopeSubdomain || scopeChainSubdomain) {
    return {
      ...(scopeSubdomain ? { scope_subdomain: scopeSubdomain } : {}),
      ...(scopeChainSubdomain ? { scope_chain_subdomain: scopeChainSubdomain } : {}),
    };
  }

  const hostname = getHostname();
  if (isLocalHost(hostname)) {
    return {};
  }

  const firstLabel = hostname.split('.')[0];
  if (firstLabel && !['review', 'reviews', 'admin', 'app', 'login'].includes(firstLabel)) {
    return { scope_subdomain: firstLabel };
  }
  return {};
}

export default function OnlineMenuPage() {
  const { restaurantSlug = '' } = useParams();
  const scopeParams = useMemo(() => getScopeParams(), []);
  const [payload, setPayload] = useState<PublicMenuPageResponse | null>(null);
  const [bookingState, setBookingState] = useState<PublicBookingState | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookingForm, setBookingForm] = useState({
    client_name: '',
    client_phone: '',
    guest_count: '2',
    booking_time: '',
    occasion: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [refreshingSlots, setRefreshingSlots] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingInfo, setBookingInfo] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    publicAPI.menuPage(restaurantSlug, scopeParams)
      .then((response) => {
        if (!active) return;
        setPayload(response.data);
        setBookingState(response.data.booking);
        setSelectedDate(response.data.booking.selected_date);
        const firstAvailable = response.data.booking.slots.find((slot) => slot.is_available);
        setBookingForm((current) => ({
          ...current,
          booking_time: firstAvailable?.time || current.booking_time,
        }));
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err?.response?.data?.error || 'Could not load the online menu.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [restaurantSlug, scopeParams]);

  useEffect(() => {
    if (!payload?.booking?.enabled || !selectedDate) return;
    let active = true;
    setRefreshingSlots(true);

    publicAPI.bookingAvailability(restaurantSlug, { date: selectedDate, ...scopeParams })
      .then((response) => {
        if (!active) return;
        setBookingState(response.data);
        const firstAvailable = response.data.slots.find((slot) => slot.is_available);
        setBookingForm((current) => ({
          ...current,
          booking_time: response.data.slots.some((slot) => slot.time === current.booking_time && slot.is_available)
            ? current.booking_time
            : firstAvailable?.time || '',
        }));
      })
      .catch((err: any) => {
        if (!active) return;
        setBookingError(err?.response?.data?.error || 'Could not refresh booking slots.');
      })
      .finally(() => {
        if (active) setRefreshingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [payload?.booking?.enabled, restaurantSlug, scopeParams, selectedDate]);

  const handleBookingField = (field: string, value: string) => {
    setBookingForm((current) => ({ ...current, [field]: value }));
  };

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!restaurantSlug) return;

    setSubmittingBooking(true);
    setBookingError('');
    setBookingInfo('');
    try {
      const response = await publicAPI.createBooking(restaurantSlug, {
        ...scopeParams,
        client_name: bookingForm.client_name.trim(),
        client_phone: bookingForm.client_phone.trim(),
        guest_count: Number(bookingForm.guest_count || 1),
        booking_date: selectedDate,
        booking_time: bookingForm.booking_time,
        occasion: bookingForm.occasion.trim(),
        notes: bookingForm.notes.trim(),
      });
      setBookingInfo(response.data.message || 'Booking request sent.');
      setBookingForm((current) => ({
        ...current,
        booking_time: '',
        occasion: '',
        notes: '',
      }));
      const availabilityResponse = await publicAPI.bookingAvailability(restaurantSlug, { date: selectedDate, ...scopeParams });
      setBookingState(availabilityResponse.data);
      const firstAvailable = availabilityResponse.data.slots.find((slot) => slot.is_available);
      setBookingForm((current) => ({
        ...current,
        booking_time: firstAvailable?.time || '',
      }));
    } catch (err: any) {
      setBookingError(err?.response?.data?.error || 'Could not create the booking.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#eef1ee] text-slate-900">
        <div className="flex items-center gap-3 rounded-full bg-white px-6 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading menu
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#eef1ee] px-4 text-slate-900">
        <div className="max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Online menu</div>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em]">Menu is unavailable.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">{error || 'Could not load the restaurant profile.'}</p>
        </div>
      </div>
    );
  }

  const { restaurant, categories, spotlight } = payload;
  const heroImage = restaurant.hero_image_url || spotlight?.image_url || restaurant.spotlight_image_url;

  return (
    <div className="min-h-screen bg-[#eef1ee] text-slate-900">
      <section className="mx-auto max-w-[1600px] px-4 pb-6 pt-4 md:px-6 xl:px-8">
        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white shadow-[0_25px_100px_rgba(15,23,42,0.08)]">
          <div
            className="relative overflow-hidden px-5 py-6 md:px-8 md:py-8 xl:px-10 xl:py-10"
            style={{
              background: heroImage
                ? `linear-gradient(180deg, rgba(7,10,14,0.12), rgba(7,10,14,0.72)), url(${heroImage}) center/cover`
                : `linear-gradient(135deg, ${restaurant.primary_color}, ${restaurant.secondary_color})`,
            }}
          >
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="flex flex-col justify-between gap-6 text-white">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-white/78">
                      <Sparkles className="h-3.5 w-3.5" />
                      Online menu
                    </div>
                    <AnimatedWaitlyLogo label="Animated menu layer" />
                  </div>
                  <div className="mt-6 flex items-end gap-4">
                    <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-[24px] border border-white/20 bg-[#102235] shadow-[0_18px_40px_rgba(0,0,0,0.25)]">
                      <SmartImage
                        src={restaurant.logo_url}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                        fallback={<div className="text-xs font-black uppercase tracking-[0.24em]">Logo</div>}
                      />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/65">{restaurant.review_category || 'Restaurant profile'}</div>
                      <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] md:text-5xl">{restaurant.name}</h1>
                    </div>
                  </div>
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-white/82 md:text-base">
                    {restaurant.headline || restaurant.review_short_description || 'A photo-first online menu with clear dish cards and a simple booking flow.'}
                  </p>
                  {restaurant.subheadline ? <p className="mt-3 max-w-3xl text-sm leading-7 text-white/66">{restaurant.subheadline}</p> : null}
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <MetaChip icon={MapPin} text={restaurant.address || 'Address will appear here'} />
                  <MetaChip icon={Clock3} text={restaurant.working_hours_text || 'Working hours will appear here'} />
                  <MetaChip icon={Users} text={restaurant.average_check_text || 'Average check will appear here'} />
                  <MetaChip icon={Phone} text={restaurant.phone_number || 'Contacts will appear here'} />
                </div>
              </div>

              <div className="rounded-[30px] border border-white/15 bg-[rgba(8,18,24,0.52)] p-5 text-white backdrop-blur-xl">
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/58">Booking</div>
                <div className="mt-3 text-2xl font-black tracking-[-0.05em]">
                  {bookingState?.enabled ? 'Book a table' : 'Booking is disabled'}
                </div>
                <p className="mt-2 text-sm leading-7 text-white/72">
                  {bookingState?.enabled
                    ? bookingState?.notes || 'Simple OpenTable-style flow: date, time, guest count, and request confirmation.'
                    : 'The owner has not opened bookings for this restaurant yet.'}
                </p>

                {bookingState?.enabled ? (
                  <form onSubmit={submitBooking} className="mt-5 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <InputCard label="Name" value={bookingForm.client_name} onChange={(value) => handleBookingField('client_name', value)} placeholder="Your name" />
                      <InputCard label="Phone" value={bookingForm.client_phone} onChange={(value) => handleBookingField('client_phone', value)} placeholder="+998 90 000 00 00" />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <SelectCard
                        label="Date"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        options={(bookingState?.dates || []).map((item) => ({ value: item.date, label: item.label }))}
                      />
                      <InputCard label="Guests" type="number" min="1" value={bookingForm.guest_count} onChange={(value) => handleBookingField('guest_count', value)} />
                    </div>

                    <div className="rounded-[24px] border border-white/12 bg-white/6 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.24em] text-white/52">Time</div>
                        {refreshingSlots ? <LoaderCircle className="h-4 w-4 animate-spin text-white/58" /> : null}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(bookingState?.slots || []).map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.is_available}
                            onClick={() => handleBookingField('booking_time', slot.time)}
                            className={cn(
                              'rounded-full border px-3 py-2 text-xs font-semibold transition',
                              slot.is_available ? 'border-white/14 bg-white/8 text-white hover:bg-white/14' : 'cursor-not-allowed border-white/6 bg-white/4 text-white/28',
                              bookingForm.booking_time === slot.time ? 'border-[#f7d47c] bg-[#f7d47c] text-slate-950' : '',
                            )}
                          >
                            {slot.time} {slot.is_available ? `- ${slot.available_tables_count}` : '- full'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <InputCard label="Occasion" value={bookingForm.occasion} onChange={(value) => handleBookingField('occasion', value)} placeholder="Dinner, birthday, business" />
                      <InputCard label="Notes" value={bookingForm.notes} onChange={(value) => handleBookingField('notes', value)} placeholder="Example: table near the window" />
                    </div>

                    {bookingError ? <div className="rounded-[20px] border border-red-400/25 bg-red-500/12 px-4 py-3 text-sm text-red-100">{bookingError}</div> : null}
                    {bookingInfo ? <div className="rounded-[20px] border border-emerald-400/20 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100">{bookingInfo}</div> : null}

                    <Button type="submit" disabled={submittingBooking || !bookingForm.booking_time || !selectedDate}>
                      {submittingBooking ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                      Send booking request
                    </Button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-6 bg-[#f6f8f4] p-4 md:p-6 xl:grid-cols-[1.1fr_0.9fr] xl:p-8">
            <div className="space-y-6">
              {spotlight ? (
                <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
                  <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="min-h-[260px] bg-slate-200">
                      <SmartImage
                        src={spotlight.image_url}
                        alt={spotlight.name}
                        className="h-full w-full object-cover"
                        fallback={<div className="grid h-full min-h-[260px] place-items-center bg-slate-100 text-slate-400">Photo coming soon</div>}
                      />
                    </div>
                    <div className="flex flex-col justify-between p-6">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Spotlight</div>
                        <h2 className="mt-4 text-3xl font-black tracking-[-0.05em]">{spotlight.name}</h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{spotlight.description || 'The owner-selected dish that should be seen first in the online menu.'}</p>
                        <IngredientChips ingredients={spotlight.ingredients} />
                      </div>
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <div className="text-lg font-black text-slate-900">{formatMenuPrice(spotlight.price)}</div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{spotlight.cooking_time || 15} min</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-5">
                {categories.map((category) => (
                  <section key={category.id} className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)] md:p-6">
                    <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Menu section</div>
                    <h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">{category.name}</h3>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {category.dishes.map((dish) => (
                        <article key={dish.id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-[#fbfcf9]">
                          <div className="aspect-[1.2/0.9] bg-slate-200">
                            <SmartImage
                              src={dish.image_url}
                              alt={dish.name}
                              className="h-full w-full object-cover"
                              fallback={<div className="grid h-full w-full place-items-center text-sm font-semibold text-slate-400">Photo coming soon</div>}
                            />
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="text-lg font-bold text-slate-900">{dish.name}</h4>
                                <p className="mt-2 text-sm leading-6 text-slate-600">{dish.description || 'The owner will add the dish story here.'}</p>
                                <IngredientChips ingredients={dish.ingredients} />
                              </div>
                              <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                                {dish.cooking_time || 15} min
                              </div>
                            </div>
                            <div className="mt-4 text-lg font-black text-slate-900">{formatMenuPrice(dish.price)}</div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <InfoPanel title="Quick links">
                <QuickLink href={restaurant.map_link} icon={MapPin} label={restaurant.address || 'Open map'} />
                <QuickLink href={restaurant.telegram_url} icon={MessageCircle} label="Telegram" />
                <QuickLink href={restaurant.instagram_url} icon={Instagram} label="Instagram" />
                <QuickLink href={restaurant.whatsapp_url} icon={MessageCircle} label="WhatsApp" />
              </InfoPanel>

              <InfoPanel title="Features">
                <div className="flex flex-wrap gap-2">
                  {(restaurant.features || []).length ? (restaurant.features || []).map((feature) => (
                    <span key={feature} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">{feature}</span>
                  )) : <div className="text-sm text-slate-500">The owner will add restaurant features soon.</div>}
                </div>
              </InfoPanel>

              <InfoPanel title="Booking details">
                <div className="space-y-3 text-sm leading-7 text-slate-600">
                  <div className="flex items-center gap-2 text-slate-800"><Clock3 className="h-4 w-4" /> {bookingState?.open_time} - {bookingState?.close_time}</div>
                  <div className="flex items-center gap-2 text-slate-800"><CalendarDays className="h-4 w-4" /> booking window: {bookingState?.window_days || 0} days</div>
                  <p>{bookingState?.notes || 'The owner can manually confirm the booking, reassign a table, and update the status in Waitly Control.'}</p>
                </div>
              </InfoPanel>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

function IngredientChips({ ingredients }: { ingredients?: string | null }) {
  const items = parseIngredients(ingredients);
  if (!items.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
          {item}
        </span>
      ))}
    </div>
  );
}

function MetaChip({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-3 text-sm text-white/86 backdrop-blur-md">
      <Icon className="h-4 w-4 text-white/72" />
      <span>{text}</span>
    </div>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">{title}</div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function QuickLink({ href, icon: Icon, label }: { href?: string | null; icon: any; label: string }) {
  if (!href) {
    return <div className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">{label} will appear soon</div>;
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
      <Icon className="h-4 w-4 text-slate-500" />
      {label}
    </a>
  );
}

function InputCard({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
}) {
  return (
    <label className="block rounded-[24px] border border-white/12 bg-white/6 p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-white/50">{label}</div>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#08141c] px-4 py-3 text-sm text-white outline-none placeholder:text-white/26"
      />
    </label>
  );
}

function SelectCard({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block rounded-[24px] border border-white/12 bg-white/6 p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-white/50">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-[#08141c] px-4 py-3 text-sm text-white outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
