import { AppShell } from '@/components/app/AppShell';
export default function AuditorPage(){
 return (
  <AppShell title="Аудитор" subtitle="Финансы, отчёты и журнал безопасности — read-only" eyebrow="Auditor">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <a href="/finances" className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme">Финансы</div><p className="text-sm text-theme-secondary mt-1">Выручка/профит</p></a>
      <a href="/reports" className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme">Отчёты</div><p className="text-sm text-theme-secondary mt-1">X/Z, налоги</p></a>
      <a href="/security" className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme">Безопасность</div><p className="text-sm text-theme-secondary mt-1">SecurityEvent</p></a>
      <a href="/attendance" className="rounded-[28px] border border-theme bg-theme-panel p-6"><div className="font-bold text-theme">Attendance</div><p className="text-sm text-theme-secondary mt-1">Смены</p></a>
    </div>
  </AppShell>
 );
}
