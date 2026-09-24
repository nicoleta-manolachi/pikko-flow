import type { Item } from '@/db/schema';

const DAY = 86_400_000;
type Timing = Pick<Item, 'lastPurchasedAt' | 'avgConsumeDays'>;

export const LOW_THRESHOLD_DAYS = 2;

export function runOutAt(i: Timing): number | null {
  if (!i.lastPurchasedAt || !i.avgConsumeDays) return null;
  return i.lastPurchasedAt.getTime() + i.avgConsumeDays * DAY;
}

/** Whole days until run-out (negative = overdue). null if unknown. */
export function daysLeft(i: Timing, now = Date.now()): number | null {
  const r = runOutAt(i);
  return r == null ? null : Math.ceil((r - now) / DAY);
}

export function isRunningLow(i: Timing, now = Date.now()): boolean {
  const d = daysLeft(i, now);
  return d != null && d <= LOW_THRESHOLD_DAYS;
}

export function runOutLabel(d: number): string {
  if (d < 0) return `Ran out ${-d}d ago`;
  if (d === 0) return 'Runs out today';
  return `Runs out in ${d}d`;
}
