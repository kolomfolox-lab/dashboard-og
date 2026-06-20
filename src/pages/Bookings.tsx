import { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, Clock, MapPin, Phone, Plus, Search, Users, X } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, type OwnerBooking } from '@/services/api';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
type TableStatus = 'FREE' | 'OCCUPIED' | 'WAITING_WAITER';

const statusColor: Record<BookingStatus, string> = {
  PENDING: 'bg-[#ff8f8f]/10 text-[#ff8f8f] border-[#ff8f8f]/20',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  SEATED: 'bg-[#8fd4ff]/10 text-[#8fd4ff] border-[#8fd4ff]/20',
  COMPLETED: 'bg-white/5 text-white/40 border-white/10',
  CANCELLED: 'bg-red-500/10 text-red-300 border-red-500/20',
};

const statusLabel: Record<BookingStatus, string> = {
  PENDING: 'Ожидание',
  CONFIRMED: 'Подтверждено',
  SEATED: 'Заселены',
  COMPLETED: 'Завершено',
  CANCELLED: 'Отменено',
};

const tableStatusColor: Record<TableStatus, { dot: string; label: string; border: string }> = {
  FREE: { dot: 'bg-emerald-400', label: 'свободен', border: 'border-emerald-500/30' },
  OCCUPIED: { dot: 'bg-[#ff6b6b]', label: 'занят', border: 'border-[#ff6b6b]/40' },
  WAITING_WAITER: { dot: 'bg-[#ff8f8f]', label: 'зовут', border: 'border-[#ff8f8f]/30' },
};

const initialForm = {
  clientName: '',
  clientPhone: '',
  guestCount: 2,
  bookingDate: new Date().toISOString().split('T')[0],
  bookingTime: '19:00',
  tableId: '',
  notes: '',
  occasion: '',
};

export default function BookingsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER' || user?.role === 'MANAGER');
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, tablesRes] = await Promise.all([
        ownerAPI.getBookings(workspace.selectedRestaurantId, 'upcoming'),
        ownerAPI.getTables(workspace.selectedRestaurantId),
      ]);
      setBookings(bookingsRes.data || []);
      setTables(tablesRes.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [workspace.selectedRestaurantId]);

  const todayBookings = useMemo(
    () => bookings.filter((b) => b.booking_date === selectedDate).sort((a, b) => a.booking_time.localeCompare(b.booking_time)),
    [bookings, selectedDate],
  );

  const tableMap = useMemo(() => {
    const map: Record<string, any> = {};
    tables.forEach((t) => { map[t.id] = t; });
    return map;
  }, [tables]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.selectedRestaurantId) return;
    setSubmitting(true);
    setError('');
    try {
      await ownerAPI.createBooking({
        restaurant_id: workspace.selectedRestaurantId,
        table_id: form.tableId || undefined,
        booking_date: form.bookingDate,
        booking_time: form.bookingTime,
        guest_count: form.guestCount,
        client_name: form.clientName,
        client_phone: form.clientPhone,
        notes: form.notes || undefined,
        occasion: form.occasion || undefined,
      });
      setShowForm(false);
      setForm(initialForm);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      await ownerAPI.updateBooking(bookingId, { status } as any);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update booking.');
    }
  };

  const dates = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, []);

  const freeTables = tables.filter((t) => !t.is_occupied);
  const occupiedTables = tables.filter((t) => t.is_occupied);
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <AppShell
      title="Бронирование"
      subtitle="Управление бронями, схема зала и контроль столов"
      eyebrow="Hostess module"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard title="Столы" value={`${freeTables.length}/${tables.length}`} note="Свободно / всего" icon={MapPin} tone="mint" />
          <MetricCard title="Броней сегодня" value={todayBookings.length} note={`${pendingCount} ожидают`} icon={Calendar} tone="coral" />
          <MetricCard title="Занято" value={occupiedTables.length} note="столов" icon={Users} tone="sand" />
          <MetricCard title="Гостей сегодня" value={todayBookings.reduce((s, b) => s + b.guest_count, 0)} note="по броням" icon={Clock} tone="cyan" />
        </div>

        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <Panel
            title="Схема зала"
            eyebrow="Hall scheme"
            description={workspace.selectedRestaurant?.name || 'Основной зал'}
            action={
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" /> Новая бронь
              </Button>
            }
          >
            {loading ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">Загрузка...</div>
            ) : tables.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">Нет столов. Добавьте их в разделе Tables.</div>
            ) : (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                {tables.map((table) => {
                  const status: TableStatus = table.is_occupied ? 'OCCUPIED' : table.has_pending_call ? 'WAITING_WAITER' : 'FREE';
                  const config = tableStatusColor[status];
                  const hasBooking = todayBookings.find((b) => b.table_id === table.id);
                  return (
                    <div
                      key={table.id}
                      className={`rounded-[22px] border ${config.border} bg-[#0b1424]/80 p-4 text-center transition hover:scale-[1.03] cursor-pointer`}
                      title={`Стол ${table.number} — ${config.label}`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                        <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">{config.label}</span>
                      </div>
                      <div className="text-lg font-bold text-white">{table.number}</div>
                      {hasBooking && (
                        <div className="mt-2 text-[10px] text-white/50 truncate px-1">
                          {hasBooking.client_name} · {hasBooking.booking_time}
                        </div>
                      )}
                      {table.waiter && (
                        <div className="mt-1 text-[10px] text-white/30 truncate">{table.waiter}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> свободен</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" /> занят</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ff8f8f]" /> зовут</span>
            </div>
          </Panel>

          <Panel
            title="Брони"
            eyebrow="Bookings"
            description="Управляйте статусами"
          >
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] border transition ${
                    selectedDate === date ? 'border-[#f97360]/40 bg-[#f97360]/12 text-white' : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
                  }`}
                >
                  {new Date(date + 'T12:00:00').toLocaleDateString('ru', { weekday: 'short', day: 'numeric' })}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              {todayBookings.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center text-sm text-white/48">Нет броней на этот день</div>
              ) : todayBookings.map((booking) => (
                <div key={booking.id} className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{booking.client_name}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${statusColor[booking.status as BookingStatus] || 'bg-white/5 text-white/50'}`}>
                          {statusLabel[booking.status as BookingStatus] || booking.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.booking_time}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {booking.guest_count}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Стол {booking.table_number || '—'}</span>
                        {booking.client_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {booking.client_phone}</span>}
                      </div>
                    </div>
                  </div>
                  {booking.notes && <div className="mt-2 text-xs text-white/40">{booking.notes}</div>}
                  <div className="mt-3 flex gap-2">
                    {booking.status === 'PENDING' && (
                      <>
                        <button onClick={() => updateStatus(booking.id, 'CONFIRMED')} className="flex-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25">
                          <Check className="mr-1 inline h-3 w-3" /> Подтвердить
                        </button>
                        <button onClick={() => updateStatus(booking.id, 'CANCELLED')} className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white">
                          <X className="mr-1 inline h-3 w-3" /> Отменить
                        </button>
                      </>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <button onClick={() => updateStatus(booking.id, 'SEATED')} className="flex-1 rounded-full bg-[#8fd4ff]/15 px-3 py-1.5 text-xs font-semibold text-[#8fd4ff] hover:bg-[#8fd4ff]/25">
                        <Users className="mr-1 inline h-3 w-3" /> Заселить
                      </button>
                    )}
                    {booking.status === 'SEATED' && (
                      <button onClick={() => updateStatus(booking.id, 'COMPLETED')} className="flex-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white">
                        <Check className="mr-1 inline h-3 w-3" /> Завершить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowForm(false)}>
            <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#0d1825] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Новая бронь</h2>
                <button onClick={() => setShowForm(false)} className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/60 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/40">Имя гостя</span>
                    <input required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/40">Телефон</span>
                    <input required value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} placeholder="+998" className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/40">Дата</span>
                    <input type="date" required value={form.bookingDate} onChange={(e) => setForm({ ...form, bookingDate: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/40">Время</span>
                    <input type="time" required value={form.bookingTime} onChange={(e) => setForm({ ...form, bookingTime: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/40">Гостей</span>
                    <input type="number" min={1} max={20} value={form.guestCount} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/40">Стол</span>
                    <select value={form.tableId} onChange={(e) => setForm({ ...form, tableId: e.target.value })} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]">
                      <option value="">Автоматически</option>
                      {tables.map((t) => (
                        <option key={t.id} value={t.id} disabled={t.is_occupied}>
                          Стол {t.number}{t.is_occupied ? ' (занят)' : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/40">Повод / Заметка</span>
                    <input value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} placeholder="День рождения, свидание..." className="mt-1 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs uppercase tracking-[0.18em] text-white/40">Примечание</span>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Аллергии, предпочтения..." className="mt-1 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Сохранение...' : 'Создать бронь'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
