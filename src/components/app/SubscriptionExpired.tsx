import { motion } from 'framer-motion';
import { LoaderCircle, MessageCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';

interface SubscriptionExpiredProps {
  restaurantId?: string;
  restaurantName?: string;
  onActivate?: (key: string) => Promise<void>;
}

export function SubscriptionExpired({ restaurantId, restaurantName, onActivate }: SubscriptionExpiredProps) {
  const { t } = useLocale();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setKey('');
    setError('');
    setSuccess('');
  }, [restaurantId]);

  const canSubmit = Boolean(restaurantId && onActivate && key.trim());

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !onActivate) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await onActivate(key.trim());
      setSuccess(t('subscriptionExpired_success', 'Subscription activated. Dashboard access is refreshing.'));
      setKey('');
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || t('subscriptionExpired_activation_failed', 'Activation failed. Check the key and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[78vh] items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[680px] rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,32,0.98),rgba(8,14,24,0.95))] p-8 text-left shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:p-10"
      >
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>

        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
            <Sparkles className="h-3.5 w-3.5 text-[#8fd4ff]" />
            {t('subscriptionExpired_access_paused', 'Access paused')}
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">{t('subscriptionExpired_title', 'Subscription expired')}</h2>
          <p className="mb-8 text-base leading-8 text-white/56 md:text-lg">
            {restaurantName ? t('subscriptionExpired_restaurant_inactive', `{restaurantName} no longer has an active subscription.`).replace('{restaurantName}', restaurantName) : t('subscriptionExpired_workspace_inactive', 'Your workspace no longer has an active subscription.')}
            {' '}{t('subscriptionExpired_enter_key', 'Enter a new activation key to restore dashboard access immediately.')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 md:p-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="subscription-key" className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
              {t('subscriptionExpired_activation_key', 'Activation key')}
            </label>
            <input
              id="subscription-key"
              type="text"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              placeholder={t('subscriptionExpired_key_placeholder', 'ENTER-NEW-KEY')}
              disabled={!restaurantId || submitting}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="h-14 rounded-2xl border border-white/10 bg-[#09111c] px-4 text-sm font-semibold tracking-[0.18em] text-white outline-none transition focus:border-[#8fd4ff]/60 focus:ring-2 focus:ring-[#8fd4ff]/15 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-white/42">
              {restaurantName ? t('subscriptionExpired_workspace_label', 'Workspace: {restaurantName}').replace('{restaurantName}', restaurantName) : t('subscriptionExpired_select_workspace', 'Select a workspace to activate.')}
            </div>
            <Button type="submit" disabled={!canSubmit || submitting} className="min-w-[200px]">
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {submitting ? t('subscriptionExpired_activating', 'Activating...') : t('subscriptionExpired_activate_button', 'Activate subscription')}
            </Button>
          </div>

          {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-200">{error}</div> : null}
          {success ? <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-200">{success}</div> : null}
        </form>

        <p className="mb-6 text-sm leading-7 text-white/40">
          {t('subscriptionExpired_help_text', 'If you do not have a valid key yet, contact the administrator and request a new subscription code for this workspace.')}
        </p>

        <div className="space-y-4">
          <a
            href="https://t.me/Business_SolutionsUz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-white/90"
          >
            <MessageCircle className="h-5 w-5" />
            {t('subscriptionExpired_contact_admin', 'Contact Administrator')}
          </a>

          <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold uppercase tracking-widest text-white/30">
            <span>{t('subscriptionExpired_powered_by', 'Powered by Business Solutions')}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
