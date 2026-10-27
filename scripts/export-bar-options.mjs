// Writes the options of every bar (the same lists the website offers) for the agenda, so she can pick them there
// instead of typing them. Run: npx tsx scripts/export-bar-options.mjs <output.json>
import { writeFileSync } from 'node:fs';
import { SERVICES } from '../src/data/services.ts';

const out = {};
for (const s of SERVICES) {
  const groups = [];
  for (const g of s.selectionGroups) {
    if (g.type === 'fixed-display') continue;
    const base = { id: g.id, label: g.label, instruction: g.instruction, kind: g.type === 'choose-1' ? 'one' : 'many' };
    if (g.totalMax) base.max = g.totalMax;
    if (g.categories?.length) groups.push({ ...base, categories: g.categories.map((c) => ({ name: c.name, options: c.options })) });
    else if (g.options?.length) groups.push({ ...base, options: g.options });
  }
  out[s.id] = { name: s.name, shortName: s.shortName, groups };
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, 'bars');
