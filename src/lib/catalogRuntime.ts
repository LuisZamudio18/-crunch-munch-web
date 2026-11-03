import { SERVICES, SERVICES_BY_CATEGORY, SERVICE_MAP } from '../data/services.ts';
import { PRICING, ESTIMATE_NOTES } from '../data/pricing.ts';
import { FAQ } from '../data/faq.ts';
import { QUOTE_COPY } from '../data/quoteCopy.ts';
import type { CatalogDoc } from '../data/catalogTypes.ts';

/**
 * Used only by the editor preview (/editor): swaps the catalog the page was built with for the draft she is editing, in
 * memory, so the page shows the draft as she types. Nothing is saved or sent anywhere, and the public page never calls it.
 * The data modules export objects and arrays that the components read every time they are drawn, so they are changed in place.
 */

/** A light check that the message is shaped like a catalog (the full validation is done by the agenda before publishing). */
export function looksLikeCatalog(doc: unknown): doc is CatalogDoc {
  const d = doc as Partial<CatalogDoc> | null;
  return (
    !!d &&
    typeof d === 'object' &&
    d.schemaVersion === 1 &&
    Array.isArray(d.services) &&
    d.services.every((s) => s && typeof s.id === 'string' && Array.isArray(s.selectionGroups)) &&
    !!d.pricing &&
    typeof d.pricing === 'object' &&
    !!d.pricing.services &&
    Array.isArray(d.pricing.discounts) &&
    Array.isArray(d.faq) &&
    !!d.quoteCopy &&
    typeof d.quoteCopy === 'object' &&
    !!d.estimateNotes
  );
}

function replaceObject(target: object, source: object) {
  const t = target as Record<string, unknown>;
  for (const k of Object.keys(t)) delete t[k];
  Object.assign(t, source);
}

export function applyDraftCatalog(doc: CatalogDoc): void {
  SERVICES.splice(0, SERVICES.length, ...doc.services);
  replaceObject(SERVICE_MAP, Object.fromEntries(SERVICES.map((s) => [s.id, s])));
  for (const category of Object.keys(SERVICES_BY_CATEGORY) as (keyof typeof SERVICES_BY_CATEGORY)[]) {
    SERVICES_BY_CATEGORY[category].splice(0, SERVICES_BY_CATEGORY[category].length, ...SERVICES.filter((s) => s.category === category));
  }
  replaceObject(PRICING, doc.pricing);
  replaceObject(ESTIMATE_NOTES, doc.estimateNotes);
  FAQ.splice(0, FAQ.length, ...doc.faq);
  replaceObject(QUOTE_COPY, doc.quoteCopy);
}
