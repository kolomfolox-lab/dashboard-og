import { Plus, Search, UtensilsCrossed, Pencil, Trash2, Eye, EyeOff, X, Image as ImageIcon, Coffee, Layers } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, modifierAPI, type OwnerMenuCategory, type OwnerMenuDish } from '@/services/api';
import { formatMoney } from '@/lib/utils';
import { showToast } from '@/lib/toast';

type Tab = 'dishes' | 'modifiers';

export default function MenuPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const [tab, setTab] = useState<Tab>('dishes');
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

  // ── Modifier state ──
  const [modGroups, setModGroups] = useState<any[]>([]);
  const [groupModal, setGroupModal] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: '', is_required: false, max_options: 1 });
  const [optionModal, setOptionModal] = useState<{ groupId: string; open: boolean }>({ groupId: '', open: false });
  const [optionForm, setOptionForm] = useState({ name: '', price_modifier: '', is_default: false });
  const [dishModModal, setDishModModal] = useState(false);
  const [dishModDish, setDishModDish] = useState<string>('');
  const [dishModGroups, setDishModGroups] = useState<string[]>([]);
  const [saveModLoading, setSaveModLoading] = useState(false);

  const loadDishes = async () => {
    if (!workspace.selectedRestaurantId) return;
    setLoading(true);
    try {
      const [catRes, dishRes] = await Promise.all([
        ownerAPI.getMenuCategories(workspace.selectedRestaurantId),
        ownerAPI.getMenuDishes(workspace.selectedRestaurantId),
      ]);
      setCategories(catRes.data);
      setDishes(dishRes.data);
    } catch { showToast(t('menu_load_error', 'Ошибка загрузки'), 'error'); }
    finally { setLoading(false); }
  };

  const loadModifiers = async () => {
    if (!workspace.selectedRestaurantId) return;
    try {
      const res = await modifierAPI.getGroups(workspace.selectedRestaurantId);
      const data = res.data;
      setModGroups(Array.isArray(data) ? data : (data.results || []));
    } catch {}
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
      await loadDishes();
      showToast(t('mod_saved', 'Сохранено'), 'success');
    } catch { showToast(t('save_error', 'Ошибка'), 'error'); }
    finally { setSaving(false); }
  };

  const handleDeleteDish = async (dish: OwnerMenuDish) => {
    if (!window.confirm(locale === 'uz' ? `«${dish.name}» taomini o'chirishni tasdiqlaysizmi?` : `Удалить блюдо «${dish.name}»?`)) return;
    try {
      await ownerAPI.deleteMenuDish(dish.id);
      await loadDishes();
      showToast(t('mod_saved', 'Удалено'), 'success');
    } catch { showToast(t('save_error', 'Ошибка'), 'error'); }
  };

  const toggleAvailability = async (dish: OwnerMenuDish) => {
    const fd = new FormData();
    fd.append('is_available', String(!dish.is_available));
    try {
      await ownerAPI.updateMenuDish(dish.id, fd);
      await loadDishes();
    } catch { showToast(t('save_error', 'Ошибка'), 'error'); }
  };

  useEffect(() => {
    if (tab === 'dishes') loadDishes();
    else loadModifiers();
  }, [workspace.selectedRestaurantId, tab]);

  const saveGroup = async () => {
    if (!workspace.selectedRestaurantId || !groupForm.name.trim()) return;
    setSaveModLoading(true);
    try {
      await modifierAPI.createGroup({ restaurant_id: workspace.selectedRestaurantId, ...groupForm });
      setGroupModal(false); setGroupForm({ name: '', is_required: false, max_options: 1 });
      await loadModifiers();
      showToast(t('mod_saved', 'Сохранено'), 'success');
    } catch { showToast(t('save_error', 'Ошибка'), 'error'); }
    finally { setSaveModLoading(false); }
  };

  const saveOption = async () => {
    if (!optionForm.name.trim()) return;
    setSaveModLoading(true);
    try {
      await modifierAPI.createOption({
        group_id: optionModal.groupId, name: optionForm.name,
        price_modifier: Number(optionForm.price_modifier) || 0,
        is_default: optionForm.is_default,
      });
      setOptionModal({ groupId: '', open: false }); setOptionForm({ name: '', price_modifier: '', is_default: false });
      await loadModifiers();
      showToast(t('mod_option_saved', 'Опция добавлена'), 'success');
    } catch { showToast(t('save_error', 'Ошибка'), 'error'); }
    finally { setSaveModLoading(false); }
  };

  const saveDishModifiers = async () => {
    if (!workspace.selectedRestaurantId) return;
    setSaveModLoading(true);
    try {
      await modifierAPI.setDishModifiers(dishModDish, { group_ids: dishModGroups });
      setDishModModal(false);
      showToast(t('mod_dish_saved', 'Модификаторы назначены'), 'success');
    } catch { showToast(t('save_error', 'Ошибка'), 'error'); }
    finally { setSaveModLoading(false); }
  };

  const deleteOption = async (id: string) => {
    try { await modifierAPI.deleteOption(id); await loadModifiers(); } catch {}
  };
  const deleteGroup = async (id: string) => {
    try { await modifierAPI.deleteGroup(id); await loadModifiers(); } catch {}
  };

  const filteredDishes = dishes.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && d.category_id !== filterCat) return false;
    return true;
  });

  return (
    <AppShell
      title={tab === 'dishes' ? t('menu_title', 'Меню') : t('modifiers_title', 'Модификаторы')}
      subtitle={tab === 'dishes' ? `${dishes.length} ${t('menu_dishes', 'блюд')}` : `${modGroups.length} групп`}
      eyebrow={tab === 'dishes' ? t('menu_eyebrow', 'Menu') : t('modifiers_eyebrow', 'Для кофейни')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <div className="flex gap-2 rounded-2xl border border-white/8 bg-black/10 p-1.5">
          <button onClick={() => setTab('dishes')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${tab === 'dishes' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
            <UtensilsCrossed className="h-4 w-4" />{t('menu_dishes_tab', 'Блюда')}
          </button>
          <button onClick={() => setTab('modifiers')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${tab === 'modifiers' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
            <Coffee className="h-4 w-4" />{t('modifiers_tab', 'Модификаторы')}
          </button>
        </div>

        {tab === 'dishes' ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('menu_search', 'Поиск...')}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#8fd4ff]" />
              </div>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-[#8fd4ff]">
                <option value="" className="bg-[#0b1622]">{t('menu_all_categories', 'Все категории')}</option>
                {categories.map(c => <option key={c.id} value={c.id} className="bg-[#0b1622]">{c.name}</option>)}
              </select>
              <Button size="sm" onClick={() => setCatModal({ open: true })}><Plus className="mr-1.5 h-4 w-4" />{t('menu_add_category', 'Категорию')}</Button>
              <Button size="sm" onClick={() => { setDishForm({ ...dishForm, category_id: categories[0]?.id || '' }); setDishModal({ open: true }); }}><Plus className="mr-1.5 h-4 w-4" />{t('menu_add_dish', 'Блюдо')}</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDishes.map(dish => (
                <div key={dish.id} className="relative rounded-3xl border border-white/8 bg-black/12 p-5 hover:border-white/20 transition">
                  {dish.image && <img src={dish.image} alt="" className="mb-3 h-32 w-full rounded-2xl object-cover" />}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{dish.name}</div>
                      {dish.category_name && <div className="text-xs text-white/30">{dish.category_name}</div>}
                    </div>
                    <div className="text-sm font-bold text-white shrink-0">{formatMoney(dish.price)}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => toggleAvailability(dish)} className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${dish.is_available ? 'border-emerald-500/30 text-emerald-300' : 'border-red-500/30 text-red-300'}`}>
                      {dish.is_available ? t('menu_available', 'В наличии') : t('menu_unavailable', 'Стоп')}
                    </button>
                    <button onClick={async () => {
                      setDishModDish(dish.id);
                      try { const r = await modifierAPI.getDishModifiers(dish.id); setDishModGroups(r.data.group_ids || []); }
                      catch { setDishModGroups([]); }
                      setDishModModal(true);
                    }} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white"><Coffee className="inline h-3.5 w-3.5 mr-1" />{t('menu_modifiers', 'Модификаторы')}</button>
                    <button onClick={() => { setDishForm({ name: dish.name, description: dish.description || '', ingredients: dish.ingredients || '', price: String(dish.price), cooking_time: dish.cooking_time || 15, category_id: dish.category_id || '', is_available: dish.is_available }); setDishModal({ open: true, edit: dish }); }}
                      className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-white/40 hover:text-white"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDeleteDish(dish)} className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-white/40 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Button size="sm" onClick={() => setGroupModal(true)}>
              <Plus className="mr-1.5 h-4 w-4" />{t('mod_add_group', 'Новая группа')}
            </Button>
            {modGroups.map(g => (
              <div key={g.id} className="rounded-3xl border border-white/8 bg-black/12 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{g.name}</h3>
                    <p className="text-xs text-white/30">{g.is_required ? 'Обязательный' : 'Необязательный'} · макс: {g.max_options}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setOptionModal({ groupId: g.id, open: true })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white"><Plus className="inline h-3 w-3 mr-1" />{t('mod_add_option', 'Опция')}</button>
                    <button onClick={() => deleteGroup(g.id)} className="rounded-xl border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {(g.options || []).map((o: any) => (
                    <div key={o.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm">
                      <span className="text-white/70">{o.name}{o.is_default ? ' ★' : ''}</span>
                      <div className="flex items-center gap-2">
                        {o.price_modifier > 0 && <span className="text-emerald-400">+{Number(o.price_modifier).toLocaleString()}</span>}
                        <button onClick={() => deleteOption(o.id)} className="text-red-400/60 hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  {(!g.options || g.options.length === 0) && <p className="text-xs text-white/20">{t('mod_no_options', 'Нет опций')}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {groupModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setGroupModal(false)}>
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1622] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white">{t('mod_new_group', 'Новая группа')}</h3>
              <div className="mt-4 space-y-3">
                <input value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} placeholder={t('mod_group_name', 'Название (Молоко, Сироп...)')}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8fd4ff]" />
                <label className="flex items-center gap-2 text-sm text-white/60">
                  <input type="checkbox" checked={groupForm.is_required} onChange={e => setGroupForm({ ...groupForm, is_required: e.target.checked })} />
                  {t('mod_is_required', 'Обязательный выбор')}
                </label>
                <label className="text-sm text-white/60">{t('mod_max_options', 'Макс. опций:')}
                  <input type="number" value={groupForm.max_options} min={1} onChange={e => setGroupForm({ ...groupForm, max_options: Number(e.target.value) })}
                    className="ml-2 w-16 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none" />
                </label>
                <div className="flex gap-3 pt-2">
                  <Button onClick={saveGroup} disabled={!groupForm.name.trim() || saveModLoading} className="flex-1"><Plus className="mr-1.5 h-4 w-4" />{t('create', 'Создать')}</Button>
                  <Button variant="outline" onClick={() => setGroupModal(false)}>{t('cancel', 'Отмена')}</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {optionModal.open && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOptionModal({ groupId: '', open: false })}>
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1622] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white">{t('mod_new_option', 'Новая опция')}</h3>
              <div className="mt-4 space-y-3">
                <input value={optionForm.name} onChange={e => setOptionForm({ ...optionForm, name: e.target.value })} placeholder={t('mod_option_name', 'Название (Кокосовое, Карамель...)')}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8fd4ff]" />
                <input type="number" value={optionForm.price_modifier} onChange={e => setOptionForm({ ...optionForm, price_modifier: e.target.value })} placeholder={t('mod_option_price', 'Доплата (5000)')}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#8fd4ff]" />
                <label className="flex items-center gap-2 text-sm text-white/60">
                  <input type="checkbox" checked={optionForm.is_default} onChange={e => setOptionForm({ ...optionForm, is_default: e.target.checked })} />
                  {t('mod_is_default', 'По умолчанию')}
                </label>
                <div className="flex gap-3 pt-2">
                  <Button onClick={saveOption} disabled={!optionForm.name.trim() || saveModLoading} className="flex-1"><Plus className="mr-1.5 h-4 w-4" />{t('add', 'Добавить')}</Button>
                  <Button variant="outline" onClick={() => setOptionModal({ groupId: '', open: false })}>{t('cancel', 'Отмена')}</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {dishModModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDishModModal(false)}>
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1622] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white">{t('mod_dish_assign', 'Модификаторы для блюда')}</h3>
              <div className="mt-4 space-y-2">
                {modGroups.map(g => (
                  <label key={g.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white cursor-pointer hover:bg-white/10">
                    <input type="checkbox" checked={dishModGroups.includes(g.id)} onChange={e => {
                      setDishModGroups(e.target.checked ? [...dishModGroups, g.id] : dishModGroups.filter(id => id !== g.id));
                    }} />
                    {g.name} <span className="text-white/30">({g.options?.length || 0} опций)</span>
                  </label>
                ))}
                {modGroups.length === 0 && <p className="text-sm text-white/40">{t('mod_no_groups', 'Сначала создайте группы модификаторов')}</p>}
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={saveDishModifiers} disabled={saveModLoading} className="flex-1">{t('save', 'Сохранить')}</Button>
                <Button variant="outline" onClick={() => setDishModModal(false)}>{t('cancel', 'Отмена')}</Button>
              </div>
            </div>
          </div>
        )}

        {dishModal.open && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDishModal({ open: false })}>
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1622] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{dishModal.edit ? t('menu_edit_dish', 'Редактировать блюдо') : t('menu_add_dish', 'Новое блюдо')}</h3>
                <button onClick={() => setDishModal({ open: false })} className="text-white/40 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="mt-4 space-y-3">
                <input value={dishForm.name} onChange={e => setDishForm(f => ({ ...f, name: e.target.value }))} placeholder={t('menu_dish_name', 'Название блюда')}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#8fd4ff]" />
                <div className="flex gap-3">
                  <input value={dishForm.price} onChange={e => setDishForm(f => ({ ...f, price: e.target.value }))} placeholder={t('menu_dish_price', 'Цена (сум)')}
                    className="w-1/2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#8fd4ff]" />
                  <input value={dishForm.cooking_time} onChange={e => setDishForm(f => ({ ...f, cooking_time: Number(e.target.value) }))} type="number" min={1} placeholder={t('menu_cook_min', 'Минуты')}
                    className="w-1/2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#8fd4ff]" />
                </div>
                <select value={dishForm.category_id} onChange={e => setDishForm(f => ({ ...f, category_id: e.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none">
                  <option value="" className="bg-[#0b1622]">{t('menu_select_cat', 'Выберите категорию')}</option>
                  {categories.map(c => <option key={c.id} value={c.id} className="bg-[#0b1622]">{c.name}</option>)}
                </select>
                <textarea value={dishForm.description} onChange={e => setDishForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder={t('menu_dish_desc', 'Описание')}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#8fd4ff]" />
                <textarea value={dishForm.ingredients} onChange={e => setDishForm(f => ({ ...f, ingredients: e.target.value }))} rows={2} placeholder={t('menu_dish_ing', 'Ингредиенты')}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#8fd4ff]" />
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60 hover:text-white">
                    <ImageIcon className="h-4 w-4" />
                    <span>{t('menu_dish_photo', 'Загрузить фото')}</span>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setDishImage(e.target.files?.[0] || null)} />
                  </label>
                  {dishImage && <span className="text-xs text-white/40">{dishImage.name}</span>}
                  {dishModal.edit?.image && !dishImage && <span className="text-xs text-white/40">{t('menu_has_photo', 'Фото есть')}</span>}
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <input type="checkbox" checked={dishForm.is_available} onChange={e => setDishForm(f => ({ ...f, is_available: e.target.checked }))} className="rounded border-white/20 bg-white/5" />
                    {t('menu_in_stock', 'В наличии')}
                  </label>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setDishModal({ open: false })}>{t('cancel', 'Отмена')}</Button>
                <Button onClick={handleSaveDish} disabled={saving || !dishForm.name.trim() || !dishForm.price}>{saving ? t('saving', 'Сохраняем…') : t('save', 'Сохранить')}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
