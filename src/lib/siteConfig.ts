/**
 * Single source of truth for cross-cutting site facts (URLs, contact info,
 * business identity). Used by metadata, JSON-LD, llms.txt, the MCP server,
 * and the trust-anchor pages so these values never drift out of sync.
 */

export const SITE_URL = 'https://crunch-munch-web.vercel.app';
export const SITE_NAME = 'Crunch & Munch';
export const BRAND_FULL_NAME = 'Crunch & Munch Snack Bar';

export const CONTACT = {
  whatsappNumber: '529931100808',
  whatsappDisplay: '+52 993 110 0808',
  whatsappUrl: 'https://wa.me/529931100808',
  instagramHandle: '@crunchandmunch_snackbar',
  instagramUrl: 'https://www.instagram.com/crunchandmunch_snackbar',
} as const;

// Crunch & Munch is a mobile bar business (no public storefront) that travels
// to events across the state. Per the business owner, coverage is state-wide
// rather than tied to one city, so the address is intentionally region-level.
export const SERVICE_AREA = {
  addressRegion: 'Tabasco',
  addressCountry: 'MX',
  description: 'Cobertura en todos los municipios de Tabasco, México',
} as const;
