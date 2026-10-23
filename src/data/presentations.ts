/**
 * Photos that show the customer how each presentation looks. The same glassware
 * and disposables are used by every bar that offers them, so one photo per
 * presentation is shared across bars.
 */
export type PresentationKey = 'cristaleria' | 'desechables' | 'cantaritos';

export interface PresentationPhotoInfo {
  label: string;
  src: string;
  alt: string;
  /** CSS object-position, so the crop lands on the drink. */
  position: string;
}

export const PRESENTATION_PHOTOS: Record<PresentationKey, PresentationPhotoInfo> = {
  cristaleria: {
    label: 'Cristalería',
    src: '/presentaciones/cristaleria.webp',
    alt: 'Cócteles servidos en vasos de cristal tallado, con etiqueta personalizada y orilla enchilada',
    position: '35% 70%',
  },
  desechables: {
    label: 'Vasos desechables',
    src: '/presentaciones/desechables.webp',
    alt: 'Cóctel de naranja en vaso desechable con orilla enchilada, rodaja de limón y etiqueta personalizada',
    position: '50% 78%',
  },
  cantaritos: {
    label: 'Cantaritos de barro',
    src: '/presentaciones/cantaritos.webp',
    alt: 'Cantaritos de barro con orilla de sal y etiquetas personalizadas sobre la barra',
    position: '50% 70%',
  },
};

/** Photo for each option of the presentation choice (Drinks Bar and Mocktails Bar). */
export const PRESENTATION_PHOTO_BY_OPTION: Record<string, PresentationKey> = {
  'Cristalería': 'cristaleria',
  'Vasos desechables': 'desechables',
};

/** Photo for bars that have a single presentation. */
export const PRESENTATION_PHOTO_BY_BAR: Record<string, PresentationKey> = {
  'mimosas-bar': 'cristaleria',
  'cantaritos-bar': 'cantaritos',
};
