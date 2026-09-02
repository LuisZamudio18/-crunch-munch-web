import { openApiSpec } from '@/lib/openapi';

// Published at /openapi.json — describes the REST API under /api/v1/**.
export const dynamic = 'force-static';

export function GET() {
  return Response.json(openApiSpec, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
