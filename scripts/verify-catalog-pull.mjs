#!/usr/bin/env node
/**
 * Checks for the two safety nets around the published catalog:
 *   1. the validator (src/lib/catalogValidate.ts) accepts the real catalog and refuses documents that would break the site;
 *   2. the pull step (scripts/pull-catalog.mjs) writes a good published catalog into the site, and in every other case
 *      (database down, nothing published, an invalid document) leaves the catalog file exactly as it was.
 * The pull runs against a small fake database on this machine, and writes only into a temporary file.
 *
 *   npm run verify:catalog-pull
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateCatalog } from '../src/lib/catalogValidate.ts';
import { CATALOG } from '../src/data/catalog.data.ts';
import { catalogFileText } from './lib/catalogFile.mjs';

const failures = [];
let passCount = 0;
function check(name, condition, detail) {
  if (condition) {
    passCount++;
    console.log(`  ok  ${name}`);
  } else {
    failures.push(name);
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}
const clone = (x) => JSON.parse(JSON.stringify(x));
const svc = (doc, id) => doc.services.find((s) => s.id === id);

// ── 1. The validator ──
check('the real catalog passes', validateCatalog(CATALOG).length === 0, validateCatalog(CATALOG));
const mutations = {
  'not an object': () => 'hola',
  'wrong schema version': (d) => (d.schemaVersion = 2),
  'no bars': (d) => (d.services = []),
  'bar without name': (d) => (svc(d, 'coffee-bar').name = ''),
  'bar with a bad id': (d) => (svc(d, 'coffee-bar').id = 'Coffee Bar!'),
  'two bars with the same id': (d) => (d.services[1].id = d.services[0].id),
  'bad category': (d) => (svc(d, 'coffee-bar').category = 'postres'),
  'minimum guests zero': (d) => (svc(d, 'coffee-bar').minPersonas = 0),
  'group without options': (d) => (svc(d, 'coffee-bar').selectionGroups[0].categories = [{ name: 'X', options: [] }]),
  'repeated topping in a list': (d) => svc(d, 'snack-bar').selectionGroups[0].categories?.[0].options.push(svc(d, 'snack-bar').selectionGroups[0].categories[0].options[0]),
  'a required bar is missing': (d) => (d.services = d.services.filter((s) => s.id !== 'drinks-bar')),
  'a required group is missing': (d) => (svc(d, 'cantaritos-bar').selectionGroups = svc(d, 'cantaritos-bar').selectionGroups.filter((g) => g.id !== 'cantarito-recuerdo')),
  'price for a bar that does not exist': (d) => (d.pricing.services['fantasma-bar'] = d.pricing.services['coffee-bar']),
  'price tier of zero': (d) => (d.pricing.services['coffee-bar'].tiers[0].pricePerPerson = 0),
  'price that is not a number': (d) => (d.pricing.services['coffee-bar'].tiers[1].pricePerPerson = 'mucho'),
  'tiers out of order': (d) => d.pricing.services['coffee-bar'].tiers.reverse(),
  'no tiers': (d) => (d.pricing.services['coffee-bar'].tiers = []),
  'negative minimum charge': (d) => (d.pricing.services['coffee-bar'].minimumTotal = -5),
  'glassware prices missing': (d) => delete d.pricing.services['drinks-bar'].variants.cristal,
  'discount over 100 percent': (d) => (d.pricing.discounts[0].percent = 150),
  'bad way of combining discounts': (d) => (d.pricing.stacking = 'todos'),
  'no FAQ': (d) => (d.faq = []),
  'FAQ without answer': (d) => (d.faq[0].a = ''),
  'quote text for a missing bar': (d) => (d.quoteCopy['fantasma-bar'] = ['hola']),
  'missing estimate notes': (d) => delete d.estimateNotes.payment,
  'bar photo that is not an address': (d) => (svc(d, 'coffee-bar').image = 'javascript:alert(1)'),
  'bar photo on another site written without https': (d) => (svc(d, 'coffee-bar').image = '//evil.example/x.jpg'),
  'topping photo that is not an address': (d) => (d.toppingImages = { oreo: 'no es una foto' }),
  'topping photos that are not an object': (d) => (d.toppingImages = ['x']),
};
for (const [name, mutate] of Object.entries(mutations)) {
  const doc = clone(CATALOG);
  const result = mutate(doc);
  const problems = validateCatalog(name === 'not an object' ? result : doc);
  check(`refuses: ${name}`, problems.length > 0);
}
// a valid change is accepted: a new bar with its price, and a higher price
{
  const doc = clone(CATALOG);
  svc(doc, 'coffee-bar').image = 'https://abc.supabase.co/storage/v1/object/public/site-images/u/1.webp';
  doc.toppingImages = { 'pumpkin spice': 'https://abc.supabase.co/storage/v1/object/public/site-images/u/2.webp', oreo: '/toppings/oreo.webp' };
  check('accepts her own photos (bar and toppings)', validateCatalog(doc).length === 0, validateCatalog(doc));
}
{
  const doc = clone(CATALOG);
  const bar = clone(svc(doc, 'snack-bar'));
  bar.id = 'bar-de-prueba';
  bar.name = 'Barra de prueba';
  bar.shortName = 'Prueba';
  doc.services.push(bar);
  doc.pricing.services['bar-de-prueba'] = { tiers: [{ fromPersonas: 30, pricePerPerson: 80 }], minimumTotal: 2000 };
  doc.quoteCopy['bar-de-prueba'] = ['-Línea de prueba.'];
  check('accepts a new bar with its price and quote text', validateCatalog(doc).length === 0, validateCatalog(doc));
  const noPrice = clone(CATALOG);
  const b2 = clone(svc(noPrice, 'snack-bar'));
  b2.id = 'sin-precio';
  noPrice.services.push(b2);
  check('accepts a new bar that has no price yet (shown as "por confirmar")', validateCatalog(noPrice).length === 0, validateCatalog(noPrice));
}

// ── 2. The pull step, against a fake database ──
let answer = { status: 200, body: 'null' };
const server = createServer((req, res) => {
  req.resume();
  res.writeHead(answer.status, { 'content-type': 'application/json' });
  res.end(answer.body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const dir = mkdtempSync(join(tmpdir(), 'catalog-pull-'));
const file = join(dir, 'catalog.data.ts');
const original = catalogFileText(CATALOG);
function run({ env = true, strict = true, url } = {}) {
  return new Promise((resolve) => {
    const e = { ...process.env, NODE_NO_WARNINGS: '1' };
    delete e.NEXT_PUBLIC_SUPABASE_URL;
    delete e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (env) {
      e.NEXT_PUBLIC_SUPABASE_URL = url ?? `http://127.0.0.1:${port}`;
      e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
    }
    const p = spawn(process.execPath, ['scripts/pull-catalog.mjs', '--out', file, ...(strict ? ['--strict'] : [])], { env: e, cwd: new URL('..', import.meta.url) });
    let out = '';
    p.stdout.on('data', (c) => (out += c));
    p.stderr.on('data', (c) => (out += c));
    p.on('close', (code) => resolve({ code, out }));
  });
}
const reset = () => writeFileSync(file, original, 'utf8');
const unchanged = () => readFileSync(file, 'utf8') === original;

reset();
let r = await run({ env: false });
check('no database configured: the file is kept', r.code === 2 && unchanged() && /No database configured/.test(r.out), r);

r = await run({ env: false, strict: false });
check('without --strict a failed pull still lets the build go on (exit 0)', r.code === 0 && unchanged(), r);

answer = { status: 200, body: 'null' };
r = await run();
check('nothing published yet: the file is kept', r.code === 2 && unchanged() && /Nothing has been published/.test(r.out), r);

answer = { status: 500, body: '{"message":"boom"}' };
r = await run();
check('database error: the file is kept', r.code === 2 && unchanged(), r);

answer = { status: 200, body: '<html>not json' };
r = await run();
check('an answer that is not JSON: the file is kept', r.code === 2 && unchanged(), r);

r = await run({ url: 'http://127.0.0.1:1' });
check('database unreachable: the file is kept', r.code === 2 && unchanged() && /Could not reach/.test(r.out), r);

const broken = clone(CATALOG);
broken.pricing.services['coffee-bar'].tiers[0].pricePerPerson = 0;
answer = { status: 200, body: JSON.stringify(broken) };
r = await run();
check('an invalid published catalog is not used and says why', r.code === 2 && unchanged() && /fails 1 check/.test(r.out) && /coffee-bar/.test(r.out), r);

answer = { status: 200, body: JSON.stringify(CATALOG) };
r = await run();
check('the same catalog as the project: nothing to change', r.code === 0 && unchanged() && /already in the project/.test(r.out), r);

const changed = clone(CATALOG);
changed.pricing.services['coffee-bar'].tiers[0].pricePerPerson = 80;
changed.faq[0].q = 'Pregunta cambiada';
const added = clone(svc(changed, 'snack-bar'));
added.id = 'bar-nueva';
added.name = 'Bar nueva';
changed.services.push(added);
changed.pricing.services['bar-nueva'] = { tiers: [{ fromPersonas: 30, pricePerPerson: 90 }], minimumTotal: 1800 };
answer = { status: 200, body: JSON.stringify(changed) };
r = await run();
const written = existsSync(file) ? readFileSync(file, 'utf8') : '';
check('a good published catalog is written into the file', r.code === 0 && written === catalogFileText(changed) && /Built from the published catalog \(25 bars\)/.test(r.out), r);
check('...with the new price, FAQ and bar', /"pricePerPerson": 80/.test(written) && /Pregunta cambiada/.test(written) && /"bar-nueva"/.test(written));

server.close();
console.log(`\n${passCount} passed, ${failures.length} failed.`);
if (failures.length) {
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
