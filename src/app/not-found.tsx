import Link from 'next/link';
import StaticHeader from '@/components/layout/StaticHeader';
import Footer from '@/components/layout/Footer';

// Next.js renders this file for any unmatched route and automatically
// answers with a real HTTP 404 status — verified with:
//   curl -s -o /dev/null -w "%{http_code}" <site>/some-nonexistent-path
export const metadata = {
  title: 'Página no encontrada — Crunch & Munch',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <StaticHeader />
      <main className="bg-cream-gradient min-h-[60vh] flex items-center">
        <div className="container-max section-padding max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-gold-500 mb-4">Error 404</p>
          <h1 className="text-display text-4xl md:text-5xl text-coffee-800 leading-tight mb-6">
            No encontramos esa página
          </h1>
          <p className="text-coffee-500 leading-relaxed mb-8">
            El enlace que seguiste no existe o cambió de lugar. Aquí tienes dónde seguir buscando:
          </p>

          <ul className="space-y-3 text-coffee-700">
            <li>
              → <Link href="/" className="underline hover:text-gold-500">Inicio</Link> — catálogo completo de barras móviles
            </li>
            <li>
              → <Link href="/about" className="underline hover:text-gold-500">Nosotros</Link> — quiénes somos
            </li>
            <li>
              → <Link href="/contact" className="underline hover:text-gold-500">Contacto</Link> — WhatsApp e Instagram
            </li>
            <li>
              → <a href="/sitemap.xml" className="underline hover:text-gold-500">/sitemap.xml</a> — mapa del sitio
            </li>
            <li>
              → <a href="/llms.txt" className="underline hover:text-gold-500">/llms.txt</a> — guía del sitio para agentes de IA
            </li>
            <li>
              → <a href="/openapi.json" className="underline hover:text-gold-500">/openapi.json</a> — especificación de la API
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
