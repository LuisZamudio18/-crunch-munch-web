/**
 * Structured content for the trust-anchor pages (About/Contact/Privacy) and
 * the homepage summary. Kept as data (not JSX) so both the React pages and
 * the text/markdown variant served via content negotiation render the exact
 * same words — no drift between the HTML a person sees and the markdown an
 * agent fetches.
 */

export interface ContentSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface PageContent {
  title: string;
  intro: string;
  sections: ContentSection[];
}

export const ABOUT_CONTENT: PageContent = {
  title: 'Nosotros',
  intro:
    'Crunch & Munch nació de la pasión por crear experiencias gastronómicas únicas. Somos una empresa de mobile bars premium especializada en llevar barras temáticas de alta calidad a tus eventos más especiales.',
  sections: [
    {
      heading: 'Lo que hacemos',
      paragraphs: [
        'Desde barras de café hasta charcutería gourmet, cada servicio está cuidadosamente curado para complementar la estética de tu evento y deleitar a cada invitado.',
        'Diseñamos e instalamos barras móviles temáticas — bebidas, postres, botanas y brunch — para bodas, eventos corporativos, quinceañeras, baby showers y celebraciones privadas en todo Tabasco.',
      ],
    },
    {
      heading: 'Nuestros pilares',
      paragraphs: [],
      list: [
        'Experiencia Premium — cada barra está diseñada con atención al detalle para crear una experiencia visual y gastronómica de lujo.',
        'Personalización Total — elige tus barras, toppings y decoración. Cada evento es único como tú.',
        'Ingredientes Selectos — trabajamos con los mejores proveedores para garantizar calidad y frescura en cada servicio.',
      ],
    },
  ],
};

export const CONTACT_CONTENT: PageContent = {
  title: 'Contacto',
  intro:
    'La forma más rápida de cotizar con nosotros es armar tu selección de barras en el configurador y enviarla por WhatsApp — llega directo al equipo de Crunch & Munch con todos los detalles de tu evento ya organizados.',
  sections: [
    {
      heading: 'Cómo contactarnos',
      paragraphs: [],
      list: [
        `WhatsApp: +52 993 110 0808 — para dudas rápidas o para enviar tu cotización armada.`,
        `Instagram: @crunchandmunch_snackbar — para ver fotos de montajes reales y eventos anteriores.`,
      ],
    },
    {
      heading: 'Zona de cobertura',
      paragraphs: [
        'Damos servicio en todos los municipios de Tabasco, México. Al armar tu cotización, indícanos el lugar del evento y te confirmamos disponibilidad y logística de traslado por WhatsApp.',
      ],
    },
    {
      heading: 'Cómo pedir una cotización',
      paragraphs: [
        'Usa el botón "Cotizar" para elegir tus barras, personalizar toppings y decoración, y capturar los datos de tu evento (fecha, horario, lugar, número de personas). Al terminar, el sitio genera un mensaje de WhatsApp ya redactado — solo lo envías y el equipo te responde con la cotización.',
        'Si prefieres platicarlo directo, puedes escribirnos por WhatsApp o Instagram sin pasar por el configurador.',
      ],
    },
  ],
};

export const PRIVACY_CONTENT: PageContent = {
  title: 'Aviso de privacidad',
  intro:
    'Este sitio es un catálogo y cotizador informativo. No tiene servidor propio de recolección de datos: no usamos cookies de rastreo ni analítica de terceros, y no almacenamos tus datos personales en una base de datos.',
  sections: [
    {
      heading: 'Qué información pasa por el sitio',
      paragraphs: [
        'El configurador de cotizaciones guarda temporalmente tus selecciones (barras, toppings, datos del evento) solo en la memoria de tu navegador, mientras usas el sitio. Esta información nunca se envía a un servidor de Crunch & Munch: al finalizar, el sitio arma un mensaje de texto y lo abre directamente en WhatsApp, para que tú decidas si lo envías.',
        'Si envías ese mensaje, los datos (nombre, teléfono, fecha del evento, lugar, número de personas y las barras elegidas) los recibe el número de WhatsApp de Crunch & Munch (+52 993 110 0808) y quedan sujetos a las políticas de privacidad de WhatsApp/Meta, no a las de este sitio web.',
      ],
    },
    {
      heading: 'Cookies y analítica',
      paragraphs: [
        'Este sitio no utiliza cookies de rastreo ni herramientas de analítica de terceros (por ejemplo, Google Analytics) al día de esta publicación. Si eso cambia en el futuro, actualizaremos este aviso.',
      ],
    },
    {
      heading: 'Contacto sobre privacidad',
      paragraphs: [
        'Si tienes dudas sobre el manejo de tu información, escríbenos por WhatsApp (+52 993 110 0808) o Instagram (@crunchandmunch_snackbar).',
      ],
    },
    {
      heading: 'Última actualización',
      paragraphs: ['Septiembre de 2026.'],
    },
  ],
};
