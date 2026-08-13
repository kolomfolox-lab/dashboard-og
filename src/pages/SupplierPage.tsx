import { useEffect, useState } from 'react';
import { Boxes, Check, ChevronDown, CirclePlus, Plus, RefreshCcw, Send, ShoppingCart, Trash2, Truck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/app/AppShell';
import { DataTable } from '@/components/app/DataTable';
import { MetricCard } from '@/components/app/MetricCard';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI, type Supplier, type SupplierProduct, type PurchaseOrder } from '@/services/api';
import { showToast } from '@/lib/toast';

type Tab = 'orders' | 'suppliers' | 'auto';

export default function SupplierPage() {
  const { user } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const workspace = useOwnerWorkspace(user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER');
  const restaurantId = workspace.selectedRestaurantId;

  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
  const [showAddProduct, setShowAddProduct] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({ name: '', unit: 'kg', price: '', min_order_qty: '1', delivery_lead_days: '1' });
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderForm, setOrderForm] = useState<{ supplier: string; notes: string; items: Array<{ product: string; quantity: string; unit_price: string }> }>({ supplier: '', notes: '', items: [{ product: '', quantity: '1', unit_price: '0' }] });

  const loadData = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const [ordersRes, suppliersRes] = await Promise.all([
        ownerAPI.getPurchaseOrders(restaurantId),
        ownerAPI.getSuppliers(restaurantId),
      ]);
      setOrders(ordersRes.data);
      setSuppliers(suppliersRes.data);
    } catch { showToast(t('supplier_load_error', 'Ошибка загрузки'), 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [restaurantId]);

  const handleAutoGenerate = async () => {
    if (!restaurantId) return;
    setGenerating(true);
    try {
      const res = await ownerAPI.autoGeneratePurchaseOrders(restaurantId);
      const count = res.data.orders?.length || 0;
      showToast(t('supplier_auto_generated', `Создано заказов: ${count}`), 'success');
      await loadData();
    } catch { showToast(t('supplier_auto_error', 'Ошибка генерации'), 'error'); }
    finally { setGenerating(false); }
  };

  const handleAddSupplier = async () => {
    if (!restaurantId || !supplierForm.name.trim()) return;
    try {
      await ownerAPI.createSupplier({ restaurant_id: restaurantId, ...supplierForm });
      setShowAddSupplier(false);
      setSupplierForm({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
      await loadData();
      showToast(t('supplier_created', 'Поставщик добавлен'), 'success');
    } catch { showToast(t('supplier_create_error', 'Ошибка'), 'error'); }
  };

  const handleAddProduct = async (supplierId: string) => {
    if (!productForm.name.trim() || !productForm.price) return;
    try {
      await ownerAPI.createSupplierProduct({
        supplier: supplierId,
        name: productForm.name.trim(),
        unit: productForm.unit,
        price: Number(productForm.price),
        min_order_qty: Number(productForm.min_order_qty),
        delivery_lead_days: Number(productForm.delivery_lead_days),
      });
      setShowAddProduct(null);
      setProductForm({ name: '', unit: 'kg', price: '', min_order_qty: '1', delivery_lead_days: '1' });
      await loadData();
      showToast(t('supplier_product_added', 'Товар добавлен'), 'success');
    } catch { showToast(t('supplier_product_error', 'Ошибка'), 'error'); }
  };

  const handleCreateOrder = async () => {
    if (!restaurantId || !orderForm.supplier || orderForm.items.length === 0) return;
    try {
      await ownerAPI.createPurchaseOrder({
        restaurant_id: restaurantId,
        supplier: orderForm.supplier,
        notes: orderForm.notes,
        items: orderForm.items.map(i => ({ product: i.product, quantity: Number(i.quantity), unit_price: Number(i.unit_price) })),
      });
      setShowAddOrder(false);
      setOrderForm({ supplier: '', notes: '', items: [{ product: '', quantity: '1', unit_price: '0' }] });
      await loadData();
      showToast(t('supplier_order_created', 'Заказ создан'), 'success');
    } catch { showToast(t('supplier_order_error', 'Ошибка'), 'error'); }
  };

  const selectedSupplierProducts = showAddOrder
    ? (suppliers.find(s => s.id === orderForm.supplier)?.products || [])
    : [];

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'orders', label: t('supplier_tab_orders', 'Заказы'), icon: ShoppingCart },
    { key: 'suppliers', label: t('supplier_tab_suppliers', 'Поставщики'), icon: Boxes },
    { key: 'auto', label: t('supplier_tab_auto', 'Автозакупки'), icon: RefreshCcw },
  ];

  const statusColor: Record<string, string> = {
    DRAFT: 'text-white/40 bg-white/5',
    SENT: 'text-blue-300 bg-blue-500/12',
    CONFIRMED: 'text-indigo-300 bg-indigo-500/12',
    SHIPPED: 'text-amber-300 bg-amber-500/12',
    RECEIVED: 'text-emerald-300 bg-emerald-500/12',
    CANCELLED: 'text-red-300 bg-red-500/12',
  };

  return (
    <AppShell
      title={t('supplier_title', 'Закупки')}
      subtitle={t('supplier_subtitle', 'Управление поставщиками, заказами и автозакупками')}
      eyebrow={t('supplier_eyebrow', 'Purchasing')}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-4">
        <div className="flex gap-2 rounded-2xl border border-white/8 bg-black/10 p-1.5">
          {tabs.map(tabItem => (
            <button key={tabItem.key} onClick={() => setTab(tabItem.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${tab === tabItem.key ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              <tabItem.icon className="h-4 w-4" />
              {tabItem.label}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <Button size="sm" onClick={loadData} disabled={loading}>
                  <RefreshCcw className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  {t('refresh', 'Обновить')}
                </Button>
              </div>
              <Button size="sm" onClick={() => setShowAddOrder(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                {t('supplier_new_order', 'Новый заказ')}
              </Button>
            </div>

            <DataTable
              rows={orders}
              emptyMessage={loading ? t('loading', '...') : t('supplier_no_orders', 'Нет заказов')}
              columns={[
                { label: t('supplier_col_number', 'Номер'), key: 'order_number', render: r => <span className="font-semibold text-white">{r.order_number}</span> },
                { label: t('supplier_col_supplier', 'Поставщик'), key: 'supplier_name' },
                { label: t('supplier_col_status', 'Статус'), key: 'status', render: r => <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[r.status] || 'text-white/40 bg-white/5'}`}>{r.status}</span> },
                { label: t('supplier_col_amount', 'Сумма'), key: 'total_amount', render: r => <span>{Number(r.total_amount).toLocaleString()} UZS</span> },
                { label: t('supplier_col_items', 'Позиций'), key: 'items', render: r => <span>{r.items?.length || 0}</span> },
                { label: t('supplier_col_date', 'Дата'), key: 'created_at', render: r => new Date(r.created_at).toLocaleDateString() },
                { label: '', key: 'actions', render: r => (
                  <div className="flex gap-1">
                    {r.status === 'DRAFT' && (
                      <>
                        <button onClick={async () => { await ownerAPI.markPurchaseOrderSent(r.id); await loadData(); }} className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-1.5 text-blue-300 hover:bg-blue-500/20" title={t('supplier_mark_sent', 'Отправить')}>
                          <Send className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={async () => { await ownerAPI.cancelPurchaseOrder(r.id); await loadData(); }} className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-300 hover:bg-red-500/20" title={t('supplier_cancel', 'Отменить')}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {r.status === 'SENT' && (
                      <button onClick={async () => { await ownerAPI.markPurchaseOrderReceived(r.id); await loadData(); }} className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-1.5 text-emerald-300 hover:bg-emerald-500/20" title={t('supplier_mark_received', 'Принять')}>
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )},
              ]}
            />

            {showAddOrder && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAddOrder(false)}>
                <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1622] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold text-white">{t('supplier_new_order', 'Новый заказ')}</h3>
                  <div className="mt-4 space-y-3">
                    <select value={orderForm.supplier} onChange={e => setOrderForm({ ...orderForm, supplier: e.target.value, items: [{ product: '', quantity: '1', unit_price: '0' }] })}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]">
                      <option value="" className="bg-[#0b1622]">{t('supplier_select', 'Выберите поставщика')}</option>
                      {suppliers.map(s => <option key={s.id} value={s.id} className="bg-[#0b1622]">{s.name}</option>)}
                    </select>

                    {orderForm.supplier && orderForm.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <select value={item.product} onChange={e => {
                          const newItems = [...orderForm.items];
                          newItems[idx].product = e.target.value;
                          const prod = selectedSupplierProducts.find(p => p.id === e.target.value);
                          if (prod) newItems[idx].unit_price = prod.price;
                          setOrderForm({ ...orderForm, items: newItems });
                        }} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]">
                          <option value="" className="bg-[#0b1622]">{t('supplier_select_product', 'Товар')}</option>
                          {selectedSupplierProducts.map(p => <option key={p.id} value={p.id} className="bg-[#0b1622]">{p.name} ({p.unit})</option>)}
                        </select>
                        <input type="number" value={item.quantity} min="1" step="0.1" onChange={e => {
                          const newItems = [...orderForm.items];
                          newItems[idx].quantity = e.target.value;
                          setOrderForm({ ...orderForm, items: newItems });
                        }} className="w-20 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none text-center focus:border-[#f97360]" placeholder="Qty" />
                        <button onClick={() => {
                          if (orderForm.items.length <= 1) return;
                          setOrderForm({ ...orderForm, items: orderForm.items.filter((_, i) => i !== idx) });
                        }} className="p-3 text-red-400 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => setOrderForm({ ...orderForm, items: [...orderForm.items, { product: '', quantity: '1', unit_price: '0' }] })}
                      className="flex items-center gap-2 text-sm text-[#8fd4ff] hover:text-white">
                      <CirclePlus className="h-4 w-4" />{t('supplier_add_item', 'Добавить позицию')}
                    </button>

                    <textarea value={orderForm.notes} onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-[#f97360]" placeholder={t('supplier_notes_placeholder', 'Заметки к заказу')} rows={2} />

                    <div className="flex gap-3">
                      <Button onClick={handleCreateOrder} disabled={!orderForm.supplier || orderForm.items.every(i => !i.product)} className="flex-1">
                        <Plus className="mr-1.5 h-4 w-4" />{t('supplier_create', 'Создать заказ')}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddOrder(false)}>{t('cancel', 'Отмена')}</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'suppliers' && (
          <>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setShowAddSupplier(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                {t('supplier_add', 'Добавить поставщика')}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="rounded-3xl border border-white/8 bg-black/12 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{supplier.name}</h3>
                      {supplier.contact_person && <p className="text-sm text-white/50">{supplier.contact_person}</p>}
                      {supplier.phone && <p className="mt-1 text-sm text-white/40">{supplier.phone}</p>}
                      {supplier.email && <p className="text-sm text-white/40">{supplier.email}</p>}
                    </div>
                    <button onClick={async () => { await ownerAPI.deleteSupplier(supplier.id); await loadData(); }} className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/30">{t('supplier_products', 'Товары')}</span>
                      <button onClick={() => setShowAddProduct(showAddProduct === supplier.id ? null : supplier.id)} className="text-xs text-[#8fd4ff] hover:text-white">
                        <Plus className="inline h-3 w-3" /> {t('supplier_add_product', 'Добавить')}
                      </button>
                    </div>
                    {supplier.products?.filter(p => p.is_active).map(product => (
                      <div key={product.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm">
                        <span className="text-white/70">{product.name} ({product.unit})</span>
                        <span className="text-white/50">{Number(product.price).toLocaleString()} UZS</span>
                      </div>
                    ))}
                    {(!supplier.products || supplier.products.length === 0) && (
                      <p className="text-xs text-white/30">{t('supplier_no_products', 'Нет товаров')}</p>
                    )}
                  </div>

                  {showAddProduct === supplier.id && (
                    <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder={t('supplier_product_name', 'Название')} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#f97360]" />
                        <select value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#f97360]">
                          <option value="kg" className="bg-[#0b1622]">kg</option>
                          <option value="g" className="bg-[#0b1622]">g</option>
                          <option value="l" className="bg-[#0b1622]">l</option>
                          <option value="ml" className="bg-[#0b1622]">ml</option>
                          <option value="pc" className="bg-[#0b1622]">pc</option>
                        </select>
                        <input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder={t('supplier_product_price', 'Цена')} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#f97360]" />
                        <input type="number" value={productForm.min_order_qty} onChange={e => setProductForm({ ...productForm, min_order_qty: e.target.value })} placeholder={t('supplier_min_order', 'Мин. заказ')} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#f97360]" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAddProduct(supplier.id)} disabled={!productForm.name || !productForm.price}>
                          <Check className="mr-1 h-4 w-4" />{t('save', 'Сохранить')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowAddProduct(null)}>{t('cancel', 'Отмена')}</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {showAddSupplier && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAddSupplier(false)}>
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1622] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold text-white">{t('supplier_add', 'Добавить поставщика')}</h3>
                  <div className="mt-4 space-y-3">
                    <input value={supplierForm.name} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} placeholder={t('supplier_name_placeholder', 'Название *')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                    <input value={supplierForm.contact_person} onChange={e => setSupplierForm({ ...supplierForm, contact_person: e.target.value })} placeholder={t('supplier_contact_placeholder', 'Контактное лицо')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={supplierForm.phone} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} placeholder={t('supplier_phone_placeholder', 'Телефон')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                      <input value={supplierForm.email} onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })} placeholder={t('supplier_email_placeholder', 'Email')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" />
                    </div>
                    <textarea value={supplierForm.notes} onChange={e => setSupplierForm({ ...supplierForm, notes: e.target.value })} placeholder={t('supplier_notes_placeholder', 'Заметки')} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#f97360]" rows={2} />
                    <div className="flex gap-3">
                      <Button onClick={handleAddSupplier} disabled={!supplierForm.name.trim()} className="flex-1">
                        <Plus className="mr-1.5 h-4 w-4" />{t('supplier_add', 'Добавить')}
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddSupplier(false)}>{t('cancel', 'Отмена')}</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'auto' && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-500/10">
                  <RefreshCcw className="h-7 w-7 text-violet-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{t('supplier_auto_title', 'Автозакупки')}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                    {t('supplier_auto_desc', 'Система анализирует текущие остатки, сравнивает с минимальным уровнем и создаёт черновики заказов поставщикам. Достаточно нажать кнопку — и закупки сформированы.')}
                  </p>
                  <Button size="sm" className="mt-4" onClick={handleAutoGenerate} disabled={generating || !restaurantId}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
                    {generating ? t('working', 'Генерация...') : t('supplier_auto_generate', 'Сгенерировать заказы по остаткам')}
                  </Button>
                </div>
              </div>
            </div>

            <Panel title={t('supplier_how_it_works', 'Как это работает')} eyebrow={t('supplier_auto_info', 'Auto-purchasing')} description={t('supplier_auto_info_desc', 'Три простых шага для автоматизации закупок.')}>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { icon: Boxes, title: t('supplier_step1_title', '1. Остатки'), desc: t('supplier_step1_desc', 'Система проверяет все ингредиенты склада и находит те, что ниже минимального уровня.') },
                  { icon: Truck, title: t('supplier_step2_title', '2. Сопоставление'), desc: t('supplier_step2_desc', 'Ингредиенты сопоставляются с товарами поставщиков по названию. Для каждого дефицита рассчитывается нужное количество.') },
                  { icon: ShoppingCart, title: t('supplier_step3_title', '3. Черновик заказа'), desc: t('supplier_step3_desc', 'Создаются черновики заказов (DRAFT). Перейдите на вкладку «Заказы», чтобы отправить или принять поставку.') },
                ].map((step, i) => (
                  <div key={i} className="rounded-2xl border border-white/8 bg-black/12 p-5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10">
                      <step.icon className="h-5 w-5 text-violet-300" />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">{step.title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-white/50">{step.desc}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </AppShell>
  );
}
