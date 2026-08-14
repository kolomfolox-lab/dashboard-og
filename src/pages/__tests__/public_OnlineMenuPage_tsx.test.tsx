import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import axios from 'axios';
import { vi } from 'vitest';
vi.mocked(axios.get).mockResolvedValue({ data: {
    restaurant: {
      id: 1,
      name: 'Demo Restaurant',
      slug: 'demo-slug',
      hero_image_url: '',
      spotlight_image_url: '',
      logo_url: '',
      primary_color: '#102235',
      secondary_color: '#1d3a5f',
      review_category: 'Cafe',
      headline: 'Demo headline',
      review_short_description: '',
      subheadline: '',
      address: 'Tashkent',
      working_hours_text: '10:00 - 22:00',
      average_check_text: '50 000 сум',
      phone_number: '+998901234567',
    },
    categories: [],
    spotlight: null,
  }, status: 200, headers: {}, config: {} } as any);

import Page from '../public/OnlineMenuPage';

describe('public/OnlineMenuPage.tsx smoke', () => {
  it('renders without crashing', async () => {
    const { container, unmount } = renderWithProviders(<Page />, {
      route: '/menu/demo-slug',
      routePath: '/menu/:restaurantSlug/*',
      role: 'RESTAURANT_OWNER',
    });
    await waitFor(() => expect(container.innerHTML.length).toBeGreaterThan(0));
    unmount();
  });
});
