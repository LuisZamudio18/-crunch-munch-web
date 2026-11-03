#!/usr/bin/env node
/**
 * The step before `next build` (npm "prebuild"): runs scripts/pull-catalog.mjs and decides whether the build may go on.
 *
 *  - The pull worked or had nothing to do                    → go on.
 *  - The pull reports trouble (exit 3) in an automatic build  → STOP (exit 1): the site stays on its last good version instead of
 *    being rebuilt with an old catalog. On a computer (no VERCEL or CI variable) it only warns, so a build never gets stuck here.
 *  - The pull could not even run (a Node without TypeScript support, a crash) → warn and go on with the catalog in the project.
 *
 * This file is plain JavaScript on purpose: it has to run on any Node.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const pull = fileURLToPath(new URL('./pull-catalog.mjs', import.meta.url));
const result = spawnSync(process.execPath, [pull, ...process.argv.slice(2)], { stdio: 'inherit' });
const automatic = Boolean(process.env.VERCEL || process.env.CI);

if (result.status === 0 || result.status === 2) process.exit(0);
if (result.status === 3) {
  if (automatic) {
    console.log('[catalog] Stopping this build so the site keeps its last good version. Fix the problem above (or publish again from the agenda) and build again.');
    process.exit(1);
  }
  console.log('[catalog] Going on with the catalog in the project (this is not an automatic build).');
  process.exit(0);
}
console.log('[catalog] The pull step could not run - the catalog in the project is used.');
process.exit(0);
