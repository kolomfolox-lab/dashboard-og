import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import Page from '../KitchenDisplay';

describe('KitchenDisplay.tsx smoke', () => {
  it('renders without crashing', async () => {
    const { container, unmount } = renderWithProviders(<Page />, {
      route: '/tv/demo-slug/k-token',
      routePath: '/tv/:restaurantSlug/:kitchenToken',
      role: 'RESTAURANT_OWNER',
    });
    await waitFor(() => expect(container.innerHTML.length).toBeGreaterThan(0));
    unmount();
  });
});
