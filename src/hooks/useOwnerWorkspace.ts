import { useEffect, useMemo, useState } from 'react';
import { ownerAPI } from '@/services/api';

const STORAGE_KEY = 'waitly-selected-restaurant';

export function useOwnerWorkspace(enabled: boolean) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(enabled);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const response = await ownerAPI.getMe();
        if (!active) return;
        const data = response.data;
        setProfile(data);
        const restaurants = data.restaurants || [];
        const savedId = localStorage.getItem(STORAGE_KEY) || '';
        const fallbackId = restaurants.find((restaurant: any) => restaurant.id === savedId)?.id || restaurants[0]?.id || '';
        setSelectedRestaurantId(fallbackId);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [enabled, reloadToken]);

  useEffect(() => {
    if (selectedRestaurantId) {
      localStorage.setItem(STORAGE_KEY, selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const restaurants = profile?.restaurants || [];
  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant: any) => restaurant.id === selectedRestaurantId) || restaurants[0] || null,
    [restaurants, selectedRestaurantId],
  );

  return {
    loading,
    profile,
    restaurants,
    selectedRestaurant,
    selectedRestaurantId: selectedRestaurant?.id || selectedRestaurantId,
    setSelectedRestaurantId,
    reload: () => setReloadToken((current) => current + 1),
  };
}
