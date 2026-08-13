import { ShieldCheck, Plus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

const ALL_PERMISSIONS = [
  { key: 'manage_menu', label: 'Manage menu', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER'] },
  { key: 'manage_orders', label: 'Manage orders', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER', 'WAITER'] },
  { key: 'manage_staff', label: 'Manage staff', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER'] },
  { key: 'manage_tables', label: 'Manage tables', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER', 'HOSTESS'] },
  { key: 'manage_inventory', label: 'Manage inventory', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER', 'CHEF'] },
  { key: 'view_reports', label: 'View reports', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER'] },
  { key: 'manage_payments', label: 'Manage payments', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER'] },
  { key: 'manage_promo', label: 'Manage promo codes', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER'] },
  { key: 'manage_surveys', label: 'Manage surveys', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER'] },
  { key: 'write_off_stock', label: 'Write off stock', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER', 'CHEF'] },
  { key: 'view_tech_cards', label: 'View tech cards', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'CHEF', 'COOK'] },
  { key: 'edit_tech_cards', label: 'Edit tech cards', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'CHEF'] },
  { key: 'manage_bookings', label: 'Manage bookings', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER', 'HOSTESS'] },
  { key: 'view_crm', label: 'View CRM', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER'] },
  { key: 'export_data', label: 'Export data', roles: ['CHAIN_OWNER', 'RESTAURANT_OWNER', 'MANAGER'] },
];

const ROLE_LABELS: Record<string, string> = {
  CHAIN_OWNER: 'Chain Owner',
  RESTAURANT_OWNER: 'Restaurant Owner',
  MANAGER: 'Manager',
  WAITER: 'Waiter',
  HOSTESS: 'Hostess',
  CHEF: 'Chef',
  COOK: 'Cook',
};

type RolePerms = Record<string, Record<string, boolean>>;

export default function PermissionsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'SUPER_ADMIN' || user?.role === 'CHAIN_OWNER' || user?.role === 'RESTAURANT_OWNER');
  const [rolePerms, setRolePerms] = useState<RolePerms>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const defaults: RolePerms = {};
    for (const role of Object.keys(ROLE_LABELS)) {
      defaults[role] = {};
      for (const perm of ALL_PERMISSIONS) {
        defaults[role][perm.key] = perm.roles.includes(role);
      }
    }
    setRolePerms(defaults);
  }, []);

  const toggle = (role: string, perm: string) => {
    setRolePerms(prev => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role]?.[perm] },
    }));
  };

  const canEdit = user?.role === 'CHAIN_OWNER';

  return (
    <AppShell title={t('permissions_title', 'Role Permissions')} subtitle={t('permissions_subtitle', 'Configure granular permissions for each staff role.')} eyebrow={t('permissions_eyebrow', 'Waitly Access')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <Panel title={t('permissions_matrix_title', 'Permission matrix')} eyebrow={t('permissions_matrix_eyebrow', 'Безопасность')} description={t('permissions_matrix_desc', 'Toggle which roles have access to which features.')}>
        <div className="mb-4 flex flex-wrap gap-3 text-xs">
          {Object.entries(ROLE_LABELS).map(([roleKey, roleLabel]) => {
            const count = ALL_PERMISSIONS.filter(p => rolePerms[roleKey]?.[p.key]).length;
            return <span key={roleKey} className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-3 py-1.5"><ShieldCheck className="h-3 w-3 text-[#8fd4ff]" /><span className="font-medium text-white/80">{t(`permissions_role_${roleKey.toLowerCase()}`, roleLabel)}</span><span className="text-white/40">{count}/{ALL_PERMISSIONS.length}</span></span>;
          })}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/8">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.28em] text-theme-muted">{t('permissions_col_permission', 'Permission')}</th>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <th key={key} className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-theme-muted">{t(`permissions_role_${key.toLowerCase()}`, label)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {ALL_PERMISSIONS.map((perm) => (
                <tr key={perm.key} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-sm text-theme">{t(`permissions_perm_${perm.key}`, perm.label)}</td>
                  {Object.keys(ROLE_LABELS).map((role) => (
                    <td key={role} className="px-3 py-3 text-center">
                      <button
                        onClick={() => canEdit && toggle(role, perm.key)}
                        disabled={!canEdit}
                        className={`h-5 w-5 rounded border ${
                          rolePerms[role]?.[perm.key]
                            ? 'bg-emerald-500 border-emerald-400'
                            : 'bg-white/5 border-white/15'
                        } transition-colors ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-emerald-400/30'}`}
                      >
                        {rolePerms[role]?.[perm.key] ? (
                          <ShieldCheck className="h-4 w-4 text-emerald-200 mx-auto" />
                        ) : null}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {canEdit ? (
          <div className="mt-5 flex items-center gap-4">
            <Button onClick={() => setSaving(true)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />{t('permissions_save', 'Save permissions')}
            </Button>
            <p className="text-xs text-amber-300/60">{t('permissions_risk_hint', 'Давайте права только на нужные действия — это снижает риски.')}</p>
          </div>
        ) : (
          <p className="mt-4 flex items-center gap-2 text-sm text-amber-300"><ShieldCheck className="h-4 w-4" />{t('permissions_chain_owner_only', 'Only Chain Owners can edit permissions.')}</p>
        )}
      </Panel>
    </AppShell>
  );
}
