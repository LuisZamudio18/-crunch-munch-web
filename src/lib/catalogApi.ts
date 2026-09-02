import { SERVICES, SERVICE_MAP } from '@/data/services';
import type { Service, ServiceCategory } from '@/types';
import { CONTACT, SITE_NAME } from '@/lib/siteConfig';

/**
 * Read-only catalog operations shared by every machine-readable surface of
 * the site: the MCP tools (src/app/api/[transport]/route.ts), the REST API
 * (src/app/api/v1/**), and the OpenAPI schema descriptions. Kept in one
 * place so the three never drift into describing different behavior.
 */

export const CATEGORY_VALUES = ['bebidas', 'dulce', 'salado', 'brunch'] as const satisfies readonly ServiceCategory[];

export interface ServiceSummary {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  minPersonas: number;
}

export interface EventDetailsInput {
  nombre?: string;
  fecha?: string;
  lugar?: string;
  personas?: string;
  tipoEvento?: string;
  comentarios?: string;
}

export interface QuoteLinkResult {
  url: string;
  unknownServiceIds: string[];
}

export function isServiceCategory(value: unknown): value is ServiceCategory {
  return typeof value === 'string' && (CATEGORY_VALUES as readonly string[]).includes(value);
}

function summarize(service: Service): ServiceSummary {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    minPersonas: service.minPersonas,
  };
}

export function listServices(category?: ServiceCategory): ServiceSummary[] {
  const items = category ? SERVICES.filter((s) => s.category === category) : SERVICES;
  return items.map(summarize);
}

export function getService(id: string): Service | null {
  return SERVICE_MAP[id] ?? null;
}

export function buildQuoteLink(serviceIds: string[], eventDetails?: EventDetailsInput): QuoteLinkResult {
  const names = serviceIds.map((id) => SERVICE_MAP[id]?.name ?? id);
  const unknownServiceIds = serviceIds.filter((id) => !SERVICE_MAP[id]);

  const lines = [
    `¡Hola! Me interesa cotizar un evento con ${SITE_NAME} 🌿`,
    '',
    '⭐ *SERVICIOS SELECCIONADOS:*',
    ...names.map((n) => `• ${n}`),
  ];

  if (eventDetails && Object.values(eventDetails).some(Boolean)) {
    lines.push('', '📝 *DATOS DEL EVENTO:*');
    if (eventDetails.nombre) lines.push(`  · Nombre: ${eventDetails.nombre}`);
    if (eventDetails.fecha) lines.push(`  · Fecha: ${eventDetails.fecha}`);
    if (eventDetails.lugar) lines.push(`  · Lugar: ${eventDetails.lugar}`);
    if (eventDetails.personas) lines.push(`  · No. de personas: ${eventDetails.personas}`);
    if (eventDetails.tipoEvento) lines.push(`  · Tipo de evento: ${eventDetails.tipoEvento}`);
    if (eventDetails.comentarios) lines.push(`  · Comentarios: ${eventDetails.comentarios}`);
  }

  lines.push('', 'Quedo en espera de cotización. ¡Gracias! 🙏');

  const url = `${CONTACT.whatsappUrl}?text=${encodeURIComponent(lines.join('\n'))}`;
  return { url, unknownServiceIds };
}
