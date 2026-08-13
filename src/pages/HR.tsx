import { useEffect, useState } from 'react';
import { AlertTriangle, Award, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app/AppShell';
import { MetricCard } from '@/components/app/MetricCard';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

export default function HRPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [tab, setTab] = useState<'fines' | 'bonuses'>('fines');
  const [fines, setFines] = useState<any[]>([]);
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ user_id: '', amount: '', reason: '' });

  const loadStaff = async () => {
    if (!workspace.selectedRestaurantId) return;
    try {
      const res = await ownerAPI.getStaff(workspace.selectedRestaurantId);
      setStaff(Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []);
    } catch { setStaff([]); }
  };

  const loadFines = async () => {
    if (!workspace.selectedRestaurantId) return;
    try {
      const res = await ownerAPI.getStaffFines(workspace.selectedRestaurantId);
      setFines(Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []);
    } catch { setFines([]); }
  };

  const loadBonuses = async () => {
    if (!workspace.selectedRestaurantId) return;
    try {
      const res = await ownerAPI.getStaffBonuses(workspace.selectedRestaurantId);
      setBonuses(Array.isArray(res.data?.results) ? res.data.results : Array.isArray(res.data) ? res.data : []);
    } catch { setBonuses([]); }
  };

  const load = async () => {
    setLoading(true);
    await Promise.all([loadStaff(), loadFines(), loadBonuses()]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const handleCreate = async () => {
    if (!form.user_id || !form.amount) return;
    try {
      if (tab === 'fines') {
        await ownerAPI.createStaffFine({ restaurant_id: workspace.selectedRestaurantId, user: form.user_id, amount: Number(form.amount), reason: form.reason });
      } else {
        await ownerAPI.createStaffBonus({ restaurant_id: workspace.selectedRestaurantId, user: form.user_id, amount: Number(form.amount), reason: form.reason });
      }
      toast.success(tab === 'fines' ? 'Fine created' : 'Bonus created');
      setShowForm(false);
      setForm({ user_id: '', amount: '', reason: '' });
      await (tab === 'fines' ? loadFines() : loadBonuses());
    } catch { toast.error('Failed to create'); }
  };

  const handleDelete = async (id: string) => {
    try {
      if (tab === 'fines') await ownerAPI.deleteStaffFine(id);
      else await ownerAPI.deleteStaffBonus(id);
      toast.success('Deleted');
      await (tab === 'fines' ? loadFines() : loadBonuses());
    } catch { toast.error('Failed to delete'); }
  };

  const finesTotal = fines.reduce((s: number, f: any) => s + Number(f.amount || 0), 0);
  const bonusesTotal = bonuses.reduce((s: number, f: any) => s + Number(f.amount || 0), 0);

  const rows = (tab === 'fines' ? fines : bonuses).map((r: any) => ({
    ...r,
    staff_name: r.user_name || r.user_full_name || r.user || '—',
    amount_display: `${Number(r.amount || 0).toLocaleString()} sum`,
  }));

  return (
    <AppShell
      title={t('nav_hr', 'HR')}
      subtitle={t('hr_subtitle', 'Staff fines, bonuses and payroll')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><span className="text-theme-secondary">Waitly</span></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('nav_hr', 'HR')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard title="Fines total" value={`${finesTotal.toLocaleString()} sum`} icon={AlertTriangle} tone="coral" />
          <MetricCard title="Bonuses total" value={`${bonusesTotal.toLocaleString()} sum`} icon={Award} tone="mint" />
        </div>

        <Card className="border-theme bg-[var(--panel-bg)]">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-theme">{tab === 'fines' ? 'Fines' : 'Bonuses'}</CardTitle>
                <CardDescription>{tab === 'fines' ? 'Staff fines and deductions' : 'Staff bonuses and rewards'}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-full border border-theme bg-black/20 p-1">
                  {(['fines', 'bonuses'] as const).map(key => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === key ? 'bg-[linear-gradient(135deg,#f97360,#f7b267)] text-slate-950' : 'text-theme-muted hover:text-theme'}`}
                    >
                      {key === 'fines' ? 'Fines' : 'Bonuses'}
                    </button>
                  ))}
                </div>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-theme">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-5 w-full bg-white/6" /></TableCell>
                      </TableRow>
                    ))
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-theme-muted">No records yet</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row: any) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-semibold text-theme">{row.staff_name}</TableCell>
                        <TableCell className={tab === 'fines' ? 'font-semibold text-red-400' : 'font-semibold text-emerald-400'}>{row.amount_display}</TableCell>
                        <TableCell className="text-theme-secondary">{row.reason || '—'}</TableCell>
                        <TableCell className="text-theme-secondary">{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} aria-label="Delete record">
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="border-theme bg-[var(--modal-bg)] text-theme">
            <DialogHeader>
              <DialogTitle>{tab === 'fines' ? 'New Fine' : 'New Bonus'}</DialogTitle>
              <DialogDescription>
                {tab === 'fines' ? 'Add a deduction for a staff member' : 'Add a reward for a staff member'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hr-staff" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">Staff</Label>
                <select
                  id="hr-staff"
                  className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60"
                  value={form.user_id}
                  onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))}
                >
                  <option value="" className="bg-[#09131e]">Select staff</option>
                  {staff.map((s: any) => (
                    <option key={s.id} value={s.id} className="bg-[#09131e]">{s.full_name || s.email || s.id}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hr-amount" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">Amount</Label>
                <InputGroup>
                  <InputGroupInput id="hr-amount" type="number" placeholder="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hr-reason" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">Reason</Label>
                <InputGroup>
                  <InputGroupInput id="hr-reason" placeholder="Late arrival, great service..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
                </InputGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
