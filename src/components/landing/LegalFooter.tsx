import { useLocale } from '@/context/LocaleContext';

const LEGAL_LINKS = [
  { to: 'https://waitly.uz/privacy', ru: 'Конфиденциальность', uz: 'Maxfiylik' },
  { to: 'https://waitly.uz/terms', ru: 'Условия', uz: 'Shartlar' },
  { to: 'https://waitly.uz/offer', ru: 'Оферта', uz: 'Oferta' },
  { to: 'https://waitly.uz/service', ru: 'Договор услуг', uz: 'Xizmat shartnomasi' },
  { to: 'https://waitly.uz/agency', ru: 'Агентский', uz: 'Agentlik' },
  { to: 'https://waitly.uz/security', ru: 'Безопасность', uz: 'Xavfsizlik' },
  { to: 'https://waitly.uz/cookies', ru: 'Cookie', uz: 'Cookie' },
];

export function LegalFooter() {
  const { locale } = useLocale();

  return (
    <footer className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-4 py-8 text-xs text-white/42 sm:flex-row md:px-6">
      <p>© 2026 Waitly · FASCO · {locale === 'uz' ? 'Toshkent shahri, MKAD 10D' : 'Ташкент, МКАД 10D'}</p>
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {LEGAL_LINKS.map((link) => (
          <a key={link.to} href={link.to} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
            {link.ru}
          </a>
        ))}
        <a href="mailto:sales@waitly.uz" className="transition hover:text-white">
          sales@waitly.uz
        </a>
      </nav>
    </footer>
  );
}
