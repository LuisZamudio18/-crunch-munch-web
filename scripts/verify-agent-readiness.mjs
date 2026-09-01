#!/usr/bin/env node
/**
 * Smoke tests for the "agent readiness" fixes (404 handling, markdown
 * content negotiation, sitemap/robots/llms.txt, JSON-LD, metadata, MCP
 * server). The project has no unit-test framework installed, so this is a
 * lightweight, dependency-free script instead of a bigger test-runner
 * addition — run it against a running server:
 *
 *   npm run build && npm run start &
 *   BASE_URL=http://localhost:3000 npm run verify
 *
 * Exits non-zero (and prints every failure) if any check fails.
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

  // 1. Agent-friendly 404
  {
    const res = await fetch(`${BASE_URL}/this-path-does-not-exist-${Date.now()}`);
    const body = await res.text();
    check('404: real HTTP 404 status', res.status === 404, `got ${res.status}`);
    check('404: has recovery links (sitemap + llms.txt)', body.includes('/sitemap.xml') && body.includes('/llms.txt'));
  }

  // 2. Markdown content negotiation
  for (const path of ['/', '/about', '/contact', '/privacy']) {
    const res = await fetch(`${BASE_URL}${path}`, { headers: { Accept: 'text/markdown' } });
    const contentType = res.headers.get('content-type') || '';
    const vary = res.headers.get('vary') || '';
    check(`markdown negotiation ${path}: Content-Type text/markdown`, contentType.includes('text/markdown'), contentType);
    check(`markdown negotiation ${path}: Vary includes Accept`, /(^|,\s*)accept(\s*,|$)/i.test(vary), vary);
    const body = await res.text();
    check(`markdown negotiation ${path}: non-empty markdown body`, body.trim().startsWith('#'));
  }
  {
    const res = await fetch(`${BASE_URL}/`, { headers: { Accept: 'text/html' } });
    const contentType = res.headers.get('content-type') || '';
    check('markdown negotiation /: plain HTML request still gets text/html', contentType.includes('text/html'), contentType);
  }

  // 3 & 6. llms.txt with when-to-use guidance
  {
    const res = await fetch(`${BASE_URL}/llms.txt`);
    const body = await res.text();
    check('llms.txt: 200 OK', res.status === 200);
    check('llms.txt: has "When to use this" section', body.includes('When to use this'));
    check('llms.txt: links to MCP + sitemap', body.includes('/api/mcp') && body.includes('/sitemap.xml'));
  }

  // 3. Developer resource discoverability
  {
    const res = await fetch(`${BASE_URL}/developers`);
    const body = await res.text();
    check('/developers: 200 OK', res.status === 200);
    check('/developers: mentions MCP endpoint', body.includes('/api/mcp'));
  }

  // 5 & 8. JSON-LD structured data (Organization/LocalBusiness completeness)
  {
    const res = await fetch(`${BASE_URL}/`);
    const body = await res.text();
    const match = body.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    check('homepage: has JSON-LD script tag', !!match);
    if (match) {
      const json = JSON.parse(match[1]);
      check('JSON-LD: has name/description/url', !!(json.name && json.description && json.url));
      check('JSON-LD: has contactPoint', !!json.contactPoint);
      check('JSON-LD: has address (PostalAddress)', json.address?.['@type'] === 'PostalAddress');
    }
  }

  // 7. Sitemap
  {
    const res = await fetch(`${BASE_URL}/sitemap.xml`);
    const body = await res.text();
    check('sitemap.xml: 200 OK', res.status === 200);
    check('sitemap.xml: valid-looking XML with <urlset>', body.includes('<urlset') && body.includes('<loc>'));
  }

  // robots.txt (supporting sitemap discovery)
  {
    const res = await fetch(`${BASE_URL}/robots.txt`);
    const body = await res.text();
    check('robots.txt: 200 OK', res.status === 200);
    check('robots.txt: references sitemap', body.includes('sitemap.xml'));
  }

  // 9. Trust anchor pages (>= 500 chars of visible text each)
  for (const path of ['/about', '/contact', '/privacy']) {
    const res = await fetch(`${BASE_URL}${path}`);
    const html = await res.text();
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    check(`${path}: 200 OK`, res.status === 200);
    check(`${path}: has >= 500 chars of content`, text.length >= 500, `${text.length} chars`);
  }

  // 10. Metadata completeness on homepage
  {
    const res = await fetch(`${BASE_URL}/`);
    const body = await res.text();
    check('metadata: <link rel="canonical">', /<link rel="canonical"/.test(body));
    check('metadata: <html lang="...">', /<html lang="[a-z-]+"/.test(body));
    check('metadata: og:image', /<meta property="og:image"/.test(body));
    check('metadata: og:type', /<meta property="og:type"/.test(body));
  }
  {
    const res = await fetch(`${BASE_URL}/opengraph-image`);
    check('opengraph-image: 200 OK image/png', res.status === 200 && (res.headers.get('content-type') || '').includes('image/png'));
  }

  // 11. MCP server + well-known handshake
  {
    const res = await fetch(`${BASE_URL}/.well-known/mcp`);
    const json = await res.json();
    check('/.well-known/mcp: 200 OK JSON', res.status === 200);
    check('/.well-known/mcp: points at /api/mcp streamable-http', json?.mcp?.endpoint?.endsWith('/api/mcp') && json?.mcp?.transport === 'streamable-http');
  }
  {
    const res = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      }),
    });
    const bodyText = await res.text();
    const dataLine = bodyText.split('\n').find((l) => l.startsWith('data:'));
    const payload = dataLine ? JSON.parse(dataLine.slice(5)) : null;
    const toolNames = payload?.result?.tools?.map((t) => t.name) ?? [];
    check('MCP tools/list: 200 OK', res.status === 200, `got ${res.status}`);
    check(
      'MCP tools/list: exposes list_services, get_service, build_quote_link',
      ['list_services', 'get_service', 'build_quote_link'].every((n) => toolNames.includes(n)),
      toolNames.join(', ')
    );
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
