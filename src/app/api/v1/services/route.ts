import { NextRequest, NextResponse } from 'next/server';
import { CATEGORY_VALUES, isServiceCategory, listServices } from '@/lib/catalogApi';
import { apiError, methodNotAllowed } from '@/lib/apiError';

// GET /api/v1/services?category=bebidas — operationId: listServices (see /openapi.json)
export async function GET(request: NextRequest) {
  const categoryParam = request.nextUrl.searchParams.get('category');

  if (categoryParam !== null && !isServiceCategory(categoryParam)) {
    return apiError(
      400,
      'INVALID_CATEGORY',
      `"${categoryParam}" no es una categoría válida.`,
      `Usa una de: ${CATEGORY_VALUES.join(', ')}.`
    );
  }

  const data = listServices(categoryParam ?? undefined);
  return NextResponse.json(
    { data, meta: { count: data.length } },
    { headers: { 'Cache-Control': 'public, max-age=300' } }
  );
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
