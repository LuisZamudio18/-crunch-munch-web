'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import BrandName from '@/components/ui/BrandName';
import { toppingImage } from '@/lib/toppingImage';
import { errorText, fetchOrder, fetchSession, ordersConfigured, pingOwner, placeOrder, type FontKey, type OrderState, type OrderTheme, type PublicBar, type PublicSession } from '@/lib/orderApi';

/**
 * The page behind the QR at the bar and the tables: the event's menu with pictures, a short form, and the live state
 * of each order. Its look (colors, letters, cover picture) comes from the event's invitation, set in the agenda.
 * She decides when each bar starts; until then guests see that the service begins in a moment.
 */

const DEFAULT_THEME: OrderTheme = { bg: '#FBF9F5', ink: '#2F2520', accent: '#96773A', accentInk: '#FFFFFF', card: '#F2EDE5', font: 'elegante', stickers: true };

const FONTS: Record<FontKey, { heading: string; body: string; italic?: boolean }> = {
  elegante: { heading: 'var(--font-bodoni), Georgia, serif', body: 'var(--font-montserrat), system-ui, sans-serif' },
  clasico: { heading: 'var(--font-cormorant), Georgia, serif', body: 'var(--font-montserrat), system-ui, sans-serif', italic: true },
  moderno: { heading: 'var(--font-poppins), system-ui, sans-serif', body: 'var(--font-poppins), system-ui, sans-serif' },
  divertido: { heading: 'var(--font-fredoka), system-ui, sans-serif', body: 'var(--font-fredoka), system-ui, sans-serif' },
};

/** A sticker that fits the bar (the brand's own illustrations). */
function stickerFor(bar: string): string {
  const b = bar.toLowerCase();
  if (/coffee|caf[eé]|latte|frapp/.test(b)) return '/stickers/06-taza-latte.webp';
  if (/drink|cantarit|mimosa|coctel|cocktail|mocktail|bebida/.test(b)) return '/stickers/02-cocktail-frutos-rojos.webp';
  if (/crep|hot ?cake|dona|helado|postre|dulce|cake|rolle|dessert/.test(b)) return '/stickers/08-pastel-frutos-rojos.webp';
  return '/stickers/20-barra.webp';
}

const instagramUrl = (handle: string) => `https://www.instagram.com/${handle.replace(/^@/, '').trim()}`;

interface Saved {
  name: string;
  phone: string;
  /** Orders placed from this phone on this page, so the cup reminder shows before the second one. */
  orders: { id: string; bar: string }[];
}

const storeKey = (code: string) => `cm-pedido-${code.toUpperCase()}`;
function readSaved(code: string): Saved {
  try {
    const raw = JSON.parse(localStorage.getItem(storeKey(code)) ?? '{}');
    return { name: raw.name ?? '', phone: raw.phone ?? '', orders: Array.isArray(raw.orders) ? raw.orders.slice(-12) : [] };
  } catch {
    return { name: '', phone: '', orders: [] };
  }
}
function writeSaved(code: string, saved: Saved) {
  try {
    localStorage.setItem(storeKey(code), JSON.stringify(saved));
  } catch {
    /* private mode: the page works without remembering */
  }
}

type Picks = Record<string, string[]>;
const ACTIVE = ['nuevo', 'preparando', 'listo'];

export default function OrderPage() {
  const code = useParams<{ code: string }>()?.code ?? '';
  const [session, setSession] = useState<PublicSession | 'loading' | 'missing' | 'error'>('loading');
  const [barId, setBarId] = useState('');
  const [picks, setPicks] = useState<Picks>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<Saved>({ name: '', phone: '', orders: [] });
  const [states, setStates] = useState<Record<string, OrderState>>({});

  // The menu and each bar's state; refreshed so the page opens by itself when she starts the service
  const loadSession = useCallback(async () => {
    try {
      const s = await fetchSession(code);
      setSession(s ?? 'missing');
    } catch {
      setSession((cur) => (typeof cur === 'object' ? cur : 'error'));
    }
  }, [code]);

  useEffect(() => {
    if (!ordersConfigured) {
      setSession('error');
      return;
    }
    void loadSession();
    const timer = setInterval(() => void loadSession(), 8000);
    const visible = () => document.visibilityState === 'visible' && void loadSession();
    document.addEventListener('visibilitychange', visible);
    const s = readSaved(code);
    setSaved(s);
    setName(s.name);
    setPhone(s.phone);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [code, loadSession]);

  // Follow this guest's orders until they are delivered
  const trackedKey = saved.orders.map((o) => o.id).join(',');
  const poll = useCallback(async () => {
    const ids = trackedKey ? trackedKey.split(',') : [];
    const next: Record<string, OrderState> = {};
    await Promise.all(
      ids.map(async (id) => {
        try {
          const o = await fetchOrder(id);
          if (o) next[id] = o;
        } catch {
          /* keeps the last known state */
        }
      })
    );
    setStates((cur) => ({ ...cur, ...next }));
  }, [trackedKey]);
  useEffect(() => {
    if (!trackedKey) return;
    void poll();
    const timer = setInterval(() => void poll(), 4000);
    const visible = () => document.visibilityState === 'visible' && void poll();
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [trackedKey, poll]);

  const active = Object.entries(states).filter(([, o]) => ACTIVE.includes(o.status));
  const anyReady = active.some(([, o]) => o.status === 'listo');
  useEffect(() => {
    if (!anyReady) return;
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
    const base = document.title;
    document.title = '¡Tu pedido está listo!';
    return () => {
      document.title = base;
    };
  }, [anyReady]);

  const theme: OrderTheme = useMemo(() => ({ ...DEFAULT_THEME, ...(typeof session === 'object' ? session.theme : {}) }), [session]);
  const font = FONTS[theme.font] ?? FONTS.elegante;
  const vars = { fontFamily: font.body, background: theme.bg, color: theme.ink } as CSSProperties;
  const headingStyle: CSSProperties = { fontFamily: font.heading, fontStyle: font.italic ? 'italic' : 'normal' };
  const dark = theme.ink.toLowerCase() === '#ffffff';

  if (session === 'loading') return <main className="grid min-h-screen place-items-center text-lg" style={{ background: DEFAULT_THEME.bg, color: DEFAULT_THEME.ink }}>Cargando el menú…</main>;
  if (session === 'missing' || session === 'error') {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center" style={{ background: DEFAULT_THEME.bg, color: DEFAULT_THEME.ink }}>
        <div>
          <p className="text-3xl" style={{ fontFamily: 'var(--font-bodoni), serif' }}>{session === 'missing' ? 'No encontramos este menú' : 'No pudimos cargar el menú'}</p>
          <p className="mt-3 text-lg opacity-75">{session === 'missing' ? 'Revisa que el código QR sea el de tu evento.' : 'Revisa tu conexión e inténtalo de nuevo.'}</p>
        </div>
      </main>
    );
  }

  const bars = session.bars;
  const many = bars.length > 1;
  // Default bar: the first one already serving, else the first
  const bar: PublicBar | undefined = bars.find((b) => b.id === barId) ?? bars.find((b) => b.status === 'abierta') ?? bars[0];
  const barById = (id: string) => bars.find((b) => b.id === id);

  const chosen = (sectionId: string) => picks[sectionId] ?? [];
  const toggle = (sectionId: string, multi: boolean, item: string) =>
    setPicks((p) => {
      const cur = p[sectionId] ?? [];
      if (!multi) return { ...p, [sectionId]: cur[0] === item ? [] : [item] };
      return { ...p, [sectionId]: cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item] };
    });
  const lines = (bar?.menu ?? []).flatMap((s) => chosen(s.id).map((n) => ({ section: s.title, name: n })));
  const digits = phone.replace(/\D/g, '');
  const ready = lines.length > 0 && name.trim().length > 0 && digits.length >= 10;
  const orderedHere = bar ? saved.orders.filter((o) => o.bar === bar.id).length : 0;

  async function submit() {
    if (!bar || !ready || busy) return;
    setBusy(true);
    setError('');
    try {
      const order = await placeOrder(code, bar.id, name.trim(), phone, lines, note.trim());
      pingOwner(order.id);
      const next: Saved = { name: name.trim(), phone, orders: [...saved.orders, { id: order.id, bar: bar.id }] };
      setSaved(next);
      writeSaved(code, next);
      setStates((s) => ({ ...s, [order.id]: { number: order.number, bar_id: bar.id, status: 'nuevo', is_refill: order.is_refill, name: name.trim(), items: lines, ahead: 0 } }));
      setPicks({});
      setNote('');
      setShowNote(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(errorText(e));
      void loadSession();
    }
    setBusy(false);
  }

  const input = 'h-16 w-full rounded-2xl border-2 bg-transparent px-5 text-lg outline-none focus:ring-2';
  const inputStyle: CSSProperties = { borderColor: `${theme.ink}33`, color: theme.ink };
  const label = 'mb-2 block text-sm font-semibold uppercase tracking-widest opacity-70';
  const summary = lines.map((l) => l.name).join(', ');

  /** One menu item: the product picture floating over its card, like on the website. */
  const item = (sectionId: string, title: string, multi: boolean, itemName: string, selectable: boolean) => {
    const on = chosen(sectionId).includes(itemName);
    const img = toppingImage(itemName, title);
    return (
      <label key={itemName} className={`relative flex min-h-[84px] items-center gap-4 rounded-3xl py-3 pl-3 pr-4 transition-transform ${selectable ? 'cursor-pointer active:scale-[0.98]' : 'opacity-80'}`} style={on ? { background: theme.accent, color: theme.accentInk } : { background: theme.card }}>
        {selectable && <input type={multi ? 'checkbox' : 'radio'} name={sectionId} className="peer sr-only" checked={on} onChange={() => toggle(sectionId, multi, itemName)} />}
        <span className="relative grid h-[72px] w-[72px] shrink-0 place-items-center" aria-hidden="true">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" loading="lazy" className="h-full w-full object-contain drop-shadow-[0_6px_6px_rgba(0,0,0,0.28)]" />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-full text-2xl font-semibold" style={{ background: on ? `${theme.accentInk}22` : `${theme.accent}26`, color: on ? theme.accentInk : theme.accent, ...headingStyle }}>
              {itemName.trim().charAt(0).toUpperCase()}
            </span>
          )}
        </span>
        <span className="flex-1 text-xl font-semibold leading-snug">{itemName}</span>
        {selectable && (
          <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center border-2 text-base ${multi ? 'rounded-lg' : 'rounded-full'}`} style={{ borderColor: on ? theme.accentInk : `${theme.ink}55` }}>
            {on ? '✓' : ''}
          </span>
        )}
        {selectable && <span className="pointer-events-none absolute inset-0 rounded-3xl peer-focus-visible:ring-4 peer-focus-visible:ring-current" aria-hidden="true" />}
      </label>
    );
  };

  const menu = (selectable: boolean) =>
    bar?.menu.map((section) => (
      <fieldset key={section.id} className="space-y-3">
        <legend className="mb-1 text-2xl leading-tight" style={headingStyle}>
          {section.title}
        </legend>
        {selectable && section.multi && <p className="-mt-1 text-base opacity-70">Puedes elegir varios</p>}
        <div className="grid gap-3">{section.items.map((it) => item(section.id, section.title, section.multi, it.name, selectable))}</div>
      </fieldset>
    ));

  return (
    <main className="min-h-screen" style={vars}>
      <div className="mx-auto max-w-md pb-40">
        {/* Cover */}
        <header className="relative">
          {theme.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={theme.banner} alt="" className="h-56 w-full object-cover" style={{ objectPosition: `50% ${theme.bannerY ?? 30}%` }} />
          ) : (
            <div className="h-28" style={{ background: `linear-gradient(135deg, ${theme.accent}40, ${theme.card})` }} />
          )}
          <span className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1.5 text-[13px] text-white backdrop-blur-sm">
            <BrandName className="brand-name--light" ampClassName="text-[#c7a86a]" />
          </span>
          {theme.stickers !== false && bar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={stickerFor(bar.name)} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-14 right-4 w-20 drop-shadow-md" />
          )}
        </header>

        <div className="px-5 pt-6">
          <h1 className="pr-24 text-4xl leading-[1.05]" style={headingStyle}>{session.title}</h1>
          {(theme.welcome || session.subtitle) && <p className="mt-3 text-lg opacity-80">{theme.welcome || session.subtitle}</p>}
        </div>

        {/* This guest's orders in progress */}
        {active.length > 0 && (
          <section className="mt-6 space-y-3 px-5" aria-live="polite" aria-label="Tus pedidos">
            {active.map(([id, o]) => {
              const isReady = o.status === 'listo';
              const orderBar = barById(o.bar_id);
              return (
                <div key={id} className="rounded-3xl p-6" style={isReady ? { background: theme.accent, color: theme.accentInk } : { background: theme.card }}>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-80">
                    Tu pedido #{o.number}
                    {many && orderBar ? ` · ${orderBar.name}` : ''}
                  </p>
                  {isReady ? (
                    <>
                      <p className="mt-2 text-4xl leading-tight" style={headingStyle}>¡Tu pedido está listo!</p>
                      <p className="mt-2 text-xl">Pasa por él a la barra{orderBar ? ` (${orderBar.name})` : ''}. 🙌</p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-3xl leading-tight" style={headingStyle}>{o.status === 'preparando' ? 'Lo estamos preparando' : 'Recibimos tu pedido'}</p>
                      <p className="mt-2 text-lg opacity-85">{o.ahead > 0 ? `Hay ${o.ahead} pedido${o.ahead === 1 ? '' : 's'} antes que el tuyo.` : 'Eres el siguiente.'} Te avisamos aquí y por WhatsApp.</p>
                    </>
                  )}
                  <p className="mt-3 text-xl font-semibold">{o.items.map((i) => i.name).join(', ')}</p>
                  {o.is_refill && orderBar?.refill && (
                    <p className="mt-4 rounded-2xl px-4 py-3 text-lg font-medium" style={isReady ? { background: theme.accentInk, color: theme.accent } : { background: theme.accent, color: theme.accentInk }}>
                      🥤 Recuerda traer tu vaso para rellenarlo.
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Which bar (only when the event has more than one) */}
        {many && (
          <div className="mt-7 grid grid-cols-2 gap-3 px-5" role="tablist" aria-label="Barras">
            {bars.map((b) => {
              const on = b.id === bar?.id;
              return (
                <button key={b.id} type="button" role="tab" aria-selected={on} onClick={() => { setBarId(b.id); setPicks({}); setError(''); }} className="rounded-3xl px-4 py-4 text-left transition-colors" style={on ? { background: theme.accent, color: theme.accentInk } : { background: theme.card }}>
                  <span className="block text-xl font-semibold leading-tight">{b.name}</span>
                  <span className="mt-1 block text-sm opacity-80">{b.status === 'abierta' ? 'Recibiendo pedidos' : b.status === 'espera' ? 'Empieza en un momento' : 'Servicio terminado'}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Waiting for the service to start */}
        {bar?.status === 'espera' && (
          <>
            <section className="mx-5 mt-7 rounded-3xl p-7 text-center" style={{ background: theme.card }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stickerFor(bar.name)} alt="" aria-hidden="true" className="mx-auto h-24 w-24 object-contain drop-shadow-md" />
              <p className="mt-3 text-3xl leading-tight" style={headingStyle}>En un momento más empezamos el servicio</p>
              <p className="mt-3 text-lg opacity-80">Mientras tanto, mira lo que tendremos en {bar.name}. Esta página se abre sola cuando comencemos.</p>
            </section>
            <div className="mt-8 space-y-8 px-5">{menu(false)}</div>
          </>
        )}

        {bar?.status === 'cerrada' && (
          <section className="mx-5 mt-7 rounded-3xl p-7 text-center" style={{ background: theme.card }}>
            <p className="text-3xl leading-tight" style={headingStyle}>El servicio de {bar.name} terminó</p>
            <p className="mt-3 text-lg opacity-80">¡Gracias por celebrar con nosotros! 💛</p>
          </section>
        )}

        {/* Menu and form */}
        {bar?.status === 'abierta' && (
          <form
            className="mt-8 space-y-10 px-5"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            {bar.refill && orderedHere > 0 && <p className="rounded-2xl px-5 py-4 text-lg font-medium" style={{ background: theme.card }}>🥤 Como ya pediste antes, recuerda traer tu vaso para rellenarlo.</p>}
            <div className="space-y-9">{menu(true)}</div>
            {bar.menu.length === 0 && <p className="text-lg opacity-70">El menú todavía no está listo. Pregunta en la barra.</p>}

            <div className="space-y-5">
              <p className="text-2xl" style={headingStyle}>Tus datos</p>
              <div>
                <label htmlFor="o-nombre" className={label}>Tu nombre</label>
                <input id="o-nombre" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className={input} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="o-tel" className={label}>Tu teléfono (WhatsApp)</label>
                <input id="o-tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className={input} style={inputStyle} />
                <p className="mt-2 text-base opacity-70">Solo lo usamos para avisarte que tu pedido está listo.</p>
              </div>
              {showNote ? (
                <div>
                  <label htmlFor="o-nota" className={label}>Algo más</label>
                  <input id="o-nota" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Sin hielo, poco dulce…" className={input} style={inputStyle} />
                </div>
              ) : (
                <button type="button" className="min-h-[48px] text-lg underline opacity-80" onClick={() => setShowNote(true)}>
                  + Agregar una nota (sin hielo, poco dulce…)
                </button>
              )}
            </div>

            {error && <p role="alert" className="rounded-2xl px-5 py-4 text-lg font-medium" style={{ background: theme.card }}>{error}</p>}

            <div className="fixed inset-x-0 bottom-0 z-10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4" style={{ background: `linear-gradient(to top, ${theme.bg} 72%, transparent)` }}>
              <div className="mx-auto max-w-md">
                <button type="submit" disabled={!ready || busy} className="min-h-[64px] w-full rounded-full px-6 py-2 text-lg font-semibold shadow-lg transition-opacity disabled:opacity-45" style={{ background: theme.accent, color: theme.accentInk }}>
                  {busy ? 'Enviando…' : lines.length === 0 ? 'Elige algo del menú' : !name.trim() || digits.length < 10 ? 'Falta tu nombre y teléfono' : `Pedir ${lines.length > 1 ? `(${lines.length})` : ''}`}
                  {lines.length > 0 && !busy && <span className="block truncate text-sm font-normal opacity-90">{summary}</span>}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* A small thank-you with the brand's Instagram, not in the way */}
        {session.instagram && (
          <section className="mx-5 mt-14 rounded-3xl p-6 text-center" style={{ background: theme.card }}>
            {theme.stickers !== false && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/stickers/13-cafe-llevar.webp" alt="" aria-hidden="true" className="mx-auto mb-2 h-16 w-auto drop-shadow" />
            )}
            <p className="text-2xl leading-tight" style={headingStyle}>¿Te está gustando nuestra barra?</p>
            <p className="mt-2 text-lg opacity-85">Regálanos una historia en Instagram y etiquétanos. ¡Nos encantará verte!</p>
            <a href={instagramUrl(session.instagram)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-[52px] max-w-full items-center justify-center rounded-full px-5 text-base font-semibold" style={{ background: theme.accent, color: theme.accentInk }}>
              {session.instagram.startsWith('@') ? session.instagram : `@${session.instagram}`}
            </a>
          </section>
        )}

        <footer className="mt-10 px-5 text-center text-lg opacity-80">
          <BrandName className={dark ? 'brand-name--light' : ''} ampClassName="text-[#96773a]" />
          <p className="mt-2 text-xs uppercase tracking-[0.3em] opacity-70">Snack Bar</p>
        </footer>
      </div>
    </main>
  );
}
