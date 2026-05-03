import { createContext, useContext, useMemo, useState } from 'react';

import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import uz from '@/locales/uz.json';

type Locale = 'ru' | 'en' | 'uz';
type Messages = Record<string, string>;

const STORAGE_KEY = 'waitly-locale';
const dictionaries: Record<Locale, Messages> = { ru, en, uz };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en') return 'en';
    return saved === 'uz' ? 'uz' : 'ru';
  });

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => {
        localStorage.setItem(STORAGE_KEY, nextLocale);
        setLocaleState(nextLocale);
      },
      t: (key, fallback) => dictionaries[locale]?.[key] || fallback || key,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used inside LocaleProvider');
  }
  return context;
}
