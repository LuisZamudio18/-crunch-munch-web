import type { Metadata } from 'next';
import StaticHeader from '@/components/layout/StaticHeader';
import Footer from '@/components/layout/Footer';
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: `Crunch & Munch para desarrolladores y agentes de IA`,
  description:
    'Servidor MCP, catálogo de barras y llms.txt de Crunch & Munch: cómo consultar el catálogo y armar cotizaciones de forma programática.',
  alternates: { canonical: '/developers' },
  openGraph: {
    title: 'Crunch & Munch para desarrolladores y agentes de IA',
    description: 'Servidor MCP y recursos machine-readable de Crunch & Munch.',
    url: '/developers',
    type: 'website',
  },
};

const MCP_CONFIG = `{
  "crunch-munch": {
    "url": "${SITE_URL}/api/mcp"
  }
}`;

export default function DevelopersPage() {
  return (
    <>
      <StaticHeader />
      <main className="bg-cream-gradient min-h-[60vh]">
        <div className="container-max section-padding max-w-3xl">
          <p className="text-xs uppercase tracking-widest text-gold-500 mb-4">{SITE_NAME}</p>
          <h1 className="text-display text-4xl md:text-5xl text-coffee-800 leading-tight mb-6">
            Para desarrolladores y agentes de IA
          </h1>
          <p className="text-coffee-500 leading-relaxed mb-10 text-lg">
            {SITE_NAME} publica su catálogo de barras móviles como datos machine-readable, para que
            agentes de IA (Claude, ChatGPT y similares) puedan consultarlo directamente en lugar de
            adivinar a partir de la página visual.
          </p>

          <div className="space-y-10">
            <section>
              <h2 className="font-sans font-semibold text-coffee-800 text-xl mb-3">Servidor MCP</h2>
              <p className="text-coffee-500 leading-relaxed mb-3">
                Exponemos un servidor <a className="underline hover:text-gold-500" href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">Model Context Protocol</a> por
                Streamable HTTP, sin autenticación, con tres herramientas: <code>list_services</code> (catálogo,
                filtrable por categoría), <code>get_service</code> (detalle de una barra por id) y{' '}
                <code>build_quote_link</code> (genera un link de WhatsApp con la cotización armada).
              </p>
              <p className="text-coffee-500 leading-relaxed mb-3">
                Endpoint: <code className="bg-coffee-800/5 px-1.5 py-0.5 rounded">{SITE_URL}/api/mcp</code>
              </p>
              <p className="text-coffee-500 leading-relaxed mb-2">Configuración para un cliente MCP (Claude Desktop, Cursor, etc.):</p>
              <pre className="bg-coffee-900 text-cream-200 text-xs rounded-xl p-4 overflow-x-auto">
                <code>{MCP_CONFIG}</code>
              </pre>
            </section>

            <section>
              <h2 className="font-sans font-semibold text-coffee-800 text-xl mb-3">Otros recursos machine-readable</h2>
              <ul className="space-y-2 list-disc list-inside text-coffee-500 leading-relaxed">
                <li><a className="underline hover:text-gold-500" href="/llms.txt">/llms.txt</a> — índice del sitio para LLMs, con guía de cuándo usarnos.</li>
                <li><a className="underline hover:text-gold-500" href="/.well-known/mcp">/.well-known/mcp</a> — manifiesto de descubrimiento del servidor MCP.</li>
                <li><a className="underline hover:text-gold-500" href="/sitemap.xml">/sitemap.xml</a> — mapa del sitio.</li>
                <li>
                  Contenido en markdown por negociación de <code>Accept</code>: <code>curl -H &quot;Accept: text/markdown&quot; {SITE_URL}/</code>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
