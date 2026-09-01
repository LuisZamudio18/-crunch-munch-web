import type { Metadata } from 'next';
import ContentPage from '@/components/layout/ContentPage';
import { ABOUT_CONTENT } from '@/lib/pageContent';
import { SITE_NAME } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: `Nosotros — ${SITE_NAME}`,
  description:
    'Conoce a Crunch & Munch: empresa de mobile bars premium en Tabasco especializada en barras temáticas de café, postres, botanas y brunch para bodas y eventos.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: `Nosotros — ${SITE_NAME}`,
    description: 'Empresa de mobile bars premium en Tabasco. Conoce nuestra historia y lo que nos distingue.',
    url: '/about',
    type: 'website',
  },
};

export default function AboutPage() {
  return <ContentPage content={ABOUT_CONTENT} />;
}
