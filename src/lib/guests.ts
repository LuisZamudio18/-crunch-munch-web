import type { EventFormData } from '@/types';

/** Guests for one bar: its own count if the customer set one, otherwise the event's. */
export function guestsFor(eventForm: EventFormData, serviceId: string): number {
  const own = parseInt(eventForm.personasPorBarra?.[serviceId] ?? '');
  return own > 0 ? own : parseInt(eventForm.personas) || 0;
}

/** Guests of every selected bar, keyed by service id. */
export function guestsByBar(eventForm: EventFormData, selectedServices: string[]): Record<string, number> {
  return Object.fromEntries(selectedServices.map((id) => [id, guestsFor(eventForm, id)]));
}
