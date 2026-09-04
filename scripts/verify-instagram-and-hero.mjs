#!/usr/bin/env node
/**
 * Smoke tests for the Instagram embeds section and the Hero background
 * video. The project has no unit-test framework installed, so this is a
 * lightweight, dependency-free script matching
 * scripts/verify-agent-readiness.mjs — run it against a running server:
 *
 *   npm run build && npm run start &
 *   BASE_URL=http://localhost:3000 node scripts/verify-instagram-and-hero.mjs
 *
 * Exits non-zero (and prints every failure) if any check fails.
 *
 * Note on the Instagram section: it uses Instagram's public embed.js
 * widget (real posts by URL, curated in src/data/instagramPosts.ts) — NOT
 * the Graph API. No token, no login, no account-risk surface to test. If
 * that list is ever emptied out, these checks fall back to verifying the
 * graceful "coming soon" empty state instead of embed markup.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
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

async function main() {
  console.log(`Verifying ${BASE_URL}\n`);

  {
    const res = await fetch(`${BASE_URL}/`);
    const html = await res.text();

    check('/: has id="instagram" section', html.includes('id="instagram"'));
    check('/: Navbar links to #instagram', /href="#instagram"/.test(html));
    check(
      '/: "Ver perfil" points at the corrected handle (not the old typo)',
      html.includes('https://www.instagram.com/crunchandmunch_snackbar') && !html.includes('crunchandmuch_snackbar')
    );
    check(
      '/: no Graph API leftovers (no fetch to /api/instagram, no token-based feed)',
      !html.includes('/api/instagram')
    );

    const instaIdx = html.indexOf('id="instagram"');
    const instaHtml = html.slice(instaIdx, instaIdx + 20000);
    const hasEmptyStateMessage = instaHtml.includes('Muy pronto vas a ver aquí publicaciones reales');
    // Cards are lazy (IntersectionObserver) — the <blockquote> only mounts
    // once scrolled near, so a plain server-rendered fetch like this one
    // sees the pulse placeholder (min-h-[400px]) instead, not the embed
    // markup itself. Real embed processing/resizing can only be checked in
    // an actual browser (see the manual QA note in the project — this
    // script can't drive real scrolling + Instagram's postMessage resize).
    const placeholderCount = (instaHtml.match(/min-h-\[400px\]/g) || []).length;
    check(
      'Instagram section: renders one lazy-load placeholder per curated post OR graceful empty-state',
      placeholderCount > 0 || hasEmptyStateMessage,
      `placeholderCount=${placeholderCount} hasEmptyStateMessage=${hasEmptyStateMessage}`
    );
    if (placeholderCount > 0) {
      console.log(`  ..  ${placeholderCount} curated post(s) queued for lazy-load`);
    }

    const heroHtml = html.slice(html.indexOf('Luxury Mobile Bars'), html.indexOf('Luxury Mobile Bars') + 6000);
    const heroVideoConfigured = !!process.env.NEXT_PUBLIC_HERO_VIDEO_URL;
    if (!heroVideoConfigured) {
      check('Hero: no NEXT_PUBLIC_HERO_VIDEO_URL set -> no <video> tag rendered, gradient only', !/<video/.test(heroHtml));
    } else {
      check('Hero: NEXT_PUBLIC_HERO_VIDEO_URL set -> <video> tag rendered', /<video/.test(heroHtml));
    }
    check('Hero: bg-hero-gradient fallback class still present', html.includes('bg-hero-gradient'));
  }

  // /api/instagram should no longer exist — the Graph API route was removed.
  {
    const res = await fetch(`${BASE_URL}/api/instagram`);
    check('GET /api/instagram: route removed (404, not a stale Graph API endpoint)', res.status === 404, `got ${res.status}`);
  }

  console.log(`\n${passCount} passed, ${failures.length} failed.`);
  if (failures.length) {
    console.log('\nFailed checks:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});
