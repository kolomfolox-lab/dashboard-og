import { useEffect, useState } from 'react';
import { BadgeCheck, Building2, Mail, Pencil, Plus, ShieldPlus, Store, Trash2, UserRound, UsersRound, X } from 'lucide-react';

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
const OWNER_ROLES = ['RESTAURANT_OWNER', 'CHAIN_OWNER'];
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
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
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
    setForm({ ...emptyForm, role: isSuperAdmin ? 'RESTAURANT_OWNER' : 'WAITER' });
  };

  const openCreateStaff = () => {
    resetForm();
    setError('');
    setInfo('');
    setStaffDialogOpen(true);
  };

  const handleEdit = (row: any) => {
    setForm({
      id: row.id,
      full_name: row.full_name || '',
      phone_number: row.phone_number || row.phone || '',
      email: row.email || '',
      role: row.role_code || row.role || (isSuperAdmin ? 'RESTAURANT_OWNER' : 'WAITER'),
    });
    setInfo('');
    setError('');
    setStaffDialogOpen(true);
  };

  const handleSaveStaff = async () => {
    if (!isSuperAdmin && !workspace.selectedRestaurantId) {
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
      if (isSuperAdmin) {
        if (form.id) {
          await adminAPI.updateOwner(form.id, {
            full_name: form.full_name.trim(),
            email: form.email.trim() || undefined,
            role: form.role,
          });
          setInfo(locale === 'uz' ? 'Owner yangilandi.' : 'Владелец обновлен.');
        } else {
          await adminAPI.createOwner({
            full_name: form.full_name.trim(),
            phone_number: form.phone_number.trim(),
            email: form.email.trim() || undefined,
            role: form.role,
          });
          setInfo(locale === 'uz' ? 'Owner qoshildi.' : 'Владелец добавлен.');
        }
      } else if (form.id) {
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
      setStaffDialogOpen(false);
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
      if (isSuperAdmin) {
        await adminAPI.updateOwner(row.id, {
          full_name: row.full_name,
          email: row.email || undefined,
          role: row.role_code || row.role,
          is_active: !row.is_active,
        });
      } else {
        await ownerAPI.updateStaff(row.id, { is_active: !row.is_active });
      }
      setInfo(isSuperAdmin ? (!row.is_active ? 'Owner activated.' : 'Owner deactivated.') : (!row.is_active ? 'Staff activated.' : 'Staff deactivated.'));
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not update staff status.');
    }
  };

  const handleDeleteStaff = async (row: any) => {
    if (!window.confirm(`Delete ${row.full_name || (isSuperAdmin ? 'this owner' : 'this staff member')}?`)) return;
    try {
      setError('');
      setInfo('');
      if (isSuperAdmin) {
        await adminAPI.deleteOwner(row.id);
      } else {
        await ownerAPI.deleteStaff(row.id);
      }
      if (form.id === row.id) resetForm();
      setInfo(isSuperAdmin ? 'Owner deleted.' : 'Staff member deleted.');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || (isSuperAdmin ? 'Could not delete owner.' : 'Could not delete staff.'));
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

        {staffDialogOpen ? (
          <div className="fixed inset-0 z-[120] grid place-items-center bg-black/62 px-4 py-6 backdrop-blur-xl" onClick={() => { if (!saving) setStaffDialogOpen(false); }}>
            <div className="w-full max-w-2xl rounded-[34px] border border-white/12 bg-[#0d1825] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.5)]" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8fd4ff]">{isSuperAdmin ? 'Quick owner' : 'Quick staff'}</div>
                  <h2 className="mt-2 font-display text-3xl text-white">
                    {form.id
                      ? isSuperAdmin
                        ? (locale === 'uz' ? 'Ownerni tahrirlash' : 'Редактировать владельца')
                        : (locale === 'uz' ? 'Xodimni tahrirlash' : 'Редактировать сотрудника')
                      : isSuperAdmin
                      ? (locale === 'uz' ? 'Yangi owner' : 'Новый владелец')
                      : (locale === 'uz' ? 'Yangi xodim' : 'Новый сотрудник')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-white/56">{isSuperAdmin ? (locale === 'uz' ? 'Owner akkauntini yarating. Keyin unga restoran yoki tarmoq biriktirish mumkin.' : 'Создай owner-аккаунт. Потом к нему можно привязать ресторан или сеть.') : (locale === 'uz' ? 'Kerakli minimal ma`lumotlarni kiriting. Taklif email bo`lsa yuboriladi.' : 'Только нужные поля. Если email указан, можно отправить приглашение.')}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setStaffDialogOpen(false)} disabled={saving}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InlineField label={locale === 'uz' ? 'Ism' : 'Имя'} value={form.full_name} onChange={(value) => setForm((current) => ({ ...current, full_name: value }))} placeholder="Ivan Perrdunov" />
                <InlineField label={locale === 'uz' ? 'Telefon' : 'Телефон'} value={form.phone_number} onChange={(value) => setForm((current) => ({ ...current, phone_number: value }))} placeholder="+998 90 000 00 00" disabled={Boolean(form.id)} />
                <InlineField label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} placeholder="name@example.com" disabled={Boolean(form.id)} />
                <label className="block rounded-[24px] border border-white/8 bg-black/12 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/40">{locale === 'uz' ? 'Rol' : 'Роль'}</div>
                  <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none">
                    {(isSuperAdmin ? OWNER_ROLES : STAFF_ROLES).map((role) => <option key={role} value={role} className="bg-[#09131e]">{role}</option>)}
                  </select>
                </label>
              </div>

              {staffDialogOpen && error ? <div className="mt-4 rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
              {staffDialogOpen && info ? <div className="mt-4 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{info}</div> : null}

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => { resetForm(); setError(''); setInfo(''); setStaffDialogOpen(false); }} disabled={saving}>
                  {locale === 'uz' ? 'Bekor qilish' : 'Отмена'}
                </Button>
                <Button onClick={() => void handleSaveStaff()} disabled={saving || (!isSuperAdmin && !workspace.selectedRestaurantId)} className="min-w-[190px]">
                  <ShieldPlus className="mr-2 h-4 w-4" />
                  {saving ? (locale === 'uz' ? 'Saqlanmoqda...' : 'Сохраняю...') : form.id ? (locale === 'uz' ? 'Saqlash' : 'Сохранить') : (locale === 'uz' ? 'Qo`shish' : 'Добавить')}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <Panel
          title={isSuperAdmin ? (locale === 'uz' ? 'Owner katalogi' : 'Каталог владельцев') : (locale === 'uz' ? 'Jamoa royxati' : 'Список команды')}
          eyebrow={locale === 'uz' ? 'Royxat' : 'Список'}
          description={isSuperAdmin ? (locale === 'uz' ? 'Superadmin bu yerda faqat chain owner va restaurant ownerlarni koradi.' : 'Суперадмин здесь видит только chain owner и restaurant owner.') : (locale === 'uz' ? 'Joriy restoran boyicha staff royxati.' : 'Список staff по текущему ресторану с управлением.') }
          action={
            <Button onClick={openCreateStaff} disabled={!isSuperAdmin && !workspace.selectedRestaurantId} className="h-11 px-5">
              <Plus className="mr-2 h-4 w-4" />
              {locale === 'uz' ? 'Qo`shish' : 'Добавить'}
            </Button>
          }
        >
          {!staffDialogOpen && error ? <div className="mb-4 rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}
          {!staffDialogOpen && info ? <div className="mb-4 rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{info}</div> : null}
          <DataTable
            rows={rows}
            emptyMessage={loading ? (locale === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...') : (locale === 'uz' ? 'Malumot topilmadi.' : 'Данные не найдены.')}
            columns={isSuperAdmin ? [
              { label: locale === 'uz' ? 'Ism' : 'Имя', key: 'full_name', render: (row) => <div className="font-semibold text-white"><div className="flex items-center gap-2">{row.full_name || (locale === 'uz' ? 'Nomsiz owner' : 'Без имени')}{row.is_active !== false && row.email ? <BadgeCheck className="h-4 w-4 text-[#34d399]" /> : null}</div>{row.created_at ? <div className="text-xs text-white/40 mt-0.5">Участник с {new Date(row.created_at).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}</div> : null}</div> },
              { label: 'Email', key: 'email', render: (row) => row.email || '—' },
              { label: locale === 'uz' ? 'Telefon' : 'Телефон', key: 'phone', render: (row) => row.phone || row.phone_number || '—' },
              { label: locale === 'uz' ? 'Rol' : 'Роль', key: 'role', render: (row) => <div className="inline-flex items-center gap-1.5"><ShieldPlus className="h-3.5 w-3.5 text-[#8fd4ff]" /><span className="font-medium">{row.role}</span></div> },
              { label: locale === 'uz' ? 'Tarmoqlar' : 'Сетей', key: 'chains', render: (row) => <div className="inline-flex items-center gap-2"><Building2 className="h-4 w-4 text-[#8fd4ff]" /> {row.chains ?? 0}</div> },
              { label: locale === 'uz' ? 'Restoranlar' : 'Ресторанов', key: 'restaurants', render: (row) => <div className="inline-flex items-center gap-2"><Store className="h-4 w-4 text-[#ffb78f]" /> {row.restaurants ?? 0}</div> },
              { label: locale === 'uz' ? 'Holat' : 'Статус', key: 'is_active', render: (row) => row.is_active !== false ? <span className="inline-flex items-center gap-1.5 text-[#34d399]"><BadgeCheck className="h-3.5 w-3.5" />{locale === 'uz' ? 'Faol' : 'Активен'}</span> : <span className="text-white/40">{locale === 'uz' ? 'Nofaol' : 'Неактивен'}</span> },
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
                      {row.is_active !== false ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => void handleDeleteStaff(row)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                ),
              },
            ] : [
              { label: locale === 'uz' ? 'Ism' : 'Имя', key: 'full_name', render: (row) => <div className="font-semibold text-white"><div className="flex items-center gap-2">{row.full_name || (locale === 'uz' ? 'Nomsiz foydalanuvchi' : 'Без имени')}{row.is_active ? <BadgeCheck className="h-4 w-4 text-[#34d399]" /> : null}</div></div> },
              { label: locale === 'uz' ? 'Telefon' : 'Телефон', key: 'phone_number', render: (row) => row.phone_number || row.phone || '—' },
              { label: 'Email', key: 'email', render: (row) => row.email || '—' },
              { label: locale === 'uz' ? 'Rol' : 'Роль', key: 'role', render: (row) => <div className="inline-flex items-center gap-1.5"><ShieldPlus className="h-3.5 w-3.5 text-[#8fd4ff]" /><span className="font-medium">{row.role}</span></div> },
              { label: locale === 'uz' ? 'Holat' : 'Статус', key: 'is_active', render: (row) => row.is_active ? <span className="inline-flex items-center gap-1.5 text-[#34d399]"><BadgeCheck className="h-3.5 w-3.5" />{locale === 'uz' ? 'Faol' : 'Активен'}</span> : <span className="text-white/40">{locale === 'uz' ? 'Nofaol' : 'Неактивен'}</span> },
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




