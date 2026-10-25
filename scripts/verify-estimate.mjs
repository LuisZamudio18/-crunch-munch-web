#!/usr/bin/env node
/**
 * Checks for the preliminary-estimate engine (src/lib/estimate.ts). It runs
 * against its own fixture config — never the real/placeholder numbers in
 * src/data/pricing.ts — so it verifies the *rules* (tiers, variants, refill,
 * floor, discount selection, range rounding, nudge messages), not the
 * business's prices. The last block only checks that the real pricing table
 * covers the catalog consistently (no bar left unpriced, no orphan ids).
 *
 *   npm run verify:estimate
 *
 * Imports the .ts file directly, which needs a Node with built-in type
 * stripping (22.18+/24+).
 */
import { computeDiscountProgress, computeEstimate } from '../src/lib/estimate.ts';
import { PRICING, PRESENTATION_VARIANT } from '../src/data/pricing.ts';
import { PRESENTATION_CHOICE_BAR_IDS, PRESENTATION_FIXED, PRESENTATION_OPTIONS } from '../src/data/services.ts';
import { PRESENTATION_PHOTOS, PRESENTATION_PHOTO_BY_BAR, PRESENTATION_PHOTO_BY_OPTION } from '../src/data/presentations.ts';
import { existsSync } from 'node:fs';
import { QUOTE_COPY } from '../src/data/quoteCopy.ts';
import { serviceHours, formatHours, serviceHoursText } from '../src/data/serviceHours.ts';
import { SERVICES } from '../src/data/services.ts';
import { countExtraPicks, extraPercent } from '../src/lib/extraPicks.ts';

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

const config = {
  services: {
    snack: {
      tiers: [
        { fromPersonas: 30, pricePerPerson: 90 },
        { fromPersonas: 50, pricePerPerson: 80 },
      ],
    },
    other: { tiers: [{ fromPersonas: 30, pricePerPerson: 100 }] },
  },
  discounts: [
    { id: 'vol', kind: 'volume-guests', label: 'Volumen', percent: 5, minPersonas: 50 },
    { id: 'multi', kind: 'multi-bar', label: 'Multi', percent: 10, minBars: 3 },
  ],
  stacking: 'best',
  rangeSpread: 0.1,
  roundTo: 50,
};
const names = { snack: 'Snack', other: 'Otra', unpriced: 'Sin precio', x: 'X' };
const est = (selectedServices, personas, cfg = config) =>
  computeEstimate({ selectedServices, personas, serviceNames: names }, cfg);

// Nothing to price
check('no guests -> null', est(['snack'], 0) === null);
check('only unpriced bars -> null', est(['unpriced'], 40) === null);

// Tiers
check('40 guests uses the 30+ tier (90/p)', est(['snack'], 40)?.lines[0].pricePerPerson === 90);
check('49 guests still the 30+ tier', est(['snack'], 49)?.lines[0].pricePerPerson === 90);
check('50 guests switches to the 50+ tier (80/p)', est(['snack'], 50)?.lines[0].pricePerPerson === 80);
check('below the first tier -> not priced', est(['snack'], 20) === null);

// Totals and range rounding (40 guests × 90 = 3600; ±10% = 3240…3960 -> 3200…4000)
{
  const e = est(['snack'], 40);
  check('subtotal = guests × tier price', e?.subtotal === 3600, String(e?.subtotal));
  check('no discount at 40 guests / 1 bar', e?.discountTotal === 0);
  check('range low rounds DOWN to the step', e?.low === 3200, String(e?.low));
  check('range high rounds UP to the step', e?.high === 4000, String(e?.high));
}

// Volume discount (50 × 80 = 4000, 5% = 200 -> 3800)
{
  const e = est(['snack'], 50);
  check('volume discount applies at 50 guests', e?.discounts.length === 1 && e.discounts[0].rule.id === 'vol');
  check('discount amount = percent of subtotal', e?.discountTotal === 200, String(e?.discountTotal));
  check('total = subtotal - discount', e?.total === 3800, String(e?.total));
}

// Best vs. sum stacking (3 bars + 50 guests: 5% and 10% both eligible)
{
  const bars = ['snack', 'other', 'unpriced'];
  const best = est(bars, 50);
  check("stacking 'best': only the biggest discount applies", best?.discounts.length === 1 && best.discounts[0].rule.id === 'multi');
  const sum = est(bars, 50, { ...config, stacking: 'sum' });
  check("stacking 'sum': both discounts apply", sum?.discounts.length === 2);
  check('unpriced bars are reported, not silently dropped', best?.unpricedServiceIds.join() === 'unpriced');
}

// Minimum floor
{
  const cfg = { ...config, services: { snack: { ...config.services.snack, minimumTotal: 3000 } } };
  const e = est(['snack'], 30, cfg); // raw 2700 -> floored 3000
  check('minimum total raises a small order', e?.lines[0].subtotal === 3000 && e.lines[0].floorApplied === true);
}

// Nudge messages
{
  const p = computeDiscountProgress({ selectedServices: ['snack'], personas: 38 }, config);
  const vol = p.find((x) => x.rule.id === 'vol');
  const multi = p.find((x) => x.rule.id === 'multi');
  check('volume nudge: remaining guests counted', vol?.remaining === 12 && vol.unlocked === false);
  check('volume nudge: progress is a 0–1 fraction', Math.abs(vol.progress - 38 / 50) < 1e-9);
  check('multi-bar nudge: singular/plural ("2 barras")', multi?.message.includes('2 barras'), multi?.message);
  const one = computeDiscountProgress({ selectedServices: ['snack', 'other'], personas: 38 }, config).find((x) => x.rule.id === 'multi');
  check('multi-bar nudge: singular ("1 barra")', one?.message.includes('1 barra más'), one?.message);
  const unlocked = computeDiscountProgress({ selectedServices: ['snack'], personas: 60 }, config).find((x) => x.rule.id === 'vol');
  check('unlocked rule: flag, zero remaining, progress capped at 1', unlocked?.unlocked && unlocked.remaining === 0 && unlocked.progress === 1);
}


// Variants (a choice that selects the price list), refill surcharge and take-home extra
{
  const cfg = {
    services: {
      drink: {
        variants: {
          cristal: [{ fromPersonas: 30, pricePerPerson: 100 }, { fromPersonas: 50, pricePerPerson: 90 }],
          desech: [{ fromPersonas: 30, pricePerPerson: 80 }, { fromPersonas: 50, pricePerPerson: 70 }],
        },
        minimumTotal: 3500,
      },
      cantaro: { tiers: [{ fromPersonas: 30, pricePerPerson: 85 }], minimumTotal: 2000, takeHomePerPerson: 35 },
    },
    discounts: [],
    stacking: 'best',
    rangeSpread: 0.1,
    roundTo: 50,
    refillSurchargePercent: 30,
    refillAffectsMinimum: false,
  };
  const run = (services, personas, options, c = cfg) =>
    computeEstimate({ selectedServices: services, personas, serviceNames: { drink: 'Drink', cantaro: 'Cantaro' }, options }, c);

  check('variant bar without a chosen variant is not priced', run(['drink'], 40, {}) === null);
  check('unknown variant is not priced', run(['drink'], 40, { drink: { variant: 'otro' } }) === null);
  check('variant picks its own price list', run(['drink'], 40, { drink: { variant: 'cristal' } })?.lines[0].subtotal === 4000);
  check('other variant, other price', run(['drink'], 40, { drink: { variant: 'desech' } })?.lines[0].subtotal === 3500);
  check('variant tiers follow the guest count', run(['drink'], 60, { drink: { variant: 'desech' } })?.lines[0].pricePerPerson === 70);

  const refill = run(['drink'], 40, { drink: { variant: 'cristal', refill: true } })?.lines[0];
  check('refill adds the surcharge to the per-person price (100 -> 130)', refill?.pricePerPerson === 130 && refill.subtotal === 5200 && refill.refillApplied, JSON.stringify(refill));
  check('no refill flag -> no surcharge', run(['drink'], 40, { drink: { variant: 'cristal', refill: false } })?.lines[0].refillApplied === false);

  // 30 guests x 80 = 2400 < floor 3500; with refill 30 x 104 = 3120, still below the floor
  const floorRefill = run(['drink'], 30, { drink: { variant: 'desech', refill: true } })?.lines[0];
  check('refill does not raise the minimum charge by default', floorRefill?.subtotal === 3500 && floorRefill.floorApplied, JSON.stringify(floorRefill));
  const floorRaised = run(['drink'], 30, { drink: { variant: 'desech', refill: true } }, { ...cfg, refillAffectsMinimum: true })?.lines[0];
  check('refillAffectsMinimum raises the floor (3500 x 1.3 = 4550)', floorRaised?.subtotal === 4550, String(floorRaised?.subtotal));

  const keep = run(['cantaro'], 40, { cantaro: { takeHome: true } })?.lines[0];
  check('take-home adds a per-guest extra (40 x 85 + 40 x 35 = 4800)', keep?.subtotal === 4800 && keep.takeHomeExtra === 1400, JSON.stringify(keep));
  check('take-home off -> no extra', run(['cantaro'], 40, { cantaro: { takeHome: false } })?.lines[0].subtotal === 3400);
  check('option label is echoed back for display', run(['drink'], 40, { drink: { variant: 'cristal', label: 'Cristaleria' } })?.lines[0].detail === 'Cristaleria');
}

// Multi-bar discount with a per-bar guest requirement
{
  const cfg = {
    services: {
      a: { tiers: [{ fromPersonas: 30, pricePerPerson: 100 }] },
      b: { tiers: [{ fromPersonas: 30, pricePerPerson: 100 }] },
      c: { tiers: [{ fromPersonas: 30, pricePerPerson: 100 }] },
      d: { tiers: [{ fromPersonas: 30, pricePerPerson: 100 }] },
    },
    discounts: [
      { id: 'b2', kind: 'multi-bar', label: '2 barras', percent: 5, minBars: 2, minPersonasPerBar: 50 },
      { id: 'b3', kind: 'multi-bar', label: '3 barras', percent: 10, minBars: 3, minPersonasPerBar: 50 },
      { id: 'b4', kind: 'multi-bar', label: '4 barras', percent: 15, minBars: 4, minPersonasPerBar: 50 },
    ],
    stacking: 'best',
    rangeSpread: 0.1,
    roundTo: 50,
  };
  const names = { a: 'A', b: 'B', c: 'C', d: 'D' };
  const run = (bars, personas) => computeEstimate({ selectedServices: bars, personas, serviceNames: names }, cfg);

  check('2 bars with too few guests per bar: no discount', run(['a', 'b'], 49)?.discounts.length === 0);
  check('2 bars at exactly 50 guests: 5%', run(['a', 'b'], 50)?.discounts[0]?.rule.id === 'b2');
  check('1 bar never gets a multi-bar discount', run(['a'], 80)?.discounts.length === 0);
  check('3 bars: the 10% rule wins over the 5% one', run(['a', 'b', 'c'], 60)?.discounts.map((d) => d.rule.id).join() === 'b3');
  check('4 bars: 15% applies to the whole subtotal (4 x 60 x 100 = 24000 -> 3600)', run(['a', 'b', 'c', 'd'], 60)?.discountTotal === 3600);

  const lowGuests = computeDiscountProgress({ selectedServices: ['a', 'b'], personas: 40 }, cfg).find((x) => x.rule.id === 'b2');
  check('guest shortfall nudge says how many bars still need more guests', lowGuests?.unlocked === false && lowGuests.remaining === 2 && lowGuests.message.includes('50+ personas 2 barras más'), lowGuests?.message);
  check('guest shortfall caps progress below 1', lowGuests !== undefined && lowGuests.progress < 1);

  // Each bar can have its own guest count
  const per = (bars, personas, personasByService) => computeEstimate({ selectedServices: bars, personas, personasByService, serviceNames: names }, cfg);
  const mixed = per(['a', 'b'], 40, { a: 60, b: 45 });
  check('each bar is priced with its own guests (60 x 100 + 45 x 100 = 10500)', mixed?.subtotal === 10500 && mixed.lines[0].personas === 60 && mixed.lines[1].personas === 45, JSON.stringify(mixed?.lines.map((l) => l.personas)));
  check('discount needs every counted bar at 50+: 60 and 45 -> none', mixed?.discounts.length === 0);
  check('60 and 50 -> 5%', per(['a', 'b'], 40, { a: 60, b: 50 })?.discounts[0]?.rule.id === 'b2');
  check('bars without their own count use the event guests', per(['a', 'b'], 55, { a: 70 })?.lines[1].personas === 55);
  check('3 bars where only 2 reach 50 guests -> 5%, not 10%', per(['a', 'b', 'c'], 40, { a: 50, b: 80 })?.discounts[0]?.rule.id === 'b2');
  const oneShort = computeDiscountProgress({ selectedServices: ['a', 'b'], personas: 40 }, cfg);
  void oneShort;
  const nudgeMixed = computeDiscountProgress({ selectedServices: ['a', 'b'], personas: 40, personasByService: { a: 60 } }, cfg).find((x) => x.rule.id === 'b2');
  check('nudge: one bar still short of guests', nudgeMixed?.remaining === 1 && nudgeMixed.message.includes('una barra más'), nudgeMixed?.message);
  const needBar = computeDiscountProgress({ selectedServices: ['a'], personas: 80 }, cfg).find((x) => x.rule.id === 'b2');
  check('bar shortfall nudge mentions the per-bar guests', needBar?.message.includes('1 barra más') && needBar.message.includes('50+ personas'), needBar?.message);
}

// The real pricing table must line up with the catalog
{
  const ids = SERVICES.map((s) => s.id);
  const priced = Object.keys(PRICING.services);
  check('every bar in the catalog has a price', ids.every((id) => priced.includes(id)), ids.filter((id) => !priced.includes(id)).join());
  check('no price entry for a bar that does not exist', priced.every((id) => ids.includes(id)), priced.filter((id) => !ids.includes(id)).join());

  const lists = (p) => (p.variants ? Object.values(p.variants) : [p.tiers]);
  const ascending = (t) => t.every((x, i) => i === 0 || x.fromPersonas > t[i - 1].fromPersonas);
  check('every tier list is in ascending guest order', Object.values(PRICING.services).every((p) => lists(p).every(ascending)));

  const startsAtMin = SERVICES.every((svc) => lists(PRICING.services[svc.id]).every((t) => t[0].fromPersonas === svc.minPersonas));
  check("each bar's first price bracket starts at the bar's minimum guests", startsAtMin);
  check('every bar has a minimum charge', Object.values(PRICING.services).every((p) => p.minimumTotal > 0));
  check('every bar has quote text for the WhatsApp message', ids.every((id) => (QUOTE_COPY[id]?.length ?? 0) > 0), ids.filter((id) => !QUOTE_COPY[id]).join());
  check('quote text only for bars that exist', Object.keys(QUOTE_COPY).every((id) => ids.includes(id)));
  check('quote text never hard-codes a duration (it depends on guests and refill)', Object.values(QUOTE_COPY).every((lines) => !lines.some((l) => /hora/i.test(l))));
  check('only Drinks and Mocktails need a presentation choice', Object.entries(PRICING.services).filter(([, p]) => p.variants).map(([id]) => id).sort().join() === 'drinks-bar,mocktails-bar');
}


// Presentation choice: every option the customer can pick must map to a price list and a photo
{
  const variantKeys = Object.keys(PRICING.services['drinks-bar'].variants);
  check('every presentation option maps to a price variant', PRESENTATION_OPTIONS.every((o) => variantKeys.includes(PRESENTATION_VARIANT[o])));
  check('every presentation option has a photo entry', PRESENTATION_OPTIONS.every((o) => PRESENTATION_PHOTOS[PRESENTATION_PHOTO_BY_OPTION[o]]));
  check('bars with a fixed presentation have a photo', Object.keys(PRESENTATION_FIXED).every((id) => PRESENTATION_PHOTOS[PRESENTATION_PHOTO_BY_BAR[id]]));
  check('choice bars and fixed bars do not overlap', PRESENTATION_CHOICE_BAR_IDS.every((id) => !(id in PRESENTATION_FIXED)));
  const missingFiles = Object.values(PRESENTATION_PHOTOS).filter((p) => !existsSync(new URL('../public' + p.src, import.meta.url)));
  check('every presentation photo file exists in /public', missingFiles.length === 0, missingFiles.map((p) => p.src).join());
}


// Service hours (the owner's rules)
{
  const reg = (g) => serviceHours(g, false);
  const ref = (g) => serviceHours(g, true);
  check('regular service: 30, 49, 50, 69 guests -> 2 h', [30, 49, 50, 69].every((g) => reg(g) === 2), [30, 49, 50, 69].map(reg));
  check('regular service: 70, 90, 99 guests -> 3 h', [70, 90, 99].every((g) => reg(g) === 3), [70, 90, 99].map(reg));
  check('regular service: 100 and more -> 4 h', [100, 150].every((g) => reg(g) === 4));
  check('refill: 30-49 guests -> 2.5 h', [30, 49].every((g) => ref(g) === 2.5), [30, 49].map(ref));
  check('refill: 50-69 guests -> 3 h', [50, 69].every((g) => ref(g) === 3), [50, 69].map(ref));
  check('refill: 70-89 guests -> 3.5 h', [70, 89].every((g) => ref(g) === 3.5), [70, 89].map(ref));
  check('refill: 90 and more -> 4 h', [90, 100, 150].every((g) => ref(g) === 4));
  check('refill is never shorter than the regular service for the same guests', [30, 49, 50, 69, 70, 89, 90, 99, 100, 150].every((g) => ref(g) >= reg(g)));
  check('brunch bars (20-29 guests) get the shortest service', reg(20) === 2 && ref(25) === 2.5);
  check('hours are written the way she says them', formatHours(2) === '2 horas' && formatHours(2.5) === '2 horas y media' && formatHours(3.5) === '3 horas y media' && formatHours(4) === '4 horas');
  check('the sentence adds "o hasta que se acabe el producto"', serviceHoursText(60, false) === 'El servicio es durante 2 horas o hasta que se acabe el producto.', serviceHoursText(60, false));
}


// Desayuno buffet: the price includes 2 + 2 + 2 + 1 picks; every 2 extra picks add 15 % per person, compounding
{
  const buffet = SERVICES.find((x) => x.id === 'desayuno-buffet');
  const menu = buffet.selectionGroups[0];
  const cat = (name) => menu.categories.find((c) => c.name === name);
  const pick = (n, name) => cat(name).options.slice(0, n);
  const sel = (a, b, c, d) => ({ menu: [...pick(a, 'Alimentos'), ...pick(b, 'Acompañamientos'), ...pick(c, 'Bebidas'), ...pick(d, 'Pan, Galletas y Postres')] });
  const rule = PRICING.services['desayuno-buffet'].extraPickSurcharge;
  check('buffet declares what is included: 2, 3, 2 and 1', menu.categories.map((c) => c.included).join() === '2,3,2,1');
  check('buffet surcharge rule is 15 % per 2 extra picks', rule?.every === 2 && rule?.percent === 15, JSON.stringify(rule));
  check('the included picks add no extras', countExtraPicks(buffet, sel(2, 3, 2, 1)) === 0);
  check('fewer picks than included add no extras', countExtraPicks(buffet, sel(1, 0, 2, 0)) === 0);
  check('extras are counted per category (3 + 4 + 2 + 1 → 1 + 1 = 2)', countExtraPicks(buffet, sel(3, 4, 2, 1)) === 2);
  check('a missing category does not offset an extra in another', countExtraPicks(buffet, sel(3, 0, 2, 1)) === 1);

  const estFor = (extraPicks, personas = 50) =>
    computeEstimate({ selectedServices: ['desayuno-buffet'], personas, serviceNames: { 'desayuno-buffet': 'Buffet' }, options: { 'desayuno-buffet': { extraPicks } } }, PRICING);
  const base = estFor(0).lines[0].pricePerPerson;
  const at = (n) => estFor(n).lines[0].pricePerPerson;
  check('no extras: the plain price per person', estFor(0).lines[0].extraPercent === 0 && base === 120, String(base));
  check('2 extras: +15 %', Math.abs(at(2) - base * 1.15) < 0.01, String(at(2)));
  check('1 extra alone is not charged', at(1) === base, String(at(1)));
  check('3 extras: still one step; 4 extras: a second +15 % on top of the first', at(3) === at(2) && Math.abs(at(4) - base * 1.15 * 1.15) < 0.01, `${at(3)} ${at(4)}`);
  check('6 extras: three compounded steps', Math.abs(at(6) - base * Math.pow(1.15, 3)) < 0.01, String(at(6)));
  const example = computeEstimate({ selectedServices: ['desayuno-buffet'], personas: 50, serviceNames: {}, options: { 'desayuno-buffet': { extraPicks: 2 } } }, PRICING).lines[0];
  check("the owner's example: 120 per person becomes 138", example.pricePerPerson === 138 && example.subtotal === 138 * 50, `${example.pricePerPerson} ${example.subtotal}`);
  check('the line reports the extras and the percent', estFor(4).lines[0].extraPicks === 4 && estFor(4).lines[0].extraPercent === 32.3, String(estFor(4).lines[0].extraPercent));
  check('extraPercent helper matches the engine', extraPercent(4, rule) === 32.3 && extraPercent(0, rule) === 0 && extraPercent(2, rule) === 15);
  check('extras never touch other bars', computeEstimate({ selectedServices: ['coffee-bar'], personas: 50, serviceNames: {}, options: { 'coffee-bar': { extraPicks: 4 } } }, PRICING).lines[0].extraPercent === 0);
}


// Opción combinada: 2 barras, 15 invitados cada una
{
  const two = (combo, guests = { 'hot-cakes-bar': 15, 'coffee-bar': 15 }) =>
    computeEstimate({ selectedServices: Object.keys(guests), personas: 30, personasByService: guests, serviceNames: {}, combo }, PRICING);
  const normal30 = computeEstimate({ selectedServices: ['hot-cakes-bar', 'coffee-bar'], personas: 30, serviceNames: {} }, PRICING);
  const c = two(true);
  const hot = c.lines.find((l) => l.serviceId === 'hot-cakes-bar');
  const cof = c.lines.find((l) => l.serviceId === 'coffee-bar');
  check('combo: each bar uses the 30-guest price plus $5 per person', hot.pricePerPerson === 65 + 5 && cof.pricePerPerson === 75 + 5, `${hot.pricePerPerson} ${cof.pricePerPerson}`);
  check('combo: charged for 15 guests per bar, no minimum charge', hot.subtotal === 15 * 70 && cof.subtotal === 15 * 80 && !hot.floorApplied, `${hot.subtotal} ${cof.subtotal}`);
  check('combo: lines are flagged and there is no multi-bar discount', c.lines.every((l) => l.combo) && c.discounts.length === 0);
  check('combo: cheaper than paying two full 30-guest bars', c.total < normal30.total, `${c.total} vs ${normal30.total}`);
  check('without the combo option 15 guests per bar are below the minimum and are not priced', two(false) === null);
  check('combo needs exactly two bars (three bars price normally)', computeEstimate({ selectedServices: ['hot-cakes-bar', 'coffee-bar', 'donas-bar'], personas: 30, serviceNames: {}, combo: true }, PRICING).lines.every((l) => !l.combo));
  check('combo with a refill bar keeps the refill surcharge', (() => {
    const e = computeEstimate({ selectedServices: ['drinks-bar', 'coffee-bar'], personas: 30, personasByService: { 'drinks-bar': 15, 'coffee-bar': 15 }, serviceNames: {}, combo: true, options: { 'drinks-bar': { variant: 'desechable', refill: true } } }, PRICING);
    return e.lines.find((l) => l.serviceId === 'drinks-bar').pricePerPerson === 95 * 1.3 + 5;
  })());
}

console.log(`\n${passCount} passed, ${failures.length} failed.`);
if (failures.length) {
  console.log('\nFailed checks:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
