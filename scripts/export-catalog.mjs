#!/usr/bin/env node
/**
 * Writes src/data/catalog.data.ts from a catalog document. The document comes from one of two places:
 *   node scripts/export-catalog.mjs --from-legacy   the old hand-written data files (scripts/legacy), used once
 *                                                   to prove the new way gives the same site
 *   node scripts/export-catalog.mjs --from-json f   a catalog document saved as JSON (what the agenda publishes)
 *
 * Needs a Node with built-in type stripping (22.18+/24+), like the other scripts.
 */
import { readFileSync } from 'node:fs';
import { writeCatalogFile } from './lib/catalogFile.mjs';

async function fromLegacy() {
  const { SERVICES } = await import('./legacy/services.legacy.ts');
  const { PRICING, ESTIMATE_NOTES } = await import('./legacy/pricing.legacy.ts');
  const { FAQ } = await import('./legacy/faq.legacy.ts');
  const { QUOTE_COPY } = await import('./legacy/quoteCopy.legacy.ts');
  return { schemaVersion: 1, services: SERVICES, pricing: PRICING, faq: FAQ, quoteCopy: QUOTE_COPY, estimateNotes: ESTIMATE_NOTES };
}

const args = process.argv.slice(2);
let doc;
if (args[0] === '--from-legacy') doc = await fromLegacy();
else if (args[0] === '--from-json' && args[1]) doc = JSON.parse(readFileSync(args[1], 'utf8'));
else {
  console.error('Usage: export-catalog.mjs --from-legacy | --from-json <file>');
  process.exit(1);
}

const wrote = writeCatalogFile(doc);
console.log(`catalog.data.ts ${wrote ? 'written' : 'already up to date'} (${doc.services.length} bars, ${Object.keys(doc.pricing.services).length} priced)`);
