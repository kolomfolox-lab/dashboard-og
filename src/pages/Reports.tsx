import { FileSpreadsheet, FileText, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

export default function ReportsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const res = await ownerAPI.getShiftReports(workspace.selectedRestaurantId);
      setReports(res.data.results || res.data || []);
    } catch { setReports([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const generate = async (type: 'X' | 'Z') => {
    if (!workspace.selectedRestaurantId) return;
    setGenerating(true);
    try {
      const fn = type === 'X' ? ownerAPI.generateXReport : ownerAPI.generateZReport;
      await fn({ restaurant_id: workspace.selectedRestaurantId });
      await load();
    } catch {}
    finally { setGenerating(false); }
  };

  return (
    <AppShell title={t('reports_title', 'Reports')} subtitle={t('reports_subtitle', 'X/Z reports, tax reports, and financial summaries.')} eyebrow={t('reports_eyebrow', 'Waitly Finance')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><span className="text-theme-secondary">Waitly</span></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{t('reports_title', 'Reports')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{t('reports_generate_eyebrow', 'Shift reports')}</div>
              <CardTitle className="mt-2 text-lg text-theme">{t('reports_generate_title', 'Generate report')}</CardTitle>
              <CardDescription>{t('reports_generate_desc', 'Create X (intermediate) or Z (final) reports for the current shift.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => generate('X')} disabled={generating || !workspace.selectedRestaurantId}>
                  {generating ? <Spinner className="h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}{t('reports_generate_x', 'Generate X-report')}
                </Button>
                <Button variant="secondary" onClick={() => generate('Z')} disabled={generating || !workspace.selectedRestaurantId}>
                  {generating ? <Spinner className="h-4 w-4" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}{t('reports_generate_z', 'Generate Z-report')}
                </Button>
                <Button variant="outline" onClick={load} disabled={loading}>
                  {loading ? <Spinner className="h-4 w-4" /> : <Receipt className="mr-2 h-4 w-4" />}{t('reports_refresh', 'Refresh')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-theme bg-[var(--panel-bg)]">
            <CardHeader>
              <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{t('reports_tax_eyebrow', 'Uzbekistan')}</div>
              <CardTitle className="mt-2 text-lg text-theme">{t('reports_tax_title', 'Tax reports')}</CardTitle>
              <CardDescription>{t('reports_tax_desc', 'Reports for the Tax Committee of Uzbekistan.')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-theme-secondary">{t('reports_tax_note', 'Tax report generation is available from the Data Export page.')}</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => window.location.href = '/data-export'}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />{t('reports_tax_go', 'Go to Data Export')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-theme bg-[var(--panel-bg)]">
          <CardHeader>
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{t('reports_history_eyebrow', 'History')}</div>
            <CardTitle className="mt-2 text-lg text-theme">{t('reports_history_title', 'Generated reports')}</CardTitle>
            <CardDescription>{t('reports_subtitle', 'X/Z reports, tax reports, and financial summaries.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-theme">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports_col_type', 'Type')}</TableHead>
                    <TableHead>{t('reports_col_date', 'Date')}</TableHead>
                    <TableHead>{t('reports_col_orders', 'Orders')}</TableHead>
                    <TableHead>{t('reports_col_revenue', 'Revenue')}</TableHead>
                    <TableHead>{t('reports_col_discounts', 'Discounts')}</TableHead>
                    <TableHead>{t('reports_col_generated_by', 'Generated by')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}><Skeleton className="h-5 w-full bg-white/6" /></TableCell>
                      </TableRow>
                    ))
                  ) : reports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-theme-muted">{t('reports_empty', 'No reports generated yet.')}</TableCell>
                    </TableRow>
                  ) : (
                    reports.map((row: any) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/6 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-theme-secondary">
                            <FileText className="h-3 w-3 text-[#8fd4ff]" />
                            {row.report_type}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(row.created_at).toLocaleString('ru-RU')}</TableCell>
                        <TableCell className="text-theme">{row.total_orders}</TableCell>
                        <TableCell className="font-semibold text-theme">{`${Number(row.total_revenue).toLocaleString()} UZS`}</TableCell>
                        <TableCell>{`${Number(row.total_discounts).toLocaleString()} UZS`}</TableCell>
                        <TableCell>{row.generated_by_name || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
