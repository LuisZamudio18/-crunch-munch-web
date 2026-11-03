/**
 * Checks a catalog document before the site is built from it. A document that fails any check is never used: the build
 * keeps the catalog it already has, so a typo in the agenda can never leave the site without bars or with a broken quote.
 * Plain functions, no imports of site data, so the build script and the agenda can both run them.
 * Returns the list of problems in plain Spanish (empty when the document is good).
 */

const CATEGORIES = ['bebidas', 'dulce', 'salado', 'brunch'];
const GROUP_TYPES = ['choose-n', 'choose-1', 'fixed-display'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Bars the code treats in a special way (type of service, glassware, take-home cantaritos): they must exist. */
export const REQUIRED_BARS: Record<string, { groups: string[]; variants?: string[] }> = {
  'drinks-bar': { groups: ['tipo-servicio'], variants: ['cristal', 'desechable'] },
  'mocktails-bar': { groups: ['tipo-servicio'], variants: ['cristal', 'desechable'] },
  'mimosas-bar': { groups: ['tipo-servicio'] },
  'cantaritos-bar': { groups: ['tipo-servicio', 'cantarito-recuerdo'] },
};

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isInt = (v: unknown, min = 0): v is number => isNum(v) && Number.isInteger(v) && v >= min;
/** A picture of the site ("/barras/x.jpg") or one she uploaded (an https address). */
const isImageRef = (v: unknown): v is string => typeof v === 'string' && (/^https:\/\/[^\s]+$/.test(v) || /^\/(?!\/)[^\s]+$/.test(v)) && v.length < 600;

function checkTiers(tiers: unknown, where: string, out: string[]) {
  if (!Array.isArray(tiers) || tiers.length === 0) return void out.push(`${where}: faltan los precios por rango de personas.`);
  let last = -1;
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (!isObj(t) || !isInt(t.fromPersonas, 1)) {
      out.push(`${where}: el rango ${i + 1} necesita un número de personas (entero, desde 1).`);
      continue;
    }
    if (t.fromPersonas <= last) out.push(`${where}: los rangos deben ir de menor a mayor número de personas (sin repetir).`);
    last = t.fromPersonas as number;
    if (!isNum(t.pricePerPerson) || t.pricePerPerson <= 0 || t.pricePerPerson > 100000) out.push(`${where}: el precio por persona del rango desde ${t.fromPersonas} debe ser un número mayor que 0.`);
  }
}

function checkService(s: unknown, i: number, out: string[]): string | null {
  if (!isObj(s)) {
    out.push(`Barra ${i + 1}: no es válida.`);
    return null;
  }
  const id = isText(s.id) && SLUG.test(s.id) ? s.id : null;
  const label = isText(s.name) ? s.name : id ?? `barra ${i + 1}`;
  if (!id) out.push(`${label}: el identificador debe estar en minúsculas, con letras, números y guiones.`);
  if (!isText(s.name)) out.push(`${label}: falta el nombre.`);
  if (!isText(s.shortName)) out.push(`${label}: falta el nombre corto.`);
  if (!isText(s.description)) out.push(`${label}: falta la descripción.`);
  if (typeof s.category !== 'string' || !CATEGORIES.includes(s.category)) out.push(`${label}: la categoría debe ser bebidas, dulce, salado o brunch.`);
  if (!isText(s.emoji)) out.push(`${label}: falta el emoji.`);
  if (s.image !== undefined && !isImageRef(s.image)) out.push(`${label}: la foto no es válida.`);
  if (!isInt(s.minPersonas, 1) || (s.minPersonas as number) > 1000) out.push(`${label}: el mínimo de personas debe ser un número entero mayor que 0.`);
  if (!Array.isArray(s.selectionGroups)) {
    out.push(`${label}: faltan los grupos de opciones.`);
    return id;
  }
  const groupIds = new Set<string>();
  for (let gi = 0; gi < s.selectionGroups.length; gi++) {
    const g = s.selectionGroups[gi];
    const where = `${label}, grupo ${gi + 1}`;
    if (!isObj(g)) {
      out.push(`${where}: no es válido.`);
      continue;
    }
    if (!isText(g.id) || !SLUG.test(g.id)) out.push(`${where}: el identificador debe estar en minúsculas, con letras, números y guiones.`);
    else if (groupIds.has(g.id)) out.push(`${where}: el identificador "${g.id}" está repetido en esta barra.`);
    else groupIds.add(g.id);
    if (!isText(g.label)) out.push(`${where}: falta el título.`);
    if (typeof g.instruction !== 'string') out.push(`${where}: falta la instrucción.`);
    if (typeof g.type !== 'string' || !GROUP_TYPES.includes(g.type)) out.push(`${where}: el tipo debe ser elegir varios, elegir uno o solo mostrar.`);
    if (g.totalMax !== undefined && !isInt(g.totalMax, 1)) out.push(`${where}: el máximo de opciones debe ser un entero mayor que 0.`);
    const lists: [string, unknown][] = [];
    if (g.options !== undefined) lists.push(['las opciones', g.options]);
    if (g.categories !== undefined) {
      if (!Array.isArray(g.categories)) out.push(`${where}: las categorías no son válidas.`);
      else
        for (const c of g.categories) {
          if (!isObj(c) || !isText(c.name)) {
            out.push(`${where}: una categoría no tiene nombre.`);
            continue;
          }
          lists.push([`la categoría ${c.name}`, c.options]);
          if (c.maxPerCategory !== undefined && !isInt(c.maxPerCategory, 1)) out.push(`${where}, ${c.name}: el máximo debe ser un entero mayor que 0.`);
          if (c.included !== undefined && !isInt(c.included, 0)) out.push(`${where}, ${c.name}: las incluidas deben ser un entero desde 0.`);
        }
    }
    if (g.fixedItems !== undefined) {
      if (!Array.isArray(g.fixedItems)) out.push(`${where}: los elementos fijos no son válidos.`);
      else for (const f of g.fixedItems) if (!isObj(f) || !isText(f.label) || !Array.isArray(f.items) || !f.items.every(isText)) out.push(`${where}: un elemento fijo no es válido.`);
    }
    for (const [name, list] of lists) {
      if (!Array.isArray(list) || list.length === 0 || !list.every(isText)) out.push(`${where}: ${name} deben ser textos y no puede quedar vacía.`);
      else if (new Set(list.map((x: string) => x.trim().toLowerCase())).size !== list.length) out.push(`${where}: ${name} tienen una opción repetida.`);
    }
    if (g.type === 'choose-n' || g.type === 'choose-1') {
      if (g.options === undefined && g.categories === undefined) out.push(`${where}: no tiene opciones para elegir.`);
    }
  }
  return id;
}

export function validateCatalog(doc: unknown): string[] {
  const out: string[] = [];
  if (!isObj(doc)) return ['El catálogo no es válido.'];
  if (doc.schemaVersion !== 1) out.push('La versión del catálogo no es la que espera la página.');

  // Bars
  const ids = new Set<string>();
  const services = Array.isArray(doc.services) ? doc.services : null;
  if (!services || services.length === 0) out.push('No hay ninguna barra.');
  else {
    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      const id = checkService(s, i, out);
      if (id) {
        if (ids.has(id)) out.push(`El identificador "${id}" está repetido en dos barras.`);
        ids.add(id);
      }
    }
    for (const [id, rule] of Object.entries(REQUIRED_BARS)) {
      const s = services.find((x) => isObj(x) && x.id === id) as Obj | undefined;
      if (!s) {
        out.push(`Falta la barra "${id}": la página necesita que exista.`);
        continue;
      }
      const groups = Array.isArray(s.selectionGroups) ? s.selectionGroups.filter(isObj).map((g) => g.id) : [];
      for (const g of rule.groups) if (!groups.includes(g)) out.push(`La barra "${id}" necesita el grupo "${g}".`);
    }
  }

  // Prices
  const pricing = doc.pricing;
  if (!isObj(pricing) || !isObj(pricing.services)) out.push('Faltan los precios.');
  else {
    for (const [id, p] of Object.entries(pricing.services)) {
      if (!ids.has(id)) out.push(`Hay un precio para "${id}", que no es una barra.`);
      if (!isObj(p)) {
        out.push(`${id}: el precio no es válido.`);
        continue;
      }
      if (p.variants !== undefined) {
        if (!isObj(p.variants)) out.push(`${id}: las variantes de precio no son válidas.`);
        else for (const [v, tiers] of Object.entries(p.variants)) checkTiers(tiers, `${id} (${v})`, out);
        const need = REQUIRED_BARS[id]?.variants ?? [];
        for (const v of need) if (!isObj(p.variants) || !(v in p.variants)) out.push(`${id}: falta el precio de "${v}".`);
      } else checkTiers(p.tiers, id, out);
      if (REQUIRED_BARS[id]?.variants && p.variants === undefined) out.push(`${id}: necesita precios por presentación (cristalería y desechables).`);
      if (p.minimumTotal !== undefined && (!isNum(p.minimumTotal) || p.minimumTotal < 0)) out.push(`${id}: el cobro mínimo debe ser un número desde 0.`);
      if (p.takeHomePerPerson !== undefined && (!isNum(p.takeHomePerPerson) || p.takeHomePerPerson < 0)) out.push(`${id}: el cargo por llevarse la pieza debe ser un número desde 0.`);
      if (p.extraPickSurcharge !== undefined) {
        const e = p.extraPickSurcharge;
        if (!isObj(e) || !isInt(e.every, 1) || !isNum(e.percent) || e.percent < 0 || e.percent > 200) out.push(`${id}: el aumento por opciones extra no es válido.`);
      }
    }
    if (!Array.isArray(pricing.discounts)) out.push('Faltan los descuentos.');
    else
      for (const d of pricing.discounts) {
        if (!isObj(d) || !isText(d.id) || !isText(d.label) || (d.kind !== 'multi-bar' && d.kind !== 'volume-guests') || !isNum(d.percent) || d.percent < 0 || d.percent > 100) out.push('Un descuento no es válido (necesita nombre, tipo y un porcentaje de 0 a 100).');
      }
    if (pricing.stacking !== 'best' && pricing.stacking !== 'sum') out.push('La forma de combinar descuentos no es válida.');
    if (!isNum(pricing.rangeSpread) || pricing.rangeSpread < 0 || pricing.rangeSpread > 0.5) out.push('El margen del estimado debe estar entre 0 y 0.5.');
    if (!isNum(pricing.roundTo) || pricing.roundTo <= 0) out.push('El redondeo del estimado debe ser mayor que 0.');
    if (pricing.refillSurchargePercent !== undefined && (!isNum(pricing.refillSurchargePercent) || pricing.refillSurchargePercent < 0 || pricing.refillSurchargePercent > 200)) out.push('El aumento por refill no es válido.');
    if (pricing.combo !== undefined && (!isObj(pricing.combo) || !isInt(pricing.combo.tierGuests, 1) || !isNum(pricing.combo.extraPerPerson) || pricing.combo.extraPerPerson < 0)) out.push('La opción combinada no es válida.');
  }

  // FAQ, quote texts and notes
  if (!Array.isArray(doc.faq) || doc.faq.length === 0 || !doc.faq.every((f) => isObj(f) && isText(f.q) && isText(f.a))) out.push('Las preguntas frecuentes necesitan pregunta y respuesta en cada una.');
  if (!isObj(doc.quoteCopy)) out.push('Faltan los textos de la cotización.');
  else
    for (const [id, lines] of Object.entries(doc.quoteCopy)) {
      if (!ids.has(id)) out.push(`Hay un texto de cotización para "${id}", que no es una barra.`);
      if (!Array.isArray(lines) || !lines.every((l) => typeof l === 'string')) out.push(`${id}: el texto de la cotización no es válido.`);
    }
  if (doc.toppingImages !== undefined) {
    const imgs = doc.toppingImages;
    if (!isObj(imgs)) out.push('Las fotos de las opciones no son válidas.');
    else {
      const entries = Object.entries(imgs);
      if (entries.length > 800) out.push('Hay demasiadas fotos de opciones.');
      for (const [name, url] of entries) if (!name.trim() || !isImageRef(url)) out.push(`La foto de la opción "${name}" no es válida.`);
    }
  }
  const notes = doc.estimateNotes;
  if (!isObj(notes) || !isText(notes.includes) || !isText(notes.travel) || !isText(notes.payment)) out.push('Faltan las notas del estimado (qué incluye, traslado y pago).');
  return out;
}
