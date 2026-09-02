import { createMcpHandler } from '@vercel/mcp-adapter';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { buildQuoteLink, CATEGORY_VALUES, getService, listServices } from '@/lib/catalogApi';
import { SERVICE_AREA, SITE_NAME } from '@/lib/siteConfig';

/**
 * The MCP (Model Context Protocol) tool definitions, shared by two live
 * Streamable HTTP endpoints: /api/mcp (src/app/api/[transport]/route.ts)
 * and /.well-known/mcp (src/app/.well-known/mcp/route.ts) — a client can
 * complete a real handshake against either path, not just read a manifest.
 * Tools delegate to src/lib/catalogApi.ts, the same logic the REST API
 * under /api/v1/** uses, so both surfaces stay in sync.
 *
 * @vercel/mcp-adapter derives the exact pathname it expects to be called at
 * from `basePath` (basePath + "/mcp") and 404s any request whose pathname
 * doesn't match — a single handler instance can't be mounted at two
 * different URLs. So each endpoint gets its own `createMcpHandler` call
 * with a matching `basePath`, both registering the same tools.
 */
function registerTools(server: McpServer) {
  server.tool(
    'list_services',
    `Lista el catálogo de barras móviles (servicios) de ${SITE_NAME}, opcionalmente filtrado por categoría. Cobertura: ${SERVICE_AREA.description}.`,
    {
      category: z.enum(CATEGORY_VALUES).optional().describe('Filtra por categoría: bebidas, dulce, salado o brunch. Omite para traer las 24 barras.'),
    },
    async ({ category }) => {
      return {
        content: [{ type: 'text', text: JSON.stringify(listServices(category), null, 2) }],
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
      const service = getService(id);
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
      const { url, unknownServiceIds } = buildQuoteLink(serviceIds, eventDetails);
      const warning = unknownServiceIds.length
        ? `\n\n⚠️ No reconocí estos ids (los incluí como texto tal cual, revisa con list_services): ${unknownServiceIds.join(', ')}`
        : '';
      return { content: [{ type: 'text', text: `${url}${warning}` }] };
    }
  );
}

const serverOptions = { serverInfo: { name: 'crunch-munch-mcp', version: '1.0.0' } };

/** Live MCP endpoint at /api/mcp. */
export const mcpHandlerApi = createMcpHandler(registerTools, serverOptions, {
  basePath: '/api',
  disableSse: true,
  verboseLogs: false,
});

/** Live MCP endpoint at /.well-known/mcp (same tools, different mount point). */
export const mcpHandlerWellKnown = createMcpHandler(registerTools, serverOptions, {
  basePath: '/.well-known',
  disableSse: true,
  verboseLogs: false,
});
