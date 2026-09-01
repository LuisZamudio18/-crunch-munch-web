import { SERVICES } from '@/data/services';
import type { PageContent } from '@/lib/pageContent';
import { ABOUT_CONTENT, CONTACT_CONTENT, PRIVACY_CONTENT } from '@/lib/pageContent';
import { CONTACT, SERVICE_AREA, SITE_NAME, SITE_URL } from '@/lib/siteConfig';

/**
 * Renders a PageContent object (also used for the HTML trust-anchor pages)
 * as markdown, so the two representations never say different things.
 */
function renderPageContent(content: PageContent): string {
  const lines = [`# ${content.title}`, '', content.intro, ''];

  for (const section of content.sections) {
    lines.push(`## ${section.heading}`, '');
    for (const p of section.paragraphs) lines.push(p, '');
    if (section.list) {
      for (const item of section.list) lines.push(`- ${item}`);
      lines.push('');
    }
  }

  return lines.join('\n').trim() + '\n';
}

export function renderAboutMarkdown(): string {
  return renderPageContent(ABOUT_CONTENT);
}

export function renderContactMarkdown(): string {
  return renderPageContent(CONTACT_CONTENT);
}

export function renderPrivacyMarkdown(): string {
  return renderPageContent(PRIVACY_CONTENT);
}

const CATEGORY_LABELS: Record<string, string> = {
  bebidas: 'Bebidas',
  dulce: 'Dulce',
  salado: 'Salado',
  brunch: 'Brunch',
};

export function renderHomeMarkdown(): string {
  const lines: string[] = [
    `# ${SITE_NAME} — Luxury Mobile Bars`,
    '',
    'Barras móviles premium para bodas, corporativos y celebraciones. Diseñadas para crear recuerdos únicos.',
    '',
    '## Catálogo de servicios',
    '',
  ];

  for (const category of ['bebidas', 'dulce', 'salado', 'brunch'] as const) {
    const items = SERVICES.filter((s) => s.category === category);
    if (!items.length) continue;
    lines.push(`### ${CATEGORY_LABELS[category]}`, '');
    for (const s of items) {
      lines.push(`- **${s.name}** — ${s.description} (mín. ${s.minPersonas} personas)`);
    }
    lines.push('');
  }

  lines.push(
    '## Cobertura',
    '',
    SERVICE_AREA.description + '.',
    '',
    '## Contacto',
    '',
    `- WhatsApp: ${CONTACT.whatsappDisplay} (${CONTACT.whatsappUrl})`,
    `- Instagram: ${CONTACT.instagramHandle} (${CONTACT.instagramUrl})`,
    '',
    '## Más páginas',
    '',
    `- [Nosotros](${SITE_URL}/about)`,
    `- [Contacto](${SITE_URL}/contact)`,
    `- [Aviso de privacidad](${SITE_URL}/privacy)`,
    `- [Para desarrolladores / agentes](${SITE_URL}/developers)`,
    `- [llms.txt](${SITE_URL}/llms.txt)`,
    `- [sitemap.xml](${SITE_URL}/sitemap.xml)`
  );

  return lines.join('\n').trim() + '\n';
}
