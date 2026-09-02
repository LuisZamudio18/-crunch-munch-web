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
    const unknownPath = `/this-path-does-not-exist-${Date.now()}`;
    const res = await fetch(`${BASE_URL}${unknownPath}`);
    const body = await res.text();
    check('404: real HTTP 404 status', res.status === 404, `got ${res.status}`);
    check('404: has recovery links (sitemap + llms.txt)', body.includes('/sitemap.xml') && body.includes('/llms.txt'));

    const mdRes = await fetch(`${BASE_URL}${unknownPath}`, { headers: { Accept: 'text/markdown' } });
    const mdContentType = mdRes.headers.get('content-type') || '';
    const mdBody = await mdRes.text();
    check('404 + Accept: text/markdown: still a real 404 status', mdRes.status === 404, `got ${mdRes.status}`);
    check('404 + Accept: text/markdown: Content-Type text/markdown', mdContentType.includes('text/markdown'), mdContentType);
    check('404 + Accept: text/markdown: markdown body with recovery links', mdBody.trim().startsWith('#') && mdBody.includes('/sitemap.xml'));
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

  // 2, 3, 5, 6. REST API: OpenAPI spec + JSON error responses + typed schemas
  {
    const res = await fetch(`${BASE_URL}/openapi.json`);
    const spec = await res.json();
    check('/openapi.json: 200 OK', res.status === 200);
    check('/openapi.json: openapi 3.x', /^3\./.test(spec.openapi || ''));
    const ops = Object.values(spec.paths || {}).flatMap((methods) => Object.values(methods));
    check('/openapi.json: every operation has an operationId', ops.length > 0 && ops.every((op) => typeof op.operationId === 'string' && op.operationId.length > 0));
    check('/openapi.json: operationIds are unique', new Set(ops.map((op) => op.operationId)).size === ops.length);
    check('/openapi.json: every operation has a description', ops.every((op) => typeof op.description === 'string' && op.description.length > 0));
    check('/openapi.json: every operation has typed responses', ops.every((op) => op.responses && Object.keys(op.responses).length > 0));
  }
  {
    const res = await fetch(`${BASE_URL}/api/v1/services?category=bebidas`);
    const json = await res.json();
    check('GET /api/v1/services?category=bebidas: 200 OK', res.status === 200);
    check('GET /api/v1/services: returns data array', Array.isArray(json.data) && json.data.length > 0, JSON.stringify(json).slice(0, 120));
    check('GET /api/v1/services: filtered by category', json.data.every((s) => s.category === 'bebidas'));
  }
  {
    const res = await fetch(`${BASE_URL}/api/v1/services?category=not-a-real-category`);
    const json = await res.json();
    check('GET /api/v1/services?category=bad: 400', res.status === 400, `got ${res.status}`);
    check('GET /api/v1/services?category=bad: structured JSON error', !!json.error?.code && !!json.error?.message, JSON.stringify(json));
  }
  {
    const res = await fetch(`${BASE_URL}/api/v1/services/coffee-bar`);
    const json = await res.json();
    check('GET /api/v1/services/coffee-bar: 200 OK', res.status === 200);
    check('GET /api/v1/services/coffee-bar: has selectionGroups', Array.isArray(json.data?.selectionGroups));
  }
  {
    const res = await fetch(`${BASE_URL}/api/v1/services/not-a-real-id`);
    const json = await res.json();
    check('GET /api/v1/services/{unknown}: 404', res.status === 404, `got ${res.status}`);
    check('GET /api/v1/services/{unknown}: structured JSON error', json.error?.code === 'SERVICE_NOT_FOUND', JSON.stringify(json));
  }
  {
    const res = await fetch(`${BASE_URL}/api/v1/quote-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceIds: ['coffee-bar'] }),
    });
    const json = await res.json();
    check('POST /api/v1/quote-link: 200 OK', res.status === 200);
    check('POST /api/v1/quote-link: returns a wa.me url', typeof json.data?.url === 'string' && json.data.url.startsWith('https://wa.me/'), json.data?.url);
  }
  {
    const res = await fetch(`${BASE_URL}/api/v1/quote-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const json = await res.json();
    check('POST /api/v1/quote-link (missing serviceIds): 400', res.status === 400, `got ${res.status}`);
    check('POST /api/v1/quote-link (bad body): structured JSON error', !!json.error?.code, JSON.stringify(json));
  }
  {
    const res = await fetch(`${BASE_URL}/api/v1/services`, { method: 'POST' });
    const json = await res.json();
    check('POST /api/v1/services (wrong method): JSON 405, not HTML', res.status === 405 && json.error?.code === 'METHOD_NOT_ALLOWED', `${res.status} ${JSON.stringify(json)}`);
  }

  // 7. Developer resources reachable + named
  {
    const res = await fetch(`${BASE_URL}/developers`);
    const body = await res.text();
    check('/developers: mentions /openapi.json and /api/v1', body.includes('/openapi.json') && body.includes('/api/v1'));
  }

  // 11. MCP server + well-known handshake (live, not just a manifest)
  async function mcpToolsList(url) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
    });
    const bodyText = await res.text();
    const dataLine = bodyText.split('\n').find((l) => l.startsWith('data:'));
    const payload = dataLine ? JSON.parse(dataLine.slice(5)) : null;
    return { status: res.status, toolNames: payload?.result?.tools?.map((t) => t.name) ?? [] };
  }
  const EXPECTED_TOOLS = ['list_services', 'get_service', 'build_quote_link'];
  {
    const res = await fetch(`${BASE_URL}/.well-known/mcp`);
    const json = await res.json();
    check('/.well-known/mcp GET: 200 OK JSON manifest', res.status === 200);
    check('/.well-known/mcp GET: points at /api/mcp streamable-http', json?.mcp?.endpoint?.endsWith('/api/mcp') && json?.mcp?.transport === 'streamable-http');
  }
  {
    const { status, toolNames } = await mcpToolsList(`${BASE_URL}/api/mcp`);
    check('POST /api/mcp tools/list: 200 OK', status === 200, `got ${status}`);
    check('POST /api/mcp tools/list: exposes all 3 tools', EXPECTED_TOOLS.every((n) => toolNames.includes(n)), toolNames.join(', '));
  }
  {
    const { status, toolNames } = await mcpToolsList(`${BASE_URL}/.well-known/mcp`);
    check('POST /.well-known/mcp tools/list: live handshake works (200 OK)', status === 200, `got ${status}`);
    check('POST /.well-known/mcp tools/list: exposes all 3 tools', EXPECTED_TOOLS.every((n) => toolNames.includes(n)), toolNames.join(', '));
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
