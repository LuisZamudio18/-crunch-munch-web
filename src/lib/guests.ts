import type { EventFormData } from '@/types';

/** Combined option (small groups): two bars that together reach the usual minimum. */
export const COMBO = { minTotal: 30, minPerBar: 10, extraPerPerson: 5 };

/** Guests for one bar: its own count if the customer set one, otherwise the event's (in the combined option only its own). */
export function guestsFor(eventForm: EventFormData, serviceId: string): number {
  const own = parseInt(eventForm.personasPorBarra?.[serviceId] ?? '');
  if (eventForm.combinada) return own > 0 ? own : 0;
  return own > 0 ? own : parseInt(eventForm.personas) || 0;
}

/** True when the customer chose the combined option and exactly two bars are selected. */
export function isCombo(eventForm: EventFormData, selectedServices: string[]): boolean {
  return !!eventForm.combinada && selectedServices.length === 2;
}

/** The combined option is valid when the two bars add up to the minimum and neither is below its own floor. */
export function comboValid(eventForm: EventFormData, selectedServices: string[]): boolean {
  const g = selectedServices.map((id) => guestsFor(eventForm, id));
  return g.length === 2 && g.every((n) => n >= COMBO.minPerBar) && g[0] + g[1] >= COMBO.minTotal;
}

/** Guests of every selected bar, keyed by service id. */
export function guestsByBar(eventForm: EventFormData, selectedServices: string[]): Record<string, number> {
  return Object.fromEntries(selectedServices.map((id) => [id, guestsFor(eventForm, id)]));
}
