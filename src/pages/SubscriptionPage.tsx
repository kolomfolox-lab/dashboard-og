import { CreditCard, RefreshCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { SubscriptionExpired } from '@/components/app/SubscriptionExpired';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, type OwnerSubscriptionStatusResponse } from '@/services/api';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [status, setStatus] = useState<OwnerSubscriptionStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true); setError('');
    try { const response = await ownerAPI.subscriptionStatus(workspace.selectedRestaurantId); setStatus(response.data); }
    catch (err: any) { setError(err?.response?.data?.error || 'Could not load subscription status.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const handleActivateSubscription = async (key: string) => {
    if (!workspace.selectedRestaurantId) throw new Error('No workspace selected');
    await ownerAPI.activateSubscription({ key, restaurant_id: workspace.selectedRestaurantId });
    workspace.reload();
    await load();
  };

  const expiresAt = status?.expires_at;
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  const isActive = workspace.selectedRestaurant?.subscription_active !== false && status?.subscription_status !== 'BLOCKED';

  return (
    <AppShell
      title="Subscription"
      subtitle="Manage subscription status and activation."
      eyebrow="Waitly Control"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}>
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Panel title={workspace.selectedRestaurant?.name || 'Workspace'} eyebrow="Selected restaurant"
            description="Current subscription state and activation.">
            <div className="flex items-center gap-3 rounded-[24px] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${isActive ? 'bg-emerald-500/12 text-emerald-100' : 'bg-amber-400/12 text-amber-100'}`}>
                {isActive ? <ShieldCheck className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{isActive ? 'Active' : 'Inactive'}</div>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">
                  {daysLeft != null ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining` : (isActive ? 'Active' : 'Inactive')}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => void load()} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" />Refresh status
              </Button>
            </div>
            {error ? <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
          </Panel>
          <Panel title="How it works" eyebrow="Owner action"
            description="If inactive, a banner stays visible across the owner area and links back here.">
            <div className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
              <p>1. Pick a restaurant from the workspace selector.</p>
              <p>2. Enter a valid subscription key below.</p>
              <p>3. After activation, blocked pages become available again.</p>
            </div>
          </Panel>
        </div>
        <SubscriptionExpired
          restaurantId={workspace.selectedRestaurantId}
          restaurantName={workspace.selectedRestaurant?.name}
          onActivate={handleActivateSubscription}
        />
      </div>
    </AppShell>
  );
}
