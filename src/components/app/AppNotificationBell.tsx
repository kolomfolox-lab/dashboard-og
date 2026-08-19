import { Component, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { Bell, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/context/LocaleContext';

class NotificationErrorBoundary extends Component<{ children: ReactNode }, { broken: boolean }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { broken: false }; }
  static getDerivedStateFromError() { return { broken: true }; }
  componentDidCatch(error: Error) { console.warn('Notification widget disabled:', error?.message); }
  render() { return this.state.broken ? null : this.props.children; }
}

const NOTIFICATION_ID = 'waitly-notification';

function safeNotificationShow() {
  try {
    const el = typeof document !== 'undefined' ? document.getElementById(NOTIFICATION_ID) : null;
    if (!el) return false;
    el.classList.remove('translate-y-full', 'opacity-0');
    window.setTimeout(() => el.classList.add('translate-y-full', 'opacity-0'), 4000);
    return true;
  } catch {
    return false;
  }
}

export function AppNotificationBell({ inactive }: { inactive?: boolean }) {
  const { t } = useLocale();
  const cleanupRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (cleanupRef.current !== null) window.clearTimeout(cleanupRef.current);
  }, []);

  const openNotification = useCallback(() => {
    safeNotificationShow();
  }, []);

  return (
    <NotificationErrorBoundary>
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="group relative overflow-hidden rounded-2xl border border-theme bg-[var(--input-bg)] hover:bg-theme-panel"
          onClick={openNotification}
          aria-label={t('shell_notifications_open', 'Открыть уведомления')}
        >
          <Bell className="h-4 w-4 text-theme-secondary transition-transform group-hover:scale-110" />
          <span className="absolute right-2 top-2 flex h-1.5 w-1.5 rounded-full bg-[#f97360]" />
        </Button>
      </div>
      <div
        id={NOTIFICATION_ID}
        className="pointer-events-none fixed bottom-8 right-8 z-[100] flex w-80 translate-y-full items-start gap-4 rounded-3xl border border-theme bg-[var(--modal-bg)] p-5 opacity-0 shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#f97360]/20 bg-[#f97360]/10">
          <Waves className="h-5 w-5 text-[#f97360]" />
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-theme-muted">{t('appShell_waitly_pulse', 'Waitly Pulse')}</div>
          <p className="mt-1 text-sm leading-relaxed text-theme-secondary">
            {inactive
              ? t('appShell_subscription_inactive_notification', 'Subscription is inactive. Open the activation page to restore this workspace.')
              : t('shell_notifications', 'System sync successful. All core modules are running.')}
          </p>
        </div>
      </div>
    </NotificationErrorBoundary>
  );
}
