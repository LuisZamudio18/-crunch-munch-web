import { NextResponse } from 'next/server';

/**
 * Structured JSON error body for the REST API (src/app/api/v1/**). Every
 * error response uses this exact shape — { error: { code, message, hint } }
 * — instead of Next's default HTML/plain-text error pages, so agents can
 * parse failures programmatically.
 */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    hint?: string;
  };
}

export function apiError(status: number, code: string, message: string, hint?: string): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message, ...(hint ? { hint } : {}) } }, { status });
}

export function methodNotAllowed(allow: string[]): NextResponse<ApiErrorBody> {
  return apiError(
    405,
    'METHOD_NOT_ALLOWED',
    `Este endpoint no soporta ese método HTTP.`,
    `Métodos permitidos: ${allow.join(', ')}.`
  );
}
