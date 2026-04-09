import { useEffect, useState } from 'react';
import { Download, Plus, QrCode, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { SubscriptionExpired } from '@/components/app/SubscriptionExpired';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

export default function TablesPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [rows, setRows] = useState<any[]>([]);
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const isSubscribed = user?.role !== 'RESTAURANT_OWNER' || workspace.selectedRestaurant?.subscription_active !== false;

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    setError('');
    try {
      const response = await ownerAPI.getTables(workspace.selectedRestaurantId);
      setRows(response.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [workspace.selectedRestaurantId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.selectedRestaurantId || !number.trim()) return;
    setSubmitting(true);
    setError('');
    setInfo('');
    try {
      await ownerAPI.createTable({ restaurant_id: workspace.selectedRestaurantId, number: number.trim() });
      setInfo('Table created successfully.');
      setNumber('');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create table.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm(`Delete table ${row.number}?`)) return;
    try {
      await ownerAPI.deleteTable(row.id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete table.');
    }
  };

  const handleActivateSubscription = async (key: string) => {
    if (!workspace.selectedRestaurantId) {
      throw new Error('No workspace selected');
    }

    await ownerAPI.activateSubscription({
      key,
      restaurant_id: workspace.selectedRestaurantId,
    });
    workspace.reload();
  };

  if (!isSubscribed) {
    return (
      <AppShell
        title={t('tables_title', 'Tables and QR')}
        subtitle={t('tables_subtitle', 'Add, delete, and download table QR codes without the old HTML chaos.')}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <SubscriptionExpired
          restaurantId={workspace.selectedRestaurantId}
          restaurantName={workspace.selectedRestaurant?.name}
          onActivate={handleActivateSubscription}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={t('tables_title', 'Tables and QR')}
      subtitle={t('tables_subtitle', 'Add, delete, and download table QR codes without the old HTML chaos.')}
      eyebrow="Service floor"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <Panel title={workspace.selectedRestaurant?.name || 'Restaurant tables'} eyebrow="QR control" description="Owners can manage service tables from one clean screen.">
          <form onSubmit={handleCreate} className="mb-4 flex flex-col gap-3 md:flex-row">
            <input
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="1, 2, VIP-1..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/22 focus:border-[#f97360] focus:outline-none"
            />
            <Button type="submit" disabled={submitting || !workspace.selectedRestaurantId}>
              <Plus className="mr-2 h-4 w-4" /> {t('tables_add', 'Add table')}
            </Button>
            {workspace.selectedRestaurantId ? (
              <a href={ownerAPI.getTablesQrPdf(workspace.selectedRestaurantId)} target="_blank" rel="noreferrer">
                <Button type="button" variant="outline">
                  <Download className="mr-2 h-4 w-4" /> {t('tables_download_all', 'Download all QR')}
                </Button>
              </a>
            ) : null}
          </form>

          {error ? <div className="mb-4 rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
          {info ? <div className="mb-4 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{info}</div> : null}

          <DataTable
            rows={rows}
            emptyMessage={loading ? 'Loading tables...' : 'No tables yet.'}
            columns={[
              { label: 'Table', key: 'number', render: (row) => <div className="font-semibold text-white">Table {row.number}</div> },
              { label: 'Status', key: 'is_occupied', render: (row) => row.is_occupied ? 'Occupied' : 'Free' },
              { label: 'Waiter', key: 'waiter', render: (row) => row.waiter || '—' },
              {
                label: 'QR',
                key: 'qr_url',
                render: (row) => (
                  <a href={ownerAPI.getTableQr(row.id)} target="_blank" rel="noreferrer" className="inline-flex items-center text-[#8fd4ff] hover:text-white">
                    <QrCode className="mr-2 h-4 w-4" /> PNG
                  </a>
                ),
              },
              {
                label: 'Action',
                key: 'id',
                render: (row) => (
                  <Button variant="outline" size="sm" onClick={() => handleDelete(row)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                ),
              },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
