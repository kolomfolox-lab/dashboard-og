import { useEffect, useState } from 'react';
import { BadgeCheck, Building2, Mail, Pencil, RefreshCcw, ShieldPlus, Store, Trash2, UserRound, UsersRound } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { SubscriptionExpired } from '@/components/app/SubscriptionExpired';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { adminAPI, ownerAPI } from '@/services/api';

function normalizeRows(payload: any) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

const STAFF_ROLES = ['WAITER', 'HEAD_WAITER', 'HOSTESS', 'CHEF', 'COOK'];
const emptyForm = {
  id: '',
  full_name: '',
  phone_number: '',
  email: '',
  role: 'WAITER',
};

export default function UsersPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const showSubscriptionWarning = user?.role === 'RESTAURANT_OWNER' && workspace.selectedRestaurant?.subscription_active === false;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = isSuperAdmin ? await adminAPI.getOwners() : await ownerAPI.getStaff(workspace.selectedRestaurantId);
      const nextRows = normalizeRows(response.data).filter((row: any) => {
        if (!isSuperAdmin) return true;
        return row.role === 'Chain Owner' || row.role === 'Restaurant Owner' || row.role === 'CHAIN_OWNER' || row.role === 'RESTAURANT_OWNER';
      });
      setRows(nextRows);
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Odamlar royxatini yuklab bolmadi.' : 'Не удалось загрузить список.'));
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [locale, isSuperAdmin, user?.role, workspace.selectedRestaurantId, workspace.selectedRestaurant?.subscription_active]);

  const handleActivateSubscription = async (key: string) => {
    if (!workspace.selectedRestaurantId) throw new Error('No workspace selected');
    await ownerAPI.activateSubscription({ key, restaurant_id: workspace.selectedRestaurantId });
    workspace.reload();
  };

  const resetForm = () => {
    setForm(emptyForm);
  };

  const handleEdit = (row: any) => {
    setForm({
      id: row.id,
      full_name: row.full_name || '',
      phone_number: row.phone_number || row.phone || '',
      email: row.email || '',
      role: row.role || 'WAITER',
    });
    setInfo('');
    setError('');
  };

  const handleSaveStaff = async () => {
    if (!workspace.selectedRestaurantId) {
      setError(locale === 'uz' ? 'Avval restoran tanlang.' : 'Сначала выбери ресторан.');
      return;
    }
    if (!form.full_name.trim() || !form.phone_number.trim()) {
      setError(locale === 'uz' ? 'Ism va telefon majburiy.' : 'Имя и телефон обязательны.');
      return;
    }

    setSaving(true);
    setError('');
    setInfo('');
    try {
      if (form.id) {
        await ownerAPI.updateStaff(form.id, {
          full_name: form.full_name.trim(),
          role: form.role,
        });
        setInfo(locale === 'uz' ? 'Staff yangilandi.' : 'Сотрудник обновлен.');
      } else {
        await ownerAPI.createStaff({
          restaurant_id: workspace.selectedRestaurantId,
          full_name: form.full_name.trim(),
          phone_number: form.phone_number.trim(),
          email: form.email.trim() || undefined,
          role: form.role,
        });
        setInfo(locale === 'uz' ? 'Staff qoshildi.' : 'Сотрудник добавлен.');
      }
      resetForm();
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Saqlab bolmadi.' : 'Не удалось сохранить сотрудника.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row: any) => {
    try {
      setError('');
      setInfo('');
      await ownerAPI.updateStaff(row.id, { is_active: !row.is_active });
      setInfo(!row.is_active ? 'Staff activated.' : 'Staff deactivated.');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not update staff status.');
    }
  };

  const handleDeleteStaff = async (row: any) => {
    if (!window.confirm(`Delete ${row.full_name || 'this staff member'}?`)) return;
    try {
      setError('');
      setInfo('');
      await ownerAPI.deleteStaff(row.id);
      if (form.id === row.id) resetForm();
      setInfo('Staff member deleted.');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not delete staff.');
    }
  };

  const handleResendInvite = async (row: any) => {
    try {
      setError('');
      setInfo('');
      const response = await ownerAPI.resendStaffInvite(row.id);
      setInfo(response.data?.message || 'Invite sent.');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not resend invite.');
    }
  };

  return (
    <AppShell
      title={isSuperAdmin ? t('users_title_superadmin', 'Владельцы на платформе') : t('users_title_owner', 'Команда ресторана')}
      subtitle={isSuperAdmin ? t('users_subtitle_superadmin', 'Здесь видны только владельцы сетей и ресторанов без staff-шума.') : t('users_subtitle_owner', 'Команда ресторана снова управляется прямо из React.')}
      eyebrow={isSuperAdmin ? (locale === 'uz' ? 'Ownerlar' : 'Владельцы') : (locale === 'uz' ? 'Jamoa' : 'Команда')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        {showSubscriptionWarning ? (
          <SubscriptionExpired restaurantId={workspace.selectedRestaurantId} restaurantName={workspace.selectedRestaurant?.name} onActivate={handleActivateSubscription} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard title={locale === 'uz' ? 'Yuklanganlar' : 'Загружено'} value={rows.length} note={isSuperAdmin ? (locale === 'uz' ? 'Faqat owner rollar' : 'Только owner-роли') : (locale === 'uz' ? 'Joriy restoran jamoasi' : 'Команда текущего ресторана')} icon={UsersRound} tone="cyan" />
          <MetricCard title={locale === 'uz' ? 'Faol akkauntlar' : 'Активные аккаунты'} value={rows.filter((entry) => entry.is_active !== false).length} note={locale === 'uz' ? 'Kirish huquqi bor foydalanuvchilar' : 'Пользователи с доступом'} icon={BadgeCheck} tone="mint" />
          <MetricCard title={locale === 'uz' ? 'Joriy rol' : 'Текущая роль'} value={user?.role || 'Member'} note={locale === 'uz' ? 'Kirish darajasi' : 'Уровень доступа'} icon={UserRound} tone="sand" />
        </div>

        {!isSuperAdmin ? (
          <Panel title={form.id ? 'Edit staff member' : 'Add staff member'} eyebrow="Owner action" description="Owners can add waiters, hostesses, cooks, and other staff directly from React again.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InlineField label="Full name" value={form.full_name} onChange={(value) => setForm((current) => ({ ...current, full_name: value }))} placeholder="Ivan Perrdunov" />
              <InlineField label="Phone number" value={form.phone_number} onChange={(value) => setForm((current) => ({ ...current, phone_number: value }))} placeholder="+998 90 000 00 00" disabled={Boolean(form.id)} />
              <InlineField label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} placeholder="name@example.com" disabled={Boolean(form.id)} />
              <label className="block rounded-[24px] border border-white/8 bg-black/12 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-white/40">Role</div>
                <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none">
                  {STAFF_ROLES.map((role) => <option key={role} value={role} className="bg-[#09131e]">{role}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => void handleSaveStaff()} disabled={saving || !workspace.selectedRestaurantId}>
                <ShieldPlus className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : form.id ? 'Save staff' : 'Add staff'}
              </Button>
              <Button variant="secondary" onClick={() => { resetForm(); setError(''); setInfo(''); }}>
                Reset
              </Button>
              <Button variant="outline" onClick={() => void load()} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reload
              </Button>
            </div>
            {error ? <div className="mt-4 rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
            {info ? <div className="mt-4 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{info}</div> : null}
          </Panel>
        ) : null}

        <Panel title={isSuperAdmin ? (locale === 'uz' ? 'Owner katalogi' : 'Каталог владельцев') : (locale === 'uz' ? 'Jamoa royxati' : 'Список команды')} eyebrow={locale === 'uz' ? 'Royxat' : 'Список'} description={isSuperAdmin ? (locale === 'uz' ? 'Superadmin bu yerda faqat chain owner va restaurant ownerlarni koradi.' : 'Суперадмин здесь видит только chain owner и restaurant owner.') : (locale === 'uz' ? 'Joriy restoran boyicha staff royxati.' : 'Список staff по текущему ресторану с управлением.') }>
          {isSuperAdmin && error ? <div className="mb-4 rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
          {isSuperAdmin && info ? <div className="mb-4 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{info}</div> : null}
          <DataTable
            rows={rows}
            emptyMessage={loading ? (locale === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...') : (locale === 'uz' ? 'Malumot topilmadi.' : 'Данные не найдены.')}
            columns={isSuperAdmin ? [
              { label: locale === 'uz' ? 'Ism' : 'Имя', key: 'full_name', render: (row) => <div className="font-semibold text-white">{row.full_name || (locale === 'uz' ? 'Nomsiz owner' : 'Без имени')}</div> },
              { label: 'Email', key: 'email', render: (row) => row.email || '—' },
              { label: locale === 'uz' ? 'Telefon' : 'Телефон', key: 'phone', render: (row) => row.phone || row.phone_number || '—' },
              { label: locale === 'uz' ? 'Rol' : 'Роль', key: 'role' },
              { label: locale === 'uz' ? 'Tarmoqlar' : 'Сетей', key: 'chains', render: (row) => <div className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-[#8fd4ff]" /> {row.chains ?? 0}</div> },
              { label: locale === 'uz' ? 'Restoranlar' : 'Ресторанов', key: 'restaurants', render: (row) => <div className="inline-flex items-center gap-2"><Store className="h-4 w-4 text-[#ffb78f]" /> {row.restaurants ?? 0}</div> },
            ] : [
              { label: locale === 'uz' ? 'Ism' : 'Имя', key: 'full_name', render: (row) => <div className="font-semibold text-white">{row.full_name || (locale === 'uz' ? 'Nomsiz foydalanuvchi' : 'Без имени')}</div> },
              { label: locale === 'uz' ? 'Telefon' : 'Телефон', key: 'phone_number', render: (row) => row.phone_number || row.phone || '—' },
              { label: 'Email', key: 'email', render: (row) => row.email || '—' },
              { label: locale === 'uz' ? 'Rol' : 'Роль', key: 'role' },
              { label: locale === 'uz' ? 'Holat' : 'Статус', key: 'is_active', render: (row) => row.is_active ? (locale === 'uz' ? 'Faol' : 'Активен') : (locale === 'uz' ? 'Nofaol' : 'Неактивен') },
              {
                label: locale === 'uz' ? 'Amallar' : 'Действия',
                key: 'id',
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(row)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void handleToggleActive(row)}>
                      {row.is_active ? 'Disable' : 'Enable'}
                    </Button>
                    {row.email ? (
                      <Button variant="outline" size="sm" onClick={() => void handleResendInvite(row)}>
                        <Mail className="mr-2 h-3.5 w-3.5" />
                        Invite
                      </Button>
                    ) : null}
                    <Button variant="destructive" size="sm" onClick={() => void handleDeleteStaff(row)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}

function InlineField({ label, value, onChange, placeholder, disabled = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <label className="block rounded-[24px] border border-white/8 bg-black/12 p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</div>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 disabled:cursor-not-allowed disabled:opacity-50" />
    </label>
  );
}




