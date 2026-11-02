import type { PricingConfig } from '@/lib/estimate';
import { CATALOG } from './catalog.data.ts';

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
 * Presentation variants. Drinks Bar and Mocktails Bar are priced by what the
 * drinks are served in. The two options the customer sees in the
 * "Personalización" step map onto these two price lists.
 */
export const PRESENTATION_VARIANT: Record<string, 'cristal' | 'desechable'> = {
  'Cristalería': 'cristal',
  'Vasos desechables': 'desechable',
};

/** Per-person price per bar and bracket, then the minimum charge for the bar, discounts and surcharges (see the catalog document). */
export const PRICING: PricingConfig = CATALOG.pricing;

/** Lo que el estimado le dice al cliente sobre pagos, inclusiones y traslado. */
export const ESTIMATE_NOTES = CATALOG.estimateNotes;
