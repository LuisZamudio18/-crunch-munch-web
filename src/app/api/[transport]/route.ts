import { mcpHandlerApi } from '@/lib/mcpHandler';

// Conventional MCP endpoint: /api/mcp (this file matches /api/[transport]).
// See src/lib/mcpHandler.ts for the tool definitions — the same tools are
// also live at /.well-known/mcp via a second handler instance.
export { mcpHandlerApi as GET, mcpHandlerApi as POST, mcpHandlerApi as DELETE };
