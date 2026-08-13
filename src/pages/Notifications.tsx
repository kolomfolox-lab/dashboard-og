import { useEffect, useState } from 'react';
import { Bell, Plus, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app/AppShell';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputGroup, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { notificationsAPI } from '@/services/api';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<'templates' | 'logs'>('templates');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', channel: 'TELEGRAM', subject: '', body: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, lRes] = await Promise.allSettled([
        notificationsAPI.getTemplates(workspace.selectedRestaurantId),
        notificationsAPI.getLogs(workspace.selectedRestaurantId),
      ]);
      setTemplates(tRes.status === 'fulfilled' ? (tRes.value.data?.results || tRes.value.data || []) : []);
      setLogs(lRes.status === 'fulfilled' ? (lRes.value.data?.results || lRes.value.data || []) : []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const handleCreate = async () => {
    try {
      await notificationsAPI.createTemplate({ ...form, restaurant: workspace.selectedRestaurantId });
      toast.success('Template created');
      setShowForm(false);
      setForm({ name: '', channel: 'TELEGRAM', subject: '', body: '' });
      await load();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => {
    try { await notificationsAPI.deleteTemplate(id); toast.success('Deleted'); await load(); } catch { toast.error('Failed'); }
  };

  const handleTest = async (id: string) => {
    try { await notificationsAPI.testSend({ template_id: id, restaurant_id: workspace.selectedRestaurantId }); toast.success('Test sent'); } catch { toast.error('Failed'); }
  };

  return (
    <AppShell
      title={t('nav_notifications', 'Notifications')}
      subtitle={t('notifications_subtitle', 'Notification templates and send log')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><span className="text-theme-secondary">Waitly</span></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('nav_notifications', 'Notifications')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="border-theme bg-[var(--panel-bg)]">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-theme">{tab === 'templates' ? 'Notification templates' : 'Send log'}</CardTitle>
                <CardDescription>{tab === 'templates' ? 'Reusable message templates for your customers' : 'Recent notification sends'}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-full border border-theme bg-black/20 p-1">
                  {(['templates', 'logs'] as const).map(key => (
                    <button
                      key={key}
                      onClick={() => setTab(key)}
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${tab === key ? 'bg-[linear-gradient(135deg,#f97360,#f7b267)] text-slate-950' : 'text-theme-muted hover:text-theme'}`}
                    >
                      {key === 'templates' ? 'Templates' : 'Log'}
                    </button>
                  ))}
                </div>
                {tab === 'templates' && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-theme">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tab === 'templates' ? (
                      <>
                        <TableHead>Template</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Template</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Date</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}><Skeleton className="h-5 w-full bg-white/6" /></TableCell>
                      </TableRow>
                    ))
                  ) : tab === 'templates' ? (
                    templates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-theme-muted">No templates yet</TableCell>
                      </TableRow>
                    ) : (
                      templates.map((tmpl: any) => (
                        <TableRow key={tmpl.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#8fd4ff]/10">
                                <Bell className="h-4 w-4 text-[#8fd4ff]" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-theme">{tmpl.name || tmpl.id}</div>
                                {tmpl.body ? <div className="max-w-60 truncate text-xs text-theme-muted">{tmpl.body}</div> : null}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex rounded-full bg-white/6 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-theme-secondary">{tmpl.channel || '—'}</span>
                          </TableCell>
                          <TableCell className="text-theme-secondary">{tmpl.subject || '—'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleTest(tmpl.id)} aria-label="Send test">
                                    <Send className="h-4 w-4 text-theme-secondary" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send test</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tmpl.id)} aria-label="Delete template">
                                    <Trash2 className="h-4 w-4 text-red-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  ) : (
                    logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-theme-muted">No notification logs</TableCell>
                      </TableRow>
                    ) : (
                      logs.slice(0, 50).map((l: any) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium text-theme">{l.template_name || '—'}</TableCell>
                          <TableCell>
                            <span className="inline-flex rounded-full bg-white/6 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-theme-secondary">{l.channel || '—'}</span>
                          </TableCell>
                          <TableCell className="text-theme-secondary">{l.recipient || '—'}</TableCell>
                          <TableCell className="text-theme-secondary">{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="border-theme bg-[var(--modal-bg)] text-theme">
            <DialogHeader>
              <DialogTitle>New Template</DialogTitle>
              <DialogDescription>Create a reusable notification template</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ntf-name" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">Name</Label>
                <InputGroup>
                  <InputGroupInput id="ntf-name" placeholder="Order ready" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ntf-channel" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">Channel</Label>
                <select id="ntf-channel" className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none focus:border-[#f97360]/60" value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}>
                  <option value="TELEGRAM" className="bg-[#09131e]">Telegram</option>
                  <option value="WHATSAPP" className="bg-[#09131e]">WhatsApp</option>
                  <option value="SMS" className="bg-[#09131e]">SMS</option>
                  <option value="PUSH" className="bg-[#09131e]">Push</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ntf-subject" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">Subject</Label>
                <InputGroup>
                  <InputGroupInput id="ntf-subject" placeholder="Your order is ready" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
                </InputGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ntf-body" className="text-xs font-semibold uppercase tracking-widest text-theme-muted">Body</Label>
                <InputGroup>
                  <InputGroupTextarea id="ntf-body" rows={4} placeholder="Hi {name}, your order is ready..." value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} />
                </InputGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
