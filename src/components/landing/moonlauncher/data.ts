import type { LucideIcon } from 'lucide-react';
import {
  BookOpenText,
  LayoutDashboard,
  Store,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
};

export type MetricItem = {
  value: string;
  label: string;
};

export type SurfaceItem = {
  title: string;
  host: string;
  body: string;
  href: string;
  cta: string;
  icon: LucideIcon;
  accent: string;
};

export type HostItem = {
  host: string;
  title: string;
  body: string;
};

export type ProofItem = {
  quote: string;
  author: string;
  role: string;
};

export const navItems: NavItem[] = [
  { label: 'Surfaces', href: '#surfaces' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Proof', href: '#proof' },
];

export const metrics: MetricItem[] = [
  { value: '01', label: 'Unified stack for operations and public trust' },
  { value: '03', label: 'Clear product surfaces across app, reviews, and API' },
  { value: '24/7', label: 'Accessible from the owner desk, dining room, and guest flow' },
];

export const surfaces: SurfaceItem[] = [
  {
    title: 'Waitly Control',
    host: 'app.moonlauncher.org',
    body: 'Run owner workflows, tables, QR flows, bookings, analytics, and brand settings from one focused workspace.',
    href: 'https://app.moonlauncher.org',
    cta: 'Open workspace',
    icon: LayoutDashboard,
    accent: 'from-[#ff8b6a]/30 via-[#f6b56e]/18 to-transparent',
  },
  {
    title: 'Reviews Hub',
    host: 'reviews.moonlauncher.org',
    body: 'Give every restaurant a sharper public face with review pages, trust signals, and profile surfaces that feel alive.',
    href: 'https://reviews.moonlauncher.org',
    cta: 'See public layer',
    icon: Store,
    accent: 'from-[#8fe6d8]/24 via-[#53b9ff]/16 to-transparent',
  },
  {
    title: 'API Docs',
    host: 'api.moonlauncher.org/api/docs/',
    body: 'Expose the product line cleanly for integrations, automation, and future product extensions without muddying the main UX.',
    href: 'https://api.moonlauncher.org/api/docs/',
    cta: 'Read docs',
    icon: BookOpenText,
    accent: 'from-[#d7c3ff]/20 via-[#7bb6ff]/12 to-transparent',
  },
];

export const hostRows: HostItem[] = [
  {
    host: 'moonlauncher.org',
    title: 'Marketing host',
    body: 'Explains the system in one pass: what the brand is, why the surfaces exist, and where each route should take the visitor next.',
  },
  {
    host: 'app.moonlauncher.org',
    title: 'Operator host',
    body: 'Reserved for restaurant teams, owner workflows, subscription state, analytics, and the day-to-day control room.',
  },
  {
    host: 'reviews.moonlauncher.org',
    title: 'Guest trust host',
    body: 'Built for public discovery, restaurant profiles, social proof, and a cleaner route to bookings and menu exploration.',
  },
  {
    host: 'api.moonlauncher.org',
    title: 'Developer host',
    body: 'Keeps technical reference isolated from marketing and operations so the brand stays understandable at every level.',
  },
];

export const proofCards: ProofItem[] = [
  {
    quote: 'Moonlauncher feels less like a dashboard farm and more like one restaurant operating system with a public face.',
    author: 'Independent operator',
    role: 'Early product feedback',
  },
  {
    quote: 'The split between control, reviews, and API is unusually clear. That clarity makes the product feel premium fast.',
    author: 'Brand and UX review',
    role: 'Positioning feedback',
  },
  {
    quote: 'It tells one story from kitchen to customer instead of forcing restaurants to juggle five disconnected tools.',
    author: 'Restaurant systems advisor',
    role: 'Operational perspective',
  },
];

export const ownerSignals = [
  'QR ordering and guest flow',
  'Manual booking controls',
  'Restaurant brand studio',
  'Public menu surfaces',
  'Review profile management',
  'Subscription-aware workspace',
];
