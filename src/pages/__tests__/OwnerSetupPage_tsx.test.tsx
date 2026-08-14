import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import Page from '../OwnerSetupPage';

describe('OwnerSetupPage.tsx smoke', () => {
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
