import { useCallback, useEffect, useRef, useState } from 'react';
import { Download, LayoutGrid, List, Minus, Plus, QrCode, Save, Square, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { SubscriptionExpired } from '@/components/app/SubscriptionExpired';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, type OwnerTable } from '@/services/api';

type HallObject = {
  id: string;
  type: 'wall' | 'glass' | 'water' | 'bar' | 'kitchen' | 'zone';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

const TOOLS: { type: HallObject['type']; label: string; color: string }[] = [
  { type: 'wall', label: 'Wall', color: '#4a5568' },
  { type: 'glass', label: 'Glass', color: '#81e6d9' },
  { type: 'water', label: 'River/Water', color: '#63b3ed' },
  { type: 'bar', label: 'Bar', color: '#d69e2e' },
  { type: 'kitchen', label: 'Kitchen', color: '#e53e3e' },
  { type: 'zone', label: 'Zone', color: '#9f7aea' },
];

const OBJECT_COLORS: Record<string, string> = {
  wall: '#4a5568',
  glass: '#81e6d9',
  water: '#63b3ed',
  bar: '#d69e2e',
  kitchen: '#e53e3e',
  zone: '#9f7aea',
};

function generateId() {
  return crypto.randomUUID().slice(0, 8);
}

export default function TablesPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(
    user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER',
  );
  const [rows, setRows] = useState<OwnerTable[]>([]);
  const [objects, setObjects] = useState<HallObject[]>([]);
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [view, setView] = useState<'list' | 'hall'>('list');
  const [dragTarget, setDragTarget] = useState<{
    type: 'table' | 'object';
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [drawing, setDrawing] = useState<{ startX: number; startY: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isSubscribed =
    user?.role !== 'RESTAURANT_OWNER' ||
    workspace.selectedRestaurant?.subscription_active !== false;

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    setError('');
    try {
      const [tableRes, mapRes] = await Promise.all([
        ownerAPI.getTables(workspace.selectedRestaurantId),
        ownerAPI.getHallMap(workspace.selectedRestaurantId),
      ]);
      setRows(tableRes.data || []);
      setObjects(mapRes.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [workspace.selectedRestaurantId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.selectedRestaurantId || !number.trim()) return;
    setSubmitting(true);
    setError('');
    setInfo('');
    try {
      const offset = rows.length * 80;
      await ownerAPI.createTable({
        restaurant_id: workspace.selectedRestaurantId,
        number: number.trim(),
        pos_x: view === 'hall' ? 80 + offset : undefined,
        pos_y: view === 'hall' ? 80 : undefined,
      });
      setInfo('Table created.');
      setNumber('');
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create table.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: OwnerTable) => {
    if (!window.confirm(`Delete table ${row.number}?`)) return;
    try {
      await ownerAPI.deleteTable(row.id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete table.');
    }
  };

  const handleActivateSubscription = async (key: string) => {
    if (!workspace.selectedRestaurantId) {
      throw new Error('No workspace selected');
    }
    await ownerAPI.activateSubscription({
      key,
      restaurant_id: workspace.selectedRestaurantId,
    });
    workspace.reload();
  };

  const handleTableMouseDown = useCallback(
    (e: React.MouseEvent, tableId: string) => {
      if (activeTool) return;
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      setDragTarget({ type: 'table', id: tableId, offsetX: e.clientX - r.left, offsetY: e.clientY - r.top });
      setSelectedId(null);
    },
    [activeTool],
  );

  const handleCanvasMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mx = Math.round(e.clientX - rect.left);
      const my = Math.round(e.clientY - rect.top);

      if (dragTarget) {
        if (dragTarget.type === 'table') {
          setRows((prev) => {
            return prev.map((r) => {
              if (r.id !== dragTarget.id) return r;
              const nx = Math.max(0, Math.min(rect.width - 56, mx - dragTarget.offsetX));
              const ny = Math.max(0, Math.min(rect.height - 56, my - dragTarget.offsetY));
              return { ...r, pos_x: nx, pos_y: ny };
            });
          });
        } else if (dragTarget.type === 'object') {
          setObjects((prev) => {
            return prev.map((o) => {
              if (o.id !== dragTarget.id) return o;
              const nx = Math.max(0, Math.min(rect.width - o.width, mx - dragTarget.offsetX));
              const ny = Math.max(0, Math.min(rect.height - o.height, my - dragTarget.offsetY));
              return { ...o, x: nx, y: ny };
            });
          });
        }
      } else if (drawing && activeTool) {
        const w = Math.abs(mx - drawing.startX);
        const h = Math.abs(my - drawing.startY);
        const left = Math.min(mx, drawing.startX);
        const top = Math.min(my, drawing.startY);
        const preview = document.getElementById('draw-preview');
        if (preview) {
          preview.style.left = left + 'px';
          preview.style.top = top + 'px';
          preview.style.width = Math.max(20, w) + 'px';
          preview.style.height = Math.max(20, h) + 'px';
        }
      }
    },
    [dragTarget, drawing, activeTool],
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (dragTarget) {
      setDragTarget(null);
      return;
    }
    if (!drawing || !activeTool || !canvasRef.current) return;
    const preview = document.getElementById('draw-preview');
    if (preview) {
      const l = parseInt(preview.style.left, 10);
      const t = parseInt(preview.style.top, 10);
      const w = parseInt(preview.style.width, 10);
      const h = parseInt(preview.style.height, 10);
      if (w >= 20 && h >= 20) {
        const obj: HallObject = {
          id: generateId(),
          type: activeTool as HallObject['type'],
          label: activeTool,
          x: l,
          y: t,
          width: w,
          height: h,
          color: OBJECT_COLORS[activeTool] || '#999',
        };
        setObjects((prev) => [...prev, obj]);
      }
      preview.style.width = '0';
      preview.style.height = '0';
    }
    setDrawing(null);
  }, [dragTarget, drawing, activeTool]);

  useEffect(() => {
    window.addEventListener('mousemove', handleCanvasMouseMove);
    window.addEventListener('mouseup', handleCanvasMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleCanvasMouseMove);
      window.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, [handleCanvasMouseMove, handleCanvasMouseUp]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;
    setSelectedId(null);
    if (!activeTool) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setDrawing({ startX: x, startY: y });
    const preview = document.getElementById('draw-preview');
    if (preview) {
      preview.style.left = x + 'px';
      preview.style.top = y + 'px';
      preview.style.width = '0';
      preview.style.height = '0';
      preview.style.display = 'block';
    }
  };

  const handleObjectMouseDown = (e: React.MouseEvent, objId: string) => {
    if (activeTool) return;
    e.stopPropagation();
    setSelectedId(objId);
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    setDragTarget({ type: 'object', id: objId, offsetX: e.clientX - r.left, offsetY: e.clientY - r.top });
  };

  const deleteSelectedObject = () => {
    if (selectedId) {
      setObjects((prev) => prev.filter((o) => o.id !== selectedId));
      setSelectedId(null);
    }
  };

  const placeTable = async (table: OwnerTable) => {
    const placedCount = rows.filter((r) => r.pos_x != null && r.pos_y != null && r.id !== table.id).length;
    const posX = 80 + (placedCount % 3) * 120;
    const posY = 80 + Math.floor(placedCount / 3) * 120;
    try {
      await ownerAPI.updateTablePosition(table.id, { pos_x: posX, pos_y: posY });
      setRows((prev) =>
        prev.map((r) => (r.id === table.id ? { ...r, pos_x: posX, pos_y: posY } : r)),
      );
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to place table.');
    }
  };

  const handleSaveLayout = async () => {
    setError('');
    setInfo('');
    try {
      const placed = rows.filter((r) => r.pos_x != null && r.pos_y != null);
      if (placed.length) {
        await Promise.all(
          placed.map((r) =>
            ownerAPI.updateTablePosition(r.id, { pos_x: r.pos_x!, pos_y: r.pos_y! }),
          ),
        );
      }
      if (workspace.selectedRestaurantId) {
        await ownerAPI.saveHallMap(workspace.selectedRestaurantId, objects);
      }
      setInfo('Layout saved.');
      setSelectedId(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save layout.');
    }
  };

  const unplaced = rows.filter((r) => r.pos_x == null || r.pos_y == null);
  const placed = rows.filter((r) => r.pos_x != null && r.pos_y != null);

  if (!isSubscribed) {
    return (
      <AppShell
        title="Tables"
        subtitle="Manage tables and QR"
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <SubscriptionExpired
          restaurantId={workspace.selectedRestaurantId}
          restaurantName={workspace.selectedRestaurant?.name}
          onActivate={handleActivateSubscription}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Tables"
      subtitle="Manage tables, QR codes, and hall layout"
      eyebrow="Service floor"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleCreate} className="flex flex-1 gap-3">
            <input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="1, 2, VIP-1..."
              className="flex-1 rounded-2xl border border-[var(--panel-border)] bg-[var(--input-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
            <Button type="submit" disabled={submitting || !workspace.selectedRestaurantId} size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> Add
            </Button>
          </form>
          <div className="flex gap-1 rounded-2xl border border-[var(--panel-border)] bg-[var(--input-bg)] p-0.5">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                view === 'list'
                  ? 'bg-[#f97360] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              type="button"
              onClick={() => setView('hall')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                view === 'hall'
                  ? 'bg-[#f97360] text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Hall scheme
            </button>
          </div>
          {workspace.selectedRestaurantId ? (
            <Button type="button" variant="outline" size="sm" onClick={() => ownerAPI.downloadTablesQrPdf(workspace.selectedRestaurantId!)}>
              <Download className="mr-1.5 h-4 w-4" /> QR PDF
            </Button>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
        {info ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {info}
          </div>
        ) : null}

        {view === 'list' ? (
          <Panel title="Tables list" eyebrow="QR control">
            <DataTable
              rows={rows}
              emptyMessage={loading ? 'Loading...' : 'No tables yet.'}
              columns={[
                {
                  label: 'Table',
                  key: 'number',
                  render: (row) => (
                    <div className="font-semibold text-[var(--text-primary)]">Table {row.number}</div>
                  ),
                },
                { label: 'Status', key: 'is_occupied', render: (row) => (row.is_occupied ? 'Occupied' : 'Free') },
                { label: 'Waiter', key: 'waiter', render: (row) => row.waiter || '\u2014' },
                {
                  label: 'Position',
                  key: 'pos_x',
                  render: (row) => (row.pos_x != null ? `${row.pos_x}, ${row.pos_y}` : '\u2014'),
                },
                {
                  label: 'QR',
                  key: 'qr_url',
                  render: (row) => (
                    <button onClick={() => ownerAPI.downloadTableQrPng(row.id)}
                      className="inline-flex items-center gap-1 text-[#8fd4ff] hover:text-white transition text-sm">
                      <QrCode className="h-4 w-4" /> PNG
                    </button>
                  ),
                },
                {
                  label: 'Action',
                  key: 'id',
                  render: (row) => (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDelete(row)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </Panel>
        ) : (
          <Panel
            title="Hall scheme"
            eyebrow="Floor plan editor"
            description="Draw walls, zones, and drag tables to create your restaurant layout."
          >
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="flex gap-1 rounded-2xl border border-[var(--panel-border)] bg-[var(--input-bg)] p-1">
                <button
                  type="button"
                  onClick={() => setActiveTool(null)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    !activeTool
                      ? 'bg-[#f97360] text-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Minus className="h-3 w-3" /> Select
                </button>
                {TOOLS.map((tool) => (
                  <button
                    key={tool.type}
                    type="button"
                    onClick={() => setActiveTool(tool.type)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      activeTool === tool.type
                        ? 'bg-[#f97360] text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Square className="h-3 w-3" style={{ color: tool.color }} /> {tool.label}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                {selectedId && (
                  <Button variant="outline" size="sm" onClick={deleteSelectedObject}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button size="sm" onClick={handleSaveLayout}>
                  <Save className="mr-1.5 h-4 w-4" /> Save layout
                </Button>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
              {TOOLS.map((tool) => (
                <span key={tool.type} className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: tool.color }} />
                  {tool.label}
                </span>
              ))}
              <span className="ml-auto flex items-center gap-1.5">
                <span className="inline-grid h-3 w-3 place-items-center rounded border border-[#f97360]/40 bg-[#f97360]/15 text-[7px] font-bold text-[#f97360]">
                  T
                </span>
                Tables
              </span>
            </div>

            <div
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              className="relative h-[500px] overflow-hidden rounded-2xl border border-[var(--panel-border)] bg-[linear-gradient(90deg,var(--input-bg)_1px,transparent_1px),linear-gradient(0deg,var(--input-bg)_1px,transparent_1px)] bg-[length:40px_40px]"
              onContextMenu={(e) => e.preventDefault()}
              style={{ cursor: activeTool ? 'crosshair' : 'default' }}
            >
              {objects.map((obj) => (
                <div
                  key={obj.id}
                  onMouseDown={(e) => handleObjectMouseDown(e, obj.id)}
                  className={`absolute rounded-lg border-2 transition-opacity ${
                    !activeTool ? 'cursor-grab' : 'cursor-default'
                  } ${
                    dragTarget?.id === obj.id && dragTarget.type === 'object'
                      ? 'z-30 scale-[1.02] ring-2 ring-white/60 shadow-lg'
                      : selectedId === obj.id
                        ? 'z-20 ring-2 ring-white/50'
                        : 'z-0 hover:opacity-80'
                  } ${obj.type === 'glass' ? 'border-dashed border-white/40' : 'border-transparent'}`}
                  style={{
                    left: obj.x,
                    top: obj.y,
                    width: obj.width,
                    height: obj.height,
                    backgroundColor: obj.color + '40',
                  }}
                >
                  <span className="absolute left-1.5 top-0.5 text-[10px] font-semibold text-white/70 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    {obj.label}
                  </span>
                </div>
              ))}

              {placed.map((table) => (
                <div
                  key={table.id}
                  onMouseDown={(e) => handleTableMouseDown(e, table.id)}
                  className={`group absolute flex cursor-grab items-center justify-center rounded-xl border-2 text-sm font-bold transition-shadow select-none ${
                    dragTarget?.id === table.id && dragTarget.type === 'table'
                      ? 'z-50 scale-110 shadow-[0_0_0_2px_#f97360,0_8px_24px_rgba(0,0,0,0.3)]'
                      : 'z-10 shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]'
                  } ${
                    table.is_occupied
                      ? 'border-red-400/50 bg-red-500/15 text-red-200'
                      : 'border-[#f97360]/40 bg-[#f97360]/10 text-[#f97360]'
                  }`}
                  style={{ left: table.pos_x ?? 0, top: table.pos_y ?? 0, width: 56, height: 56 }}
                >
                  <span>{table.number}</span>
                  <div className="absolute -right-1.5 -top-1.5 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); ownerAPI.downloadTableQrPng(table.id); }}
                      className="grid h-4 w-4 place-items-center rounded-full bg-[#8fd4ff]/80 text-[8px] text-white hover:bg-[#8fd4ff]"
                      title="Download QR">Q</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(table); }}
                      className="grid h-4 w-4 place-items-center rounded-full bg-red-500/80 text-[9px] text-white hover:bg-red-500">×</button>
                  </div>
                </div>
              ))}

              <div
                id="draw-preview"
                className="pointer-events-none absolute rounded-lg border-2 border-dashed border-white/50 bg-white/10"
                style={{ display: 'none', width: 0, height: 0 }}
              />
            </div>

            {unplaced.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
                  Unplaced tables ({unplaced.length}) {'\u2014'} click to place on canvas
                </div>
                <div className="flex flex-wrap gap-2">
                  {unplaced.map((table) => (
                    <button
                      key={table.id}
                      onClick={() => placeTable(table)}
                      className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm text-[var(--text-primary)] transition hover:border-[#f97360]/50 hover:bg-[#f97360]/5"
                    >
                      <Plus className="h-3 w-3 text-[#f97360]" />
                      <span className="font-semibold">Table {table.number}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(table);
                        }}
                        className="text-[var(--text-muted)] hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
