import { Plus, Search, UtensilsCrossed, Pencil, Trash2, Eye, EyeOff, X, Image as ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, type OwnerMenuCategory, type OwnerMenuDish } from '@/services/api';
import { formatMoney } from '@/lib/utils';

export default function MenuPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [categories, setCategories] = useState<OwnerMenuCategory[]>([]);
  const [dishes, setDishes] = useState<OwnerMenuDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [catModal, setCatModal] = useState<{ open: boolean; edit?: OwnerMenuCategory }>({ open: false });
  const [catName, setCatName] = useState('');
  const [dishModal, setDishModal] = useState<{ open: boolean; edit?: OwnerMenuDish }>({ open: false });
  const [dishForm, setDishForm] = useState({ name: '', description: '', ingredients: '', price: '', cooking_time: 15, category_id: '', is_available: true });
  const [dishImage, setDishImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const [catRes, dishRes] = await Promise.all([
        ownerAPI.getMenuCategories(workspace.selectedRestaurantId),
        ownerAPI.getMenuDishes(workspace.selectedRestaurantId),
      ]);
      setCategories(catRes.data);
      setDishes(dishRes.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [workspace.selectedRestaurantId]);

  const filteredDishes = dishes.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && d.category_id !== filterCat) return false;
    return true;
  });

  const handleSaveCategory = async () => {
    if (!catName.trim() || !workspace.selectedRestaurantId) return;
    setSaving(true);
    try {
      if (catModal.edit) {
        await ownerAPI.updateMenuCategory(catModal.edit.id, { name: catName.trim() });
      } else {
        await ownerAPI.createMenuCategory({ restaurant_id: workspace.selectedRestaurantId, name: catName.trim() });
      }
      setCatModal({ open: false });
      setCatName('');
      await load();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(locale === 'uz' ? 'Kategoriyani o\'chirishni tasdiqlaysizmi?' : 'Удалить категорию?')) return;
    await ownerAPI.deleteMenuCategory(id);
    await load();
  };

  const handleSaveDish = async () => {
    if (!dishForm.name.trim() || !dishForm.price || !workspace.selectedRestaurantId) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('restaurant_id', workspace.selectedRestaurantId);
      fd.append('name', dishForm.name.trim());
      fd.append('description', dishForm.description);
      fd.append('ingredients', dishForm.ingredients);
      fd.append('price', dishForm.price);
      fd.append('cooking_time', String(dishForm.cooking_time));
      fd.append('category_id', dishForm.category_id);
      fd.append('is_available', String(dishForm.is_available));
      if (dishImage) fd.append('image', dishImage);
      if (dishModal.edit) {
        await ownerAPI.updateMenuDish(dishModal.edit.id, fd);
      } else {
        await ownerAPI.createMenuDish(fd);
      }
      setDishModal({ open: false });
      setDishForm({ name: '', description: '', ingredients: '', price: '', cooking_time: 15, category_id: '', is_available: true });
      setDishImage(null);
      await load();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleDeleteDish = async (id: string) => {
    if (!confirm(locale === 'uz' ? 'Taomni o\'chirishni tasdiqlaysizmi?' : 'Удалить блюдо?')) return;
    await ownerAPI.deleteMenuDish(id);
    await load();
  };

  const toggleAvailability = async (dish: OwnerMenuDish) => {
    const fd = new FormData();
    fd.append('is_available', String(!dish.is_available));
    await ownerAPI.updateMenuDish(dish.id, fd);
    await load();
  };

  const openEditDish = (dish: OwnerMenuDish) => {
    setDishForm({
      name: dish.name,
      description: dish.description,
      ingredients: dish.ingredients,
      price: dish.price,
      cooking_time: dish.cooking_time,
      category_id: dish.category_id || '',
      is_available: dish.is_available,
    });
    setDishImage(null);
    setDishModal({ open: true, edit: dish });
  };

  return (
    <AppShell
      title={locale === 'uz' ? 'Menyu' : 'Меню'}
      subtitle={locale === 'uz' ? 'Taomlar va kategoriyalarni boshqarish' : 'Управление блюдами и категориями'}
      eyebrow="Menu"
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-2.5">
            <Search className="h-4 w-4 text-theme-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={locale === 'uz' ? 'Taom nomi...' : 'Название блюда...'} className="min-w-[180px] bg-transparent text-sm text-theme outline-none placeholder:text-theme-muted" />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-2.5 text-sm text-theme outline-none">
            <option value="">{locale === 'uz' ? 'Barcha kategoriyalar' : 'Все категории'}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button variant="secondary" size="sm" onClick={() => { setCatName(''); setCatModal({ open: true }); }}>
            <Plus className="mr-1.5 h-4 w-4" />{locale === 'uz' ? 'Kategoriya' : 'Категория'}
          </Button>
          <Button size="sm" onClick={() => { setDishForm({ name: '', description: '', ingredients: '', price: '', cooking_time: 15, category_id: categories[0]?.id || '', is_available: true }); setDishImage(null); setDishModal({ open: true }); }}>
            <Plus className="mr-1.5 h-4 w-4" />{locale === 'uz' ? 'Taom' : 'Блюдо'}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 rounded-full border border-theme bg-theme-panel px-4 py-1.5 text-sm">
              <span className="text-theme">{cat.name}</span>
              <span className="text-[11px] text-theme-muted">({cat.dish_count})</span>
              <button onClick={() => { setCatName(cat.name); setCatModal({ open: true, edit: cat }); }} className="ml-1 text-theme-muted hover:text-theme"><Pencil className="h-3 w-3" /></button>
              <button onClick={() => handleDeleteCategory(cat.id)} className="text-white/30 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-3 h-32 rounded-2xl bg-white/10" />
                <div className="mb-2 h-4 w-3/4 rounded bg-white/10" />
                <div className="h-4 w-1/2 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : filteredDishes.length === 0 ? (
          <Panel title={locale === 'uz' ? 'Taomlar yo\'q' : 'Нет блюд'} eyebrow="Menu">
            <div className="flex flex-col items-center gap-4 py-16">
              <UtensilsCrossed className="h-12 w-12 text-white/20" />
              <p className="text-sm text-white/40">{locale === 'uz' ? 'Hozircha taomlar yo\'q. Yangi taom qo\'shing.' : 'Пока нет блюд. Добавьте новое блюдо.'}</p>
            </div>
          </Panel>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {filteredDishes.map(dish => (
              <div key={dish.id} className={`group relative rounded-3xl border transition-all ${dish.is_available ? 'border-theme bg-theme-panel hover:bg-[var(--panel-bg)]' : 'border-theme opacity-55'}`}>
                <div className="aspect-[4/3] overflow-hidden rounded-t-3xl bg-theme-panel">
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center"><ImageIcon className="h-8 w-8 text-theme-muted" /></div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-theme">{dish.name}</h3>
                      {dish.category_name && <p className="mt-0.5 text-[10px] uppercase tracking-wider text-theme-muted">{dish.category_name}</p>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-[#ffd4c4]">{formatMoney(Number(dish.price))}</div>
                      {Number(dish.cost_price) > 0 && (
                        <div className="mt-0.5 text-[10px] text-theme-muted">
                          себест. {formatMoney(Number(dish.cost_price))}
                          {dish.margin_percent !== null && (
                            <span className={dish.margin_percent >= 30 ? 'ml-1 text-emerald-400' : dish.margin_percent > 0 ? 'ml-1 text-amber-400' : 'ml-1 text-red-400'}>
                              {dish.margin_percent >= 30 ? '✓' : ''} {dish.margin_percent}%
                            </span>
                          )}
                        </div>
                      )}
                      {dish.average_rating >= 4 && (
                        <div className="mt-1 text-[10px] text-amber-400">
                          ★ {dish.average_rating}
                        </div>
                      )}
                    </div>
                  </div>
                  {dish.ingredients && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-theme-secondary">{dish.ingredients}</p>}
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => toggleAvailability(dish)} className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${dish.is_available ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-theme bg-theme-panel text-theme-muted'}`}>
                      {dish.is_available ? <><Eye className="mr-1 inline h-3 w-3" />{locale === 'uz' ? 'Mavjud' : 'В наличии'}</> : <><EyeOff className="mr-1 inline h-3 w-3" />{locale === 'uz' ? 'Yo\'q' : 'Нет'}</>}
                    </button>
                    <button onClick={() => openEditDish(dish)} className="rounded-lg border border-theme bg-theme-panel p-1.5 text-theme-muted hover:text-theme"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDeleteDish(dish.id)} className="rounded-lg border border-theme bg-theme-panel p-1.5 text-theme-muted hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Modal */}
      {catModal.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--overlay-bg)] backdrop-blur-sm" onClick={() => setCatModal({ open: false })}>
          <div className="w-full max-w-md rounded-3xl border border-theme bg-[var(--modal-bg)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-theme">{catModal.edit ? (locale === 'uz' ? 'Kategoriyani tahrirlash' : 'Редактировать категорию') : (locale === 'uz' ? 'Yangi kategoriya' : 'Новая категория')}</h2>
              <button onClick={() => setCatModal({ open: false })} className="text-theme-secondary hover:text-theme"><X className="h-5 w-5" /></button>
            </div>
            <input value={catName} onChange={e => setCatName(e.target.value)} placeholder={locale === 'uz' ? 'Kategoriya nomi' : 'Название категории'} className="mt-4 w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none placeholder:text-theme-muted" autoFocus />
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setCatModal({ open: false })}>{locale === 'uz' ? 'Bekor qilish' : 'Отмена'}</Button>
              <Button onClick={handleSaveCategory} disabled={saving || !catName.trim()}>{saving ? '...' : (locale === 'uz' ? 'Saqlash' : 'Сохранить')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Dish Modal */}
      {dishModal.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--overlay-bg)] backdrop-blur-sm" onClick={() => setDishModal({ open: false })}>
          <div className="w-full max-w-lg rounded-3xl border border-theme bg-[var(--modal-bg)] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-theme">{dishModal.edit ? (locale === 'uz' ? 'Taomni tahrirlash' : 'Редактировать блюдо') : (locale === 'uz' ? 'Yangi taom' : 'Новое блюдо')}</h2>
              <button onClick={() => setDishModal({ open: false })} className="text-theme-secondary hover:text-theme"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-4 space-y-3">
              <input value={dishForm.name} onChange={e => setDishForm(f => ({ ...f, name: e.target.value }))} placeholder={locale === 'uz' ? 'Taom nomi' : 'Название блюда'} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none placeholder:text-theme-muted" />
              <div className="flex gap-3">
                <input value={dishForm.price} onChange={e => setDishForm(f => ({ ...f, price: e.target.value }))} placeholder={locale === 'uz' ? 'Narxi (sum)' : 'Цена (сум)'} className="w-1/2 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none placeholder:text-theme-muted" />
                <input value={dishForm.cooking_time} onChange={e => setDishForm(f => ({ ...f, cooking_time: Number(e.target.value) }))} type="number" min={1} placeholder={locale === 'uz' ? 'Daqiqa' : 'Минуты'} className="w-1/2 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none placeholder:text-theme-muted" />
              </div>
              <select value={dishForm.category_id} onChange={e => setDishForm(f => ({ ...f, category_id: e.target.value }))} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none">
                <option value="">{locale === 'uz' ? 'Kategoriya tanlang' : 'Выберите категорию'}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea value={dishForm.description} onChange={e => setDishForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder={locale === 'uz' ? 'Ta\'rif' : 'Описание'} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none placeholder:text-theme-muted" />
              <textarea value={dishForm.ingredients} onChange={e => setDishForm(f => ({ ...f, ingredients: e.target.value }))} rows={2} placeholder={locale === 'uz' ? 'Masalliqlar' : 'Ингредиенты'} className="w-full rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme outline-none placeholder:text-theme-muted" />
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-theme bg-[var(--input-bg)] px-4 py-3 text-sm text-theme-secondary hover:text-theme">
                  <ImageIcon className="h-4 w-4" />
                  <span>{locale === 'uz' ? 'Rasm yuklash' : 'Загрузить фото'}</span>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setDishImage(e.target.files?.[0] || null)} />
                </label>
                {dishImage && <span className="text-xs text-white/40">{dishImage.name}</span>}
                {dishModal.edit?.image && !dishImage && <span className="text-xs text-white/40">{locale === 'uz' ? 'Rasm mavjud' : 'Фото есть'}</span>}
                <label className="flex items-center gap-2 text-sm text-white/60">
                  <input type="checkbox" checked={dishForm.is_available} onChange={e => setDishForm(f => ({ ...f, is_available: e.target.checked }))} className="rounded border-white/20 bg-white/5" />
                  {locale === 'uz' ? 'Mavjud' : 'В наличии'}
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDishModal({ open: false })}>{locale === 'uz' ? 'Bekor qilish' : 'Отмена'}</Button>
              <Button onClick={handleSaveDish} disabled={saving || !dishForm.name.trim() || !dishForm.price}>{saving ? '...' : (locale === 'uz' ? 'Saqlash' : 'Сохранить')}</Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
