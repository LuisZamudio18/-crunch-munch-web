declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

/**
 * Loads Instagram's official public embed widget (embed.js) exactly once
 * per page, however many <blockquote class="instagram-media"> posts are on
 * it. No Graph API, no access token, no login — this is the same script
 * blogs use to embed a public Instagram post.
 */
export function loadInstagramEmbedScript(): Promise<void> {
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
      resolve(); // don't block; the plain <blockquote> link still works
    };
    document.body.appendChild(script);
  });

  return scriptLoadPromise;
}
