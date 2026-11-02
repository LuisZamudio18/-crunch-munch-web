#!/usr/bin/env node
/**
 * Proves that the site built from the catalog document (src/data/catalog.data.ts) is the same site as the one built from
 * the hand-written data files it replaced (frozen in scripts/legacy): same bars, prices, FAQ and quote texts, and the same
 * estimate for hundreds of combinations of bars, guests and choices.
 *
 *   npm run verify:catalog
 *
 * It is meant for the move to the catalog document. Once the owner starts changing the offer on purpose the two will differ,
 * and the legacy copies (and this script) are deleted. Needs a Node with built-in type stripping (22.18+/24+).
 */
import { computeDiscountProgress, computeEstimate } from '../src/lib/estimate.ts';
import * as oldServices from './legacy/services.legacy.ts';
import * as oldPricing from './legacy/pricing.legacy.ts';
import * as oldFaq from './legacy/faq.legacy.ts';
import * as oldQuote from './legacy/quoteCopy.legacy.ts';
import * as newServices from '../src/data/services.ts';
import * as newPricing from '../src/data/pricing.ts';
import * as newFaq from '../src/data/faq.ts';
import * as newQuote from '../src/data/quoteCopy.ts';

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
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ── Same data, export by export ──
for (const key of Object.keys(oldServices)) {
  check(`services: ${key} is the same`, same(oldServices[key], newServices[key]));
}
for (const key of Object.keys(oldPricing)) {
  check(`pricing: ${key} is the same`, same(oldPricing[key], newPricing[key]));
}
check('faq: FAQ is the same', same(oldFaq.FAQ, newFaq.FAQ));
check('quote copy: QUOTE_COPY is the same', same(oldQuote.QUOTE_COPY, newQuote.QUOTE_COPY));
check('the catalog has 24 bars, all priced', newServices.SERVICES.length === 24 && newServices.SERVICES.every((s) => newPricing.PRICING.services[s.id]));

// ── Same estimate for many orders ──
const ids = newServices.SERVICES.map((s) => s.id);
const names = Object.fromEntries(newServices.SERVICES.map((s) => [s.id, s.name]));
const guestsList = [10, 20, 29, 30, 49, 50, 69, 70, 99, 100, 150, 400];
let n = 0;
let mismatches = 0;
function both(input) {
  const a = computeEstimate(input, oldPricing.PRICING);
  const b = computeEstimate(input, newPricing.PRICING);
  const pa = computeDiscountProgress(input, oldPricing.PRICING);
  const pb = computeDiscountProgress(input, newPricing.PRICING);
  n++;
  if (!same(a, b) || !same(pa, pb)) {
    mismatches++;
    if (mismatches <= 3) console.log('  differs for', JSON.stringify(input).slice(0, 200));
  }
}

// every bar alone: every guest count, every variant, refill, take-home and a few extra picks
for (const id of ids) {
  const variants = Object.keys(oldPricing.PRICING.services[id]?.variants ?? { none: 1 });
  for (const personas of guestsList) {
    for (const variant of variants) {
      for (const refill of [false, true]) {
        for (const takeHome of [false, true]) {
          for (const extraPicks of [0, 1, 2, 3, 5]) {
            both({ selectedServices: [id], personas, serviceNames: names, options: { [id]: { variant: variant === 'none' ? undefined : variant, refill, takeHome, extraPicks } } });
          }
        }
      }
    }
  }
}
// groups of 2, 3 and 4+ bars (the multi-bar discount), with their own guest counts, and the combined option for two bars
const pick = (k, seed) => Array.from({ length: k }, (_, i) => ids[(seed * 7 + i * 5) % ids.length]).filter((v, i, a) => a.indexOf(v) === i);
for (let seed = 0; seed < 30; seed++) {
  for (const k of [2, 3, 4, 5]) {
    const sel = pick(k, seed);
    for (const personas of [30, 50, 80, 120]) {
      const options = Object.fromEntries(sel.map((id) => [id, { variant: 'cristal', refill: seed % 2 === 0 }]));
      both({ selectedServices: sel, personas, serviceNames: names, options });
      both({ selectedServices: sel, personas, personasByService: { [sel[0]]: 40 }, serviceNames: names, options });
      if (k === 2) both({ selectedServices: sel, personas, serviceNames: names, options, combo: true });
    }
  }
}
check(`${n} estimates are the same with the old and the new catalog`, mismatches === 0, `${mismatches} differ`);

console.log(`\n${passCount} passed, ${failures.length} failed.`);
if (failures.length) {
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
