#!/usr/bin/env node
/**
 * Runs before every build (through scripts/prebuild.mjs). Asks the database for the catalog the owner published from the agenda
 * and, if it is good, writes it into src/data/catalog.data.ts so the site is built from it.
 *
 * Two kinds of "nothing to do":
 *  - Normal: no database configured, the function is not there yet (404), nothing has been published yet, or it is the same catalog.
 *    The catalog in the project is used and the build goes on (exit 0).
 *  - Trouble: the database cannot be reached after a few tries, answers with an error, answers with something that is not a
 *    catalog, or the published catalog fails the checks in src/lib/catalogValidate.ts. If the build went on it would publish the
 *    OLD catalog in the project and the site would silently go back to old prices, so this exits with 3 and prebuild.mjs stops the
 *    automatic build (the site stays on its last good version).
 *
 *   node scripts/pull-catalog.mjs [--out <file>] [--strict]
 *
 * --strict is for tests: a "normal" no-op exits with 2 instead of 0, so a test can tell it from a write.
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
const TRIES = 3;
const WAIT_MS = Number(process.env.CATALOG_PULL_RETRY_MS ?? 3000);

/** Nothing to change, and that is fine. */
function normal(reason) {
  console.log(`[catalog] ${reason}. The catalog in the project is used.`);
  process.exitCode = strict ? 2 : 0;
}

/** Something is wrong: the catalog in the project must not be used for an automatic build. */
function trouble(reason) {
  console.log(`[catalog] PROBLEM: ${reason}.`);
  process.exitCode = 3;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Asks for the published catalog; tries again when the problem may be passing (no connection, a server error). */
async function fetchPublished() {
  let last = '';
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    try {
      const res = await fetch(`${URL_BASE}/rest/v1/rpc/get_published_catalog`, {
        method: 'POST',
        headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(20000),
      });
      if (res.status === 404) return { missing: true };
      if (res.ok) {
        try {
          return { doc: await res.json() };
        } catch {
          return { error: 'the database answered with something that is not JSON' };
        }
      }
      last = `the database answered ${res.status}`;
      if (res.status < 500) return { error: last };
    } catch (e) {
      last = `could not reach the database (${e?.message ?? e})`;
    }
    if (attempt < TRIES) await sleep(WAIT_MS * attempt);
  }
  return { error: last };
}

async function main() {
  if (!URL_BASE || !KEY) return normal('No database configured');
  const result = await fetchPublished();
  if (result.missing) return normal('The database has no published catalog function yet');
  if (result.error) return trouble(result.error);
  const doc = result.doc;
  if (doc === null || doc === undefined) return normal('Nothing has been published yet');
  const problems = validateCatalog(doc);
  if (problems.length) {
    console.log(`[catalog] The published catalog fails ${problems.length} check(s):`);
    for (const p of problems.slice(0, 20)) console.log(`  - ${p}`);
    return trouble('the published catalog is not valid, so it is not used');
  }
  const wrote = writeCatalogFile(doc, out);
  console.log(wrote ? `[catalog] Built from the published catalog (${doc.services.length} bars).` : '[catalog] The published catalog is the one already in the project.');
}

try {
  await main();
} catch (e) {
  trouble(`unexpected problem (${e?.message ?? e})`);
}
