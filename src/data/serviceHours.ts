/**
 * How long a bar serves, by number of guests (the owner's own rules).
 *
 * Regular service:  30–69 guests → 2 h · 70–99 → 3 h · 100+ → 4 h
 * Unlimited refill (cocktail bars): <50 → 2.5 h · 50–69 → 3 h · 70–89 → 3.5 h · 90+ → 4 h
 *
 * Each row is [from this many guests, hours]; the first row that fits wins, so keep them from the
 * largest group to the smallest. The boundaries (70 and 90) belong to the longer service.
 */
const REGULAR: [number, number][] = [
  [100, 4],
  [70, 3],
  [0, 2],
];

const REFILL: [number, number][] = [
  [90, 4],
  [70, 3.5],
  [50, 3],
  [0, 2.5],
];

export function serviceHours(guests: number, refill: boolean): number {
  const table = refill ? REFILL : REGULAR;
  return (table.find(([from]) => guests >= from) ?? table[table.length - 1])[1];
}

/** 2 → "2 horas", 2.5 → "2 horas y media", 1 → "1 hora". */
export function formatHours(hours: number): string {
  const whole = Math.floor(hours);
  const half = hours - whole >= 0.5;
  const base = `${whole} ${whole === 1 ? 'hora' : 'horas'}`;
  return half ? `${base} y media` : base;
}

/** The sentence used in the quote and on the page. */
export function serviceHoursText(guests: number, refill: boolean): string {
  return `El servicio es durante ${formatHours(serviceHours(guests, refill))} o hasta que se acabe el producto.`;
}
