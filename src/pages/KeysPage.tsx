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
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Kalitlarni yuklab bo‘lmadi.' : 'Не удалось загрузить ключи.'));
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
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Kalit yaratib bo‘lmadi.' : 'Не удалось создать ключ.'));
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (key: any) => {
    if (!window.confirm(`${locale === 'uz' ? 'Kalit bekor qilinsinmi' : 'Отозвать ключ'} ${key.key}?`)) return;
    setError('');
    try {
      await adminAPI.revokeKey(key.id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || (locale === 'uz' ? 'Kalitni bekor qilib bo‘lmadi.' : 'Не удалось отозвать ключ.'));
    }
  };

  return (
    <AppShell
      title={locale === 'uz' ? 'Obuna kalitlari' : 'Ключи подписки'}
      subtitle={locale === 'uz' ? 'Kalitlarni yaratish, ko‘rish va bekor qilish.' : 'Создание, просмотр и отзыв ключей.'}
      eyebrow="Billing"
    >
      <div className="space-y-4">
        {error ? <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

        <Panel title={locale === 'uz' ? 'Yangi kalit yaratish' : 'Создать ключ'} eyebrow={locale === 'uz' ? 'Generatsiya' : 'Генерация'} description={locale === 'uz' ? 'Yangi obuna kalitlarini yarating.' : 'Сгенерируйте новые ключи подписки.'}>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm text-white/60">{locale === 'uz' ? 'Muddat (oy)' : 'Срок (мес.)'}</label>
              <select
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {[1, 3, 6, 12, 24].map((m) => (
                  <option key={m} value={m}>{m} {locale === 'uz' ? 'oy' : 'мес.'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-white/60">{locale === 'uz' ? 'Soni' : 'Количество'}</label>
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
                ? (locale === 'uz' ? 'Yaratilmoqda...' : 'Генерация...')
                : (locale === 'uz' ? 'Yaratish' : 'Создать')}
            </Button>
          </div>
        </Panel>

        <Panel title={`${keys.length}`} eyebrow={locale === 'uz' ? 'Kalitlar' : 'Ключи'} description={locale === 'uz' ? 'Barcha obuna kalitlari va ularning holati.' : 'Все ключи подписки и их статус.'}>
          <div className="flex items-center gap-3 text-white/52">
            <KeyRound className="h-4 w-4 text-[#a7f3d0]" />
            {locale === 'uz' ? 'Faol va bo‘sh kalitlar.' : 'Активные и свободные ключи.'}
          </div>
          <DataTable
            rows={keys}
            emptyMessage={locale === 'uz' ? 'Hali kalitlar yo‘q.' : 'Ключей пока нет.'}
            columns={[
              { label: locale === 'uz' ? 'Kalit' : 'Ключ', key: 'key' },
              { label: locale === 'uz' ? 'Muddat' : 'Срок', key: 'duration_months', render: (row) => `${row.duration_months} ${locale === 'uz' ? 'oy' : 'мес.'}` },
              { label: locale === 'uz' ? 'Faollashtirgan restoran' : 'Активировавший ресторан', key: 'activated_by', render: (row) => row.activated_by || '—' },
              { label: locale === 'uz' ? 'Holat' : 'Статус', key: 'is_activated', render: (row) => row.is_activated ? (locale === 'uz' ? 'Faollashtirilgan' : 'Активирован') : (locale === 'uz' ? 'Bo‘sh' : 'Свободен') },
              { label: locale === 'uz' ? 'Amal' : 'Действие', key: 'id', render: (row) => row.is_activated ? <Button variant="secondary" size="sm" onClick={() => handleRevoke(row)}>{locale === 'uz' ? 'Bekor qilish' : 'Отозвать'}</Button> : null },
            ]}
          />
        </Panel>
      </div>
    </AppShell>
  );
}
