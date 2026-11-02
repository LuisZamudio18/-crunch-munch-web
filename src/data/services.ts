import type { Service } from '@/types';
import { CATALOG } from './catalog.data.ts';

// Barras que además del catálogo de bebidas requieren elegir tipo de servicio
export const COCKTAIL_BAR_IDS = ['drinks-bar', 'mocktails-bar', 'cantaritos-bar', 'mimosas-bar'];
export const SERVICE_TYPE_GROUP_ID = 'tipo-servicio';
export const SERVICE_TYPE_OPTIONS = ['1 cóctel por persona', 'Refill ilimitado'];
export const REFILL_OPTION = 'Refill ilimitado';

// Cantaritos Bar: los cantaritos son de barro y, si los invitados se los llevan, tiene costo extra por pieza
export const TAKE_HOME_GROUP_ID = 'cantarito-recuerdo';
export const TAKE_HOME_NO = 'Cantaritos rentados';
export const TAKE_HOME_YES = 'Cantaritos de regalo para los invitados';
export const TAKE_HOME_OPTIONS = [TAKE_HOME_NO, TAKE_HOME_YES];

// Presentación de las bebidas: Drinks y Mocktails se ofrecen en cristalería o desechables y hay que elegir una.
// Mimosas Bar (copas de cristal) y Cantaritos Bar (cantarito de barro) tienen una sola presentación.
export const PRESENTATION_OPTIONS = ['Cristalería', 'Vasos desechables'];
export const PRESENTATION_CHOICE_BAR_IDS = ['drinks-bar', 'mocktails-bar'];
export const PRESENTATION_FIXED: Record<string, string> = {
  'mimosas-bar': 'Copas de cristal',
  'cantaritos-bar': 'Cantarito de barro',
};

// Grupos que se eligen en su propio paso (no en "Toppings")
export const SERVICE_STEP_GROUP_IDS = [SERVICE_TYPE_GROUP_ID, TAKE_HOME_GROUP_ID];

// ─── Bars ────────────────────────────────────────────────────────────────────
// The bars (names, descriptions, topping lists) come from the catalog document, not from this file.

export const SERVICES: Service[] = CATALOG.services;

export const SERVICES_BY_CATEGORY = {
  bebidas: SERVICES.filter((s) => s.category === 'bebidas'),
  dulce: SERVICES.filter((s) => s.category === 'dulce'),
  salado: SERVICES.filter((s) => s.category === 'salado'),
  brunch: SERVICES.filter((s) => s.category === 'brunch'),
};

export const SERVICE_MAP = Object.fromEntries(SERVICES.map((s) => [s.id, s]));
