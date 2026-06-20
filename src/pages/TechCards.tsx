import { ChefHat, Plus, Trash2, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

export default function TechCardsPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'CHEF' || user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [techCards, setTechCards] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ dish: '', yield_amount: 1, cooking_instructions: '', cooking_time_minutes: 0 });
  const [itemForm, setItemForm] = useState({ ingredient: '', quantity_needed: 0, ingredient_cost_price: 0 });

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const tcRes = await ownerAPI.getTechCards(workspace.selectedRestaurantId);
      const dishRes = await ownerAPI.getMenuDishes(workspace.selectedRestaurantId);
      const ingRes = await ownerAPI.getInventory(workspace.selectedRestaurantId);
      setTechCards((tcRes.data as any).results || tcRes.data || []);
      const dishesData = dishRes.data;
      setDishes(Array.isArray(dishesData) ? dishesData : (dishesData as any).results || []);
      setIngredients(ingRes.data.ingredients || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const create = async () => {
    try {
      await ownerAPI.createTechCard({ ...form, restaurant: workspace.selectedRestaurantId! });
      setShowCreate(false);
      setForm({ dish: '', yield_amount: 1, cooking_instructions: '', cooking_time_minutes: 0 });
      await load();
    } catch {}
  };

  const addItem = async (cardId: string) => {
    try {
      await ownerAPI.addTechCardItem(cardId, itemForm);
      setItemForm({ ingredient: '', quantity_needed: 0, ingredient_cost_price: 0 });
      await load();
    } catch {}
  };

  const removeItem = async (cardId: string, itemId: string) => {
    try {
      await ownerAPI.removeTechCardItem(cardId, itemId);
      await load();
    } catch {}
  };

  const recalculate = async (cardId: string) => {
    try {
      await ownerAPI.recalculateTechCard(cardId);
      await load();
    } catch {}
  };

  const selectedCard = techCards.find(tc => tc.id === expandedCard);

  return (
    <AppShell title="Tech Cards" subtitle="Technological cards, cost calculation, and margin analysis." eyebrow="Waitly Kitchen"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <Panel title="Total cards" eyebrow="Tech cards">
          <div className="text-3xl font-bold text-theme">{techCards.length}</div>
        </Panel>
        <Panel title="Avg margin" eyebrow="Profitability">
          <div className="text-3xl font-bold text-emerald-400">
            {techCards.length > 0
              ? Math.round(techCards.reduce((s, c) => s + (parseFloat(c.margin_percent) || 0), 0) / techCards.length) + '%'
              : '—'}
          </div>
        </Panel>
        <Panel title="Action" eyebrow="Quick">
          <Button variant="secondary" onClick={() => setShowCreate(!showCreate)} className="w-full">
            <Plus className="mr-2 h-4 w-4" />{showCreate ? 'Cancel' : 'New tech card'}
          </Button>
        </Panel>
      </div>

      {showCreate ? (
        <Panel title="Create tech card" eyebrow="New" className="mb-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-theme-secondary">Dish</label>
              <select value={form.dish} onChange={e => setForm(f => ({ ...f, dish: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none">
                <option value="">Select dish</option>
                {dishes.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary">Yield (portions)</label>
              <input type="number" value={form.yield_amount} onChange={e => setForm(f => ({ ...f, yield_amount: +e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-theme-secondary">Cooking instructions</label>
              <textarea value={form.cooking_instructions} onChange={e => setForm(f => ({ ...f, cooking_instructions: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" rows={3} />
            </div>
            <div>
              <label className="text-xs font-semibold text-theme-secondary">Cooking time (min)</label>
              <input type="number" value={form.cooking_time_minutes} onChange={e => setForm(f => ({ ...f, cooking_time_minutes: +e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none" />
            </div>
          </div>
          <div className="mt-5">
            <Button onClick={create}><ChefHat className="mr-2 h-4 w-4" />Create tech card</Button>
          </div>
        </Panel>
      ) : null}

      <Panel title="All tech cards" eyebrow="Recipes">
        <DataTable
          columns={[
            { label: 'Dish', key: 'dish_name' },
            { label: 'Cost', key: 'total_cost', render: (row) => `${Number(row.total_cost).toLocaleString()} UZS` },
            { label: 'Selling', key: 'id', render: (row) => {
              const d = dishes.find((x: any) => x.id === row.dish);
              return d ? `${Number(d.price).toLocaleString()} UZS` : '—';
            }},
            { label: 'Margin', key: 'margin_percent', render: (row) => (
              <span className={parseFloat(row.margin_percent) > 30 ? 'text-emerald-400' : parseFloat(row.margin_percent) > 0 ? 'text-amber-300' : 'text-red-400'}>
                {row.margin_percent}%
              </span>
            )},
            { label: 'Items', key: 'id', render: (row) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setExpandedCard(expandedCard === row.id ? null : row.id)}>
                  {(row.tech_card_items || []).length} ingredients
                </Button>
                <Button variant="ghost" size="sm" onClick={() => recalculate(row.id)}><RefreshCcw className="h-3 w-3" /></Button>
              </div>
            )},
          ]}
          rows={techCards}
          emptyMessage="No tech cards yet. Create one to start tracking dish costs."
        />
      </Panel>

      {selectedCard ? (
        <Panel title={`${selectedCard.dish_name} — ingredients`} eyebrow="Tech card detail" className="mt-5">
          <DataTable
            columns={[
              { label: 'Ingredient', key: 'ingredient_name' },
              { label: 'Quantity', key: 'quantity_needed', render: (row) => `${row.quantity_needed} ${(row as any).ingredient_unit || ''}` },
              { label: 'Cost price', key: 'ingredient_cost_price', render: (row) => `${Number(row.ingredient_cost_price).toLocaleString()} UZS` },
              { label: 'Actions', key: 'id', render: (row) => (
                <Button variant="ghost" size="sm" onClick={() => removeItem(selectedCard.id, row.id)}>
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              )},
            ]}
            rows={selectedCard.tech_card_items || []}
            emptyMessage="No ingredients added yet."
          />
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-theme-secondary">Ingredient</label>
              <select value={itemForm.ingredient} onChange={e => setItemForm(f => ({ ...f, ingredient: e.target.value }))}
                className="rounded-xl border border-theme bg-[var(--input-bg)] px-3 py-2 text-sm text-theme outline-none">
                <option value="">Select</option>
                {ingredients.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-theme-secondary">Qty</label>
              <input type="number" value={itemForm.quantity_needed} onChange={e => setItemForm(f => ({ ...f, quantity_needed: +e.target.value }))}
                className="w-20 rounded-xl border border-theme bg-[var(--input-bg)] px-3 py-2 text-sm text-theme outline-none" />
            </div>
            <div>
              <label className="text-xs text-theme-secondary">Unit cost</label>
              <input type="number" value={itemForm.ingredient_cost_price} onChange={e => setItemForm(f => ({ ...f, ingredient_cost_price: +e.target.value }))}
                className="w-24 rounded-xl border border-theme bg-[var(--input-bg)] px-3 py-2 text-sm text-theme outline-none" />
            </div>
            <Button variant="secondary" size="sm" onClick={() => addItem(selectedCard.id)}>
              <Plus className="mr-1 h-3 w-3" />Add
            </Button>
          </div>
        </Panel>
      ) : null}
    </AppShell>
  );
}
