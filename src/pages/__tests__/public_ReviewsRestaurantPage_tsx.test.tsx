import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import Page from '../public/ReviewsRestaurantPage';

describe('public/ReviewsRestaurantPage.tsx smoke', () => {
  it('renders without crashing', async () => {
    const { container, unmount } = renderWithProviders(<Page />, {
      route: '/reviews/sub/chain/slug?page=1',
      routePath: '/reviews/:restaurantSubdomain/:chainSubdomain/:restaurantSlug',
      role: 'RESTAURANT_OWNER',
    });
    await waitFor(() => expect(container.innerHTML.length).toBeGreaterThan(0));
    unmount();
  });
});
