import type { PriceTier, PricingConfig, ServicePricing } from '@/lib/estimate';

/**
 * Preliminary-estimate feature. ON by default now that the numbers are the
 * owner's real tariff. Set NEXT_PUBLIC_ESTIMATE_ENABLED=false (and redeploy) to
 * switch it off without touching code.
 */
export const ESTIMATE_ENABLED = process.env.NEXT_PUBLIC_ESTIMATE_ENABLED !== 'false';

/**
 * While true, the numbers below are stand-ins and the estimate card shows a
 * visible "montos de ejemplo" tag. They are the owner's real tariff now
 * (form answers of October 2026), so this is false.
 */
export const PRICING_IS_PLACEHOLDER = false;

/**
 * Four guest brackets shared by every bar: 30–49, 50–69, 70–99 and 100+.
 * `fromPersonas` is the lower edge of each bracket (a tier applies from there
 * up to the next one). The two brunch bars start lower, at 20 guests.
 */
const BRACKETS = [30, 50, 70, 100] as const;

function tiers(...prices: [number, number, number, number]): PriceTier[] {
  return BRACKETS.map((fromPersonas, i) => ({ fromPersonas, pricePerPerson: prices[i] }));
}

function tiersFrom20(price20: number, ...prices: [number, number, number, number]): PriceTier[] {
  return [{ fromPersonas: 20, pricePerPerson: price20 }, ...tiers(...prices)];
}

function bar(prices: PriceTier[], minimumTotal: number): ServicePricing {
  return { tiers: prices, minimumTotal };
}

/**
 * Presentation variants. Drinks Bar and Mocktails Bar are priced by what the
 * drinks are served in. The two options the customer sees in the
 * "Personalización" step map onto these two price lists.
 */
export const PRESENTATION_VARIANT: Record<string, 'cristal' | 'desechable'> = {
  'Cristalería': 'cristal',
  'Vasos desechables': 'desechable',
};

/** Per-person price per bar and bracket, then the minimum charge for the bar. */
export const PRICING: PricingConfig = {
  services: {
    // ── Bebidas
    'coffee-bar': bar(tiers(75, 70, 68, 65), 2250),
    'smoothie-bar': bar(tiers(65, 60, 58, 58), 1950),
    'frappes-bar': bar(tiers(65, 60, 58, 58), 1950),
    'drinks-bar': {
      variants: {
        cristal: tiers(115, 110, 105, 100),
        desechable: tiers(95, 90, 85, 80),
      },
      minimumTotal: 2500,
    },
    'mocktails-bar': {
      variants: {
        cristal: tiers(80, 75, 72, 70),
        desechable: tiers(75, 70, 68, 65),
      },
      minimumTotal: 2000,
    },
    // Mimosas: una sola presentación (copas de cristal)
    'mimosas-bar': bar(tiers(100, 98, 95, 90), 2000),
    // Cantaritos: una sola presentación (cantarito de barro); si los invitados se lo llevan hay un cargo por pieza
    'cantaritos-bar': { ...bar(tiers(85, 82, 80, 75), 2000), takeHomePerPerson: 35 },
    'tapiocas-bar': bar(tiers(70, 66, 62, 60), 1950),

    // ── Dulce
    'hot-cakes-bar': bar(tiers(65, 60, 58, 55), 1950),
    'donas-bar': bar(tiers(65, 60, 58, 55), 1950),
    'crepas-bar': bar(tiers(72, 70, 65, 60), 2100),
    'helados-bar': bar(tiers(65, 60, 58, 55), 1950),
    'cake-bar': bar(tiers(68, 65, 60, 58), 2100),
    'rolles-bar': bar(tiers(68, 65, 60, 58), 2100),
    'dessert-bar': bar(tiers(60, 58, 55, 50), 2000),

    // ── Salado
    'snack-bar': bar(tiers(58, 52, 50, 40), 1800),
    'charcuteria-bar': bar(tiers(90, 85, 80, 75), 2800),
    'esquites-bar': bar(tiers(55, 50, 48, 45), 1800),
    'tostielotes-bar': bar(tiers(65, 60, 58, 55), 1950),
    'maruchan-bar': bar(tiers(62, 60, 55, 50), 1950),
    'chilaquiles-bar': bar(tiers(115, 110, 100, 95), 2200),
    'ice-bar': bar(tiers(65, 60, 58, 55), 1950),

    // ── Brunch (desde 20 personas)
    'brunch-bar': bar(tiersFrom20(115, 110, 100, 98, 95), 2000),
    // El precio incluye 2 alimentos, 2 acompañamientos, 2 bebidas y 1 pan/galleta/postre (ver `included` en services.ts).
    // Cada 2 opciones de más suben 15 % el precio por persona (1 sola no se cobra), y el aumento se compone: 120 → 138 → 158.70
    'desayuno-buffet': { ...bar(tiersFrom20(150, 130, 120, 110, 100), 2000), extraPickSurcharge: { every: 2, percent: 15 } },
  },

  // Descuento por combinar barras: depende de cuántas barras se contratan y de que cada una
  // sea para al menos 50 personas. Aplica al total del evento; las reglas no se suman, vale la mayor.
  // La página pide un solo número de invitados, así que se usa el mismo para todas las barras.
  discounts: [
    { id: 'barras-2', kind: 'multi-bar', label: 'Descuento por 2 barras', percent: 5, minBars: 2, minPersonasPerBar: 50 },
    { id: 'barras-3', kind: 'multi-bar', label: 'Descuento por 3 barras', percent: 10, minBars: 3, minPersonasPerBar: 50 },
    { id: 'barras-4', kind: 'multi-bar', label: 'Descuento por 4 barras o más', percent: 15, minBars: 4, minPersonasPerBar: 50 },
  ],
  stacking: 'best',

  // El estimado se muestra como un rango de ±10 %
  rangeSpread: 0.1,
  roundTo: 50,

  // Refill ilimitado: +30 % sobre el precio por persona. Pendiente de confirmar si también sube el cobro mínimo.
  refillSurchargePercent: 30,
  refillAffectsMinimum: false,
};

/** Lo que el estimado le dice al cliente sobre pagos, inclusiones y traslado. */
export const ESTIMATE_NOTES = {
  includes: 'Incluye mobiliario, traslado, staff, desechables y personalización.',
  travel:
    'Fuera del centro de la ciudad y en municipios distintos de Villahermosa y Cárdenas puede aplicar un cargo extra de traslado, que confirmamos contigo.',
  payment:
    'Para agendar tu fecha se pide un anticipo del 40 %; el resto se liquida a más tardar un día antes del evento.',
};
