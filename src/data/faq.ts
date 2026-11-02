/**
 * Preguntas frecuentes visibles en la página y publicadas también como FAQPage (JSON-LD),
 * para que buscadores y asistentes de IA puedan citarlas. Solo hechos que ya están en el sitio
 * (precios, mínimos, duración, anticipo, cobertura); si cambia alguna regla, cambia aquí.
 */
import { CATALOG } from './catalog.data.ts';

export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ: FaqItem[] = CATALOG.faq;
