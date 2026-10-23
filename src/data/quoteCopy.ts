/**
 * What the owner writes under each bar when she sends a quote. Keyed by catalog id; a bar with no
 * entry simply shows its name, choices and price, and she completes the rest by hand.
 *
 * Only Drinks Bar has its text so far (taken from her own quote). Add the others here as she sends them.
 */
export const QUOTE_COPY: Record<string, string[]> = {
  'drinks-bar': [
    '-Incluye 3 bebidas de su elección de nuestro menú que se le brindarán a sus invitados.',
    'Bebidas como: mojitos, mezcalita, ginger tonic, tequila sunrise, piñas coladas, margaritas etc.',
    '',
    '-La barra incluye personalización de decoración como globos, flores o imágenes.',
    '-Espejo selfie personalizado.',
    '-Etiquetas o imagen personalizable en vaso.',
    '',
    '-El servicio es durante 3 horas.',
  ],
};
