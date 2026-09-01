import { CONTACT, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

// Discovery manifest for the MCP server at /api/mcp. There is no single
// ratified schema for /.well-known/mcp yet (the MCP spec's own discovery
// conventions are still evolving); this follows the shape used by
// existing "AI plugin manifest" style well-known files so agents that
// probe this path have something structured to read before connecting.
export const dynamic = 'force-static';

const manifest = {
  schema_version: '2025-06-18',
  name_for_human: `${SITE_NAME} MCP`,
  name_for_model: 'crunch_munch',
  description_for_human: 'Consulta el catálogo de barras móviles de Crunch & Munch y genera links de cotización por WhatsApp.',
  description_for_model:
    'Use this server to look up Crunch & Munch mobile bar catalog items (coffee bar, snack bar, dessert bar, brunch bar, etc.), read full details for one bar, and build a prefilled WhatsApp quote-request link once the user has picked services for an event in Tabasco, Mexico. Does not process payments or confirm bookings — a human confirms availability and price over WhatsApp.',
  mcp: {
    endpoint: `${SITE_URL}/api/mcp`,
    transport: 'streamable-http',
    auth: { type: 'none' },
  },
  documentation: `${SITE_URL}/developers`,
  llms_txt: `${SITE_URL}/llms.txt`,
  contact: {
    whatsapp: CONTACT.whatsappUrl,
    instagram: CONTACT.instagramUrl,
  },
};

export function GET() {
  return Response.json(manifest, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
