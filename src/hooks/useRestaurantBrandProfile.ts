import { useEffect, useMemo, useState } from 'react';
import { ownerAPI, type OwnerReviewsProfileResponse } from '@/services/api';

export type PublicBrandForm = { primary_color: string; secondary_color: string; phone_number: string; address: string; review_category: string; review_short_description: string; review_features: string; working_hours_text: string; average_check_text: string; map_link: string; telegram_url: string; instagram_url: string; whatsapp_url: string; menu_headline: string; menu_subheadline: string; booking_enabled: boolean; booking_open_time: string; booking_close_time: string; booking_slot_minutes: string; booking_window_days: string; booking_notes: string; clear_reviews_logo: boolean; clear_reviews_cover: boolean; clear_menu_hero_image: boolean; clear_menu_spotlight_image: boolean; };

type FileField = 'logoFile' | 'coverFile' | 'menuHeroFile' | 'menuSpotlightFile';

export function createEmptyPublicBrandForm(): PublicBrandForm { return { primary_color: '#0f766e', secondary_color: '#0f172a', phone_number: '', address: '', review_category: '', review_short_description: '', review_features: '', working_hours_text: '', average_check_text: '', map_link: '', telegram_url: '', instagram_url: '', whatsapp_url: '', menu_headline: '', menu_subheadline: '', booking_enabled: false, booking_open_time: '10:00', booking_close_time: '22:00', booking_slot_minutes: '30', booking_window_days: '14', booking_notes: '', clear_reviews_logo: false, clear_reviews_cover: false, clear_menu_hero_image: false, clear_menu_spotlight_image: false }; }

function useObjectUrl(file: File | null) { const [url, setUrl] = useState<string | null>(null); useEffect(() => { if (!file) { setUrl(null); return undefined; } const objectUrl = URL.createObjectURL(file); setUrl(objectUrl); return () => URL.revokeObjectURL(objectUrl); }, [file]); return url; }

export function useRestaurantBrandProfile(restaurantId?: string) {
  const [profile, setProfile] = useState<OwnerReviewsProfileResponse | null>(null);
  const [form, setForm] = useState<PublicBrandForm>(createEmptyPublicBrandForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [menuHeroFile, setMenuHeroFile] = useState<File | null>(null);
  const [menuSpotlightFile, setMenuSpotlightFile] = useState<File | null>(null);
  const logoPreviewUrl = useObjectUrl(logoFile);
  const coverPreviewUrl = useObjectUrl(coverFile);
  const menuHeroPreviewUrl = useObjectUrl(menuHeroFile);
  const menuSpotlightPreviewUrl = useObjectUrl(menuSpotlightFile);

  const applyProfile = (payload: OwnerReviewsProfileResponse) => {
    setProfile(payload);
    setForm({ primary_color: payload.primary_color || '#0f766e', secondary_color: payload.secondary_color || '#0f172a', phone_number: payload.phone_number || '', address: payload.address || '', review_category: payload.review_category || '', review_short_description: payload.review_short_description || '', review_features: payload.review_features || '', working_hours_text: payload.working_hours_text || '', average_check_text: payload.average_check_text || '', map_link: payload.map_link || '', telegram_url: payload.telegram_url || '', instagram_url: payload.instagram_url || '', whatsapp_url: payload.whatsapp_url || '', menu_headline: payload.menu_headline || '', menu_subheadline: payload.menu_subheadline || '', booking_enabled: Boolean(payload.booking_enabled), booking_open_time: payload.booking_open_time || '10:00', booking_close_time: payload.booking_close_time || '22:00', booking_slot_minutes: String(payload.booking_slot_minutes || 30), booking_window_days: String(payload.booking_window_days || 14), booking_notes: payload.booking_notes || '', clear_reviews_logo: false, clear_reviews_cover: false, clear_menu_hero_image: false, clear_menu_spotlight_image: false });
    setLogoFile(null); setCoverFile(null); setMenuHeroFile(null); setMenuSpotlightFile(null);
  };

  const load = async () => { if (!restaurantId) return; setLoading(true); setError(''); try { const response = await ownerAPI.getReviewsProfile(restaurantId); applyProfile(response.data); } catch (err: any) { setError(err?.response?.data?.error || 'Could not load public page settings.'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [restaurantId]);
  const updateField = (key: keyof PublicBrandForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const setFile = (field: FileField, value: File | null) => { if (field === 'logoFile') setLogoFile(value); if (field === 'coverFile') setCoverFile(value); if (field === 'menuHeroFile') setMenuHeroFile(value); if (field === 'menuSpotlightFile') setMenuSpotlightFile(value); };
  const save = async () => { if (!restaurantId) return; setSaving(true); setError(''); setInfo(''); try { const payload = new FormData(); payload.append('restaurant_id', restaurantId); Object.entries(form).forEach(([key, value]) => payload.append(key, typeof value === 'boolean' ? String(value) : value)); if (logoFile) payload.append('reviews_logo', logoFile); if (coverFile) payload.append('reviews_cover', coverFile); if (menuHeroFile) payload.append('menu_hero_image', menuHeroFile); if (menuSpotlightFile) payload.append('menu_spotlight_image', menuSpotlightFile); const response = await ownerAPI.updateReviewsProfile(restaurantId, payload); applyProfile(response.data); setInfo('Changes saved.'); } catch (err: any) { setError(err?.response?.data?.error || 'Could not save settings.'); } finally { setSaving(false); } };
  const preview = useMemo(() => ({ logoUrl: form.clear_reviews_logo ? null : logoPreviewUrl || profile?.reviews_logo_url || null, coverUrl: form.clear_reviews_cover ? null : coverPreviewUrl || profile?.reviews_cover_url || null, menuHeroUrl: form.clear_menu_hero_image ? null : menuHeroPreviewUrl || profile?.menu_hero_image_url || null, menuSpotlightUrl: form.clear_menu_spotlight_image ? null : menuSpotlightPreviewUrl || profile?.menu_spotlight_image_url || null }), [coverPreviewUrl, form.clear_menu_hero_image, form.clear_menu_spotlight_image, form.clear_reviews_cover, form.clear_reviews_logo, logoPreviewUrl, menuHeroPreviewUrl, menuSpotlightPreviewUrl, profile]);
  return { profile, form, loading, saving, error, info, preview, files: { logoFile, coverFile, menuHeroFile, menuSpotlightFile }, load, save, updateField, setFile };
}
