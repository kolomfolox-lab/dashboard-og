import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';
import { CalendarCheck, FileText, Loader2 } from 'lucide-react';

function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export default function ShiftsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'X' | 'Z' | null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const res = await ownerAPI.getShiftReports(workspace.selectedRestaurantId);
      setReports(toArray(res.data));
    } catch { setReports([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const generate = async (type: 'X' | 'Z') => {
    try {
      setActionLoading(type);
      setMsg('');
      const fn = type === 'X' ? ownerAPI.generateXReport : ownerAPI.generateZReport;
      await fn({ restaurant_id: workspace.selectedRestaurantId });
      setMsg(type === 'X' ? 'X report generated' : 'Z report generated');
      await load();
    } catch { setMsg('Failed to generate report'); }
    finally { setActionLoading(null); }
  };

  return (
    <AppShell
      title={t('nav_shifts', 'Shifts')}
      subtitle={t('shifts_subtitle', 'Shift management and X/Z reports')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.selectRestaurant}
    >
      <div className="space-y-4">
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => generate('X')} disabled={!!actionLoading}>
            {actionLoading === 'X' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            X Report
          </Button>
          <Button onClick={() => generate('Z')} disabled={!!actionLoading}>
            {actionLoading === 'Z' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarCheck className="mr-2 h-4 w-4" />}
            Z Report
          </Button>
        </div>
        {msg && <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">{msg}</div>}
        <Panel title={t('shifts_reports', 'Reports')}>
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
          ) : reports.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/40">No shift reports yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Opened</th>
                    <th className="pb-3 pr-4">Closed</th>
                    <th className="pb-3 pr-4 text-right">Revenue</th>
                    <th className="pb-3 pr-4 text-right">Orders</th>
                    <th className="pb-3">Waiter</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r: any) => (
                    <tr key={r.id} className="border-b border-white/5">
                      <td className="py-3 pr-4">
                        <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold">{r.report_type || '—'}</span>
                      </td>
                      <td className="py-3 pr-4">{r.shift?.started_at ? new Date(r.shift.started_at).toLocaleString() : '—'}</td>
                      <td className="py-3 pr-4">{r.shift?.ended_at ? new Date(r.shift.ended_at).toLocaleString() : '—'}</td>
                      <td className="py-3 pr-4 text-right">{Number(r.total_revenue || 0).toLocaleString()} sum</td>
                      <td className="py-3 pr-4 text-right">{r.total_orders || 0}</td>
                      <td className="py-3">{r.shift?.user_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
