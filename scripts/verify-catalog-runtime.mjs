#!/usr/bin/env node
/**
 * Checks for the editor preview: swapping the catalog for a draft in memory (src/lib/catalogRuntime.ts) changes everything
 * the page reads (bars, prices, FAQ, quote texts, notes), puts the original back exactly, and refuses what is not a catalog.
 *
 *   npm run verify:catalog-runtime
 */
import { applyDraftCatalog, looksLikeCatalog } from '../src/lib/catalogRuntime.ts';
import { CATALOG } from '../src/data/catalog.data.ts';
import { SERVICES, SERVICES_BY_CATEGORY, SERVICE_MAP } from '../src/data/services.ts';
import { PRICING, ESTIMATE_NOTES } from '../src/data/pricing.ts';
import { FAQ } from '../src/data/faq.ts';
import { QUOTE_COPY } from '../src/data/quoteCopy.ts';
import { computeEstimate } from '../src/lib/estimate.ts';

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
const snapshot = () => JSON.stringify({ SERVICES, SERVICES_BY_CATEGORY, SERVICE_MAP, PRICING, ESTIMATE_NOTES, FAQ, QUOTE_COPY });
const original = snapshot();
// The data modules hold the very objects of CATALOG, so keep a copy of the original to compare with and to put back
const ORIGINAL = clone(CATALOG);

check('the catalog is recognised', looksLikeCatalog(ORIGINAL));
check('things that are not a catalog are refused', !looksLikeCatalog(null) && !looksLikeCatalog('x') && !looksLikeCatalog({}) && !looksLikeCatalog({ ...CATALOG, services: 'no' }) && !looksLikeCatalog({ ...CATALOG, schemaVersion: 2 }) && !looksLikeCatalog({ ...CATALOG, faq: undefined }));

// A draft: a higher price, a new bar with its own price and text, one question less, new notes
const draft = clone(ORIGINAL);
draft.pricing.services['coffee-bar'].tiers[0].pricePerPerson = 99;
const bar = clone(draft.services.find((s) => s.id === 'snack-bar'));
Object.assign(bar, { id: 'bar-nueva', name: 'Bar nueva', shortName: 'Nueva', category: 'dulce' });
draft.services.push(bar);
draft.pricing.services['bar-nueva'] = { tiers: [{ fromPersonas: 30, pricePerPerson: 120 }], minimumTotal: 3000 };
draft.quoteCopy['bar-nueva'] = ['-Texto nuevo.'];
draft.faq = draft.faq.slice(1);
draft.estimateNotes.payment = 'Pago nuevo';
const bars = SERVICES; // the same array object the components hold

applyDraftCatalog(draft);
check('the same array object now holds the draft bars', bars === SERVICES && SERVICES.length === 25 && SERVICES[24].id === 'bar-nueva');
check('the lookup by id has the new bar', SERVICE_MAP['bar-nueva']?.name === 'Bar nueva' && SERVICE_MAP['coffee-bar'].name === 'Coffee Bar');
check('the bars by category are rebuilt', SERVICES_BY_CATEGORY.dulce.some((s) => s.id === 'bar-nueva') && SERVICES_BY_CATEGORY.dulce.length === ORIGINAL.services.filter((s) => s.category === 'dulce').length + 1 && !SERVICES_BY_CATEGORY.salado.some((s) => s.id === 'bar-nueva'));
check('prices follow the draft', PRICING.services['coffee-bar'].tiers[0].pricePerPerson === 99 && PRICING.services['bar-nueva'].minimumTotal === 3000);
const names = { 'coffee-bar': 'Coffee Bar', 'bar-nueva': 'Bar nueva' };
const est = computeEstimate({ selectedServices: ['coffee-bar', 'bar-nueva'], personas: 30, serviceNames: names }, PRICING);
check('the estimate uses the draft prices', est && est.lines[0].pricePerPerson === 99 && est.lines[1].pricePerPerson === 120, est?.lines);
check('FAQ, quote texts and notes follow the draft', FAQ.length === ORIGINAL.faq.length - 1 && QUOTE_COPY['bar-nueva'][0] === '-Texto nuevo.' && ESTIMATE_NOTES.payment === 'Pago nuevo');

applyDraftCatalog(clone(ORIGINAL));
check('applying the original puts everything back exactly', snapshot() === original);

console.log(`\n${passCount} passed, ${failures.length} failed.`);
if (failures.length) {
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
