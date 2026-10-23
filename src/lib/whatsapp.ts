import type { EventFormData, PersonalizationData, Service } from '@/types';
import { SERVICE_MAP } from '@/data/services';
import { guestsFor } from '@/lib/guests';

const WA_NUMBER = '529931100808';

function formatGroupSelections(service: Service, groupSelections: Record<string, string[]>): string {
  const lines: string[] = [];

  for (const group of service.selectionGroups) {
    if (group.type === 'fixed-display') continue;
    const selected = groupSelections[group.id];
    if (!selected || selected.length === 0) continue;

    const counts = selected.reduce<Record<string, number>>((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

    const formatted = Object.entries(counts)
      .map(([item, count]) => (count > 1 ? `${item} ×${count}` : item))
      .join(', ');

    lines.push(`  · ${group.label}: ${formatted}`);
  }

  return lines.join('\n');
}

export function buildWhatsAppMessage(params: {
  selectedServices: string[];
  serviceSelections: Record<string, Record<string, string[]>>;
  personalization: PersonalizationData;
  eventForm: EventFormData;
  /** The quote the customer saw on the page, written like the owner's own quotes. Goes first. */
  quoteLines?: string[];
}): string {
  const { selectedServices, serviceSelections, personalization, eventForm, quoteLines } = params;

  const servicesBlock = selectedServices
    .map((id) => {
      const service = SERVICE_MAP[id];
      if (!service) return '';
      const selText = formatGroupSelections(service, serviceSelections[id] || {});
      return selText ? `• ${service.name}\n${selText}` : `• ${service.name}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const decorLines = [
    personalization.decoracion.length ? `  · Decoración: ${personalization.decoracion.join(', ')}` : '',
    personalization.presentacion.length ? `  · Presentación: ${personalization.presentacion.join(', ')}` : '',
    personalization.coloresEvento ? `  · Colores del evento: ${personalization.coloresEvento}` : '',
    personalization.notas ? `  · Notas: ${personalization.notas}` : '',
  ].filter(Boolean).join('\n');

  const hasQuote = !!quoteLines?.length;

  // Order: the quote first (what the owner has to confirm or correct), then the event data, then the details.
  const message = [
    '¡Hola! Me interesa cotizar un evento con Crunch & Munch 🌿',
    '',
    ...(hasQuote ? ['💰 *COTIZACIÓN QUE VIO EL CLIENTE EN LA PÁGINA (sujeta a confirmación):*', '', ...quoteLines!, ''] : []),
    '📝 *DATOS DEL EVENTO:*',
    `  · Nombre: ${eventForm.nombre}`,
    `  · Teléfono: ${eventForm.telefono}`,
    `  · Fecha: ${eventForm.fecha}`,
    `  · Horario: ${eventForm.horario}`,
    `  · Lugar: ${eventForm.lugar}`,
    `  · No. de personas: ${eventForm.personas}`,
    ...(selectedServices.length > 1 && selectedServices.some((id) => guestsFor(eventForm, id) !== (parseInt(eventForm.personas) || 0))
      ? [`  · Personas por barra: ${selectedServices.map((id) => `${SERVICE_MAP[id]?.name ?? id} ${guestsFor(eventForm, id)}`).join(', ')}`]
      : []),
    `  · Tipo de evento: ${eventForm.tipoEvento}`,
    ...(eventForm.comentarios ? [`  · Comentarios: ${eventForm.comentarios}`] : []),
    '',
    '⭐ *SERVICIOS SELECCIONADOS:*',
    servicesBlock,
    '',
    ...(decorLines ? ['🎨 *PERSONALIZACIÓN:*', decorLines, ''] : []),
    hasQuote
      ? 'Quedo en espera de la confirmación de mi cotización. ¡Gracias! 🙏'
      : 'Quedo en espera de cotización y tiempo de duración del servicio. ¡Gracias! 🙏',
  ].join('\n');

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WA_NUMBER}?text=${encoded}`;
}
