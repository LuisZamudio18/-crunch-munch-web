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
  'first price range starts after the bar minimum': (d) => (d.pricing.services['coffee-bar'].tiers[0].fromPersonas = 40),
  'minimum lowered below the first price range': (d) => (svc(d, 'snack-bar').minPersonas = 25),
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

// ── 2. The pull step and the build guard, against a fake database ──
// `answers` is the list of replies the fake database gives in turn (the last one repeats); `hits` counts the requests it got
let answers = [{ status: 200, body: 'null' }];
let hits = 0;
const server = createServer((req, res) => {
  req.resume();
  const a = answers[Math.min(hits, answers.length - 1)];
  hits++;
  res.writeHead(a.status, { 'content-type': 'application/json' });
  res.end(a.body);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const reply = (...list) => {
  answers = list;
  hits = 0;
};

const dir = mkdtempSync(join(tmpdir(), 'catalog-pull-'));
const file = join(dir, 'catalog.data.ts');
const original = catalogFileText(CATALOG);
/** Runs the pull (or the build guard that wraps it) like the build does. `automatic` = Vercel is building. */
function run({ env = true, strict = true, url, script = 'pull-catalog', automatic = false, nodeOptions } = {}) {
  return new Promise((resolve) => {
    const e = { ...process.env, NODE_NO_WARNINGS: '1', CATALOG_PULL_RETRY_MS: '20' };
    for (const k of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'VERCEL', 'CI', 'NODE_OPTIONS']) delete e[k];
    if (env) {
      e.NEXT_PUBLIC_SUPABASE_URL = url ?? `http://127.0.0.1:${port}`;
      e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';
    }
    if (automatic) e.VERCEL = '1';
    if (nodeOptions) e.NODE_OPTIONS = nodeOptions;
    const p = spawn(process.execPath, [`scripts/${script}.mjs`, '--out', file, ...(strict ? ['--strict'] : [])], { env: e, cwd: new URL('..', import.meta.url) });
    let out = '';
    p.stdout.on('data', (c) => (out += c));
    p.stderr.on('data', (c) => (out += c));
    p.on('close', (code) => resolve({ code, out }));
  });
}
const reset = () => writeFileSync(file, original, 'utf8');
const unchanged = () => readFileSync(file, 'utf8') === original;

// Normal cases: nothing to do, the build goes on with the catalog in the project
reset();
let r = await run({ env: false });
check('no database configured: nothing to do', r.code === 2 && unchanged() && /No database configured/.test(r.out), r);

r = await run({ env: false, strict: false });
check('...and without --strict that is a plain exit 0', r.code === 0 && unchanged(), r);

reply({ status: 200, body: 'null' });
r = await run();
check('nothing published yet: nothing to do', r.code === 2 && unchanged() && /Nothing has been published/.test(r.out), r);

reply({ status: 404, body: '{"code":"PGRST202","message":"function not found"}' });
r = await run();
check('the database has no catalog function yet (404): nothing to do', r.code === 2 && unchanged() && hits === 1, r);

reply({ status: 200, body: JSON.stringify(CATALOG) });
r = await run({ strict: false });
check('the same catalog as the project: nothing to change', r.code === 0 && unchanged() && /already in the project/.test(r.out), r);

// Trouble: the pull says so (exit 3) and the file is not touched
reply({ status: 500, body: '{"message":"boom"}' });
r = await run();
check('a server error is tried 3 times, then reported as a problem', r.code === 3 && unchanged() && hits === 3 && /PROBLEM/.test(r.out), { code: r.code, hits, out: r.out });

reply({ status: 401, body: '{"message":"bad key"}' });
r = await run();
check('a refused request (401) is a problem, and is not repeated', r.code === 3 && unchanged() && hits === 1, { code: r.code, hits });

reply({ status: 200, body: '<html>not json' });
r = await run();
check('an answer that is not JSON is a problem', r.code === 3 && unchanged(), r);

r = await run({ url: 'http://127.0.0.1:1' });
check('database unreachable is a problem', r.code === 3 && unchanged() && /could not reach/.test(r.out), r);

const broken = clone(CATALOG);
broken.pricing.services['coffee-bar'].tiers[0].pricePerPerson = 0;
reply({ status: 200, body: JSON.stringify(broken) });
r = await run();
check('an invalid published catalog is a problem and says why', r.code === 3 && unchanged() && /fails 1 check/.test(r.out) && /coffee-bar/.test(r.out), r);

// A passing problem is overcome by trying again
const changed = clone(CATALOG);
changed.pricing.services['coffee-bar'].tiers[0].pricePerPerson = 80;
changed.faq[0].q = 'Pregunta cambiada';
const added = clone(svc(changed, 'snack-bar'));
added.id = 'bar-nueva';
added.name = 'Bar nueva';
changed.services.push(added);
changed.pricing.services['bar-nueva'] = { tiers: [{ fromPersonas: 30, pricePerPerson: 90 }], minimumTotal: 1800 };
reply({ status: 503, body: '{}' }, { status: 200, body: JSON.stringify(changed) });
r = await run({ strict: false });
let written = existsSync(file) ? readFileSync(file, 'utf8') : '';
check('a server error that passes on the second try still gets the catalog', r.code === 0 && hits === 2 && written === catalogFileText(changed), { code: r.code, hits });
check('...written with the new price, FAQ and bar', /"pricePerPerson": 80/.test(written) && /Pregunta cambiada/.test(written) && /"bar-nueva"/.test(written) && /Built from the published catalog \(25 bars\)/.test(r.out));

// The build guard (what `npm run build` runs first)
reset();
reply({ status: 500, body: '{}' });
r = await run({ script: 'prebuild', strict: false, automatic: true });
check('guard: trouble in an automatic build STOPS the build (the site keeps its last good version)', r.code === 1 && unchanged() && /Stopping this build/.test(r.out), r);

r = await run({ script: 'prebuild', strict: false, automatic: false });
check('guard: the same trouble on a computer only warns', r.code === 0 && unchanged() && /not an automatic build/.test(r.out), r);

reply({ status: 200, body: JSON.stringify(broken) });
r = await run({ script: 'prebuild', strict: false, automatic: true });
check('guard: an invalid published catalog stops an automatic build', r.code === 1 && unchanged(), r);

reply({ status: 200, body: 'null' });
r = await run({ script: 'prebuild', strict: false, automatic: true });
check('guard: nothing published yet lets an automatic build go on', r.code === 0 && unchanged(), r);

r = await run({ script: 'prebuild', strict: false, automatic: true, env: false });
check('guard: no database configured lets the build go on', r.code === 0 && unchanged(), r);

reply({ status: 200, body: JSON.stringify(changed) });
r = await run({ script: 'prebuild', strict: false, automatic: true });
written = readFileSync(file, 'utf8');
check('guard: a good published catalog goes into the build', r.code === 0 && written === catalogFileText(changed), r);

reset();
reply({ status: 500, body: '{}' });
r = await run({ script: 'prebuild', strict: false, automatic: true, nodeOptions: '--no-experimental-strip-types' });
check('guard: if the pull cannot even run (a Node without TypeScript), the build goes on', r.code === 0 && unchanged() && /could not run/.test(r.out), r);

server.close();
console.log(`\n${passCount} passed, ${failures.length} failed.`);
if (failures.length) {
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
