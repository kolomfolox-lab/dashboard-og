import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

class IntersectionObserverMock {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

vi.stubGlobal('scrollTo', vi.fn());
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.scrollTo = vi.fn();

if (!('scrollTo' in Element.prototype)) {
  (Element.prototype as any).scrollTo = vi.fn();
}

class WebSocketMock {
  static OPEN = 1;
  readyState = 1;
  onopen: ((e: any) => void) | null = null;
  onmessage: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  onclose: ((e: any) => void) | null = null;
  send = vi.fn();
  close = vi.fn();
  constructor(public url: string) {
    setTimeout(() => this.onopen?.({}), 0);
  }
}
vi.stubGlobal('WebSocket', WebSocketMock);

const emptyPayload = () =>
  Object.assign([], {
    results: [],
    count: 0,
    total: 0,
    next: null,
    previous: null,
  });

export const axiosMock = {
  get: vi.fn(() => Promise.resolve({ data: emptyPayload(), status: 200, headers: {}, config: {} })),
  post: vi.fn(() => Promise.resolve({ data: emptyPayload(), status: 201, headers: {}, config: {} })),
  put: vi.fn(() => Promise.resolve({ data: emptyPayload(), status: 200, headers: {}, config: {} })),
  patch: vi.fn(() => Promise.resolve({ data: emptyPayload(), status: 200, headers: {}, config: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {}, status: 204, headers: {}, config: {} })),
  request: vi.fn(() => Promise.resolve({ data: emptyPayload(), status: 200, headers: {}, config: {} })),
};

vi.mock('axios', () => ({
  default: {
    ...axiosMock,
    create: () => ({
      ...axiosMock,
      defaults: { headers: { common: {} } },
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn(), clear: vi.fn() },
      },
    }),
  },
  isAxiosError: () => false,
  AxiosError: class extends Error {},
}));

vi.mock('chart.js', () => {
  const stub = class {};
  return {
    Chart: class {
      static register() {}
      destroy() {}
      update() {}
      resize() {}
    },
    registerables: [],
    CategoryScale: stub,
    LinearScale: stub,
    PointElement: stub,
    LineElement: stub,
    BarElement: stub,
    ArcElement: stub,
    RadialLinearScale: stub,
    Tooltip: stub,
    Legend: stub,
    Filler: stub,
    Title: stub,
    defaults: {},
  };
});

vi.mock('react-chartjs-2', () => {
  const ChartStub = () => null;
  return { Bar: ChartStub, Line: ChartStub, Doughnut: ChartStub, Pie: ChartStub, Radar: ChartStub, Scatter: ChartStub, Bubble: ChartStub, PolarArea: ChartStub };
});

const originalError = console.error;
console.error = (...args: unknown[]) => {
  const message = String(args[0] ?? '');
  if (
    message.includes('Warning: An update to') ||
    message.includes('not wrapped in act') ||
    message.includes('React Router Future Flag Warning') ||
    message.includes('ReactDOMTestUtils.act')
  ) {
    return;
  }
  originalError(...args);
};

const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = String(args[0] ?? '');
  if (message.includes('React Router Future Flag Warning') || message.includes('not wrapped in act')) {
    return;
  }
  originalWarn(...args);
};
