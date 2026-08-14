import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import Page from '../LandingPage';

describe('LandingPage.tsx smoke', () => {
  it('renders without crashing', async () => {
    const { container, unmount } = renderWithProviders(<Page />, {
      route: '/',
      routePath: '*',
      role: 'RESTAURANT_OWNER',
    });
    await waitFor(() => expect(container.innerHTML.length).toBeGreaterThan(0));
    unmount();
  });
});
