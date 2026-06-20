import { useEffect, useState } from 'react';
import { Globe, Palette, Upload, Box, Copy, ExternalLink, Send, Image as ImageIcon, Check, Loader2, Smartphone } from 'lucide-react';

import { AppShell } from '@/components/app/AppShell';
import { Panel } from '@/components/app/Panel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { useOwnerWorkspace } from '@/hooks/useOwnerWorkspace';
import { ownerAPI } from '@/services/api';

const THEMES = [
  {
    id: 'dark_elegant',
    name: 'Dark Elegant',
    desc: 'Dark background with gold accents',
    colors: { bg: '#0a0a0a', primary: '#d4af37', text: '#f5f5f5', card: '#1a1a1a' },
  },
  {
    id: 'minimal_light',
    name: 'Minimal Light',
    desc: 'Clean white with subtle accents',
    colors: { bg: '#ffffff', primary: '#1a1a1a', text: '#333333', card: '#f8f8f8' },
  },
  {
    id: 'warm_rustic',
    name: 'Warm Rustic',
    desc: 'Warm earth tones with wood feel',
    colors: { bg: '#faf3e8', primary: '#8b5e3c', text: '#3d2b1f', card: '#f0e6d3' },
  },
  {
    id: 'neon_modern',
    name: 'Neon Modern',
    desc: 'Vibrant gradients with neon glow',
    colors: { bg: '#0d0221', primary: '#ff00ff', text: '#ffffff', card: '#1a0533' },
  },
];

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default function OnlineMenuPage() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const isOwnerWorkspace = user?.role === 'RESTAURANT_OWNER' || user?.role === 'CHAIN_OWNER';
  const workspace = useOwnerWorkspace(isOwnerWorkspace);
  const restaurantId = workspace.selectedRestaurantId;

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('dark_elegant');
  const [customBg, setCustomBg] = useState('');
  const [customPrimary, setCustomPrimary] = useState('');
  const [customText, setCustomText] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [arEnabled, setArEnabled] = useState(false);
  const [embedEnabled, setEmbedEnabled] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [dishes, setDishes] = useState<any[]>([]);
  const [dishesLoading, setDishesLoading] = useState(false);

  const [uploading3D, setUploading3D] = useState<string | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderDish, setOrderDish] = useState<any>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderImage, setOrderImage] = useState<File | null>(null);
  const [orderSending, setOrderSending] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const [embedCode, setEmbedCode] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const loadSettings = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/online-menu/settings/my_settings/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setSelectedTheme(data.theme || 'dark_elegant');
        setCustomBg(data.custom_bg_color || '');
        setCustomPrimary(data.custom_primary_color || '');
        setCustomText(data.custom_text_color || '');
        setInstagramUrl(data.instagram_url || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setArEnabled(data.ar_enabled || false);
        setEmbedEnabled(data.embed_enabled || false);
        if (data.logo_url) setLogoPreview(data.logo_url);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadDishes = async () => {
    if (!restaurantId) return;
    setDishesLoading(true);
    try {
      const res = await fetch(`${apiBase}/menu/dishes/?restaurant_id=${restaurantId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDishes(data.results || data || []);
      }
    } catch (e) {
      console.error(e);
    }
    setDishesLoading(false);
  };

  const loadEmbed = async () => {
    try {
      const res = await fetch(`${apiBase}/online-menu/settings/embed_code/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmbedCode(data.embed_code);
        setMenuUrl(data.menu_url);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSettings();
    loadDishes();
    loadEmbed();
  }, [restaurantId]);

  const handleSave = async () => {
    if (!restaurantId) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('theme', selectedTheme);
      if (customBg) formData.append('custom_bg_color', customBg);
      if (customPrimary) formData.append('custom_primary_color', customPrimary);
      if (customText) formData.append('custom_text_color', customText);
      formData.append('instagram_url', instagramUrl);
      formData.append('phone', phone);
      formData.append('address', address);
      formData.append('ar_enabled', String(arEnabled));
      formData.append('embed_enabled', String(embedEnabled));
      if (logoFile) formData.append('logo', logoFile);

      const res = await fetch(`${apiBase}/online-menu/settings/my_settings/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.logo_url) setLogoPreview(data.logo_url);
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleUpload3D = async (dishId: string, file: File) => {
    setUploading3D(dishId);
    try {
      const formData = new FormData();
      formData.append('dish_id', dishId);
      formData.append('model_file', file);

      const res = await fetch(`${apiBase}/online-menu/3d-models/upload/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (res.ok) {
        loadDishes();
      }
    } catch (e) {
      console.error(e);
    }
    setUploading3D(null);
  };

  const handleOrder3D = async () => {
    if (!orderDish) return;
    setOrderSending(true);
    try {
      const formData = new FormData();
      if (orderDish.id) formData.append('dish', orderDish.id);
      formData.append('dish_name', orderDish.name);
      formData.append('dish_description', orderDish.description || '');
      formData.append('notes', orderNotes);
      if (orderImage) formData.append('reference_image', orderImage);

      const res = await fetch(`${apiBase}/online-menu/3d-orders/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (res.ok) {
        setOrderSent(true);
        setTimeout(() => {
          setOrderModalOpen(false);
          setOrderSent(false);
          setOrderNotes('');
          setOrderImage(null);
          setOrderDish(null);
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    }
    setOrderSending(false);
  };

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTheme = THEMES.find((th) => th.id === selectedTheme) || THEMES[0];

  if (loading) {
    return (
      <AppShell
        title={t('online_menu_title', 'Online Menu')}
        subtitle={t('online_menu_subtitle', 'Manage your public menu, themes, and 3D models.')}
        eyebrow={locale === 'uz' ? 'Onlayn menyu' : 'Онлайн меню'}
        restaurants={workspace.restaurants}
        selectedRestaurantId={workspace.selectedRestaurantId}
        onRestaurantChange={workspace.setSelectedRestaurantId}
      >
        <div className="grid place-items-center py-20 text-white/50">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={t('online_menu_title', 'Online Menu')}
      subtitle={t('online_menu_subtitle', 'Manage your public menu, themes, and 3D models.')}
      eyebrow={locale === 'uz' ? 'Onlayn menyu' : 'Онлайн меню'}
      restaurants={workspace.restaurants}
      selectedRestaurantId={workspace.selectedRestaurantId}
      onRestaurantChange={workspace.setSelectedRestaurantId}
    >
      <div className="space-y-6">
        {/* Theme Selection */}
        <Panel
          title={locale === 'uz' ? 'Mavzu tanlash' : 'Выбор темы'}
          eyebrow={locale === 'uz' ? 'Dizayn' : 'Дизайн'}
          description={locale === 'uz' ? 'Menyuingiz uchun mavzu tanlang.' : 'Выберите тему для вашего меню.'}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative rounded-2xl border-2 p-4 transition-all ${
                  selectedTheme === theme.id
                    ? 'border-[#8fd4ff] shadow-[0_0_20px_rgba(143,212,255,0.2)]'
                    : 'border-white/8 hover:border-white/20'
                }`}
                style={{ background: theme.colors.bg }}
              >
                {selectedTheme === theme.id && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#8fd4ff]">
                    <Check className="h-3.5 w-3.5 text-black" />
                  </div>
                )}
                <div className="mb-3 flex gap-2">
                  <div className="h-8 w-8 rounded-lg" style={{ background: theme.colors.bg, border: '1px solid rgba(255,255,255,0.1)' }} />
                  <div className="h-8 w-8 rounded-lg" style={{ background: theme.colors.primary }} />
                  <div className="h-8 w-8 rounded-lg" style={{ background: theme.colors.card }} />
                </div>
                <div className="font-semibold text-white">{theme.name}</div>
                <div className="mt-1 text-xs text-white/40">{theme.desc}</div>
              </button>
            ))}
          </div>
        </Panel>

        {/* Customization */}
        <Panel
          title={locale === 'uz' ? 'Sozlash' : 'Кастомизация'}
          eyebrow={locale === 'uz' ? 'Ranglar' : 'Цвета'}
          description={locale === 'uz' ? 'Ranglarni ozingiz moslashtiring.' : 'Настройте цвета под себя.'}
        >
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-white/60">{locale === 'uz' ? 'Fon rangi' : 'Фон'}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={customBg || currentTheme.colors.bg} onChange={(e) => setCustomBg(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg border-0" />
                <input type="text" value={customBg} onChange={(e) => setCustomBg(e.target.value)} placeholder="#0a0a0a" className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">{locale === 'uz' ? 'Asosiy rang' : 'Акцент'}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={customPrimary || currentTheme.colors.primary} onChange={(e) => setCustomPrimary(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg border-0" />
                <input type="text" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} placeholder="#d4af37" className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">{locale === 'uz' ? 'Matn rangi' : 'Текст'}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={customText || currentTheme.colors.text} onChange={(e) => setCustomText(e.target.value)} className="h-10 w-10 cursor-pointer rounded-lg border-0" />
                <input type="text" value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="#f5f5f5" className="flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20" />
              </div>
            </div>
          </div>
        </Panel>

        {/* Restaurant Info */}
        <Panel
          title={locale === 'uz' ? 'Restoran ma\'lumotlari' : 'Информация о ресторане'}
          eyebrow={locale === 'uz' ? 'Profil' : 'Профиль'}
          description={locale === 'uz' ? 'Ijtimoiy tarmoqlar va aloqa.' : 'Соцсети и контакты.'}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/60">Logo</label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-16 w-16 rounded-2xl object-cover" />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-black/20">
                    <ImageIcon className="h-6 w-6 text-white/30" />
                  </div>
                )}
                <label className="cursor-pointer rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5">
                  <Upload className="mr-2 inline h-4 w-4" />
                  {locale === 'uz' ? 'Yuklash' : 'Загрузить'}
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} className="hidden" />
                </label>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">Instagram URL</label>
              <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/restaurant" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">{locale === 'uz' ? 'Telefon' : 'Телефон'}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/60">{locale === 'uz' ? 'Manzil' : 'Адрес'}</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={locale === 'uz' ? 'Toshkent, Chilonzor' : 'Москва, ул. Примерная 1'} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-3">
              <div className={`relative h-6 w-12 rounded-full transition ${arEnabled ? 'bg-[#8fd4ff]' : 'bg-white/10'}`} onClick={() => setArEnabled(!arEnabled)}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${arEnabled ? 'left-6' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-white/70">AR {locale === 'uz' ? 'yoqish' : 'включить'}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <div className={`relative h-6 w-12 rounded-full transition ${embedEnabled ? 'bg-[#8fd4ff]' : 'bg-white/10'}`} onClick={() => setEmbedEnabled(!embedEnabled)}>
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${embedEnabled ? 'left-6' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-white/70">Embed {locale === 'uz' ? 'yoqish' : 'включить'}</span>
            </label>
          </div>

          <div className="mt-6">
            <Button onClick={handleSave} disabled={saving} className="rounded-xl px-6">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {locale === 'uz' ? 'Saqlash' : 'Сохранить'}
            </Button>
          </div>
        </Panel>

        {/* Dishes with 3D */}
        <Panel
          title={locale === 'uz' ? 'Taomlar va 3D modellar' : 'Блюда и 3D модели'}
          eyebrow={locale === 'uz' ? '3D / AR' : '3D / AR'}
          description={locale === 'uz' ? '3D model yuklang yoki buyurtma bering.' : 'Загрузите 3D модель или закажите.'}
        >
          {dishesLoading ? (
            <div className="py-8 text-center text-white/50">{locale === 'uz' ? 'Yuklanmoqda...' : 'Загрузка...'}</div>
          ) : dishes.length === 0 ? (
            <div className="py-8 text-center text-white/50">{locale === 'uz' ? 'Taomlar yo\'q' : 'Нет блюд'}</div>
          ) : (
            <div className="space-y-3">
              {dishes.map((dish: any) => (
                <div key={dish.id} className="flex items-center gap-4 rounded-xl border border-white/8 bg-black/12 p-4">
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-xl border border-white/10 bg-black/20">
                      <ImageIcon className="h-5 w-5 text-white/30" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">{dish.name}</div>
                    <div className="text-xs text-white/40">{dish.price}</div>
                  </div>
                  {dish.model_3d_url || dish.has_3d ? (
                    <div className="flex items-center gap-2 rounded-lg bg-[#8fd4ff]/10 px-3 py-1.5 text-xs font-semibold text-[#8fd4ff]">
                      <Box className="h-3.5 w-3.5" />
                      3D
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/5">
                        <Upload className="mr-1 inline h-3 w-3" />
                        GLB
                        <input type="file" accept=".glb,.gltf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload3D(dish.id, f); }} className="hidden" />
                      </label>
                      <Button variant="ghost" size="sm" onClick={() => { setOrderDish(dish); setOrderModalOpen(true); }} className="rounded-lg px-3 text-xs">
                        <Send className="mr-1 h-3 w-3" />
                        {locale === 'uz' ? 'Buyurtma' : 'Заказать'}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Embed & Link */}
        <Panel
          title={locale === 'uz' ? 'Joylashtirish va havola' : 'Встраивание и ссылка'}
          eyebrow={locale === 'uz' ? 'Kod' : 'Код'}
          description={locale === 'uz' ? 'Saytingizga joylashtirish kodi.' : 'Код для вставки на сайт.'}
        >
          {menuUrl && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/8 bg-black/12 p-4">
              <ExternalLink className="h-4 w-4 text-[#8fd4ff]" />
              <a href={menuUrl} target="_blank" rel="noopener" className="flex-1 truncate text-sm text-[#8fd4ff] underline">{menuUrl}</a>
              <Smartphone className="h-4 w-4 text-white/30" />
            </div>
          )}
          {embedCode && (
            <div className="relative">
              <pre className="max-h-40 overflow-auto rounded-xl border border-white/8 bg-black/20 p-4 text-xs text-white/60">{embedCode}</pre>
              <Button variant="ghost" size="sm" onClick={copyEmbed} className="absolute right-3 top-3">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </Panel>

        {/* 3D Order Modal */}
        {orderModalOpen && orderDish && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" onClick={() => setOrderModalOpen(false)}>
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c1420] p-6" onClick={(e) => e.stopPropagation()}>
              {orderSent ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-green-500/20">
                    <Check className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="text-lg font-bold text-white">{locale === 'uz' ? 'Yuborildi!' : 'Отправлено!'}</div>
                  <div className="mt-2 text-sm text-white/50">{locale === 'uz' ? 'Tez orada tayyor bo\'ladi' : 'Скоро будет готово'}</div>
                </div>
              ) : (
                <>
                  <h3 className="mb-1 text-lg font-bold text-white">{locale === 'uz' ? '3D model buyurtma' : 'Заказ 3D модели'}</h3>
                  <p className="mb-4 text-sm text-white/50">{orderDish.name}</p>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs text-white/50">{locale === 'uz' ? 'Izoh' : 'Комментарий'}</label>
                      <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={3} placeholder={locale === 'uz' ? 'Qo\'shimcha ma\'lumot...' : 'Дополнительные пожелания...'} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-white/50">{locale === 'uz' ? 'Rasm (ixtiyoriy)' : 'Фото (необязательно)'}</label>
                      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/10 bg-black/20 p-4 transition hover:bg-white/5">
                        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) setOrderImage(f); }} className="hidden" />
                        <Upload className="h-5 w-5 text-white/30" />
                        <span className="text-sm text-white/50">{orderImage ? orderImage.name : (locale === 'uz' ? 'Rasm tanlang' : 'Выберите фото')}</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button variant="ghost" onClick={() => setOrderModalOpen(false)} className="flex-1 rounded-xl">{locale === 'uz' ? 'Bekor qilish' : 'Отмена'}</Button>
                    <Button onClick={handleOrder3D} disabled={orderSending} className="flex-1 rounded-xl">
                      {orderSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      {locale === 'uz' ? 'Yuborish' : 'Отправить'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
