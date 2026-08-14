import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import axios from 'axios';
import { vi } from 'vitest';
vi.mocked(axios.get).mockResolvedValue({ data: {
    restaurant: { id: '1', name: 'Demo Restaurant', slug: 'demo-slug' },
    table: { id: '1', number: '5' },
    items: [],
    categories: [],
  }, status: 200, headers: {}, config: {} } as any);

import Page from '../public/TelegramMiniAppPage';

describe('public/TelegramMiniAppPage.tsx smoke', () => {
  it('renders without crashing', async () => {
    const { container, unmount } = renderWithProviders(<Page />, {
      route: '/telegram-mini-app/demo-slug/5',
      routePath: '/telegram-mini-app/:restaurantSlug/:tableNumber',
      role: 'RESTAURANT_OWNER',
    });
    await waitFor(() => expect(container.innerHTML.length).toBeGreaterThan(0));
    unmount();
  });
});
