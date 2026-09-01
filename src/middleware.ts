import { NextRequest, NextResponse } from 'next/server';
import {
  renderAboutMarkdown,
  renderContactMarkdown,
  renderHomeMarkdown,
  renderPrivacyMarkdown,
} from '@/lib/markdown';

// acceptmarkdown.com content negotiation: pages listed here can be fetched
// as text/markdown by sending `Accept: text/markdown`. Scoped to these exact
// paths only (see `matcher` below) so static assets, images, RSC/_next
// internals, and API routes are never touched by this middleware.
const MARKDOWN_RENDERERS: Record<string, () => string> = {
  '/': renderHomeMarkdown,
  '/about': renderAboutMarkdown,
  '/contact': renderContactMarkdown,
  '/privacy': renderPrivacyMarkdown,
};

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

  // HTML path: let Next.js render normally. We still set Vary here in case
  // a future Next.js version (or a non-static render of this route) honors
  // it — verified on Next.js 14.2.5 that for statically-optimized pages the
  // App Router's own RSC cache Vary header (`RSC, Next-Router-State-Tree,
  // Next-Router-Prefetch, Accept-Encoding`) always wins over anything set
  // here or in next.config.js `headers()`, so this line is currently a
  // no-op for `/`, `/about`, `/contact`, `/privacy` in production. The
  // markdown branch above is unaffected — it returns a plain Response that
  // bypasses Next's page renderer entirely, so its Vary header is honored.
  const response = NextResponse.next();
  response.headers.set('Vary', 'Accept, Accept-Encoding');
  return response;
}

export const config = {
  matcher: ['/', '/about', '/contact', '/privacy'],
};
