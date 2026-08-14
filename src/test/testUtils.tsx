import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface RenderOptions {
  route?: string;
  routePath?: string;
  role?: string;
}

export function seedAuth(role = 'RESTAURANT_OWNER') {
  localStorage.setItem('token', 'test-access-token');
  localStorage.setItem('refresh', 'test-refresh-token');
  localStorage.setItem(
    'user',
    JSON.stringify({
      id: 'test-user-1',
      phone_number: '+998901234567',
      full_name: 'Test Owner',
      role,
      is_active: true,
    }),
  );
}

export function renderWithProviders(ui: React.ReactElement, options: RenderOptions = {}) {
  const { route = '/', routePath = '*', role = 'RESTAURANT_OWNER' } = options;
  seedAuth(role);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route
          path={routePath}
          element={
            <ThemeProvider>
              <LocaleProvider>
                <AuthProvider>
                  <TooltipProvider delayDuration={0}>{ui}</TooltipProvider>
                </AuthProvider>
              </LocaleProvider>
            </ThemeProvider>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

export { screen, waitFor, act, fireEvent } from '@testing-library/react';
