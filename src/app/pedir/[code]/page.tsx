'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams } from 'next/navigation';
import { errorText, fetchOrder, fetchSession, ordersConfigured, pingOwner, placeOrder, type FontKey, type OrderState, type OrderTheme, type PlacedOrder, type PublicSession } from '@/lib/orderApi';

/**
 * The page behind the QR at the bar and the tables: the event's menu, a short form, and the live state of the order.
 * Its look (colors, letters, cover picture) comes from the event's invitation, set in the agenda.
 */

const DEFAULT_THEME: OrderTheme = { bg: '#FBF9F5', ink: '#2F2520', accent: '#96773A', accentInk: '#FFFFFF', card: '#F2EDE5', font: 'elegante', stickers: true };

const FONTS: Record<FontKey, { heading: string; body: string; italic?: boolean }> = {
  elegante: { heading: 'var(--font-bodoni), Georgia, serif', body: 'var(--font-montserrat), system-ui, sans-serif' },
  clasico: { heading: 'var(--font-cormorant), Georgia, serif', body: 'var(--font-montserrat), system-ui, sans-serif', italic: true },
  moderno: { heading: 'var(--font-poppins), system-ui, sans-serif', body: 'var(--font-poppins), system-ui, sans-serif' },
  divertido: { heading: 'var(--font-fredoka), system-ui, sans-serif', body: 'var(--font-fredoka), system-ui, sans-serif' },
};

/** A sticker that fits the bar (the brand's own illustrations). */
function stickerFor(bar: string | null): string {
  const b = (bar ?? '').toLowerCase();
  if (/coffee|caf[eé]|latte|frapp/.test(b)) return '/stickers/06-taza-latte.webp';
  if (/drink|cantarit|mimosa|coctel|cocktail|mocktail|bebida/.test(b)) return '/stickers/02-cocktail-frutos-rojos.webp';
  if (/crep|hot ?cake|dona|helado|postre|dulce|cake|rolle|dessert/.test(b)) return '/stickers/08-pastel-frutos-rojos.webp';
  return '/stickers/20-barra.webp';
}

interface Saved {
  name: string;
  phone: string;
  lastOrderId?: string;
  /** Orders placed from this phone on this page, so the refill reminder shows before the second one. */
  count: number;
}

const storeKey = (code: string) => `cm-pedido-${code.toUpperCase()}`;
function readSaved(code: string): Saved {
  try {
    return { name: '', phone: '', count: 0, ...JSON.parse(localStorage.getItem(storeKey(code)) ?? '{}') };
  } catch {
    return { name: '', phone: '', count: 0 };
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

export default function OrderPage() {
  const code = useParams<{ code: string }>()?.code ?? '';
  const [session, setSession] = useState<PublicSession | 'loading' | 'missing' | 'error'>('loading');
  const [picks, setPicks] = useState<Picks>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [state, setState] = useState<OrderState | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!ordersConfigured) {
      setSession('error');
      return;
    }
    fetchSession(code)
      .then((s) => setSession(s ?? 'missing'))
      .catch(() => setSession('error'));
    const saved = readSaved(code);
    setName(saved.name);
    setPhone(saved.phone);
    setCount(saved.count);
    if (saved.lastOrderId) {
      fetchOrder(saved.lastOrderId)
        .then((o) => {
          if (o && (o.status === 'nuevo' || o.status === 'preparando' || o.status === 'listo')) {
            setPlaced({ id: saved.lastOrderId as string, number: o.number, is_refill: o.is_refill, status: o.status });
            setState(o);
          }
        })
        .catch(() => undefined);
    }
  }, [code]);

  // Follow the order until it is delivered
  const orderId = placed?.id;
  const poll = useCallback(async () => {
    if (!orderId) return;
    try {
      const o = await fetchOrder(orderId);
      if (o) setState(o);
    } catch {
      /* keeps the last known state */
    }
  }, [orderId]);
  useEffect(() => {
    if (!orderId) return;
    const timer = setInterval(() => void poll(), 4000);
    const visible = () => document.visibilityState === 'visible' && void poll();
    document.addEventListener('visibilitychange', visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [orderId, poll]);

  const status = state?.status ?? placed?.status;
  useEffect(() => {
    if (status === 'listo') {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
      const base = document.title;
      document.title = '¡Tu pedido está listo!';
      return () => {
        document.title = base;
      };
    }
  }, [status]);

  const theme: OrderTheme = useMemo(() => ({ ...DEFAULT_THEME, ...(typeof session === 'object' ? session.theme : {}) }), [session]);
  const font = FONTS[theme.font] ?? FONTS.elegante;
  const vars = { '--bg': theme.bg, '--ink': theme.ink, '--accent': theme.accent, '--accent-ink': theme.accentInk, '--card': theme.card, fontFamily: font.body, background: theme.bg, color: theme.ink } as CSSProperties;
  const headingStyle: CSSProperties = { fontFamily: font.heading, fontStyle: font.italic ? 'italic' : 'normal' };

  if (session === 'loading') return <main className="grid min-h-screen place-items-center" style={{ background: DEFAULT_THEME.bg, color: DEFAULT_THEME.ink }}><p>Cargando el menú…</p></main>;
  if (session === 'missing' || session === 'error') {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center" style={{ background: DEFAULT_THEME.bg, color: DEFAULT_THEME.ink }}>
        <div>
          <p className="text-2xl" style={{ fontFamily: 'var(--font-bodoni), serif' }}>{session === 'missing' ? 'No encontramos este menú' : 'No pudimos cargar el menú'}</p>
          <p className="mt-2 text-sm opacity-75">{session === 'missing' ? 'Revisa que el código QR sea el de tu evento.' : 'Revisa tu conexión e inténtalo de nuevo.'}</p>
        </div>
      </main>
    );
  }

  const chosen = (sectionId: string) => picks[sectionId] ?? [];
  const toggle = (sectionId: string, multi: boolean, item: string) =>
    setPicks((p) => {
      const cur = p[sectionId] ?? [];
      if (!multi) return { ...p, [sectionId]: [item] };
      return { ...p, [sectionId]: cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item] };
    });
  const lines = session.menu.flatMap((s) => chosen(s.id).map((n) => ({ section: s.title, name: n })));
  const digits = phone.replace(/\D/g, '');
  const ready = lines.length > 0 && name.trim().length > 0 && digits.length >= 10;
  const active = placed && state?.status !== 'entregado' && state?.status !== 'cancelado';

  async function submit() {
    if (!ready || busy) return;
    setBusy(true);
    setError('');
    try {
      const order = await placeOrder(code, name.trim(), phone, lines, note.trim());
      pingOwner(order.id);
      const nextCount = count + 1;
      setCount(nextCount);
      writeSaved(code, { name: name.trim(), phone, lastOrderId: order.id, count: nextCount });
      setPlaced(order);
      setState({ number: order.number, status: 'nuevo', is_refill: order.is_refill, name: name.trim(), items: lines, ahead: 0 });
      setPicks({});
      setNote('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setError(errorText(e));
    }
    setBusy(false);
  }

  // On the order card only when the server says it is a refill; on the form as a heads-up once she has ordered before
  const refillNote = session.refill && Boolean(state?.is_refill ?? placed?.is_refill);
  const refillHeadsUp = session.refill && count > 0;

  return (
    <main className="min-h-screen" style={vars}>
      <div className="mx-auto max-w-md pb-28">
        {/* Cover */}
        <header className="relative">
          {theme.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={theme.banner} alt="" className="h-52 w-full object-cover" style={{ objectPosition: `50% ${theme.bannerY ?? 30}%` }} />
          ) : (
            <div className="h-24" style={{ background: `linear-gradient(135deg, ${theme.accent}33, ${theme.card})` }} />
          )}
          {theme.stickers !== false && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={stickerFor(session.bar_name)} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-14 right-4 w-20 drop-shadow-md" />
          )}
        </header>
        <div className="px-5 pt-5">
          {session.bar_name && <p className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: theme.accent }}>{session.bar_name}</p>}
          <h1 className="mt-1 pr-20 text-[2rem] leading-[1.05]" style={headingStyle}>{session.title}</h1>
          {(theme.welcome || session.subtitle) && <p className="mt-2 text-sm opacity-80">{theme.welcome || session.subtitle}</p>}
        </div>

        {/* Order in progress */}
        {active && state && (
          <section className="mx-5 mt-6 rounded-3xl p-5" style={status === 'listo' ? { background: theme.accent, color: theme.accentInk } : { background: theme.card }} aria-live="polite">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] opacity-80">Tu pedido #{state.number}</p>
            {status === 'listo' ? (
              <>
                <p className="mt-1 text-3xl leading-tight" style={headingStyle}>¡Tu pedido está listo!</p>
                <p className="mt-2 text-sm">Pasa por él a la barra{session.bar_name ? ` (${session.bar_name})` : ''}. 🙌</p>
              </>
            ) : (
              <>
                <p className="mt-1 text-2xl leading-tight" style={headingStyle}>{status === 'preparando' ? 'Lo estamos preparando' : 'Recibimos tu pedido'}</p>
                <p className="mt-1 text-sm opacity-85">
                  {state.ahead > 0 ? `Hay ${state.ahead} pedido${state.ahead === 1 ? '' : 's'} antes que el tuyo. ` : 'Eres el siguiente. '}Te avisamos aquí y por WhatsApp cuando esté listo.
                </p>
              </>
            )}
            <p className="mt-3 text-sm opacity-90">{state.items.map((i) => i.name).join(', ')}</p>
            {refillNote && <p className="mt-3 rounded-2xl px-4 py-3 text-sm font-medium" style={status === 'listo' ? { background: theme.accentInk, color: theme.accent } : { background: theme.accent, color: theme.accentInk }}>🥤 Recuerda traer tu vaso para rellenarlo.</p>}
          </section>
        )}

        {!session.open && !active && (
          <p className="mx-5 mt-6 rounded-3xl p-5 text-center" style={{ background: theme.card }}>
            Los pedidos están cerrados por ahora. ¡Gracias por celebrar con nosotros!
          </p>
        )}

        {/* Menu and form */}
        {session.open && (
          <form
            className="mt-7 space-y-8 px-5"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <p className="text-lg" style={headingStyle}>{active ? '¿Quieres pedir otra cosa?' : 'Haz tu pedido'}</p>
            {refillHeadsUp && !refillNote && <p className="rounded-2xl px-4 py-3 text-sm font-medium" style={{ background: theme.card }}>🥤 Como ya pediste antes, recuerda traer tu vaso para rellenarlo.</p>}

            {session.menu.map((section) => (
              <fieldset key={section.id}>
                <legend className="mb-3 text-xl leading-tight" style={headingStyle}>
                  {section.title}
                  <span className="ml-2 text-xs font-normal opacity-60" style={{ fontFamily: font.body, fontStyle: 'normal' }}>{section.multi ? 'elige los que quieras' : 'elige uno'}</span>
                </legend>
                <div className="grid gap-2.5">
                  {section.items.map((item) => {
                    const on = chosen(section.id).includes(item.name);
                    return (
                      <label key={item.id} className="relative flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition-transform active:scale-[0.98]" style={on ? { background: theme.accent, color: theme.accentInk } : { background: theme.card }}>
                        <input type={section.multi ? 'checkbox' : 'radio'} name={section.id} className="peer sr-only" checked={on} onChange={() => toggle(section.id, section.multi, item.name)} />
                        <span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center border-2 text-xs ${section.multi ? 'rounded-md' : 'rounded-full'}`} style={{ borderColor: on ? theme.accentInk : theme.accent }}>
                          {on ? '✓' : ''}
                        </span>
                        <span className="text-base font-medium leading-snug">{item.name}</span>
                        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-offset-2 ring-transparent peer-focus-visible:ring-current" aria-hidden="true" />
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            {session.menu.length === 0 && <p className="text-sm opacity-70">El menú todavía no está listo. Pregunta en la barra.</p>}

            <div className="space-y-4">
              <p className="text-xl" style={headingStyle}>Tus datos</p>
              <div>
                <label htmlFor="o-nombre" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest opacity-70">Tu nombre</label>
                <input id="o-nombre" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} className="h-14 w-full rounded-2xl border-2 bg-transparent px-4 text-base outline-none focus:ring-2" style={{ borderColor: `${theme.ink}33`, color: theme.ink }} />
              </div>
              <div>
                <label htmlFor="o-tel" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest opacity-70">Tu teléfono (WhatsApp)</label>
                <input id="o-tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className="h-14 w-full rounded-2xl border-2 bg-transparent px-4 text-base outline-none focus:ring-2" style={{ borderColor: `${theme.ink}33`, color: theme.ink }} />
                <p className="mt-1.5 text-xs opacity-65">Solo lo usamos para avisarte que tu pedido está listo.</p>
              </div>
              <div>
                <label htmlFor="o-nota" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest opacity-70">Algo más (opcional)</label>
                <input id="o-nota" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Sin hielo, poco dulce…" className="h-14 w-full rounded-2xl border-2 bg-transparent px-4 text-base outline-none focus:ring-2" style={{ borderColor: `${theme.ink}33`, color: theme.ink }} />
              </div>
            </div>

            {error && <p role="alert" className="rounded-2xl px-4 py-3 text-sm font-medium" style={{ background: theme.card, color: theme.ink }}>{error}</p>}

            <div className="fixed inset-x-0 bottom-0 z-10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3" style={{ background: `linear-gradient(to top, ${theme.bg} 70%, transparent)` }}>
              <div className="mx-auto max-w-md">
                <button type="submit" disabled={!ready || busy} className="h-14 w-full rounded-full text-base font-semibold shadow-lg transition-opacity disabled:opacity-45" style={{ background: theme.accent, color: theme.accentInk }}>
                  {busy ? 'Enviando…' : lines.length ? `Pedir · ${lines.map((l) => l.name).join(', ').slice(0, 34)}${lines.map((l) => l.name).join(', ').length > 34 ? '…' : ''}` : 'Elige algo del menú'}
                </button>
              </div>
            </div>
          </form>
        )}

        <footer className="mt-12 px-5 text-center text-[11px] uppercase tracking-[0.3em] opacity-60">Crunch &amp; Munch Snack Bar</footer>
      </div>
    </main>
  );
}
