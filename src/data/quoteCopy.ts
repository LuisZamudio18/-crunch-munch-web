/**
 * What goes under each bar in the quote the website writes into WhatsApp, in the owner's own style.
 *
 * Sources: Drinks Bar is her own text, word for word. Every other bar is built from the 2026 catalog
 * (what each service is and includes) and from the choices the configurator asks for, so the numbers
 * here are the ones the customer actually picked on the page (e.g. "Elige 12 toppings").
 *
 * The personalization lines are in the catalog for every service ("espejo selfie, flores o globos que
 * tu servicio ya incluye"). The service duration is NOT written here: it depends on the guests of the
 * bar and on refill, so it is added when the quote is built (see serviceHours.ts).
 */

const PERSONALIZATION: string[] = [
  '',
  '-La barra incluye personalización de decoración como globos, flores o imágenes.',
  '-Espejo selfie personalizado.',
  '-Etiquetas y diseño personalizables.',
];

/** What is specific to each bar; the shared personalization block is added after it. */
const SPECIFIC: Record<string, string[]> = {
  'coffee-bar': [
    '-Incluye 4 bebidas de su elección de nuestro menú (calientes o frías) que se le brindarán a sus invitados.',
    'Más de 30 bebidas como: capuccino, americano, ice lattes, matcha, frappe, taro, chaí y más.',
  ],
  'smoothie-bar': [
    '-Incluye 2 sabores de smoothie de su elección, a base de frutas.',
    '-Incluye 4 toppings de su elección (gomitas, cacahuates o dulces).',
  ],
  'frappes-bar': ['-Incluye 2 sabores de frappe de su elección de nuestro menú.'],
  'mocktails-bar': ['-Incluye 3 mocktails (bebidas sin alcohol) de su elección de nuestro menú que se le brindarán a sus invitados.'],
  'mimosas-bar': ['-Barra completa de mimosas, refrescantes y dulces, con 3 sabores: clásica, toronja y fresa.'],
  'cantaritos-bar': ['-Incluye 1 tequila de su elección.', '-Cantaritos de barro personalizados.'],
  'tapiocas-bar': [
    '-Incluye 2 sabores de bebida de su elección.',
    '-Incluye 1 tipo de tapioca y 1 tipo de perla explosiva a elegir.',
  ],
  'hot-cakes-bar': [
    '-Mini hot cakes preparados al momento.',
    '-Incluye 6 toppings de su elección (máximo 2 por categoría) y 4 glaseados.',
  ],
  'donas-bar': ['-Mini donas preparadas al momento.', '-Incluye 6 toppings de su elección (máximo 2 por categoría) y 4 glaseados.'],
  'crepas-bar': [
    '-Crepas preparadas al momento, al gusto de cada invitado.',
    '-Incluye 6 toppings de su elección (máximo 2 por categoría) y 4 glaseados o untables.',
  ],
  'helados-bar': [
    '-Incluye 3 sabores de helado de su elección.',
    '-Incluye 6 toppings de su elección (máximo 2 por categoría) y 4 glaseados o jarabes.',
  ],
  'cake-bar': [
    '-Pasteles individuales preparados al gusto de cada invitado.',
    '-Incluye 1 sabor de pastel de su elección, 6 toppings (máximo 2 por categoría) y 4 glaseados.',
  ],
  'rolles-bar': [
    '-Rolles calientitos preparados al gusto de cada invitado.',
    '-Incluye 6 toppings de su elección (máximo 2 por categoría) y 4 glaseados.',
  ],
  'dessert-bar': [
    '-Postres gourmet elaborados con ingredientes de alta calidad.',
    '-Los postres se eligen de nuestro menú de más de 25 opciones.',
  ],
  'snack-bar': [
    '-Incluye 12 toppings de su elección (máximo 3 por categoría): sabritas, gomitas, dulces, cacahuates y frutas.',
  ],
  'charcuteria-bar': [
    '-Incluye 9 elementos de su elección (máximo 3 por categoría): panes y galletas, frutos frescos y secos, quesos y carnes frías.',
  ],
  'esquites-bar': ['-Esquites preparados al gusto de cada invitado.', '-Incluye 4 toppings de su elección (sabritas, cacahuates o verduras).'],
  'tostielotes-bar': ['-Tostielotes preparados al gusto de cada invitado.', '-Incluye 4 toppings de su elección (sabritas, cacahuates o verduras).'],
  'maruchan-bar': ['-Maruchan preparadas al gusto de cada invitado.', '-Incluye 4 toppings de su elección (sabritas, cacahuates o verduras).'],
  'chilaquiles-bar': ['-Chilaquiles en salsa roja y verde (ambas incluidas).', '-Incluye 1 proteína de su elección.'],
  'ice-bar': [
    '-Paletas preparadas: de agua con toppings como dulces y gomitas, y de leche con coberturas, chocolates y fruta.',
    '-Incluye 12 toppings de su elección (máximo 3 por categoría).',
  ],
  'brunch-bar': ['-Incluye 3 alimentos, 2 bebidas y 1 opción de pan o postre de su elección.'],
  'desayuno-buffet': [
    '-Incluye 2 alimentos, 3 acompañamientos, 2 bebidas y 1 pan, galleta o postre de su elección.',
    '-Cada 2 opciones extra que elijan suben 15 % el precio por persona.',
  ],
};

/** Drinks Bar: the owner's own text (it already has its personalization lines; the duration is added after it). */
const DRINKS_BAR: string[] = [
  '-Incluye 3 bebidas de su elección de nuestro menú que se le brindarán a sus invitados.',
  'Bebidas como: mojitos, mezcalita, ginger tonic, tequila sunrise, piñas coladas, margaritas etc.',
  '',
  '-La barra incluye personalización de decoración como globos, flores o imágenes.',
  '-Espejo selfie personalizado.',
  '-Etiquetas o imagen personalizable en vaso.',
];

export const QUOTE_COPY: Record<string, string[]> = {
  ...Object.fromEntries(Object.entries(SPECIFIC).map(([id, lines]) => [id, [...lines, ...PERSONALIZATION]])),
  'drinks-bar': DRINKS_BAR,
};
