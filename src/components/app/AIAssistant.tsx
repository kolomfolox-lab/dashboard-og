import {
  ArrowDown,
  Bot,
  CalendarPlus,
  ChartColumn,
  Check,
  Copy,
  Info,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  Waves,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { aiAPI, type AiAction, type AiChatMessage } from '@/services/api';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const SUGGESTIONS = [
  'Создай банкет на 20 гостей сегодня в 19:00',
  'Покажи аналитику за последние 7 дней',
  'Какие брони на завтра?',
  'Что по инвентарю? Какие продукты заканчиваются?',
  'Добавь официанта по имени Азиз, телефон +998901234567',
  'Сколько заказов сегодня и какая выручка?',
  'Сводка меню ресторана',
  'Сделай QR-меню в тёмной теме',
  'Покажи сотрудников ресторана',
  'Сколько мы заработали за месяц?',
];

const QUICK_ACTIONS = [
  { label: 'Банкет', prompt: 'Создай банкет на 15 гостей сегодня в 19:00, повод — день рождения', icon: CalendarPlus },
  { label: 'Аналитика', prompt: 'Покажи аналитику за последние 7 дней', icon: ChartColumn },
  { label: 'Брони', prompt: 'Какие брони на ближайшие дни?', icon: UtensilsCrossed },
];

function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}

function formatToolResult(tool: string, detail: Record<string, any>): { title: string; rows: Record<string, string>[] } | null {
  if (tool === 'list_bookings') {
    return {
      title: 'Брони',
      rows: (detail.bookings || []).map((b: any) => ({
        'Стол': b.table,
        'Дата': b.date,
        'Время': b.time,
        'Гости': String(b.guests),
        'Клиент': b.client,
        'Статус': b.status,
      })),
    };
  }
  if (tool === 'list_orders') {
    return {
      title: 'Заказы',
      rows: (detail.orders || []).map((o: any) => ({
        'Стол': o.table || '-',
        'Статус': o.status,
        'Сумма': o.total,
        'Создан': o.created,
      })),
    };
  }
  if (tool === 'create_booking' && detail.booking) {
    return {
      title: 'Бронь создана',
      rows: [{
        'Стол': detail.booking.table,
        'Дата': detail.booking.date,
        'Время': detail.booking.time,
        'Гости': String(detail.booking.guests),
        'Клиент': detail.booking.client,
        'Повод': detail.booking.occasion || '-',
      }],
    };
  }
  if (tool === 'create_banquet' && detail.banquet) {
    return {
      title: 'Банкет',
      rows: (detail.banquet.tables || []).map((t: any) => ({
        'Стол': t.table,
        'Вместимость': String(t.capacity),
        'ID брони': t.id.slice(0, 8),
      })),
    };
  }
  if (tool === 'get_restaurant_status') {
    return {
      title: 'Рестораны',
      rows: (detail.restaurants || []).map((r: any) => ({
        'Название': r.name,
        'Поддомен': r.subdomain,
        'Столов': String(r.tables),
        'Блюд': String(r.dishes),
        'Подписка': r.subscription_active ? 'Активна' : 'Не активна',
      })),
    };
  }
  if (tool === 'get_menu_summary') {
    return {
      title: 'Меню',
      rows: (detail.menu || []).map((m: any) => ({
        'Категория': m.name,
        'Блюд': String(m.dishes),
      })),
    };
  }
  if (tool === 'list_staff') {
    return {
      title: 'Сотрудники',
      rows: (detail.staff || []).map((s: any) => ({
        'ФИО': s.full_name,
        'Телефон': s.phone,
        'Роль': s.role,
        'Активен': s.is_active ? 'Да' : 'Нет',
      })),
    };
  }
  if (tool === 'list_dishes') {
    return {
      title: 'Блюда',
      rows: (detail.dishes || []).map((d: any) => ({
        'Название': d.name,
        'Цена': d.price,
        'Категория': d.category || '-',
        'Доступно': d.is_available ? 'Да' : 'Нет',
      })),
    };
  }
  if (tool === 'list_modules') {
    return {
      title: 'Модули',
      rows: (detail.modules || []).map((m: any) => ({
        'Модуль': m.name,
        'Описание': m.description,
        'Статус': m.is_active ? 'Включён' : 'Выключен',
      })),
    };
  }
  if (tool === 'list_pending_actions') {
    return {
      title: 'Ждут подтверждения',
      rows: (detail.pending_actions || []).map((p: any) => ({
        'Действие': p.summary,
        'Создано': p.created_at,
      })),
    };
  }
  if (tool === 'get_inventory') {
    return {
      title: 'Инвентарь',
      rows: (detail.ingredients || []).slice(0, 20).map((i: any) => ({
        'Ингредиент': i.name,
        'Остаток': `${i.quantity} ${i.unit}`,
        'Минимум': String(i.minimum),
        'Статус': i.status === 'empty' ? 'Пусто' : i.status === 'low' ? 'Заканчивается' : 'Ок',
      })),
    };
  }
  if (tool === 'get_finances') {
    return {
      title: 'Финансы',
      rows: [{
        'Выручка': String(detail.revenue ?? '-'),
        'Заказы': String(detail.order_count ?? '-'),
        'Себестоимость': String(detail.food_cost ?? '-'),
        'Зарплаты': String(detail.payroll ?? '-'),
        'Закупки': String(detail.purchases ?? '-'),
        'Прибыль': String(detail.net_profit ?? '-'),
      }],
    };
  }
  if (tool === 'toggle_module') {
    return {
      title: 'Модуль',
      rows: [{
        'Модуль': detail.module_slug || '-',
        'Статус': detail.is_active ? 'Включён' : 'Выключен',
      }],
    };
  }
  if (tool === 'list_tables') {
    return {
      title: 'Столы',
      rows: (detail.tables || []).map((t: any) => ({
        'Стол': String(t.number),
        'Статус': t.is_occupied ? 'Занят' : 'Свободен',
        'Официант': t.waiter || '-',
        'QR': t.has_qr ? 'Есть' : 'Нет',
      })),
    };
  }
  return null;
}

function AnalyticsChart({ detail }: { detail: Record<string, any> }) {
  const days: { date: string; orders_count: number; total_revenue: string }[] = detail.days || [];
  if (!days.length) return null;

  const data = days.map((d) => ({
    date: d.date.slice(5),
    orders: d.orders_count,
    revenue: Number(d.total_revenue || 0),
  }));

  const chartConfig = {
    orders: { label: 'Заказы', color: 'var(--chart-1)' },
    revenue: { label: 'Выручка', color: 'var(--chart-2)' },
  } satisfies ChartConfig;

  return (
    <div className="mt-3">
      <ChartContainer config={chartConfig} className="h-40 w-full">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={48} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="orders" fill="var(--color-orders)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: AiAction[];
};

function MessageBubble({
  message,
  onCopy,
  onRetry,
  pendingStatus,
  onResolvePending,
}: {
  message: Message;
  onCopy: () => void;
  onRetry?: () => void;
  pendingStatus?: Record<string, { status: string; message?: string }>;
  onResolvePending?: (key: string, pendingId: string, confirm: boolean) => void;
}) {
  const isUser = message.role === 'user';
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <Card className={`max-w-[85%] rounded-3xl px-0 py-3 ${isUser ? 'bg-[#f97360]/15' : 'bg-[var(--panel-bg)]'}`}>
            <CardContent className="px-4 py-0 text-sm leading-7 text-theme">
              {message.content}
              {message.actions?.length ? (
                <ActionDetails actions={message.actions} pendingStatus={pendingStatus} onResolvePending={onResolvePending} />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>{isUser ? 'Сообщение' : 'Ответ ассистента'}</ContextMenuLabel>
        <ContextMenuItem onClick={onCopy}>
          <Copy className="h-3.5 w-3.5" /> Копировать
        </ContextMenuItem>
        {!isUser && onRetry ? (
          <ContextMenuItem onClick={onRetry}>
            <RotateCcw className="h-3.5 w-3.5" /> Переспросить
          </ContextMenuItem>
        ) : null}
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" onClick={() => {}}>
          <Trash2 className="h-3.5 w-3.5" /> Удалить
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function ActionDetails({
  actions,
  pendingStatus,
  onResolvePending,
}: {
  actions: AiAction[];
  pendingStatus?: Record<string, { status: string; message?: string }>;
  onResolvePending?: (key: string, pendingId: string, confirm: boolean) => void;
}) {
  return (
    <Accordion type="multiple" className="mt-3">
      {actions.map((action, idx) => {
        const tableData = formatToolResult(action.tool, action.detail);
        const key = `${action.tool}-${idx}`;
        const pending = action.pending_action;
        const pendingState = pending ? pendingStatus?.[pending.id] : undefined;
        return (
          <AccordionItem key={key} value={key} className="border-white/10">
            <AccordionTrigger className="py-2 text-[13px]">
              <span className="inline-flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-[#8fd4ff]" />
                {action.summary}
              </span>
            </AccordionTrigger>
            <AccordionContent>
              {action.tool === 'get_analytics' && (action.detail.days || []).length ? (
                <AnalyticsChart detail={action.detail} />
              ) : null}
              {pending ? (
                <PendingConfirmationCard
                  pendingId={pending.id}
                  actionLabel={pending.action}
                  state={pendingState}
                  onResolve={onResolvePending}
                />
              ) : null}
              {tableData && tableData.rows.length ? (
                <div className="mt-2 overflow-hidden rounded-2xl border border-theme">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(tableData.rows[0]).map((tkey) => (
                          <TableHead key={tkey}>{tkey}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.rows.map((row, i) => (
                        <TableRow key={i}>
                          {Object.values(row).map((value, j) => (
                            <TableCell key={j}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : null}
              {!tableData && action.detail.error ? (
                <p className="mt-2 text-sm text-red-400">{action.detail.error}</p>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function PendingConfirmationCard({
  pendingId,
  actionLabel,
  state,
  onResolve,
}: {
  pendingId: string;
  actionLabel: string;
  state?: { status: string; message?: string };
  onResolve?: (key: string, pendingId: string, confirm: boolean) => void;
}) {
  if (state?.status === 'EXECUTED') {
    return (
      <div className="mt-2 flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-3">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <div>
          <div className="text-[13px] font-semibold text-emerald-300">Выполнено</div>
          <div className="mt-0.5 text-xs leading-5 text-emerald-200/70">{state.message || `Действие «${actionLabel}» выполнено в системе.`}</div>
        </div>
      </div>
    );
  }
  if (state?.status === 'CANCELLED') {
    return (
      <div className="mt-2 flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3">
        <X className="mt-0.5 h-4 w-4 shrink-0 text-theme-muted" />
        <div>
          <div className="text-[13px] font-semibold text-theme-secondary">Отменено</div>
          <div className="mt-0.5 text-xs leading-5 text-theme-muted">Действие «{actionLabel}» не было выполнено.</div>
        </div>
      </div>
    );
  }
  const busy = state?.status === 'EXECUTING';
  return (
    <div className="mt-2 flex items-start gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-amber-300">Действие ждёт вашего подтверждения</div>
        <div className="mt-0.5 text-xs leading-5 text-amber-200/70">«{actionLabel}» ещё НЕ выполнено. Нажмите кнопку, чтобы продолжить.</div>
        <div className="mt-2.5 flex items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onResolve?.(pendingId, pendingId, true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" /> Подтвердить
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onResolve?.(pendingId, pendingId, false)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-theme px-3.5 py-1.5 text-xs font-semibold text-theme-secondary transition hover:text-theme disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" /> Отменить
          </button>
        </div>
      </div>
    </div>
  );
}

export function AIAssistant({ restaurantId }: { restaurantId?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Record<string, { status: string; message?: string }>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const nextId = () => `msg-${++idRef.current}`;

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, thinking, messages, scrollToBottom]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || thinking) return;
      setInput('');
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', content: trimmed }]);
      setThinking(true);
      try {
        const history: AiChatMessage[] = messages
          .filter((m) => m.role !== 'user' || m !== messages[messages.length - 1])
          .map((m) => ({ role: m.role, content: m.content }))
          .slice(-10);
        const response = await aiAPI.chat({ message: trimmed, history, restaurant_id: restaurantId });
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: response.data.reply, actions: response.data.actions },
        ]);
        const created = response.data.actions.find((a) => a.tool === 'create_booking' || a.tool === 'create_banquet');
        if (created) {
          toast.success(created.summary, {
            description: created.detail.error ? created.detail.error : 'Данные сохранены в системе',
          });
        }
      } catch (err: any) {
        const detail = err?.response?.data?.error;
        toast.error('AI-ассистент недоступен', {
          description: detail || 'Проверьте GROQ_API_KEY на сервере',
        });
        setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', content: detail || 'Не удалось получить ответ. Проверьте настройки GROQ_API_KEY.' }]);
      } finally {
        setThinking(false);
      }
    },
    [messages, thinking, restaurantId],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setConfirmClear(false);
    setPendingStatus({});
    toast.info('Чат очищен');
  }, []);

  const resolvePending = useCallback(
    async (key: string, pendingId: string, confirm: boolean) => {
      setPendingStatus((prev) => ({ ...prev, [key]: { status: 'EXECUTING' } }));
      try {
        const res = await aiAPI.confirm(pendingId, confirm);
        if (res.data.executed) {
          const result = res.data.result as Record<string, any> | undefined;
          const detail = typeof result?.deleted === 'string' ? result.deleted : result?.message;
          setPendingStatus((prev) => ({
            ...prev,
            [key]: { status: 'EXECUTED', message: detail || 'Действие выполнено в системе' },
          }));
          toast.success(confirm ? 'Действие подтверждено и выполнено' : 'Действие отменено');
        } else if (res.data.cancelled) {
          setPendingStatus((prev) => ({ ...prev, [key]: { status: 'CANCELLED' } }));
          toast.info('Действие отменено');
        } else {
          setPendingStatus((prev) => ({
            ...prev,
            [key]: { status: 'ERROR', message: res.data.error || 'Не удалось выполнить' },
          }));
          toast.error('Не удалось выполнить', { description: res.data.error });
        }
      } catch (err: any) {
        setPendingStatus((prev) => ({
          ...prev,
          [key]: { status: 'ERROR', message: err?.response?.data?.error || 'Ошибка запроса' },
        }));
        toast.error('Ошибка', { description: err?.response?.data?.error || 'Попробуйте ещё раз' });
      }
    },
    [],
  );

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard?.writeText(content).then(() => toast.success('Скопировано'));
  }, []);

  const quickPrompts = useMemo(() => QUICK_ACTIONS, []);

  const chatBody = (
    <div className="flex h-full min-w-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-theme px-5 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <span className="text-theme-secondary">Waitly</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>AI Ассистент</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={() => setConfirmClear(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-theme text-theme-secondary transition hover:text-theme" aria-label="Очистить чат">
                <Trash2 className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Очистить чат</TooltipContent>
          </Tooltip>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-xl border border-theme text-theme-secondary transition hover:text-theme" aria-label="Меню">
                <Waves className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 border-theme bg-[var(--modal-bg)] p-2">
              <button
                type="button"
                onClick={() => toast.info('Waitly AI работает на DeepSeek V4 Flash')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-theme-secondary transition hover:bg-white/10 hover:text-theme"
              >
                <Info className="h-4 w-4" /> О провайдере
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" /> Очистить чат
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <ResizablePanel defaultSize={70} minSize={50} className="min-w-0 overflow-hidden">
          <div ref={scrollRef} className="h-full overflow-y-auto px-5 py-4">
            {!messages.length && !thinking ? (
              <div className="space-y-4">
                <Card className="rounded-3xl border-theme bg-gradient-to-br from-[#f97360]/12 to-[#8fd4ff]/8">
                  <CardContent className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(249,115,96,0.35),rgba(143,212,255,0.2))]">
                        <Sparkles className="h-5 w-5 text-[#ffd29f]" />
                      </div>
                      <div>
                        <div className="font-display text-base font-semibold text-theme">Waitly AI Ассистент</div>
                        <div className="mt-0.5 text-xs text-theme-secondary">
                          Пишите на русском — ИИ сделает всё как владелец: сотрудники, меню, столы, инвентарь, финансы, модули, дизайн QR-меню. Удаления — только с вашей кнопкой.
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[11px] text-theme-muted">
                      <Kbd className="border-theme bg-white/5 text-theme-secondary">⌘</Kbd>
                      <Kbd className="border-theme bg-white/5 text-theme-secondary">K</Kbd>
                      <span>— открыть ассистента</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-theme-muted">
                    <Sparkles className="h-3 w-3" /> Быстрые команды
                  </div>
                  <ButtonGroup className="flex-wrap">
                    {quickPrompts.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => sendMessage(action.prompt)}
                          className="inline-flex items-center gap-2 rounded-xl border border-theme bg-[var(--input-bg)] px-3.5 py-2.5 text-[13px] font-medium text-theme-secondary transition hover:border-[#f97360]/40 hover:text-theme"
                        >
                          <Icon className="h-3.5 w-3.5 text-[#8fd4ff]" />
                          {action.label}
                        </button>
                      );
                    })}
                  </ButtonGroup>
                  <ButtonGroupSeparator />
                  <div className="text-[10px] uppercase tracking-[0.2em] text-theme-muted">или выберите сценарий:</div>
                </div>

                <Carousel opts={{ align: 'start', loop: true }} className="w-full">
                  <CarouselContent className="-ml-3">
                    {SUGGESTIONS.map((prompt) => (
                      <CarouselItem key={prompt} className="basis-[85%] pl-3 sm:basis-[55%] lg:basis-[45%]">
                        <button
                          type="button"
                          onClick={() => sendMessage(prompt)}
                          className="h-full w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-left text-[13px] leading-6 text-theme-secondary transition hover:border-[#8fd4ff]/40 hover:text-theme"
                        >
                          {prompt}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-2 border-theme" />
                  <CarouselNext className="-right-2 border-theme" />
                </Carousel>
              </div>
            ) : null}

            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onCopy={() => copyMessage(message.content)}
                  onRetry={message.role === 'assistant' ? () => sendMessage(message.content) : undefined}
                  pendingStatus={pendingStatus}
                  onResolvePending={resolvePending}
                />
              ))}
            </div>

            {thinking ? (
              <div className="mt-4 flex items-start gap-2">
                <Marker variant="border">
                  <MarkerIcon>
                    <Spinner className="h-4 w-4 text-[#8fd4ff]" />
                  </MarkerIcon>
                  <MarkerContent className="flex items-center gap-2">
                    <span role="status" className="inline-flex items-center gap-2 text-[13px] text-theme-secondary">
                      Думаю и выполняю…
                    </span>
                  </MarkerContent>
                </Marker>
                <div className="mt-1 space-y-2">
                  <Skeleton className="h-4 w-2/3 bg-white/8" />
                  <Skeleton className="h-4 w-1/2 bg-white/8" />
                </div>
              </div>
            ) : null}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-white/10" />
        <ResizablePanel defaultSize={30} minSize={20} className="hidden min-w-0 overflow-hidden lg:flex">
          <div className="flex h-full flex-col gap-3 overflow-y-auto border-l border-theme p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-theme-muted">
              <ArrowDown className="h-3 w-3" /> Выполненные действия
            </div>
            {messages.some((m) => (m.actions?.length ?? 0) > 0) ? (
              messages
                .filter((m) => m.actions?.length)
                .flatMap((m) => (m.actions || []).map((a) => ({ message: m, action: a })))
                .map(({ message, action }, idx) => (
                  <Marker key={`${message.id}-${idx}`} variant="border">
                    <MarkerIcon>
                      <Bot className="h-4 w-4 text-[#8fd4ff]" />
                    </MarkerIcon>
                    <MarkerContent className="text-[13px] text-theme-secondary">{action.summary}</MarkerContent>
                  </Marker>
                ))
            ) : (
              <p className="text-xs leading-6 text-theme-muted">Здесь появятся действия, которые ИИ выполнил в системе.</p>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <div className="border-t border-theme p-4">
        <Label htmlFor="ai-input" className="sr-only">Сообщение для ИИ</Label>
        <InputGroup>
          <InputGroupInput
            id="ai-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Например: создай банкет на 20 гостей сегодня в 19:00"
            className="rounded-2xl bg-[var(--input-bg)] pr-24"
          />
          <InputGroupButton
            type="button"
            onClick={() => sendMessage(input)}
            disabled={thinking || !input.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-[#f97360] px-4 py-2 font-semibold text-white hover:brightness-110"
          >
            {thinking ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </InputGroupButton>
        </InputGroup>
        <p className="mt-2 text-[11px] text-theme-muted">
          ИИ выполняет действия от вашего имени. Проверяйте созданные брони в разделе «Брони».
        </p>
      </div>
    </div>
  );

  const launcher = (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group fixed bottom-6 right-6 z-[90] grid h-14 w-14 place-items-center rounded-2xl bg-[linear-gradient(135deg,#f97360,#e56350)] text-white shadow-[0_18px_50px_rgba(249,115,96,0.4)] transition hover:scale-105"
          aria-label="Открыть AI ассистента"
        >
          <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="bg-white text-slate-900">AI Ассистент (⌘K)</TooltipContent>
    </Tooltip>
  );

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>{launcher}</PopoverTrigger>
        <PopoverContent className="mr-24 mb-16 w-64 border-theme bg-[var(--modal-bg)]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#ffd29f]" />
            <span className="text-sm font-semibold text-theme">Waitly AI</span>
          </div>
          <p className="mt-2 text-xs leading-6 text-theme-secondary">
            Управляйте рестораном через чат: банкеты, брони, аналитика, заказы. Нажмите, чтобы открыть.
          </p>
        </PopoverContent>
      </Popover>

      {open && !isMobile() ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-none overflow-hidden p-0 text-theme"
            style={{ width: 'min(1024px, calc(100vw - 2rem))', maxWidth: 'none' }}
            showCloseButton={false}
          >
            <DialogHeader className="hidden">
              <DialogTitle>AI Ассистент</DialogTitle>
              <DialogDescription>Управление рестораном через ИИ</DialogDescription>
            </DialogHeader>
            <div className="h-[78vh]">{chatBody}</div>
          </DialogContent>
        </Dialog>
      ) : null}

      {open && isMobile() ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="border-theme bg-[var(--modal-bg)] text-theme">
            <DrawerHeader className="hidden">
              <DrawerTitle>AI Ассистент</DrawerTitle>
              <DrawerDescription>Управление рестораном через ИИ</DrawerDescription>
            </DrawerHeader>
            <div className="h-[80vh]">{chatBody}</div>
          </DrawerContent>
        </Drawer>
      ) : null}

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистить чат?</AlertDialogTitle>
            <AlertDialogDescription>
              История диалога с AI-ассистентом будет удалена. Выполненные действия в системе останутся.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={clearChat}>Очистить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
