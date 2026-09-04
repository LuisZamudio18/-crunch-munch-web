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
    const embedCount = (instaHtml.match(/class="instagram-media"/g) || []).length;
    // Either real embeds are configured (curated posts render as
    // <blockquote class="instagram-media">, later hydrated into iframes by
    // Instagram's script) or the list is empty and the graceful fallback
    // copy shows instead — never both, never neither.
    check(
      'Instagram section: renders curated embeds OR graceful empty-state (never a broken/blank section)',
      embedCount > 0 || hasEmptyStateMessage,
      `embedCount=${embedCount} hasEmptyStateMessage=${hasEmptyStateMessage}`
    );
    if (embedCount > 0) {
      console.log(`  ..  ${embedCount} curated post(s) present as embed blockquotes`);
    }
    // embed.js itself is injected client-side (see InstagramEmbedCard.tsx)
    // so it never appears in a plain server-rendered HTML fetch like this
    // one — verified separately in the browser that it loads and turns
    // each <blockquote class="instagram-media"> into a real iframe.

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
