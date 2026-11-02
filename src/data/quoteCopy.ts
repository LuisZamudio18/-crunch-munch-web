/**
 * What goes under each bar in the quote the website writes into WhatsApp, in the owner's own style.
 *
 * Sources: Drinks Bar is her own text, word for word. Every other bar is built from the 2026 catalog
 * (what each service is and includes) and from the choices the configurator asks for, so the numbers
 * here are the ones the customer actually picked on the page (e.g. "Elige 12 toppings").
 *
 * The personalization lines are in the catalog for every service ("flores, globos o imágenes que
 * tu servicio ya incluye"). The service duration is NOT written here: it depends on the guests of the
 * bar and on refill, so it is added when the quote is built (see serviceHours.ts).
 */

import { CATALOG } from './catalog.data.ts';

export const QUOTE_COPY: Record<string, string[]> = CATALOG.quoteCopy;
