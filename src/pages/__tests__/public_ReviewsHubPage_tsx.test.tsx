import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import axios from 'axios';
import { vi } from 'vitest';
vi.mocked(axios.get).mockResolvedValue({ data: {
    hero_stats: { total_reviews: 0, restaurants_count: 0, average_rating: 0 },
    restaurants: [],
    featured_reviews: [],
  }, status: 200, headers: {}, config: {} } as any);

import Page from '../public/ReviewsHubPage';

describe('public/ReviewsHubPage.tsx smoke', () => {
  it('renders without crashing', async () => {
    const { container, unmount } = renderWithProviders(<Page />, {
      route: '/hub',
      routePath: '*',
      role: 'SUPER_ADMIN',
    });
    await waitFor(() => expect(container.innerHTML.length).toBeGreaterThan(0));
    unmount();
  });
});
