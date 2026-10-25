/**
 * Preliminary-estimate engine. Pure functions with the pricing config passed
 * in (no imports of site data), so the rules can be unit-checked in
 * isolation — see scripts/verify-estimate.mjs. The real numbers live in
 * src/data/pricing.ts.
 *
 * An estimate is deliberately a *range*, never a quote: final pricing is
 * confirmed by the team over WhatsApp.
 */

export interface PriceTier {
  /** This tier applies from this many guests upward. */
  fromPersonas: number;
  pricePerPerson: number;
}

export interface ServicePricing {
  /** Price tiers for a bar with a single price list. */
  tiers?: PriceTier[];
  /**
   * Price tiers per variant, for bars whose price depends on a choice the
   * customer must make (e.g. glassware vs. disposable cups). When present the
   * bar is only priced once a known variant is chosen.
   */
  variants?: Record<string, PriceTier[]>;
  /** Floor for this bar's subtotal (e.g. a minimum charge for small groups). */
  minimumTotal?: number;
  /** Extra charge per guest when the customer asks for the take-home option. */
  takeHomePerPerson?: number;
  /**
   * For bars whose price covers a fixed number of picks: every full `every` picks beyond that raises the
   * per-person price by `percent`, each step on top of the previous one (a lone extra is not charged).
   */
  extraPickSurcharge?: { every: number; percent: number };
}

export type DiscountKind = 'volume-guests' | 'multi-bar';

export interface DiscountRule {
  id: string;
  kind: DiscountKind;
  /** Short name shown to the customer, e.g. "Descuento por 3 barras". */
  label: string;
  percent: number;
  /** For kind 'volume-guests': guests needed to unlock. */
  minPersonas?: number;
  /** For kind 'multi-bar': number of bars needed to unlock. */
  minBars?: number;
  /** For kind 'multi-bar': guests each bar must have (the event's guest count is used for every bar). */
  minPersonasPerBar?: number;
}

export interface PricingConfig {
  services: Record<string, ServicePricing>;
  discounts: DiscountRule[];
  /** 'best' = only the single biggest eligible discount applies; 'sum' = they stack. */
  stacking: 'best' | 'sum';
  /** Range around the computed total, e.g. 0.1 → shown as -10% … +10%. */
  rangeSpread: number;
  /** Range ends are rounded to this step (down for low, up for high). */
  roundTo: number;
  /** Percent added to the per-person price of a bar sold with unlimited refill. */
  refillSurchargePercent?: number;
  /** Whether the refill surcharge also raises the bar's minimum charge. */
  refillAffectsMinimum?: boolean;
}

/** What the customer chose for one bar, as far as price is concerned. */
export interface ServiceOptions {
  /** Key into ServicePricing.variants. */
  variant?: string;
  /** Unlimited refill → the config's refill surcharge applies. */
  refill?: boolean;
  /** Take-home option → ServicePricing.takeHomePerPerson applies. */
  takeHome?: boolean;
  /** Picks beyond what the base price includes → ServicePricing.extraPickSurcharge applies. */
  extraPicks?: number;
  /** Human-readable summary of the choices, echoed back on the estimate line. */
  label?: string;
  /** The same choices as separate lines (presentation, service type…), for the quote text. */
  lines?: string[];
}

export interface EstimateInput {
  selectedServices: string[];
  /** Guests of the event; used for every bar that has no count of its own. */
  personas: number;
  /** Guests for a specific bar, when it differs from the event's. */
  personasByService?: Record<string, number>;
  /** Display names keyed by service id (kept out of the config so it stays pure data). */
  serviceNames: Record<string, string>;
  /** Price-relevant choices keyed by service id. */
  options?: Record<string, ServiceOptions>;
}

export interface EstimateLine {
  serviceId: string;
  name: string;
  /** Guests this bar was priced for. */
  personas: number;
  /** Per-person price actually charged (includes the refill surcharge when it applies). */
  pricePerPerson: number;
  subtotal: number;
  /** True when the minimumTotal floor raised this subtotal. */
  floorApplied: boolean;
  refillApplied: boolean;
  /** Picks beyond the included ones (0 when none or when the bar has no such rule). */
  extraPicks: number;
  /** Total percent the extra picks added to the per-person price (0 when none). */
  extraPercent: number;
  /** Amount of the subtotal that comes from the take-home option (0 when not chosen). */
  takeHomeExtra: number;
  /** Summary of the choices that shaped the price, e.g. "Cristalería premium · Refill ilimitado". */
  detail?: string;
  /** The same choices, one per line. */
  choices: string[];
}

export interface AppliedDiscount {
  rule: DiscountRule;
  amount: number;
}

export interface Estimate {
  lines: EstimateLine[];
  /** Selected bars with no price yet (no pricing, or a required choice is missing) — shown as "por confirmar". */
  unpricedServiceIds: string[];
  subtotal: number;
  discounts: AppliedDiscount[];
  discountTotal: number;
  total: number;
  low: number;
  high: number;
}

export interface DiscountProgress {
  rule: DiscountRule;
  unlocked: boolean;
  /** 0–1, how close the customer is to unlocking this rule. */
  progress: number;
  /** Guests or bars still missing (0 when unlocked). */
  remaining: number;
  message: string;
}

function tierFor(tiers: PriceTier[] | undefined, personas: number): PriceTier | null {
  if (!tiers) return null;
  const eligible = tiers
    .filter((t) => personas >= t.fromPersonas)
    .sort((a, b) => b.fromPersonas - a.fromPersonas);
  return eligible[0] ?? null;
}

function tiersFor(pricing: ServicePricing, options: ServiceOptions): PriceTier[] | undefined {
  if (pricing.variants) return options.variant ? pricing.variants[options.variant] : undefined;
  return pricing.tiers;
}

function roundDown(n: number, step: number) {
  return Math.floor(n / step) * step;
}
function roundUp(n: number, step: number) {
  return Math.ceil(n / step) * step;
}

/** Guests of each selected bar, in selection order. */
function guestList(
  input: { selectedServices: string[]; personas: number; personasByService?: Record<string, number> }
): number[] {
  return input.selectedServices.map((id) => {
    const own = input.personasByService?.[id];
    return own !== undefined && own > 0 ? own : input.personas;
  });
}

/** Bars that meet the rule's per-bar guest requirement. */
function qualifyingBars(rule: DiscountRule, guests: number[]) {
  return guests.filter((g) => g >= (rule.minPersonasPerBar ?? 0)).length;
}

function isUnlocked(rule: DiscountRule, personas: number, guests: number[]) {
  if (rule.kind === 'volume-guests') return personas >= (rule.minPersonas ?? Infinity);
  return guests.length >= (rule.minBars ?? Infinity) && qualifyingBars(rule, guests) >= (rule.minBars ?? Infinity);
}

/** Returns null when there is nothing priceable yet (no guests, or no selected bar has a price). */
export function computeEstimate(input: EstimateInput, config: PricingConfig): Estimate | null {
  const { selectedServices, personas, serviceNames, options = {} } = input;
  if (!(personas > 0)) return null;
  const guests = guestList(input);

  const lines: EstimateLine[] = [];
  const unpricedServiceIds: string[] = [];
  const refillFactor = 1 + (config.refillSurchargePercent ?? 0) / 100;

  for (let index = 0; index < selectedServices.length; index++) {
    const id = selectedServices[index];
    const barGuests = guests[index];
    const pricing = config.services[id];
    const opts = options[id] ?? {};
    const tier = pricing ? tierFor(tiersFor(pricing, opts), barGuests) : null;
    if (!pricing || !tier) {
      unpricedServiceIds.push(id);
      continue;
    }

    const refillApplied = !!opts.refill && refillFactor !== 1;
    const extraRule = pricing.extraPickSurcharge;
    const extraPicks = extraRule ? Math.max(0, Math.floor(opts.extraPicks ?? 0)) : 0;
    const extraFactor = extraRule ? Math.pow(1 + extraRule.percent / 100, Math.floor(extraPicks / extraRule.every)) : 1;
    const pricePerPerson = tier.pricePerPerson * (refillApplied ? refillFactor : 1) * extraFactor;
    const raw = pricePerPerson * barGuests;
    const floor =
      pricing.minimumTotal === undefined
        ? undefined
        : pricing.minimumTotal * (refillApplied && config.refillAffectsMinimum ? refillFactor : 1);
    const base = floor !== undefined ? Math.max(raw, floor) : raw;
    const takeHomeExtra = opts.takeHome && pricing.takeHomePerPerson ? pricing.takeHomePerPerson * barGuests : 0;

    lines.push({
      serviceId: id,
      name: serviceNames[id] ?? id,
      personas: barGuests,
      pricePerPerson: Math.round(pricePerPerson * 100) / 100,
      subtotal: Math.round(base + takeHomeExtra),
      floorApplied: floor !== undefined && base > raw,
      refillApplied,
      extraPicks,
      extraPercent: Math.round(((extraFactor - 1) * 100 + 1e-9) * 10) / 10,
      takeHomeExtra,
      detail: opts.label,
      choices: opts.lines ?? [],
    });
  }

  if (lines.length === 0) return null;

  const subtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);

  const eligible = config.discounts.filter((r) => isUnlocked(r, personas, guests));
  const chosen =
    config.stacking === 'best'
      ? eligible.length
        ? [eligible.reduce((a, b) => (b.percent > a.percent ? b : a))]
        : []
      : eligible;

  const discounts: AppliedDiscount[] = chosen.map((rule) => ({
    rule,
    amount: Math.round((subtotal * rule.percent) / 100),
  }));
  const discountTotal = discounts.reduce((sum, d) => sum + d.amount, 0);
  const total = Math.max(0, subtotal - discountTotal);

  return {
    lines,
    unpricedServiceIds,
    subtotal,
    discounts,
    discountTotal,
    total,
    low: roundDown(total * (1 - config.rangeSpread), config.roundTo),
    high: roundUp(total * (1 + config.rangeSpread), config.roundTo),
  };
}

/**
 * Progress toward each discount, for the "you're 1 bar away" nudges.
 * Only meaningful once there is at least one guest count or bar selected.
 */
export function computeDiscountProgress(
  input: { selectedServices: string[]; personas: number; personasByService?: Record<string, number> },
  config: PricingConfig
): DiscountProgress[] {
  const guests = guestList(input);
  const barCount = guests.length;

  return config.discounts.map((rule) => {
    const unlocked = isUnlocked(rule, input.personas, guests);

    if (rule.kind === 'volume-guests') {
      const target = rule.minPersonas ?? 0;
      const remaining = Math.max(0, target - input.personas);
      return {
        rule,
        unlocked,
        progress: target > 0 ? Math.min(1, input.personas / target) : 1,
        remaining,
        message: unlocked
          ? `${rule.label} desbloqueado (${rule.percent}%)`
          : `Con ${target}+ personas obtienes ${rule.percent}% de descuento — te faltan ${remaining}`,
      };
    }

    const barTarget = rule.minBars ?? 0;
    const guestTarget = rule.minPersonasPerBar ?? 0;
    const qualifying = qualifyingBars(rule, guests);
    const barsRemaining = Math.max(0, barTarget - barCount);
    const qualifyingRemaining = Math.max(0, barTarget - qualifying);
    const perBarNote = guestTarget > 0 ? ` (cada barra con ${guestTarget}+ personas)` : '';
    const plural = (n: number) => (n === 1 ? '' : 's');

    let message: string;
    let remaining: number;
    if (unlocked) {
      message = `${rule.label} desbloqueado (${rule.percent}%)`;
      remaining = 0;
    } else if (barsRemaining > 0) {
      message = `Agrega ${barsRemaining} barra${plural(barsRemaining)} más y obtén ${rule.percent}% de descuento${perBarNote}`;
      remaining = barsRemaining;
    } else {
      message = `Sube a ${guestTarget}+ personas ${qualifyingRemaining === 1 ? 'una barra más' : `${qualifyingRemaining} barras más`} y obtén ${rule.percent}% de descuento`;
      remaining = qualifyingRemaining;
    }

    return {
      rule,
      unlocked,
      // Half for having enough bars, half for those bars having enough guests.
      progress: barTarget > 0 ? Math.min(1, (Math.min(barCount, barTarget) + Math.min(qualifying, barTarget)) / (2 * barTarget)) : 1,
      remaining,
      message,
    };
  });
}

export function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
}
