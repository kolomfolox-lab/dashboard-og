import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, fireEvent } from '@/test/testUtils';

import Page from '../PosPairConfirmPage';

const { getPosPairRequestMock, confirmPosPairRequestMock, getMeMock } = vi.hoisted(() => ({
  getPosPairRequestMock: vi.fn(),
  confirmPosPairRequestMock: vi.fn(),
  getMeMock: vi.fn(),
}));

vi.mock('@/services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/api')>();
  return {
    ...actual,
    ownerAPI: {
      ...actual.ownerAPI,
      getPosPairRequest: getPosPairRequestMock,
      confirmPosPairRequest: confirmPosPairRequestMock,
      getMe: getMeMock,
    },
  };
});

function renderPage() {
  return renderWithProviders(<Page />, {
    route: '/pos-pair/123456',
    routePath: '/pos-pair/:code',
    role: 'SUPER_ADMIN',
  });
}

beforeEach(() => {
  getPosPairRequestMock.mockReset();
  confirmPosPairRequestMock.mockReset();
  getMeMock.mockReset();
});

describe('PosPairConfirmPage — подтверждение кассы владельцем', () => {
  it('ждёт подтверждения: показывает код, список заведений и кнопку', async () => {
    getPosPairRequestMock.mockResolvedValue({
      data: { code: '123456', status: 'waiting', expires_at: new Date(Date.now() + 90_000).toISOString() },
    });
    getMeMock.mockResolvedValue({
      data: { restaurants: [{ id: 'r1', name: 'Демо Кофейня' }, { id: 'r2', name: 'Кафе 2' }] },
    });
    renderPage();
    expect(await screen.findByText(/Касса с кодом/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByDisplayValue('Демо Кофейня')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Подтвердить подключение/ })).toBeEnabled();
  });

  it('подтверждение подключает кассу к выбранному заведению', async () => {
    getPosPairRequestMock.mockResolvedValue({
      data: { code: '123456', status: 'waiting', expires_at: new Date(Date.now() + 90_000).toISOString() },
    });
    getMeMock.mockResolvedValue({
      data: { restaurants: [{ id: 'r1', name: 'Демо Кофейня' }] },
    });
    confirmPosPairRequestMock.mockResolvedValue({
      data: { status: 'confirmed', restaurant_id: 'r1', restaurant_name: 'Демо Кофейня' },
    });
    renderPage();
    const btn = await screen.findByRole('button', { name: /Подтвердить подключение/ });
    fireEvent.click(btn);
    await waitFor(() => expect(confirmPosPairRequestMock).toHaveBeenCalledWith('123456', 'r1'));
    expect(await screen.findByText(/Касса подключена к «Демо Кофейня»/)).toBeInTheDocument();
  });

  it('уже подключённая касса показывает статус confirmed', async () => {
    getPosPairRequestMock.mockResolvedValue({
      data: { code: '123456', status: 'confirmed', restaurant_id: 'r1', restaurant_name: 'Демо Кофейня' },
    });
    getMeMock.mockResolvedValue({ data: { restaurants: [{ id: 'r1', name: 'Демо Кофейня' }] } });
    renderPage();
    expect(await screen.findByText('Касса уже подключена')).toBeInTheDocument();
  });

  it('истёкший/неверный код показывает понятную ошибку', async () => {
    getPosPairRequestMock.mockRejectedValue({
      response: { data: { error: { code: 'POS_PAIR_NOT_FOUND' } } },
    });
    renderPage();
    expect(await screen.findByText(/Код истёк или не найден/)).toBeInTheDocument();
  });
});
