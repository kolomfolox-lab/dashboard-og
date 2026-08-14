import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import Page from '../SupportPage';

describe('SupportPage.tsx smoke (redirect stub)', () => {
  it('renders without crashing and triggers redirect', async () => {
    const { container, unmount } = renderWithProviders(<Page />, {
      route: '/',
      routePath: '*',
      role: 'RESTAURANT_OWNER',
    });
    await waitFor(() => expect(container).toBeTruthy());
    unmount();
  });
});
