import type { Service, ToppingCategory } from '@/types';

export interface CategoryPicks {
  name: string;
  picked: number;
  included: number;
  extra: number;
}

/** Picks per category against what the base price includes (only categories that declare `included`). */
export function categoryPicks(categories: ToppingCategory[], selections: string[]): CategoryPicks[] {
  return categories
    .filter((c) => c.included !== undefined)
    .map((c) => {
      const picked = c.options.reduce((acc, o) => acc + selections.filter((s) => s === o).length, 0);
      const included = c.included ?? 0;
      return { name: c.name, picked, included, extra: Math.max(0, picked - included) };
    });
}

/** Picks beyond the included ones across every group of a service. */
export function countExtraPicks(service: Service | undefined, selections: Record<string, string[]>): number {
  if (!service) return 0;
  return service.selectionGroups.reduce(
    (sum, g) => sum + (g.categories ? categoryPicks(g.categories, selections[g.id] ?? []).reduce((s, c) => s + c.extra, 0) : 0),
    0
  );
}

/** Percent added to the per-person price after `extra` extra picks, e.g. 2 steps of 15 % → 32.3. */
export function extraPercent(extra: number, rule: { every: number; percent: number }): number {
  const steps = Math.floor(extra / rule.every);
  return Math.round(((Math.pow(1 + rule.percent / 100, steps) - 1) * 100 + 1e-9) * 10) / 10;
}
