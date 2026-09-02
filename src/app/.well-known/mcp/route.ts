import { mcpHandlerWellKnown } from '@/lib/mcpHandler';
import { CONTACT, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

// GET here returns a discovery manifest for humans/agents browsing the
// well-known path. POST/DELETE mount the *same live* MCP handler as
// /api/mcp, so a client can also complete a real Streamable HTTP handshake
// directly against /.well-known/mcp, not just read a static description.
//
// There is no single ratified schema for the GET manifest yet (the MCP
// spec's own well-known discovery conventions are still evolving); this
// follows the shape used by existing "AI plugin manifest" style
// well-known files.
const manifest = {
  schema_version: '2025-06-18',
  name_for_human: `${SITE_NAME} MCP`,
  name_for_model: 'crunch_munch',
  description_for_human: 'Consulta el catálogo de barras móviles de Crunch & Munch y genera links de cotización por WhatsApp.',
  description_for_model:
    'Use this server to look up Crunch & Munch mobile bar catalog items (coffee bar, snack bar, dessert bar, brunch bar, etc.), read full details for one bar, and build a prefilled WhatsApp quote-request link once the user has picked services for an event in Tabasco, Mexico. Does not process payments or confirm bookings — a human confirms availability and price over WhatsApp.',
  mcp: {
    endpoint: `${SITE_URL}/api/mcp`,
    well_known_endpoint: `${SITE_URL}/.well-known/mcp`,
    transport: 'streamable-http',
    auth: { type: 'none' },
    note: 'Both endpoints accept the same JSON-RPC Streamable HTTP handshake (POST) — GET on this path returns this manifest instead.',
  },
  api: {
    openapi: `${SITE_URL}/openapi.json`,
    base_url: `${SITE_URL}/api/v1`,
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

export { mcpHandlerWellKnown as POST, mcpHandlerWellKnown as DELETE };
