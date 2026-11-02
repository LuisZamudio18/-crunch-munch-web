#!/usr/bin/env node
/**
 * Runs before every build (npm "prebuild"). Asks the database for the catalog the owner published from the agenda and,
 * if it is good, writes it into src/data/catalog.data.ts so the site is built from it.
 *
 * The build must never be put at risk by this step. Whatever goes wrong (no database configured, no internet, nothing
 * published yet, a document that fails the checks in src/lib/catalogValidate.ts) it prints why and leaves the catalog
 * that is already in the project untouched, and the build goes on with it.
 *
 *   node scripts/pull-catalog.mjs [--out <file>] [--strict]
 *
 * --strict is for tests: exit with an error instead of carrying on when the pull does not produce a new catalog file.
 * Needs a Node with built-in type stripping (22.18+/24+).
 */
import { validateCatalog } from '../src/lib/catalogValidate.ts';
import { CATALOG_FILE, writeCatalogFile } from './lib/catalogFile.mjs';

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const outIndex = args.indexOf('--out');
const out = outIndex >= 0 ? args[outIndex + 1] : CATALOG_FILE;

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function keep(reason) {
  console.log(`[catalog] ${reason}. The catalog in the project is used.`);
  // Not process.exit(): ending abruptly while a request is closing crashes Node on Windows
  process.exitCode = strict ? 2 : 0;
}

async function main() {
  if (!URL_BASE || !KEY) return keep('No database configured');
  let doc;
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/rpc/get_published_catalog`, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return keep(`The database answered ${res.status}`);
    doc = await res.json();
  } catch (e) {
    return keep(`Could not reach the database (${e?.message ?? e})`);
  }
  if (doc === null || doc === undefined) return keep('Nothing has been published yet');
  const problems = validateCatalog(doc);
  if (problems.length) {
    console.log(`[catalog] The published catalog fails ${problems.length} check(s):`);
    for (const p of problems.slice(0, 20)) console.log(`  - ${p}`);
    return keep('It is not used');
  }
  const wrote = writeCatalogFile(doc, out);
  console.log(wrote ? `[catalog] Built from the published catalog (${doc.services.length} bars).` : '[catalog] The published catalog is the one already in the project.');
}

try {
  await main();
} catch (e) {
  keep(`Unexpected problem (${e?.message ?? e})`);
}
