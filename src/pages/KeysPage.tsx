import { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';
import { adminAPI } from '@/services/api';

export default function KeysPage() {
  const { t, locale } = useLocale();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [duration, setDuration] = useState(12);
  const [count, setCount] = useState(1);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const keysRes = await adminAPI.getKeys();
      setKeys(keysRes.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || t('keys_page_load_error', 'Не удалось загрузить ключи.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [locale]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      await adminAPI.generateKey({ duration_months: duration, count });
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || t('keys_page_create_error', 'Не удалось создать ключ.'));
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (key: any) => {
    if (!window.confirm(`${t('keys_page_revoke_confirm', 'Отозвать ключ')} ${key.key}?`)) return;
    setError('');
    try {
      await adminAPI.revokeKey(key.id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || t('keys_page_revoke_error', 'Не удалось отозвать ключ.'));
    }
  };

  return (
    <AppShell
      title={t('keys_page_title', 'Ключи подписки')}
      subtitle={t('keys_page_subtitle', 'Создание, просмотр и отзыв ключей.')}
      eyebrow={t('keys_page_eyebrow', 'Биллинг')}
    >
      <div className="space-y-4">
        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        <div className="rounded-[24px] border border-amber-500/15 bg-amber-500/8 px-5 py-4 text-sm text-amber-200/80">
          <strong className="text-amber-200">{t('keys_page_warning_title', 'Важно:')}</strong> {t('keys_page_warning_text', 'каждый ресторан должен активировать ключ в течение 7 дней после генерации, иначе подписка автоматически отключается. Без активного ключа гости не смогут оставлять отзывы и заказывать по QR.')}
        </div>

        <Panel title={t('keys_page_generate_title', 'Создать ключ')} eyebrow={t('keys_page_generation', 'Генерация')} description={t('keys_page_generate_desc', 'Сгенерируйте новые ключи подписки.')}>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm text-white/60">{t('keys_page_duration_label', 'Срок (мес.)')}</label>
              <select
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {[1, 3, 6, 12, 24].map((m) => (
                  <option key={m} value={m}>{m} {t('keys_page_months', 'мес.')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/60">{t('keys_page_count_label', 'Количество')}</label>
              <input
                type="number"
                min={1}
                max={10}
                className="w-20 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={count}
                onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value))))}
              />
            </div>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating
                ? t('keys_page_generating', 'Генерация...')
                : t('keys_page_create', 'Создать')}
            </Button>
          </div>
        </Panel>

        <Panel title={`${keys.length}`} eyebrow={t('keys_page_keys', 'Ключи')} description={t('keys_page_keys_desc', 'Все ключи подписки и их статус.')}>
          <div className="flex items-center gap-3 text-white/52">
            <KeyRound className="h-4 w-4 text-[#a7f3d0]" />
            {t('keys_page_keys_note', 'Активные и свободные ключи.')}
          </div>
          <DataTable
            rows={keys}
            emptyMessage={t('keys_page_no_keys', 'Ключей пока нет.')}
            columns={[
              { label: t('keys_page_col_key', 'Ключ'), key: 'key' },
              { label: t('keys_page_col_duration', 'Срок'), key: 'duration_months', render: (row) => `${row.duration_months} ${t('keys_page_months', 'мес.')}` },
              { label: t('keys_page_col_activated_by', 'Активировавший ресторан'), key: 'activated_by', render: (row) => row.activated_by || '—' },
              { label: t('keys_page_col_status', 'Статус'), key: 'is_activated', render: (row) => row.is_activated ? t('keys_page_activated', 'Активирован') : t('keys_page_free', 'Свободен') },
              { label: t('keys_page_col_action', 'Действие'), key: 'id', render: (row) => row.is_activated ? <Button variant="secondary" size="sm" onClick={() => handleRevoke(row)}>{t('keys_page_revoke', 'Отозвать')}</Button> : null },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
