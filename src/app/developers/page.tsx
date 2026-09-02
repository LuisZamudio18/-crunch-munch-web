import type { Metadata } from 'next';
import StaticHeader from '@/components/layout/StaticHeader';
import Footer from '@/components/layout/Footer';
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig';

export const metadata: Metadata = {
  title: `Crunch & Munch para desarrolladores y agentes de IA`,
  description:
    'API REST, especificación OpenAPI, servidor MCP y llms.txt de Crunch & Munch: cómo consultar el catálogo y armar cotizaciones de forma programática.',
  alternates: { canonical: '/developers' },
  openGraph: {
    title: 'Crunch & Munch para desarrolladores y agentes de IA',
    description: 'API REST, OpenAPI, servidor MCP y recursos machine-readable de Crunch & Munch.',
    url: '/developers',
    type: 'website',
  },
};

const MCP_CONFIG = `{
  "crunch-munch": {
    "url": "${SITE_URL}/api/mcp"
  }
}`;

const CURL_EXAMPLE = `curl ${SITE_URL}/api/v1/services?category=bebidas
curl ${SITE_URL}/api/v1/services/coffee-bar
curl -X POST ${SITE_URL}/api/v1/quote-link \\
  -H "Content-Type: application/json" \\
  -d '{"serviceIds":["coffee-bar"]}'`;

const ERROR_EXAMPLE = `{
  "error": {
    "code": "SERVICE_NOT_FOUND",
    "message": "No existe una barra con id \\"xyz\\".",
    "hint": "Usa GET /api/v1/services para ver los ids válidos."
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
            {SITE_NAME} publica su catálogo de barras móviles como datos machine-readable — vía REST y
            vía MCP — para que agentes de IA (Claude, ChatGPT y similares) puedan consultarlo
            directamente en lugar de adivinar a partir de la página visual.
          </p>

          <div className="space-y-10">
            <section>
              <h2 className="font-sans font-semibold text-coffee-800 text-xl mb-3">API REST</h2>
              <p className="text-coffee-500 leading-relaxed mb-3">
                Tres operaciones de solo lectura, documentadas en{' '}
                <a className="underline hover:text-gold-500" href="/openapi.json">/openapi.json</a> (OpenAPI 3.1,
                cada operación con <code>operationId</code>, tipos y respuestas de error):
              </p>
              <ul className="space-y-1 list-disc list-inside text-coffee-500 leading-relaxed mb-3">
                <li><code>GET /api/v1/services</code> (<code>listServices</code>) — catálogo, filtrable por <code>?category=</code>.</li>
                <li><code>GET /api/v1/services/{'{id}'}</code> (<code>getService</code>) — detalle completo de una barra.</li>
                <li><code>POST /api/v1/quote-link</code> (<code>buildQuoteLink</code>) — arma el link de WhatsApp con la cotización.</li>
              </ul>
              <pre className="bg-coffee-900 text-cream-200 text-xs rounded-xl p-4 overflow-x-auto mb-3">
                <code>{CURL_EXAMPLE}</code>
              </pre>
              <p className="text-coffee-500 leading-relaxed mb-2">
                Los errores siempre son JSON con código, mensaje y sugerencia de corrección — nunca una página HTML:
              </p>
              <pre className="bg-coffee-900 text-cream-200 text-xs rounded-xl p-4 overflow-x-auto">
                <code>{ERROR_EXAMPLE}</code>
              </pre>
            </section>

            <section>
              <h2 className="font-sans font-semibold text-coffee-800 text-xl mb-3">Servidor MCP</h2>
              <p className="text-coffee-500 leading-relaxed mb-3">
                Exponemos un servidor <a className="underline hover:text-gold-500" href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">Model Context Protocol</a> por
                Streamable HTTP, sin autenticación, con tres herramientas equivalentes a la API REST:{' '}
                <code>list_services</code>, <code>get_service</code> y <code>build_quote_link</code>.
              </p>
              <p className="text-coffee-500 leading-relaxed mb-3">
                Endpoint: <code className="bg-coffee-800/5 px-1.5 py-0.5 rounded">{SITE_URL}/api/mcp</code>{' '}
                — también responde en <code className="bg-coffee-800/5 px-1.5 py-0.5 rounded">/.well-known/mcp</code> (mismo
                handshake por <code>POST</code>; un <code>GET</code> ahí devuelve un manifiesto de descubrimiento en JSON).
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
