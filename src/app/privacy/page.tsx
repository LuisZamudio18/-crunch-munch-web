import type { Metadata } from 'next';
import ContentPage from '@/components/layout/ContentPage';
import { PRIVACY_CONTENT } from '@/lib/pageContent';
import { SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: `Aviso de privacidad — ${SITE_NAME}`,
  description:
    'Cómo maneja Crunch & Munch la información que pasa por su sitio y su configurador de cotizaciones.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: `Aviso de privacidad — ${SITE_NAME}`,
    description: 'Cómo maneja Crunch & Munch la información que pasa por su sitio.',
    url: '/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return <ContentPage content={PRIVACY_CONTENT} />;
}
