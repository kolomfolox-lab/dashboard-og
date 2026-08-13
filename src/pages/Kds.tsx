import { Check, Copy, ExternalLink, MonitorPlay, RefreshCcw, RotateCcw, ShieldCheck, Tv } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app/AppShell';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Kbd } from '@/components/ui/kbd';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { kdsAPI, type KdsInfo } from '@/services/api';

export default function KdsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const [restaurants, setRestaurants] = useState<KdsInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<KdsInfo | null>(null);
  const [error, setError] = useState('');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await kdsAPI.list();
      setRestaurants(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        return;
      }
      if (e.key === 'c' && copied) {
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [copied]);

  const copyUrl = async (info: KdsInfo) => {
    const url = `${origin}${info.kds_url}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(info.id);
      toast.success(t('kds_copied', 'Ссылка KDS скопирована'), { description: url });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error(t('kds_copy_error', 'Не удалось скопировать'));
    }
  };

  const regenerate = async () => {
    if (!confirmTarget) return;
    setRegenerating(confirmTarget.id);
    try {
      const response = await kdsAPI.regenerate(confirmTarget.id);
      setRestaurants((prev) => prev.map((r) => (r.id === response.data.id ? response.data : r)));
      toast.success(t('kds_regenerated', 'Токен KDS перегенерирован'));
    } catch (err: any) {
      toast.error(err?.response?.data?.error || t('kds_regenerate_error', 'Ошибка'));
    } finally {
      setRegenerating(null);
      setConfirmTarget(null);
    }
  };

  return (
    <AppShell
      title={t('kds_title', 'KDS — Кухонный экран')}
      subtitle={t('kds_subtitle', 'Сгенерируйте ссылку для кухонного дисплея: откройте её на ТВ или планшете на кухне.')}
      eyebrow={t('kds_eyebrow', 'Kitchen Display System')}
    >
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem><span className="text-theme-secondary">Waitly</span></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{t('kds_title', 'KDS')}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {error}
          <button onClick={load} className="ml-3 underline hover:text-white">{t('retry', 'Retry')}</button>
        </div>
      ) : null}

      <Card className="mb-4 border-theme bg-gradient-to-br from-[#8fd4ff]/10 to-[#f97360]/6">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(143,212,255,0.35),rgba(249,115,96,0.2))]">
              <Tv className="h-6 w-6 text-[#8fd4ff]" />
            </div>
            <div>
              <CardTitle className="text-lg text-theme">{t('kds_how_title', 'Как подключить KDS')}</CardTitle>
              <CardDescription className="mt-1 leading-7">
                {t('kds_how_text', '1. Скопируйте ссылку ресторана · 2. Откройте её в полноэкранном режиме на телевизоре или планшете · 3. Повара видят заказы в реальном времени и меняют статусы.')}
              </CardDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8fd4ff]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#8fd4ff]">
                  <MonitorPlay className="h-3 w-3" /> {t('kds_live', 'Real-time')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> {t('kds_secure', 'По токену')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ffd28d]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#ffd28d]">
                  <Kbd className="border-theme bg-white/5 text-[#ffd28d]">/tv</Kbd> {t('kds_route', 'URL экрана')}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border-theme bg-[var(--panel-bg)]">
              <CardHeader><Skeleton className="h-6 w-40 bg-white/8" /></CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-12 w-full bg-white/6" />
                <Skeleton className="h-10 w-full bg-white/6" />
              </CardContent>
            </Card>
          ))
        ) : restaurants.length === 0 ? (
          <Card className="border-theme bg-[var(--panel-bg)] lg:col-span-2">
            <CardContent className="py-14 text-center text-theme-muted">
              {t('kds_empty', 'Нет ресторанов для подключения KDS.')}
            </CardContent>
          </Card>
        ) : (
          restaurants.map((info) => {
            const url = `${origin}${info.kds_url}`;
            const isRegenerating = regenerating === info.id;
            return (
              <Card key={info.id} className="border-theme bg-[var(--panel-bg)]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg text-theme">{info.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {t('kds_restaurant_slug', 'Ресторан')}: {info.slug}
                      </CardDescription>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#8fd4ff]/12">
                      <Tv className="h-5 w-5 text-[#8fd4ff]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-theme-muted">
                      {t('kds_url_label', 'Ссылка кухонного экрана')}
                    </div>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <MonitorPlay className="h-4 w-4 text-theme-muted" />
                      </InputGroupAddon>
                      <InputGroupInput value={url} readOnly onFocus={(e) => e.target.select()} className="rounded-xl py-2.5 pl-9 pr-2 font-mono text-xs" />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton onClick={() => copyUrl(info)} className="rounded-xl bg-[#8fd4ff]/15 text-[#8fd4ff] hover:bg-[#8fd4ff]/25">
                          {copied === info.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="secondary" size="sm" onClick={() => copyUrl(info)}>
                          {copied === info.id ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                          {t('kds_copy', 'Копировать')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('kds_copy_tooltip', 'Скопировать ссылку')}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" asChild>
                          <a href={url} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            {t('kds_open', 'Открыть')}
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('kds_open_tooltip', 'Открыть в новой вкладке')}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setConfirmTarget(info)} disabled={isRegenerating} aria-label={t('kds_regenerate', 'Перегенерировать токен')}>
                          {isRegenerating ? <Spinner className="mr-1.5 h-3.5 w-3.5" /> : <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />}
                          {t('kds_regenerate', 'Новый токен')}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('kds_regenerate_tooltip', 'Старая ссылка перестанет работать')}</TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-theme-muted">
                    <Kbd className="border-theme bg-white/5 text-theme-muted">token</Kbd>
                    <span className="font-mono">{info.kitchen_token}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AlertDialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('kds_confirm_title', 'Перегенерировать токен KDS?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('kds_confirm_text', 'Старая ссылка кухонного экрана для «{name}» перестанет работать. Новая ссылка появится сразу после подтверждения.').replace('{name}', confirmTarget?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', 'Отмена')}</AlertDialogCancel>
            <AlertDialogAction onClick={regenerate}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> {t('kds_regenerate', 'Перегенерировать')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
