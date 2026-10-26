/**
 * The guests' side of the QR orders. It talks to the database through three public functions
 * (get_order_session, place_order, get_order) that check everything they receive; the key used here is the
 * publishable one, which is safe to ship in the page.
 */

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const AGENDA_URL = process.env.NEXT_PUBLIC_AGENDA_URL || 'https://crunch-munch-agenda.vercel.app';

export const ordersConfigured = Boolean(URL_BASE && KEY);

export interface MenuItem {
  id: string;
  name: string;
}
export interface MenuSection {
  id: string;
  title: string;
  multi: boolean;
  items: MenuItem[];
}
export type FontKey = 'elegante' | 'clasico' | 'moderno' | 'divertido';
export interface OrderTheme {
  bg: string;
  ink: string;
  accent: string;
  accentInk: string;
  card: string;
  font: FontKey;
  banner?: string;
  bannerY?: number;
  welcome?: string;
  stickers?: boolean;
}
export type BarStatus = 'espera' | 'abierta' | 'cerrada';
export interface PublicBar {
  id: string;
  name: string;
  refill: boolean;
  status: BarStatus;
  menu: MenuSection[];
}
export interface PublicSession {
  title: string;
  subtitle: string | null;
  bars: PublicBar[];
  theme: Partial<OrderTheme>;
  instagram: string | null;
}
export type OrderStatus = 'nuevo' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
export interface PlacedOrder {
  id: string;
  number: number;
  is_refill: boolean;
  status: OrderStatus;
}
export interface OrderState {
  number: number;
  bar_id: string;
  status: OrderStatus;
  is_refill: boolean;
  name: string;
  items: { section: string; name: string }[];
  ahead: number;
}

export class OrderError extends Error {}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  if (!URL_BASE || !KEY) throw new OrderError('no_configurado');
  const res = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    cache: 'no-store',
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new OrderError(typeof body?.message === 'string' ? body.message : 'error');
  return body as T;
}

export const fetchSession = (code: string) => rpc<PublicSession | null>('get_order_session', { p_code: code });

/** Only the state of each bar (a few bytes), so the page can follow it without downloading the cover picture again. */
export const fetchBarStates = (code: string) => rpc<{ id: string; status: BarStatus }[] | null>('get_order_bars', { p_code: code });

export const placeOrder = (code: string, bar: string, name: string, phone: string, items: { section: string; name: string }[], note: string) =>
  rpc<PlacedOrder>('place_order', { p_code: code, p_bar: bar, p_name: name, p_phone: phone, p_items: items, p_note: note || null });

export const fetchOrder = (id: string) => rpc<OrderState | null>('get_order', { p_id: id });

/** Lets the owner's phone know there is a new order (best effort: the order is already saved). */
export function pingOwner(orderId: string) {
  try {
    void fetch(`${AGENDA_URL}/api/orders/ping`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ orderId }), keepalive: true });
  } catch {
    /* nothing to do */
  }
}

export const ORDER_ERRORS: Record<string, string> = {
  espera_un_momento: 'Espera unos segundos antes de pedir otra vez.',
  demasiados_pedidos: 'Ya tienes 3 pedidos pendientes. Cuando recojas uno, puedes pedir otro.',
  pedidos_cerrados: 'Los pedidos están cerrados por ahora.',
  servicio_no_iniciado: 'Todavía no empieza el servicio de esta barra. En un momento más abrimos.',
  servicio_cerrado: 'El servicio de esta barra ya terminó. ¡Gracias por celebrar con nosotros!',
  telefono_invalido: 'Revisa tu teléfono: debe tener 10 dígitos.',
  nombre_invalido: 'Escribe tu nombre.',
  pedido_invalido: 'Elige algo del menú para pedir.',
};

export const errorText = (e: unknown) => (e instanceof OrderError && ORDER_ERRORS[e.message]) || 'No pudimos enviar tu pedido. Revisa tu conexión e inténtalo de nuevo.';
