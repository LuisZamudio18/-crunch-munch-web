import type { MetadataRoute } from 'next';

// Para que al "Agregar a pantalla de inicio" la página tenga nombre e ícono propios.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Crunch & Munch — Luxury Mobile Bars',
    short_name: 'Crunch & Munch',
    description: 'Barras móviles de lujo para eventos en Tabasco. Cotiza tu evento en línea.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F0E9',
    theme_color: '#4A3528',
    lang: 'es-MX',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
