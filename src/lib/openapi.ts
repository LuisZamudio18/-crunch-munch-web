import { CATEGORY_VALUES } from '@/lib/catalogApi';
import { SITE_NAME, SITE_URL } from '@/lib/siteConfig';

/**
 * OpenAPI 3.1 description of the read-only REST API under /api/v1. Every
 * operation below has a unique operationId, a description, typed
 * parameters, and a typed response (including the shared Error schema) —
 * the shape LLM function-calling importers expect. Kept as one hand-written
 * source of truth rather than generated, since the surface is small and
 * stable; the route handlers in src/app/api/v1/** implement exactly this.
 */
export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: `${SITE_NAME} API`,
    version: '1.0.0',
    description:
      'API de solo lectura para el catálogo de barras móviles (servicios) de Crunch & Munch y para generar links de cotización por WhatsApp. No procesa pagos ni confirma reservaciones — un humano confirma disponibilidad y precio por WhatsApp.',
    contact: { url: `${SITE_URL}/developers` },
  },
  servers: [{ url: SITE_URL }],
  paths: {
    '/api/v1/services': {
      get: {
        operationId: 'listServices',
        summary: 'Lista el catálogo de barras móviles',
        description:
          'Devuelve todas las barras (servicios) de Crunch & Munch, opcionalmente filtradas por categoría. Cada barra incluye id, nombre, categoría, descripción corta y mínimo de personas.',
        parameters: [
          {
            name: 'category',
            in: 'query',
            required: false,
            description: 'Filtra por categoría. Si se omite, devuelve las 24 barras.',
            schema: { type: 'string', enum: [...CATEGORY_VALUES] },
          },
        ],
        responses: {
          '200': {
            description: 'Catálogo (filtrado o completo).',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['data', 'meta'],
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/ServiceSummary' } },
                    meta: {
                      type: 'object',
                      required: ['count'],
                      properties: { count: { type: 'integer', minimum: 0 } },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'La categoría enviada no existe.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/v1/services/{id}': {
      get: {
        operationId: 'getService',
        summary: 'Obtiene el detalle completo de una barra',
        description:
          'Devuelve el detalle completo de una barra por id, incluyendo sus grupos de selección (toppings/opciones disponibles para personalizarla).',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'El id de la barra, tal como lo devuelve listServices (ej. "coffee-bar").',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Detalle de la barra.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['data'],
                  properties: { data: { $ref: '#/components/schemas/Service' } },
                },
              },
            },
          },
          '404': {
            description: 'No existe una barra con ese id.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/v1/quote-link': {
      post: {
        operationId: 'buildQuoteLink',
        summary: 'Genera un link de WhatsApp con la cotización armada',
        description:
          'A partir de una lista de ids de barras y datos opcionales del evento, arma un mensaje de WhatsApp pre-llenado y devuelve el link listo para abrir. No cobra ni confirma nada por sí solo — el equipo humano de Crunch & Munch responde por WhatsApp.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['serviceIds'],
                properties: {
                  serviceIds: {
                    type: 'array',
                    minItems: 1,
                    items: { type: 'string' },
                    description: 'Ids de las barras elegidas, como los devuelve listServices.',
                  },
                  eventDetails: { $ref: '#/components/schemas/EventDetails' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Link de WhatsApp generado.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['data'],
                  properties: {
                    data: {
                      type: 'object',
                      required: ['url'],
                      properties: { url: { type: 'string', format: 'uri' } },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        unknownServiceIds: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Ids enviados que no corresponden a ninguna barra (se incluyeron como texto literal en el mensaje).',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'El cuerpo no cumple el esquema esperado (falta serviceIds, JSON inválido, etc.).',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string', description: 'Código de error estable, p. ej. SERVICE_NOT_FOUND.' },
              message: { type: 'string', description: 'Explicación legible del error.' },
              hint: { type: 'string', description: 'Sugerencia de cómo corregir la solicitud.' },
            },
          },
        },
      },
      ServiceSummary: {
        type: 'object',
        required: ['id', 'name', 'category', 'description', 'minPersonas'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string', enum: [...CATEGORY_VALUES] },
          description: { type: 'string' },
          minPersonas: { type: 'integer', minimum: 1 },
        },
      },
      ToppingCategory: {
        type: 'object',
        required: ['name', 'options'],
        properties: {
          name: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          maxPerCategory: { type: 'integer' },
        },
      },
      SelectionGroup: {
        type: 'object',
        required: ['id', 'label', 'instruction', 'type'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          instruction: { type: 'string' },
          type: { type: 'string', enum: ['choose-n', 'choose-1', 'fixed-display'] },
          totalMax: { type: 'integer' },
          categories: { type: 'array', items: { $ref: '#/components/schemas/ToppingCategory' } },
          options: { type: 'array', items: { type: 'string' } },
          fixedItems: {
            type: 'array',
            items: {
              type: 'object',
              required: ['label', 'items'],
              properties: { label: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } },
            },
          },
        },
      },
      Service: {
        allOf: [
          { $ref: '#/components/schemas/ServiceSummary' },
          {
            type: 'object',
            required: ['shortName', 'emoji', 'selectionGroups'],
            properties: {
              shortName: { type: 'string' },
              emoji: { type: 'string' },
              image: { type: 'string' },
              selectionGroups: { type: 'array', items: { $ref: '#/components/schemas/SelectionGroup' } },
            },
          },
        ],
      },
      EventDetails: {
        type: 'object',
        description: 'Datos opcionales del evento para incluir en el mensaje de WhatsApp.',
        properties: {
          nombre: { type: 'string' },
          fecha: { type: 'string' },
          lugar: { type: 'string' },
          personas: { type: 'string' },
          tipoEvento: { type: 'string' },
          comentarios: { type: 'string' },
        },
      },
    },
  },
} as const;
