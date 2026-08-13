import { useEffect, useState } from 'react';
import { Calculator, ChevronRight, CircleDollarSign, Clock, Coins, Plus, Receipt, Users, X } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { showToast } from '@/lib/toast';

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

const periodPresets = [
  { label: 'Эта неделя', get: () => {
    const now = new Date(); const d = new Date(now); d.setDate(d.getDate() - d.getDay() + 1);
    const e = new Date(d); e.setDate(e.getDate() + 6);
    return { start: d.toISOString().slice(0,10), end: e.toISOString().slice(0,10) };
  }},
  { label: 'Прошлая неделя', get: () => {
    const now = new Date(); const d = new Date(now); d.setDate(d.getDate() - d.getDay() - 6);
    const e = new Date(d); e.setDate(e.getDate() + 6);
    return { start: d.toISOString().slice(0,10), end: e.toISOString().slice(0,10) };
  }},
  { label: 'Этот месяц', get: () => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10), end: now.toISOString().slice(0,10) };
  }},
  { label: 'Прошлый месяц', get: () => {
    const now = new Date(); const y = now.getFullYear(); const m = now.getMonth() - 1;
    const s = new Date(y, m, 1); const e = new Date(y, m + 1, 0);
    return { start: s.toISOString().slice(0,10), end: e.toISOString().slice(0,10) };
  }},
];

export default function PayrollPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const restaurantId = workspace.selectedRestaurantId;

  const [periods, setPeriods] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [calcLoading, setCalcLoading] = useState(false);

  const loadPeriods = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await ownerAPI.getPayrollPeriods(restaurantId);
      setPeriods(toArray(res.data));
    } catch {}
    finally { setLoading(false); }
  };

  const loadEntries = async (p: any) => {
    setSelectedPeriod(p);
    setCalcLoading(true);
    try {
      const res = await ownerAPI.getPayrollEntries(p.id);
      setEntries(toArray(res.data));
    } catch { setEntries([]); }
    finally { setCalcLoading(false); }
  };

  useEffect(() => { loadPeriods(); }, [restaurantId]);

  const handleCalculate = async (periodId: string) => {
    setCalcLoading(true);
    try {
      await ownerAPI.calculatePayroll(periodId, restaurantId);
      showToast(t('payroll_calculated', 'Зарплата рассчитана'), 'success');
      await loadPeriods();
      if (selectedPeriod?.id === periodId) {
        const res = await ownerAPI.getPayrollEntries(periodId);
        setEntries(toArray(res.data));
      }
    } catch { showToast(t('payroll_calc_error', 'Ошибка расчёта'), 'error'); }
    finally { setCalcLoading(false); }
  };

  const handleCreatePeriod = async () => {
    if (!restaurantId || !newStart || !newEnd) return;
    try {
      await ownerAPI.createPayrollPeriod({ restaurant_id: restaurantId, start_date: newStart, end_date: newEnd });
      showToast(t('payroll_period_created', 'Период создан'), 'success');
      setShowCreate(false);
      setNewStart(''); setNewEnd('');
      await loadPeriods();
    } catch { showToast(t('payroll_create_error', 'Ошибка'), 'error'); }
  };

  const totalNet = entries.reduce((s, e) => s + Number(e.net_pay || 0), 0);
  const totalHours = entries.reduce((s, e) => s + Number(e.hours_worked || 0), 0);
  const totalBonuses = entries.reduce((s, e) => s + Number(e.bonuses || 0), 0);
  const totalFines = entries.reduce((s, e) => s + Number(e.deductions || 0), 0);

  const statusColor: Record<string, string> = {
    OPEN: 'border-amber-500/30 bg-amber-500/8 text-amber-300',
    LOCKED: 'border-blue-500/30 bg-blue-500/8 text-blue-300',
    PAID: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-300',
  };

  return (
    <AppShell
      title={t('payroll_title', 'Зарплата')}
      subtitle={t('payroll_subtitle', 'Расчёт заработной платы сотрудников')}
      eyebrow={t('payroll_eyebrow', 'Payroll')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t('payroll_periods', 'Расчётные периоды')}</h2>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1.5 h-4 w-4" />{t('payroll_new_period', 'Новый период')}
          </Button>
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1622] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white">{t('payroll_new_period', 'Новый период')}</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/30 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                {periodPresets.map(p => (
                  <button key={p.label} onClick={() => { const d = p.get(); setNewStart(d.start); setNewEnd(d.end); }}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10 hover:text-white transition">{p.label}</button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-white/40 mb-1">{t('payroll_start_date', 'Начало периода')}</label>
                  <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">{t('payroll_end_date', 'Конец периода')}</label>
                  <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleCreatePeriod} disabled={!newStart || !newEnd} className="flex-1">
                  <Plus className="mr-1.5 h-4 w-4" />{t('payroll_create', 'Создать')}
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)}>{t('cancel', 'Отмена')}</Button>
              </div>
            </div>
          </div>
        )}

        {selectedPeriod && (
          <div className="grid gap-4 md:grid-cols-5">
            <MetricCard title={t('payroll_employees', 'Сотрудников')} value={entries.length} note={`${totalHours.toFixed(1)} часов всего`} icon={Users} tone="cyan" />
            <MetricCard title={t('payroll_bonuses', 'Бонусы')} value={`+${totalBonuses.toLocaleString()}`} note={t('payroll_bonuses_note', 'Начислено')} icon={Coins} tone="mint" />
            <MetricCard title={t('payroll_deductions', 'Штрафы')} value={`-${totalFines.toLocaleString()}`} note={t('payroll_deductions_note', 'Удержано')} icon={Receipt} tone="coral" />
            <MetricCard title={t('payroll_total_pay', 'К выдаче')} value={`${totalNet.toLocaleString()} UZS`} note={t('payroll_net', 'Чистыми')} icon={CircleDollarSign} tone="sand" />
            <MetricCard title={t('payroll_status', 'Статус')} value={selectedPeriod.status || '—'} note={`${selectedPeriod.start_date} — ${selectedPeriod.end_date}`} icon={Clock} tone={selectedPeriod.status === 'PAID' ? 'mint' : selectedPeriod.status === 'LOCKED' ? 'sand' : 'cyan'} />
          </div>
        )}

        <div className="space-y-3">
          {periods.length === 0 && !loading && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-12 text-center">
              <Receipt className="mx-auto h-10 w-10 text-white/20" />
              <p className="mt-4 text-sm text-white/40">{t('payroll_no_periods', 'Нет расчётных периодов. Нажмите «Новый период» чтобы начать.')}</p>
              <Button size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1.5 h-4 w-4" />{t('payroll_new_period', 'Создать первый период')}
              </Button>
            </div>
          )}

          {periods.map(p => {
            const isActive = selectedPeriod?.id === p.id;
            return (
              <div key={p.id} onClick={() => loadEntries(p)}
                className={`rounded-3xl border p-5 cursor-pointer transition-all ${isActive ? 'border-[#f97360]/40 bg-[#f97360]/5 shadow-lg' : 'border-white/8 bg-black/12 hover:border-white/20'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5">
                      <Calculator className="h-6 w-6 text-white/50" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{p.start_date} — {p.end_date}</div>
                      <div className="mt-0.5 text-xs text-white/40">{t('payroll_period_created_at', 'Создан')}: {new Date(p.created_at).toLocaleDateString('ru')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColor[p.status] || 'border-white/10 bg-white/5 text-white/40'}`}>{p.status}</span>
                    {p.status === 'OPEN' && (
                      <button onClick={e => { e.stopPropagation(); handleCalculate(p.id); }}
                        disabled={calcLoading}
                        className="rounded-xl bg-[#ff6b6b] px-4 py-2 text-xs font-bold text-white hover:brightness-105 transition disabled:opacity-50">
                        {t('payroll_calculate', 'Рассчитать')}
                      </button>
                    )}
                    <ChevronRight className={`h-5 w-5 text-white/20 transition ${isActive ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {isActive && entries.length > 0 && (
                  <div className="mt-5 border-t border-white/8 pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/30">{t('payroll_entries_title', 'Начисления')}</span>
                      <span className="text-xs text-white/30">{totalNet.toLocaleString()} UZS</span>
                    </div>
                    <div className="space-y-2">
                      {entries.map(e => (
                        <div key={e.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{e.user_name}</div>
                            <div className="mt-0.5 flex gap-3 text-[11px] text-white/30">
                              <span>{e.hours_worked}ч</span>
                              {e.overtime_hours > 0 && <span className="text-amber-300">+{e.overtime_hours}ч сверх</span>}
                              {Number(e.bonuses) > 0 && <span className="text-emerald-400">+{Number(e.bonuses).toLocaleString()} UZS</span>}
                              {Number(e.deductions) > 0 && <span className="text-red-400">-{Number(e.deductions).toLocaleString()} UZS</span>}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-white">{Number(e.net_pay).toLocaleString()} UZS</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isActive && entries.length === 0 && !calcLoading && (
                  <div className="mt-5 border-t border-white/8 pt-5 text-center">
                    <p className="text-sm text-white/30">{t('payroll_no_entries', 'Нажмите «Рассчитать»')}</p>
                  </div>
                )}

                {isActive && calcLoading && (
                  <div className="mt-5 border-t border-white/8 pt-5 text-center">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50">
                      <Clock className="h-3.5 w-3.5 animate-spin" /> {t('payroll_calculating', 'Расчёт...')}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
