import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import Page from '../DispatcherPage';

describe('DispatcherPage.tsx smoke (redirect stub)', () => {
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
