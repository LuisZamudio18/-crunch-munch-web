import type { Metadata } from 'next';
import ContentPage from '@/components/layout/ContentPage';
import { CONTACT_CONTENT } from '@/lib/pageContent';
import { SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: `Contacto — ${SITE_NAME}`,
  description:
    'Contacta a Crunch & Munch por WhatsApp o Instagram para cotizar barras móviles en Tabasco, México.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `Contacto — ${SITE_NAME}`,
    description: 'WhatsApp, Instagram y zona de cobertura de Crunch & Munch.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContentPage content={CONTACT_CONTENT} />;
}
