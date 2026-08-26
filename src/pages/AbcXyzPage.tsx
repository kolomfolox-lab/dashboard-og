import { BarChart3, CircleDollarSign, RefreshCcw, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

const uzs = (value: unknown) => `${Number(value || 0).toLocaleString('ru-RU')} UZS`;

const CELL_TONE: Record<string, string> = {
  A: 'bg-emerald-500/12 text-emerald-400',
  B: 'bg-[#ffd28d]/15 text-[#ffd28d]',
  C: 'bg-red-500/12 text-red-400',
};

interface MatrixRow {
  dish_name: string;
  revenue: number;
  qty: number;
  revenue_share_pct: number;
  cum_pct: number;
  abc: 'A' | 'B' | 'C';
  xyz: 'X' | 'Y' | 'Z';
  cell: string;
  recommendation: string;
}

interface ReorderRow {
  ingredient_id: string;
  name: string;
  unit: string;
  stock: number;
  minimum_quantity: number;
  avg_daily_consumption: number;
  days_left: number | null;
  suggested_order_qty: number;
}

export default function AbcXyzPage() {
  const { user } = useAuth();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [reorder, setReorder] = useState<ReorderRow[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const res = await ownerAPI.getAbcXyz(workspace.selectedRestaurantId, days);
      setRows(res.data.items || []);
      setReorder(res.data.reorder || []);
      setSummary(res.data.summary || {});
      setTotalRevenue(res.data.total_revenue || 0);
    } catch {
      toast.error('Не удалось загрузить матрицу ABC/XYZ');
    } finally {
      setLoading(false);
    }
  }, [workspace.selectedRestaurantId, days]);

  useEffect(() => { void load(); }, [load]);

  return (
    <AppShell
      title="ABC/XYZ матрица"
      subtitle="Классификация блюд по выручке (ABC) и стабильности спроса (XYZ) + автозаказ по реальному расходу."
      eyebrow="Waitly Analytics · Часть 15"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-theme bg-[var(--panel-bg)] p-1">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold ${days === d ? 'bg-[#f97360] text-white' : 'text-theme-secondary hover:bg-white/5'}`}
            >
              {d} дн.
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />Обновить
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Выручка за период" value={uzs(totalRevenue)} note={`${rows.length} блюд в анализе`} />
        <MetricCard title="Ядро (класс A)" value={String(summary.A ?? 0)} note={`B: ${summary.B ?? 0} · C: ${summary.C ?? 0}`} />
        <MetricCard title="Спрос X / Y / Z" value={`${summary.X ?? 0} / ${summary.Y ?? 0} / ${summary.Z ?? 0}`} note="стабильный / средний / нестабильный" />
      </div>

      <Card className="mt-4 border-theme bg-[var(--panel-bg)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-theme"><BarChart3 className="h-5 w-5" />Матрица блюд</CardTitle>
          <CardDescription>AX — держите запас; AZ — страховой запас; CZ — кандидат на вывод.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-theme">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Блюдо</TableHead>
                  <TableHead>Выручка</TableHead>
                  <TableHead>Доля</TableHead>
                  <TableHead>Шт.</TableHead>
                  <TableHead>Класс</TableHead>
                  <TableHead>Рекомендация</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-5 w-full bg-white/6" /></TableCell></TableRow>
                  ))
                ) : rows.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-10 text-center text-theme-muted">Нет продаж за выбранный период.</TableCell></TableRow>
                ) : rows.map((r) => (
                  <TableRow key={r.cell + r.dish_name}>
                    <TableCell className="font-semibold text-theme">{r.dish_name}</TableCell>
                    <TableCell>{uzs(r.revenue)}</TableCell>
                    <TableCell>{r.revenue_share_pct}%</TableCell>
                    <TableCell>{r.qty}</TableCell>
                    <TableCell>
                      <span className={`mr-1 inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-black ${CELL_TONE[r.abc]}`}>{r.abc}</span>
                      <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-black ${r.xyz === 'X' ? 'bg-emerald-500/12 text-emerald-400' : r.xyz === 'Y' ? 'bg-[#ffd28d]/15 text-[#ffd28d]' : 'bg-red-500/12 text-red-400'}`}>{r.xyz}</span>
                    </TableCell>
                    <TableCell className="max-w-72 text-xs text-theme-secondary">{r.recommendation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 border-theme bg-[var(--panel-bg)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-theme"><ShoppingCart className="h-5 w-5" />Автозаказ</CardTitle>
          <CardDescription>Расчёт по списаниям из заказов за период; горизонт закупки — 14 дней.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-theme">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ингредиент</TableHead>
                  <TableHead>Запас</TableHead>
                  <TableHead>Расход/день</TableHead>
                  <TableHead>Хватит на</TableHead>
                  <TableHead>Заказать</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5}><Skeleton className="h-5 w-full bg-white/6" /></TableCell></TableRow>
                ) : reorder.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-theme-muted"><span className="inline-flex items-center gap-2"><CircleDollarSign className="h-4 w-4" />Всего хватает — закупка не требуется.</span></TableCell></TableRow>
                ) : reorder.map((r) => (
                  <TableRow key={r.ingredient_id}>
                    <TableCell className="font-semibold text-theme">{r.name}</TableCell>
                    <TableCell>{r.stock.toLocaleString('ru-RU')} {r.unit}</TableCell>
                    <TableCell>{r.avg_daily_consumption.toLocaleString('ru-RU')} {r.unit}</TableCell>
                    <TableCell>
                      {r.days_left === null ? '—' : (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.days_left < 7 ? 'bg-red-500/12 text-red-400' : 'bg-[#ffd28d]/15 text-[#ffd28d]'}`}>
                          {r.days_left} дн.
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-400">+{r.suggested_order_qty.toLocaleString('ru-RU')} {r.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function MetricCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <Card className="border-theme bg-[var(--panel-bg)]">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-theme-secondary">{title}</CardTitle>
        <div className="mt-3 font-display text-2xl font-black text-theme">{value}</div>
        <CardDescription className="mt-2">{note}</CardDescription>
      </CardHeader>
    </Card>
  );
}
