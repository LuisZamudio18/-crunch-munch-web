import { NextRequest, NextResponse } from 'next/server';
import {
  renderAboutMarkdown,
  renderContactMarkdown,
  renderHomeMarkdown,
  renderNotFoundMarkdown,
  renderPrivacyMarkdown,
} from '@/lib/markdown';

// acceptmarkdown.com content negotiation: pages listed here can be fetched
// as text/markdown by sending `Accept: text/markdown`. Scoped to these exact
// paths (plus the "unknown path" 404 branch below) so static assets,
// images, RSC/_next internals, and API routes are never touched by this
// middleware.
const MARKDOWN_RENDERERS: Partial<Record<string, () => string>> = {
  '/': renderHomeMarkdown,
  '/about': renderAboutMarkdown,
  '/contact': renderContactMarkdown,
  '/privacy': renderPrivacyMarkdown,
};

// Every real route this site serves, besides the four above. Used only to
// tell a genuine 404 apart from a negotiated page when deciding whether to
// hand back a markdown 404 body (see below) — this site has no dynamic
// user-generated routes, so an explicit allowlist is safe and won't shadow
// a real page.
const OTHER_KNOWN_PATHS = new Set([
  '/developers',
  '/llms.txt',
  '/sitemap.xml',
  '/robots.txt',
  '/opengraph-image',
  '/openapi.json',
]);
const KNOWN_PREFIXES = ['/api/', '/.well-known/', '/barras/', '/images/', '/_next/'];

function isKnownPath(pathname: string): boolean {
  if (pathname in MARKDOWN_RENDERERS || OTHER_KNOWN_PATHS.has(pathname)) return true;
  if (KNOWN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true;
  // Anything with a file extension (favicon.ico, a future manifest.json,
  // etc.) is left to Next's normal static/404 handling rather than being
  // treated as a "fake page" 404.
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

interface MediaRangePreference {
  type: string;
  q: number;
}

function parseAccept(accept: string): MediaRangePreference[] {
  return accept
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [type, ...params] = part.split(';').map((s) => s.trim());
      const qParam = params.find((p) => p.startsWith('q='));
      const q = qParam ? parseFloat(qParam.slice(2)) : 1;
      return { type: type.toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    });
}

/** True when the request's Accept header ranks text/markdown at or above text/html. */
function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const prefs = parseAccept(accept);
  const markdownPref = prefs.find((p) => p.type === 'text/markdown');
  if (!markdownPref) return false;

  const htmlPref = prefs.find((p) => p.type === 'text/html' || p.type === '*/*');
  if (!htmlPref) return true;
  return markdownPref.q >= htmlPref.q;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const render = MARKDOWN_RENDERERS[pathname];
  const accept = request.headers.get('accept');

  if (render && prefersMarkdown(accept)) {
    return new NextResponse(render(), {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        // Tell caches/CDNs the body depends on Accept, so the markdown
        // variant is never served to a browser asking for text/html (or
        // vice versa) from a shared cache entry.
        Vary: 'Accept, Accept-Encoding',
      },
    });
  }

  // Agent-friendly 404: a request for a path this site doesn't serve, with
  // an Accept header that prefers markdown, gets a real 404 status *and* a
  // short markdown body with recovery links — instead of Next's default
  // 404 HTML page, which agents asking for text/markdown shouldn't have to
  // parse. (A plain browser request for an unknown path still falls
  // through to the styled not-found.tsx page below, unaffected.)
  if (!render && !isKnownPath(pathname) && prefersMarkdown(accept)) {
    return new NextResponse(renderNotFoundMarkdown(pathname), {
      status: 404,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        Vary: 'Accept, Accept-Encoding',
      },
    });
  }

  if (render) {
    // HTML path for one of the negotiated pages: let Next.js render
    // normally. We still set Vary here in case a future Next.js version (or
    // a non-static render of this route) honors it — verified on Next.js
    // 14.2.5 that for statically-optimized pages the App Router's own RSC
    // cache Vary header (`RSC, Next-Router-State-Tree, Next-Router-Prefetch,
    // Accept-Encoding`) always wins over anything set here or in
    // next.config.js `headers()`, so this is currently a no-op in
    // production. The markdown branch above is unaffected — it returns a
    // plain Response that bypasses Next's page renderer entirely, so its
    // Vary header is honored.
    const response = NextResponse.next();
    response.headers.set('Vary', 'Accept, Accept-Encoding');
    return response;
  }

  // Everything else (known extra pages, API/MCP routes, static assets, or a
  // genuinely unknown path with a plain-HTML Accept header) is untouched —
  // Next.js handles routing and 404s for it normally.
  return NextResponse.next();
}

export const config = {
  // Runs on every path except Next's own static/image internals and the
  // site's static asset folders, so the "unknown path" 404 branch above can
  // see requests for pages that don't exist. See isKnownPath() for how
  // known static/API paths are excluded from the 404 logic itself.
  matcher: ['/((?!_next/static|_next/image|barras/|images/).*)'],
};
