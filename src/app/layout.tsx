import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import './globals.css';
import { BRAND_FULL_NAME, CONTACT, SERVICE_AREA, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Crunch & Munch — Luxury Mobile Bars',
  description:
    'Barras móviles premium para bodas, corporativos y celebraciones. Coffee Bar, Snack Bar, Charcutería, Smoothies, Brunch y más.',
  keywords: 'mobile bar, barra móvil, coffee bar, snack bar, eventos, bodas, Tabasco',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Crunch & Munch — Luxury Mobile Bars',
    description: 'Eleva cada momento a una experiencia con nuestras barras móviles premium.',
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    locale: 'es_MX',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crunch & Munch — Luxury Mobile Bars',
    description: 'Eleva cada momento a una experiencia con nuestras barras móviles premium.',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  legalName: BRAND_FULL_NAME,
  description:
    'Empresa de mobile bars premium: barras móviles temáticas de café, postres, botanas y brunch para bodas, eventos corporativos y celebraciones en Tabasco, México.',
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  telephone: `+${CONTACT.whatsappNumber}`,
  sameAs: [CONTACT.instagramUrl],
  address: {
    '@type': 'PostalAddress',
    addressRegion: SERVICE_AREA.addressRegion,
    addressCountry: SERVICE_AREA.addressCountry,
  },
  areaServed: {
    '@type': 'State',
    name: SERVICE_AREA.addressRegion,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: `+${CONTACT.whatsappNumber}`,
    contactType: 'customer service',
    areaServed: SERVICE_AREA.addressCountry,
    availableLanguage: ['es'],
    url: CONTACT.whatsappUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
