'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

/** Loads Instagram's official public embed widget exactly once, however many cards are on the page. */
function loadEmbedScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.instgrm) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="instagram.com/embed.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      console.error('[instagram] No se pudo cargar embed.js — las tarjetas quedan como link simple a la publicación.');
      resolve(); // don't block other cards; the plain <blockquote> link still works
    };
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}

interface InstagramEmbedCardProps {
  permalink: string;
}

/**
 * Renders one Instagram post/reel via Instagram's own public embed widget
 * (https://www.instagram.com/embed.js) — no Graph API, no access token, no
 * login. Works for any public post: paste the link, Instagram's script
 * turns the <blockquote> below into its native embedded player/card.
 */
export default function InstagramEmbedCard({ permalink }: InstagramEmbedCardProps) {
  useEffect(() => {
    let cancelled = false;
    loadEmbedScript().then(() => {
      if (!cancelled) window.instgrm?.Embeds.process();
    });
    return () => {
      cancelled = true;
    };
  }, [permalink]);

  return (
    <div className="rounded-2xl overflow-hidden bg-cream-50 shadow-md flex justify-center">
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
    </div>
  );
}
