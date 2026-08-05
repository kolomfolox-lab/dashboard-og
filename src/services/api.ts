/**
 * Waitly API — единая точка входа.
 *
 * Все доменные модули лежат рядом (./auth, ./owner, ./public и т.д.),
 * здесь только реэкспорт, чтобы существующие импорты
 * `import { ownerAPI } from '@/services/api'` продолжали работать.
 */

export * from './http';
export * from './auth';
export * from './ai';
export * from './kds';
export * from './telegramMiniApp';
export * from './admin';
export * from './subscription';
export * from './owner';
export * from './ownerExtras';
export * from './payments';
export * from './marketing';
export * from './kitchen';
export * from './public';
export * from './guestPayment';
export * from './supplier';

export { api as default } from './http';
