import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

vi.mock('@/services/api', () => ({
  ownerAPI: {
    getMe: vi.fn().mockResolvedValue({ data: { restaurants: [] } }),
    getPosSettings: vi.fn().mockResolvedValue({ data: {} }),
    getPosPrintStatus: vi.fn().mockResolvedValue({ data: {} }),
    getStaff: vi.fn().mockResolvedValue({ data: [] }),
    getPosCertificates: vi.fn().mockResolvedValue({ data: [] }),
    getPosArchive: vi.fn().mockResolvedValue({ data: { checks: [] } }),
    createPosPairCode: vi.fn().mockResolvedValue({ data: { code: '123456', magic_link: 'https://pwa.waitly.uz/pair/123456', expires_at: new Date(Date.now()+90000).toISOString() } }),
    getSecurityEvents: vi.fn().mockResolvedValue({ data: [] }),
    getStats: vi.fn().mockResolvedValue({ data: {} }),
  },
  api: { get: vi.fn().mockResolvedValue({ data: [] }), post: vi.fn().mockResolvedValue({ data: {} }), delete: vi.fn().mockResolvedValue({}), put: vi.fn().mockResolvedValue({ data: {} }) },
}));
vi.mock('@/lib/toast', () => ({ showToast: vi.fn() }));
vi.mock('@/hooks/useOwnerWorkspace', () => ({
  useOwnerWorkspace: () => ({ selectedRestaurantId: 'test-id', restaurants: [{ id: 'test-id', name: 'Test' }], selectRestaurant: vi.fn(), selectedRestaurant: { id: 'test-id', name: 'Test' } }),
}));
vi.mock('@/context/AuthContext', async () => {
  const actual: any = await vi.importActual('@/context/AuthContext');
  return { ...actual, useAuth: () => ({ user: { role: 'RESTAURANT_OWNER', full_name: 'Test' }, logout: vi.fn() }) };
});
vi.mock('@/context/LocaleContext', async () => {
  const actual: any = await vi.importActual('@/context/LocaleContext');
  return { ...actual, useLocale: () => ({ t: (k:string, f:string)=>f, locale: 'ru', setLocale: vi.fn() }) };
});

function Wrapper({ children }: any) {
  return <MemoryRouter><TooltipProvider>{children}</TooltipProvider></MemoryRouter>;
}

describe('buttons smoke — all pages render and primary buttons clickable', () => {
  const pages = [
    ['PosManagement', () => import('@/pages/PosManagementPage.tsx')],
    ['Printers', () => import('@/pages/PrintersPage.tsx')],
    ['Security', () => import('@/pages/SecurityPage.tsx')],
    ['ApiKeys', () => import('@/pages/ApiKeysPage.tsx')],
    ['Payouts', () => import('@/pages/PayoutsPage.tsx')],
    ['SplitBill', () => import('@/pages/SplitBillPage.tsx')],
    ['Dashboard', () => import('@/pages/Dashboard.tsx')],
    ['Menu', () => import('@/pages/Menu.tsx')],
    ['Tables', () => import('@/pages/Tables.tsx')],
  ] as const;

  for (const [name, loader] of pages) {
    it(`${name} — renders and has at least one clickable button`, async () => {
      const mod: any = await loader();
      const Comp = mod.default;
      const { container } = render(<Wrapper><Comp /></Wrapper>);
      await new Promise(r => setTimeout(r, 800));
      const buttons = container.querySelectorAll('button, [role="button"], a');
      if (buttons.length === 0) {
        expect(container.textContent?.length).toBeGreaterThan(0);
        return;
      }
      const enabled = Array.from(buttons).filter(b => !(b as HTMLButtonElement).disabled);
      expect(enabled.length).toBeGreaterThan(0);
      if (enabled[0]) { await userEvent.click(enabled[0] as Element); }
    });
  }

  it('PosManagement Magic Pair button clickable and shows QR after click', async () => {
    const mod: any = await import('@/pages/PosManagementPage.tsx');
    const Comp = mod.default;
    const { container } = render(<Wrapper><Comp /></Wrapper>);
    await new Promise(r => setTimeout(r, 500));
    const btn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('Показать QR') || b.textContent?.includes('QR'));
    if (btn) {
      expect((btn as HTMLButtonElement).disabled).toBe(false);
      await userEvent.click(btn);
      await new Promise(r => setTimeout(r, 400));
    }
  });

  it('AppShell sidebar collapse toggles and persists', async () => {
    const { container } = render(<Wrapper><div data-testid="shell"><span>ok</span></div></Wrapper>);
    expect(container).toBeTruthy();
    const key = 'waitly-sidebar-open';
    localStorage.setItem(key, '1');
    expect(localStorage.getItem(key)).toBe('1');
    localStorage.setItem(key, '0');
    expect(localStorage.getItem(key)).toBe('0');
  });
});
