import type { ComponentType } from 'react';
import {
  BellRing,
  ChefHat,
  Layers3,
  LayoutTemplate,
  MapPinned,
  MessageSquareQuote,
  QrCode,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Star,
  Workflow,
} from 'lucide-react';

export type LandingIcon = ComponentType<{ className?: string }>;

export const heroStats = [
  { label: 'Modules', value: '06' },
  { label: 'Public + private', value: 'B2B/B2C' },
  { label: 'Built for', value: 'Operators' },
];

export const liveSignals = [
  { icon: QrCode, label: 'QR guest flow', value: 'Scan -> order -> ETA -> review' },
  { icon: ChefHat, label: 'Kitchen visibility', value: 'Cooking stage + load level' },
  { icon: BellRing, label: 'Waiter coordination', value: 'Calls and service response' },
  { icon: Star, label: 'Public trust', value: 'Published reviews and menu cards' },
];

export const miniBoards = [
  {
    eyebrow: 'Ops lens',
    title: 'Made for real restaurant rhythm',
    body: 'Less dashboard theater. More usable flow, response speed, and public credibility.',
  },
  {
    eyebrow: 'Brand lens',
    title: 'Every restaurant gets a stronger surface',
    body: 'Menus, reviews, and profiles should look crafted, not dumped from a template.',
  },
];

export const featureGrid = [
  {
    title: 'Guest-to-kitchen visibility',
    body: 'Orders move from scan to cooking to handoff with clean status communication, not clumsy manual guesswork.',
    icon: Workflow,
  },
  {
    title: 'Brand-ready public pages',
    body: 'Online menu, reviews, and profile surfaces feel premium instead of looking like a generic directory template.',
    icon: Sparkles,
  },
  {
    title: 'Operational control',
    body: 'Staff, tables, waiter flow, booking logic, and analytics stay inside one owner-grade control surface.',
    icon: ShieldCheck,
  },
  {
    title: 'Fast rollout model',
    body: 'The system avoids heavyweight complexity when a restaurant actually needs speed, clarity, and reliable execution.',
    icon: ScanSearch,
  },
];

export const surfaceCards = [
  {
    title: 'Waitly Control',
    body: 'The owner workspace for staff, tables, branding, bookings, subscriptions, and day-to-day execution.',
    accent: 'bg-[#121212] text-white border-black/80',
    href: 'https://app.waitly.uz',
    cta: 'Open control',
    icon: LayoutTemplate,
  },
  {
    title: 'Reviews Hub',
    body: 'A public discovery layer where restaurants present real comments, menu previews, and a polished trust surface.',
    accent: 'bg-[#efe4d4] text-[#171717] border-black/8',
    href: 'https://reviews.waitly.uz',
    cta: 'Explore reviews',
    icon: MapPinned,
  },
  {
    title: 'Guest QR Flow',
    body: 'Table-scoped order tracking, kitchen progress, estimated readiness, waiter calls, and post-delivery feedback.',
    accent: 'bg-[#f6f2ea] text-[#171717] border-black/8',
    href: 'https://reviews.waitly.uz',
    cta: 'See public layer',
    icon: QrCode,
  },
];

export const hostRows = [
  {
    host: 'waitly.uz',
    title: 'Marketing + entry layer',
    body: 'The main brand, product story, and launch routes live here.',
    icon: Layers3,
  },
  {
    host: 'app.waitly.uz',
    title: 'Owner workspace',
    body: 'Control panel for restaurants, chains, staff, subscriptions, and settings.',
    icon: LayoutTemplate,
  },
  {
    host: 'reviews.waitly.uz',
    title: 'Public trust surface',
    body: 'Review cards, restaurant profile pages, menu previews, and guest-facing discovery routes.',
    icon: MessageSquareQuote,
  },
  {
    host: 'api.waitly.uz',
    title: 'Pure API host',
    body: 'Schema, docs, health, and JSON endpoints. No control-panel shell belongs here.',
    icon: ShieldCheck,
  },
];
