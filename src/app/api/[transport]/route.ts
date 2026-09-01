import { createMcpHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';
import { SERVICES, SERVICE_MAP } from '@/data/services';
import { CONTACT, SERVICE_AREA, SITE_NAME } from '@/lib/siteConfig';

const CATEGORY_VALUES = ['bebidas', 'dulce', 'salado', 'brunch'] as const;

function summarize(service: (typeof SERVICES)[number]) {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    minPersonas: service.minPersonas,
  };
}

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'list_services',
      `Lista el catálogo de barras móviles (servicios) de ${SITE_NAME}, opcionalmente filtrado por categoría. Cobertura: ${SERVICE_AREA.description}.`,
      {
        category: z.enum(CATEGORY_VALUES).optional().describe('Filtra por categoría: bebidas, dulce, salado o brunch. Omite para traer las 24 barras.'),
      },
      async ({ category }) => {
        const items = category ? SERVICES.filter((s) => s.category === category) : SERVICES;
        return {
          content: [{ type: 'text', text: JSON.stringify(items.map(summarize), null, 2) }],
        };
      }
    );

    server.tool(
      'get_service',
      'Obtiene el detalle completo de una barra por su id: mínimo de personas y grupos de selección (toppings/opciones disponibles para personalizarla).',
      {
        id: z.string().describe('El id de la barra, tal como lo devuelve list_services (ej. "coffee-bar").'),
      },
      async ({ id }) => {
        const service = SERVICE_MAP[id];
        if (!service) {
          return {
            isError: true,
            content: [{ type: 'text', text: `No existe una barra con id "${id}". Usa list_services para ver los ids válidos.` }],
          };
        }
        return { content: [{ type: 'text', text: JSON.stringify(service, null, 2) }] };
      }
    );

    server.tool(
      'build_quote_link',
      `Genera un link de WhatsApp pre-llenado para pedir cotización de una o más barras de ${SITE_NAME}. Úsalo cuando el usuario ya decidió qué barras quiere para su evento en Tabasco, México. El link abre WhatsApp con el mensaje ya redactado; el humano del otro lado confirma disponibilidad y precio — esta herramienta no cobra ni confirma nada por sí sola.`,
      {
        serviceIds: z.array(z.string()).min(1).describe('Ids de las barras elegidas, como los devuelve list_services.'),
        eventDetails: z
          .object({
            nombre: z.string().optional(),
            fecha: z.string().optional(),
            lugar: z.string().optional(),
            personas: z.string().optional(),
            tipoEvento: z.string().optional(),
            comentarios: z.string().optional(),
          })
          .optional()
          .describe('Datos opcionales del evento para incluir en el mensaje.'),
      },
      async ({ serviceIds, eventDetails }) => {
        const names = serviceIds.map((id) => SERVICE_MAP[id]?.name ?? id);
        const unknown = serviceIds.filter((id) => !SERVICE_MAP[id]);

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

        const warning = unknown.length
          ? `\n\n⚠️ No reconocí estos ids (los incluí como texto tal cual, revisa con list_services): ${unknown.join(', ')}`
          : '';

        return {
          content: [{ type: 'text', text: `${url}${warning}` }],
        };
      }
    );
  },
  {
    serverInfo: { name: 'crunch-munch-mcp', version: '1.0.0' },
  },
  {
    basePath: '/api',
    disableSse: true,
    verboseLogs: false,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
