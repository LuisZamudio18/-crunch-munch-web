'use client';

import { useEffect, useRef, useState } from 'react';
import { loadInstagramEmbedScript } from '@/lib/instagramEmbed';

interface InstagramEmbedCardProps {
  permalink: string;
}

/**
 * Renders one Instagram post/reel via Instagram's own public embed widget
 * (https://www.instagram.com/embed.js) — no Graph API, no access token, no
 * login. Works for any public post: paste the link, Instagram's script
 * turns the <blockquote> below into its native embedded player/card.
 *
 * Lazy-loaded via IntersectionObserver: the <blockquote> only mounts (and
 * gets processed into a real embed) once it scrolls near the viewport.
 * With many embeds on one page, having all of them fire their embed
 * request to Instagram in the same instant is what caused every card but
 * the first to get stuck at a collapsed height — Instagram's resize
 * handshake never completed for the rest. Spacing the requests out as the
 * visitor scrolls avoids that burst.
 */
export default function InstagramEmbedCard({ permalink }: InstagramEmbedCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px 0px' } // start loading well before it's actually on screen
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldRender) return;
    let cancelled = false;
    loadInstagramEmbedScript().then(() => {
      if (cancelled) return;
      window.instgrm?.Embeds.process();
      // A short retry catches this one post if its first request was slow;
      // harmless no-op once it's already resized.
      setTimeout(() => window.instgrm?.Embeds.process(), 1500);
    });
    return () => {
      cancelled = true;
    };
  }, [shouldRender]);

  return (
    <div ref={containerRef} className="rounded-2xl overflow-hidden bg-cream-50 shadow-md flex justify-center min-h-[400px]">
      {shouldRender ? (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={permalink}
          data-instgrm-version="14"
          style={{ background: '#FFF', border: 0, margin: 0, maxWidth: 540, minWidth: 300, width: '100%' }}
        >
          <a href={permalink} target="_blank" rel="noopener noreferrer" className="block p-6 text-center text-coffee-500 text-sm">
            Ver esta publicación en Instagram
          </a>
        </blockquote>
      ) : (
        <div className="w-full h-full animate-pulse bg-coffee-100" aria-hidden="true" />
      )}
    </div>
  );
}
