import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';
import { BRAND_FULL_NAME, CONTACT, SERVICE_AREA, SITE_NAME, SITE_URL } from '@/lib/siteConfig';
import { FAQ } from '@/data/faq';
import { SERVICES } from '@/data/services';

// Tipografías de la guía de marca: Bodoni Moda (logotipo y titulares grandes),
// Cormorant Garamond Italic (títulos) y Montserrat (textos).
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  adjustFontFallback: false,
  style: ['normal', 'italic'],
  variable: '--font-bodoni',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F5F0E9',
};

const TITLE = 'Crunch & Munch — Barras móviles de lujo para eventos en Tabasco';
const DESCRIPTION =
  'Barras móviles de lujo para bodas, XV años, baby showers y eventos corporativos en Tabasco: coffee bar, drinks bar, mimosas, dessert bar, charcutería, brunch y más. Cotiza en línea y recibe tu estimado.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s | Crunch & Munch' },
  description: DESCRIPTION,
  keywords: [
    'Crunch & Munch',
    'Crunch and Munch',
    'barras móviles para eventos',
    'mobile bar Tabasco',
    'coffee bar para bodas',
    'barra de bebidas para eventos',
    'dessert bar',
    'snack bar',
    'barra de mimosas',
    'brunch para eventos Villahermosa',
    'catering temático Tabasco',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: BRAND_FULL_NAME }],
  alternates: { canonical: '/', languages: { 'es-MX': '/' } },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

const SERVICE_CATEGORY_NAME: Record<string, string> = {
  bebidas: 'Barras de bebidas',
  dulce: 'Barras de dulces',
  salado: 'Barras saladas',
  brunch: 'Barras de brunch',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}/#business`,
      name: SITE_NAME,
      legalName: BRAND_FULL_NAME,
      alternateName: ['Crunch and Munch', 'Crunch & Munch Snack Bar', 'Crunch & Munch Luxury Mobile Bars'],
      description:
        'Empresa de mobile bars de lujo: barras móviles temáticas de café, bebidas, postres, botanas y brunch para bodas, eventos corporativos y celebraciones en Tabasco, México.',
      url: SITE_URL,
      image: `${SITE_URL}/opengraph-image`,
      logo: `${SITE_URL}/opengraph-image`,
      telephone: `+${CONTACT.whatsappNumber}`,
      priceRange: '$$',
      knowsAbout: ['barras móviles', 'coffee bar', 'catering para eventos', 'bodas', 'brunch', 'repostería'],
      sameAs: [CONTACT.instagramUrl],
      address: {
        '@type': 'PostalAddress',
        addressRegion: SERVICE_AREA.addressRegion,
        addressCountry: SERVICE_AREA.addressCountry,
      },
      areaServed: { '@type': 'State', name: SERVICE_AREA.addressRegion },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: `+${CONTACT.whatsappNumber}`,
        contactType: 'customer service',
        areaServed: SERVICE_AREA.addressCountry,
        availableLanguage: ['es'],
        url: CONTACT.whatsappUrl,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Catálogo de barras móviles',
        itemListElement: SERVICES.map((s) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: s.name,
            description: s.description,
            category: SERVICE_CATEGORY_NAME[s.category] ?? s.category,
            provider: { '@id': `${SITE_URL}/#business` },
            areaServed: { '@type': 'State', name: SERVICE_AREA.addressRegion },
          },
        })),
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'es-MX',
      publisher: { '@id': `${SITE_URL}/#business` },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${bodoni.variable} ${cormorant.variable} ${montserrat.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
