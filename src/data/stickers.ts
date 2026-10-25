/** Stickers de la marca, recortados de la hoja de stickers original (public/stickers). */
export type StickerId =
  | 'cafe-helado'
  | 'cocktail-frutos-rojos'
  | 'limonada-tajin'
  | 'fresa-tajin'
  | 'copa-rosa'
  | 'taza-latte'
  | 'croissant'
  | 'pastel-frutos-rojos'
  | 'galleta-chispas'
  | 'cheesecake'
  | 'frascos-matcha'
  | 'menu-drinks'
  | 'cafe-llevar'
  | 'jarabe-vainilla'
  | 'costal-cafe'
  | 'coctelera'
  | 'jigger'
  | 'cuchara'
  | 'popotes'
  | 'barra'
  | 'flores';

export const STICKERS: Record<StickerId, { src: string; w: number; h: number }> = {
  'cafe-helado': { src: '/stickers/01-cafe-helado.webp', w: 474, h: 698 },
  'cocktail-frutos-rojos': { src: '/stickers/02-cocktail-frutos-rojos.webp', w: 564, h: 668 },
  'limonada-tajin': { src: '/stickers/03-limonada-tajin.webp', w: 536, h: 572 },
  'fresa-tajin': { src: '/stickers/04-fresa-tajin.webp', w: 594, h: 574 },
  'copa-rosa': { src: '/stickers/05-copa-rosa.webp', w: 524, h: 656 },
  'taza-latte': { src: '/stickers/06-taza-latte.webp', w: 646, h: 478 },
  'croissant': { src: '/stickers/07-croissant.webp', w: 590, h: 432 },
  'pastel-frutos-rojos': { src: '/stickers/08-pastel-frutos-rojos.webp', w: 528, h: 538 },
  'galleta-chispas': { src: '/stickers/09-galleta-chispas.webp', w: 516, h: 478 },
  'cheesecake': { src: '/stickers/10-cheesecake.webp', w: 430, h: 466 },
  'frascos-matcha': { src: '/stickers/11-frascos-matcha.webp', w: 940, h: 580 },
  'menu-drinks': { src: '/stickers/12-menu-drinks.webp', w: 414, h: 566 },
  'cafe-llevar': { src: '/stickers/13-cafe-llevar.webp', w: 530, h: 632 },
  'jarabe-vainilla': { src: '/stickers/14-jarabe-vainilla.webp', w: 370, h: 642 },
  'costal-cafe': { src: '/stickers/15-costal-cafe.webp', w: 526, h: 594 },
  'coctelera': { src: '/stickers/16-coctelera.webp', w: 308, h: 576 },
  'jigger': { src: '/stickers/17-jigger.webp', w: 272, h: 432 },
  'cuchara': { src: '/stickers/18-cuchara.webp', w: 356, h: 560 },
  'popotes': { src: '/stickers/19-popotes.webp', w: 304, h: 550 },
  'barra': { src: '/stickers/20-barra.webp', w: 1385, h: 1010 },
  'flores': { src: '/stickers/21-flores.webp', w: 622, h: 604 },
};
