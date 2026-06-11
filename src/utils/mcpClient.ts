// C-10: a minimal MCP (Model Context Protocol) client over Streamable HTTP.
// Talks JSON-RPC 2.0 to an MCP server endpoint so the Ohmyhotel internal DB can
// expose its data/stats as MCP "tools" the CRM pulls on demand. No backend of our
// own — the browser calls the MCP endpoint directly with the user's token.
//
// This is the client half only; it works against any compliant MCP-over-HTTP
// server. Until one is wired up, the Settings card lets the user test/list tools.

export interface McpTool {
  name: string
  description?: string
  inputSchema?: unknown
}

interface JsonRpcResult<T> {
  jsonrpc: '2.0'
  id: number | string
  result?: T
  error?: { code: number; message: string }
}

let rpcId = 0

async function rpc<T>(endpoint: string, token: string, method: string, params?: unknown): Promise<T> {
  if (!endpoint.trim()) throw new Error('no-endpoint')
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...(token.trim() ? { authorization: `Bearer ${token.trim()}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params: params ?? {} }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`MCP ${res.status}: ${body.slice(0, 200)}`)
  }
  // Servers may answer as JSON or as a one-shot SSE frame — handle both.
  const contentType = res.headers.get('content-type') ?? ''
  const raw = await res.text()
  const json: JsonRpcResult<T> = contentType.includes('text/event-stream')
    ? JSON.parse(raw.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('') || '{}')
    : JSON.parse(raw || '{}')
  if (json.error) throw new Error(`MCP: ${json.error.message}`)
  return json.result as T
}

/** Handshake + list the tools the server exposes. Used by the Settings "test". */
export async function listMcpTools(endpoint: string, token: string): Promise<McpTool[]> {
  // initialize is best-effort — some servers don't require it for tools/list.
  await rpc(endpoint, token, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'OAC', version: '1.0' },
  }).catch(() => undefined)
  const out = await rpc<{ tools?: McpTool[] }>(endpoint, token, 'tools/list')
  return out.tools ?? []
}

/** Call a tool and return its text content (joined). */
export async function callMcpTool(endpoint: string, token: string, name: string, args: Record<string, unknown> = {}): Promise<string> {
  const out = await rpc<{ content?: { type: string; text?: string }[] }>(endpoint, token, 'tools/call', { name, arguments: args })
  return (out.content ?? []).filter((c) => c.type === 'text' && c.text).map((c) => c.text).join('\n')
}
