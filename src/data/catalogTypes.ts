import type { Service } from '@/types';
import type { PricingConfig } from '@/lib/estimate';
import type { FaqItem } from '@/data/faq';

/**
 * Everything about the offer that the owner may change without touching code: the bars with their descriptions
 * and topping lists, the prices, the FAQ and the text each bar gets in the quote. It is one document; the site is
 * built from it (see catalog.data.ts, which is generated from it) so every page, the quote and the API agree.
 * Rules that depend on specific bars (glassware choice, cantaritos take-home…) are still in code (services.ts).
 */
export interface CatalogDoc {
  schemaVersion: 1;
  services: Service[];
  pricing: PricingConfig;
  faq: FaqItem[];
  /** What goes under each bar in the quote the website writes into WhatsApp, keyed by bar id. */
  quoteCopy: Record<string, string[]>;
  estimateNotes: { includes: string; travel: string; payment: string };
}
