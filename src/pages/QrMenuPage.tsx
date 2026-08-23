import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/app/Panel';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { QrCode } from 'lucide-react';
export default function QrMenuPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  return (
    <AppShell title="QR-меню" subtitle="Гости сканируют QR на столе" eyebrow="Меню" restaurants={workspace.restaurants} selectedRestaurantId={workspace.selectedRestaurantId} onRestaurantChange={workspace.setSelectedRestaurantId}>
      <Panel title="QR-меню" eyebrow="Меню">
        <div className="rounded-xl border border-theme bg-white/[0.03] p-8 text-center">
          <QrCode className="mx-auto h-10 w-10 text-theme-muted mb-3" />
          <div className="font-medium text-theme">QR-меню для каждого стола</div>
          <div className="text-sm text-theme-muted mt-1">Печать QR: /qr/{"{slug}"}/{"{table}"}/ — гость открывает меню без приложения</div>
          <Button size="sm" className="mt-4" onClick={() => window.open(`/qr/${workspace.selectedRestaurant?.slug || ''}/1/`, '_blank')}>Открыть QR-меню</Button>
        </div>
      </Panel>
    </AppShell>
  );
}
