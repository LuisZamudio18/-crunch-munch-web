import { NextResponse } from 'next/server';
import { getService } from '@/lib/catalogApi';
import { apiError, methodNotAllowed } from '@/lib/apiError';

// GET /api/v1/services/{id} — operationId: getService (see /openapi.json)
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const service = getService(params.id);

  if (!service) {
    return apiError(
      404,
      'SERVICE_NOT_FOUND',
      `No existe una barra con id "${params.id}".`,
      'Usa GET /api/v1/services para ver los ids válidos.'
    );
  }

  return NextResponse.json({ data: service }, { headers: { 'Cache-Control': 'public, max-age=300' } });
}

export async function POST() {
  return methodNotAllowed(['GET']);
}
export async function PUT() {
  return methodNotAllowed(['GET']);
}
export async function DELETE() {
  return methodNotAllowed(['GET']);
}
export async function PATCH() {
  return methodNotAllowed(['GET']);
}
