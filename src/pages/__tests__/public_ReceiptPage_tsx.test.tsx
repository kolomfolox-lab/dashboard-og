import { describe, it, expect } from 'vitest';
import { renderWithProviders, waitFor } from '@/test/testUtils';

import Page from '../public/ReceiptPage';

describe('public/ReceiptPage.tsx smoke', () => {
  it('renders without crashing', async () => {
    const { container, unmount } = renderWithProviders(<Page />, {
      route: '/receipt/trx-1',
      routePath: '/receipt/:transactionId',
      role: 'RESTAURANT_OWNER',
    });
    await waitFor(() => expect(container.innerHTML.length).toBeGreaterThan(0));
    unmount();
  });
});
