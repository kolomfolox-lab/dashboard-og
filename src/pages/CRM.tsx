import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarDays, MessageSquareText, NotebookPen, RefreshCcw, Repeat2, Save, Search, Sparkles, Star, Tags, UsersRound, WalletCards, type LucideIcon } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, type OwnerCrmGuest, type OwnerCrmGuestVisit, type OwnerFeedbackInsight } from '@/services/api';
import { cn } from '@/lib/utils';

const extractRows = <T,>(payload: T[] | { results: T[] }): T[] => {
  if (Array.isArray(payload)) return payload;
  return payload.results || [];
};

export default function CRMPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER' || user?.role === 'MANAGER');
  const [guests, setGuests] = useState<OwnerCrmGuest[]>([]);
  const [insights, setInsights] = useState<OwnerFeedbackInsight[]>([]);
  const [visits, setVisits] = useState<OwnerCrmGuestVisit[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [query, setQuery] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftTags, setDraftTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const localeForDate = locale === 'uz' ? 'uz-UZ' : locale === 'en' ? 'en-US' : 'ru-RU';
  const localeForNumber = locale === 'uz' ? 'uz-UZ' : locale === 'en' ? 'en-US' : 'ru-RU';

  const formatMoney = (value: string | number) => {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount)) return t('crm_zero_uzs', '0 UZS');
    return new Intl.NumberFormat(localeForNumber, { maximumFractionDigits: 0 }).format(amount) + ' UZS';
  };

  const formatDate = (value?: string | null) => {
    if (!value) return t('crm_dash', '-');
    return new Intl.DateTimeFormat(localeForDate, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  };

  const selectedGuest = useMemo(
    () => guests.find((guest) => guest.id === selectedGuestId) || guests[0] || null,
    [guests, selectedGuestId],
  );

  const latestInsight = insights[0] || null;
  const repeatGuests = guests.filter((guest) => guest.total_visits > 1).length;
  const totalSpend = guests.reduce((sum, guest) => sum + Number(guest.total_spend || 0), 0);

  const load = async (search = query) => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    setError('');
    try {
      const [guestResponse, insightResponse] = await Promise.all([
        ownerAPI.getCrmGuests(workspace.selectedRestaurantId, search.trim()),
        ownerAPI.getFeedbackInsights(workspace.selectedRestaurantId),
      ]);
      const guestRows = extractRows<OwnerCrmGuest>(guestResponse.data);
      setGuests(guestRows);
      setInsights(extractRows<OwnerFeedbackInsight>(insightResponse.data));
      setSelectedGuestId((current) => (guestRows.some((guest) => guest.id === current) ? current : guestRows[0]?.id || ''));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || t('crm_load_error', 'Could not load CRM data.'));
      setGuests([]);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load('');
  }, [workspace.selectedRestaurantId]);

  useEffect(() => {
    if (!selectedGuest) {
      setVisits([]);
      setDraftNotes('');
      setDraftTags('');
      return;
    }
    setDraftNotes(selectedGuest.notes || '');
    setDraftTags((selectedGuest.tags || []).join(', '));
    let active = true;
    ownerAPI.getCrmGuestVisits(selectedGuest.id)
      .then((response) => {
        if (active) setVisits(response.data);
      })
      .catch(() => {
        if (active) setVisits([]);
      });
    return () => {
      active = false;
    };
  }, [selectedGuest?.id]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    void load(query);
  };

  const saveGuest = async () => {
    if (!selectedGuest) return;
    setSaving(true);
    setError('');
    setInfo('');
    try {
      const tags = draftTags.split(',').map((tag) => tag.trim()).filter(Boolean);
      const response = await ownerAPI.updateCrmGuest(selectedGuest.id, { notes: draftNotes, tags });
      setGuests((current) => current.map((guest) => (guest.id === selectedGuest.id ? response.data : guest)));
      setInfo(t('crm_saved', 'CRM profile saved.'));
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.response?.data?.error || t('crm_save_error', 'Could not save guest profile.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title={t('crm_title', 'Guest CRM')}
      subtitle={t('crm_subtitle', 'Repeat guests, visit history, notes, tags, and AI feedback insights in one owner workspace.')}
      eyebrow={t('crm_eyebrow', 'Guest intelligence')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard title={t('crm_metric_guests', 'Guests')} value={guests.length} note={workspace.selectedRestaurant?.name || t('shell_workspace', 'Workspace')} icon={UsersRound} tone="cyan" />
          <MetricCard title={t('crm_metric_repeat', 'Repeat guests')} value={repeatGuests} note={t('crm_metric_repeat_note', 'More than one visit')} icon={Repeat2} tone="mint" />
          <MetricCard title={t('crm_metric_regulars', 'Regulars (10+)')} value={guests.filter(g => g.total_visits >= 10).length} note={t('crm_metric_regulars_note', 'Loyal regular guests')} icon={Star} tone="coral" />
          <MetricCard title={t('crm_metric_spend', 'Tracked spend')} value={formatMoney(totalSpend)} note={t('crm_metric_spend_note', 'From linked orders')} icon={WalletCards} tone="sand" />
          <MetricCard title={t('crm_metric_rating', 'Feedback rating')} value={latestInsight ? Number(latestInsight.average_rating).toFixed(1) : t('crm_zero_rating', '0.0')} note={latestInsight ? `${t('crm_reviews_count', 'reviews')}: ${latestInsight.reviews_count}` : t('crm_metric_rating_note', 'No insight yet')} icon={Star} tone="coral" />
        </div>

        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
        {info ? <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{info}</div> : null}

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel
            title={t('crm_guest_list_title', 'Guest base')}
            eyebrow={t('crm_guest_list_eyebrow', 'Profiles')}
            description={t('crm_guest_list_description', 'Guests are created automatically from QR, Telegram Mini App, waiter flow, and table sessions.')}
            action={
              <form onSubmit={submitSearch} className="flex w-full gap-2 sm:w-auto">
                <div className="relative min-w-0 flex-1 sm:w-72">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/36" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('crm_search_placeholder', 'Search name, phone, Telegram')}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/32 focus:border-[#f97360]"
                  />
                </div>
                <Button type="submit" variant="outline" disabled={loading}><Search className="mr-2 h-4 w-4" />{t('crm_search', 'Search')}</Button>
                <Button type="button" variant="ghost" onClick={() => void load(query)} disabled={loading}><RefreshCcw className="h-4 w-4" /></Button>
              </form>
            }
          >
            <div className="grid gap-3">
              {guests.length ? guests.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  onClick={() => setSelectedGuestId(guest.id)}
                  className={cn(
                    'rounded-[24px] border p-4 text-left transition hover:border-[#f97360]/40 hover:bg-white/[0.055]',
                    selectedGuest?.id === guest.id ? 'border-[#f97360]/55 bg-[#f97360]/10' : 'border-white/8 bg-black/12',
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-display text-lg text-white">{guest.display_name || guest.first_name || guest.telegram_username || t('crm_guest_unknown', 'Guest')}</div>
                      <div className="mt-1 text-sm text-white/48">{guest.phone_number || guest.telegram_username || t('crm_guest_no_contact', 'No contact yet')}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-white/58">
                      {guest.total_visits >= 10 && <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-300">{t('crm_regular_badge', '★ Постоянный')}</span>}
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{guest.total_visits} {t('crm_visits_count', 'visits')}</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{formatMoney(guest.total_spend)}</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">{formatDate(guest.last_visit_at)}</span>
                    </div>
                  </div>
                  {guest.tags?.length ? <div className="mt-3 flex flex-wrap gap-2">{guest.tags.map((tag) => <span key={tag} className="rounded-full bg-[#8fd4ff]/10 px-2.5 py-1 text-xs text-[#bde9ff]">#{tag}</span>)}</div> : null}
                </button>
              )) : <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{loading ? t('loading', 'Loading...') : t('crm_empty_guests', 'No guest profiles yet. They will appear after QR, Telegram, or waiter sessions.')}</div>}
            </div>
          </Panel>

          <Panel
            title={t('crm_profile_title', 'Guest profile')}
            eyebrow={t('crm_profile_eyebrow', 'Owner notes')}
            description={t('crm_profile_description', 'Add tags and context so managers and waiters understand valuable guests faster.')}
          >
            {selectedGuest ? (
              <div className="space-y-4">
                <div className="rounded-[24px] border border-white/8 bg-black/12 p-4">
                  <div className="text-xs uppercase tracking-[0.26em] text-white/38">{t('crm_selected_guest', 'Selected guest')}</div>
                  <div className="mt-2 font-display text-2xl text-white">{selectedGuest.display_name || selectedGuest.first_name || selectedGuest.telegram_username || t('crm_guest_unknown', 'Guest')}</div>
                  <div className="mt-2 grid gap-2 text-sm text-white/58">
                    <span>{t('crm_contact', 'Contact')}: {selectedGuest.phone_number || selectedGuest.telegram_username || t('crm_dash', '-')}</span>
                    <span>{t('crm_language', 'Language')}: {selectedGuest.language?.toUpperCase?.() || t('crm_dash', '-')}</span>
                    <span>{t('crm_last_visit', 'Last visit')}: {formatDate(selectedGuest.last_visit_at)}</span>
                  </div>
                </div>

                <label className="block rounded-[24px] border border-white/8 bg-black/12 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40"><Tags className="h-4 w-4" />{t('crm_tags', 'Tags')}</div>
                  <input value={draftTags} onChange={(event) => setDraftTags(event.target.value)} placeholder={t('crm_tags_placeholder', 'vip, birthday, loves spicy')} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f97360]" />
                </label>

                <label className="block rounded-[24px] border border-white/8 bg-black/12 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40"><NotebookPen className="h-4 w-4" />{t('crm_notes', 'Notes')}</div>
                  <textarea value={draftNotes} onChange={(event) => setDraftNotes(event.target.value)} rows={5} placeholder={t('crm_notes_placeholder', 'Example: prefers table near window, likes fast service.')} className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f97360]" />
                </label>

                <Button onClick={saveGuest} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? t('working', 'Working...') : t('crm_save_profile', 'Save profile')}</Button>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{t('crm_select_guest_empty', 'Select a guest to edit CRM notes.')}</div>
            )}
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title={t('crm_visits_title', 'Visit history')} eyebrow={t('crm_visits_eyebrow', 'Timeline')} description={t('crm_visits_description', 'Table sessions and seat labels linked to the selected guest.')}>
            <DataTable
              rows={visits}
              emptyMessage={selectedGuest ? t('crm_empty_visits', 'No visits for this guest yet.') : t('crm_select_guest_empty', 'Select a guest to edit CRM notes.')}
              columns={[
                { label: t('crm_col_started', 'Started'), key: 'started_at', render: (row) => formatDate(row.started_at) },
                { label: t('crm_col_table', 'Table'), key: 'table_number', render: (row) => row.table_number || t('crm_dash', '-') },
                { label: t('crm_col_seat', 'Seat'), key: 'seat_label', render: (row) => row.seat_label || t('crm_dash', '-') },
                { label: t('crm_col_source', 'Source'), key: 'source' },
              ]}
            />
          </Panel>

          <Panel title={t('crm_insights_title', 'AI feedback insights')} eyebrow={t('crm_insights_eyebrow', 'CRM intelligence')} description={t('crm_insights_description', 'Weekly feedback summary for owner decisions: strengths, weak spots, and actions.')}>
            {insights.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {insights.slice(0, 4).map((insight) => (
                  <div key={insight.id} className="rounded-[26px] border border-white/8 bg-black/12 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.26em] text-[#8fd4ff]">{insight.period}</div>
                        <div className="mt-2 font-display text-xl text-white">{insight.date_from} - {insight.date_to}</div>
                      </div>
                      <div className="rounded-2xl border border-[#f97360]/20 bg-[#f97360]/10 px-3 py-2 text-sm font-semibold text-[#ffd7c4]">{Number(insight.average_rating).toFixed(1)}</div>
                    </div>
                    {insight.summary ? <p className="mt-4 text-sm leading-7 text-white/62">{insight.summary}</p> : null}
                    <InsightList icon={Sparkles} title={t('crm_strengths', 'Strengths')} items={insight.strengths} />
                    <InsightList icon={MessageSquareText} title={t('crm_weaknesses', 'Weaknesses')} items={insight.weaknesses} />
                    <InsightList icon={CalendarDays} title={t('crm_actions', 'Actions')} items={insight.recommended_actions} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">{t('crm_empty_insights', 'No feedback insights yet. They will appear after reviews are collected and summarized.')}</div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}

function InsightList({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/38"><Icon className="h-4 w-4" />{title}</div>
      <div className="mt-2 space-y-2">
        {items.slice(0, 4).map((item) => (
          <div key={item} className="rounded-2xl border border-white/8 bg-white/[0.035] px-3 py-2 text-sm leading-6 text-white/66">{item}</div>
        ))}
      </div>
    </div>
  );
}
