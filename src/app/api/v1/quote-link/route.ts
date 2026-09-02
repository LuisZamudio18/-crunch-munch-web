import { NextResponse } from 'next/server';
import { z } from 'zod';
import { buildQuoteLink } from '@/lib/catalogApi';
import { apiError, methodNotAllowed } from '@/lib/apiError';

const RequestSchema = z.object({
  serviceIds: z.array(z.string()).min(1),
  eventDetails: z
    .object({
      nombre: z.string().optional(),
      fecha: z.string().optional(),
      lugar: z.string().optional(),
      personas: z.string().optional(),
      tipoEvento: z.string().optional(),
      comentarios: z.string().optional(),
    })
    .optional(),
});

// POST /api/v1/quote-link — operationId: buildQuoteLink (see /openapi.json)
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'El cuerpo de la solicitud no es JSON válido.', 'Envía Content-Type: application/json con un objeto JSON.');
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      400,
      'INVALID_BODY',
      'El cuerpo no cumple el esquema esperado.',
      `Se requiere "serviceIds" (array de strings, mínimo 1). Detalle: ${parsed.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ')}`
    );
  }

  const { serviceIds, eventDetails } = parsed.data;
  const result = buildQuoteLink(serviceIds, eventDetails);

  return NextResponse.json({
    data: { url: result.url },
    meta: result.unknownServiceIds.length ? { unknownServiceIds: result.unknownServiceIds } : undefined,
  });
}

export async function GET() {
  return methodNotAllowed(['POST']);
}
export async function PUT() {
  return methodNotAllowed(['POST']);
}
export async function DELETE() {
  return methodNotAllowed(['POST']);
}
export async function PATCH() {
  return methodNotAllowed(['POST']);
}
