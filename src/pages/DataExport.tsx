import { FileSpreadsheet, Download, Package } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { dataExportAPI, ownerAPI } from '@/services/api';

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function DataExportPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async (type: string) => {
    if (!workspace.selectedRestaurantId) return;
    setExporting(true);
    setError('');
    try {
      if (type === 'restaurant') {
        const res = await dataExportAPI.exportRestaurants(workspace.selectedRestaurantId);
        if (res.data.type === 'application/json' || (res.data instanceof Blob && res.data.type.includes('json'))) {
          const text = await res.data.text();
          const json = JSON.parse(text);
          throw new Error(json.error || json.detail || t('dataExport_export_failed', 'Export failed'));
        }
        downloadBlob(res.data, `report-${workspace.selectedRestaurant?.name || 'restaurant'}.xlsx`);
      } else if (type === 'tax') {
        const res = await dataExportAPI.exportTaxReport(workspace.selectedRestaurantId);
        if (res.data.type === 'application/json' || (res.data instanceof Blob && res.data.type.includes('json'))) {
          const text = await res.data.text();
          const json = JSON.parse(text);
          throw new Error(json.error || json.detail || t('dataExport_tax_export_failed', 'Tax export failed'));
        }
        downloadBlob(res.data, `tax_report_${workspace.selectedRestaurant?.name || 'restaurant'}.xlsx`);
      } else if (type === 'orders') {
        const res = await ownerAPI.getOrders(workspace.selectedRestaurantId);
        const orders = (res.data as any[]) || [];
        const wb = XLSX.utils.book_new();
        const wsData = [
          ['Order ID', 'Status', 'Created', 'Total (UZS)', 'Table', 'Waiter', 'Items'],
          ...orders.map((o: any) => [
            o.id,
            o.status,
            o.created_at_display || (o.created_at ? new Date(o.created_at).toLocaleString('ru-UZ') : ''),
            o.total,
            o.table || '',
            o.waiter || '',
            o.items_count ?? '',
          ]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [
          { wch: 36 }, { wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 8 }, { wch: 20 }, { wch: 8 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');
        const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        downloadBlob(new Blob([buf]), `orders-${workspace.selectedRestaurant?.name || 'data'}-${Date.now()}.xlsx`);
      } else if (type === 'inventory') {
        const res = await ownerAPI.getInventory(workspace.selectedRestaurantId);
        const stock = (res.data as any).stock || [];
        const wb = XLSX.utils.book_new();
        const wsData = [
          ['Ingredient', 'Unit', 'Quantity', 'Min Quantity', 'Status', 'Last Updated'],
          ...stock.map((s: any) => [
            s.name,
            s.unit,
            s.quantity,
            s.minimum_quantity,
            s.is_empty ? 'Empty' : s.is_low ? 'Low' : 'OK',
            s.updated_at ? new Date(s.updated_at).toLocaleString('ru-UZ') : '',
          ]),
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [
          { wch: 28 }, { wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 10 }, { wch: 20 },
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
        const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        downloadBlob(new Blob([buf]), `inventory-${workspace.selectedRestaurant?.name || 'stock'}-${Date.now()}.xlsx`);
      }
    } catch (err: any) {
      setError(err?.message || t('dataExport_error', 'Export failed. Make sure the server is running.'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <AppShell title={t('dataExport_title', 'Data Export')} subtitle={t('dataExport_subtitle', 'Export restaurant data for accounting, tax reports, and analysis.')} eyebrow={t('dataExport_eyebrow', 'Waitly Data')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title={t('dataExport_restaurant_title', 'Restaurant report')} eyebrow={t('dataExport_excel', 'Excel')} description={t('dataExport_restaurant_desc', 'Full restaurant report with orders, revenue, and staff stats.')}>
          <Button variant="secondary" onClick={() => handleExport('restaurant')} disabled={exporting || !workspace.selectedRestaurantId} className="w-full">
            <FileSpreadsheet className="mr-2 h-4 w-4" />{t('dataExport_restaurant_btn', 'Export Excel report')}
          </Button>
        </Panel>
        <Panel title={t('dataExport_orders_title', 'Orders')} eyebrow={t('dataExport_excel', 'Excel')} description={t('dataExport_orders_desc', 'Raw order data with statuses, dates, totals, and table info.')}>
          <Button variant="secondary" onClick={() => handleExport('orders')} disabled={exporting || !workspace.selectedRestaurantId} className="w-full">
            <Download className="mr-2 h-4 w-4" />{t('dataExport_orders_btn', 'Export orders (xlsx)')}
          </Button>
        </Panel>
        <Panel title={t('dataExport_tax_title', 'Tax report')} eyebrow={t('dataExport_tax_eyebrow', 'Uzbekistan')} description={t('dataExport_tax_desc', 'Formatted report for the Tax Committee of Uzbekistan (solik hisoboti) with tax calculations.')}>
          <p className="mb-4 text-sm text-theme-secondary">{t('dataExport_tax_note', 'Includes: gross revenue, turnover tax (4%), social tax estimate, daily breakdown, and net profit.')}</p>
          <Button variant="secondary" onClick={() => handleExport('tax')} disabled={exporting || !workspace.selectedRestaurantId} className="w-full">
            <Download className="mr-2 h-4 w-4" />{t('dataExport_tax_btn', 'Download tax report (Excel)')}
          </Button>
        </Panel>
        <Panel title={t('dataExport_inventory_title', 'Inventory export')} eyebrow={t('dataExport_inventory_eyebrow', 'Stock')} description={t('dataExport_inventory_desc', 'Export current stock levels and ingredient status.')}>
          <Button variant="secondary" onClick={() => handleExport('inventory')} disabled={exporting || !workspace.selectedRestaurantId} className="w-full">
            <Package className="mr-2 h-4 w-4" />{t('dataExport_inventory_btn', 'Export inventory (xlsx)')}
          </Button>
        </Panel>
      </div>
      {error ? <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
    </AppShell>
  );
}
