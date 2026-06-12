import { describe, it, expect, vi, afterEach } from 'vitest'
import { listMcpTools, callMcpTool } from './mcpClient'

// Minimal Response-like stub so the test doesn't depend on a global Response.
function res(body: string, { contentType = 'application/json', ok = true, status = 200, headers = {} as Record<string, string> } = {}) {
  const all: Record<string, string> = { 'content-type': contentType, ...headers }
  return {
    ok,
    status,
    headers: { get: (h: string) => all[h.toLowerCase()] ?? null },
    text: async () => body,
  }
}
const rpcOk = (result: unknown) => res(JSON.stringify({ jsonrpc: '2.0', id: 1, result }))

afterEach(() => vi.unstubAllGlobals())

describe('MCP-over-HTTP client (simulated server)', () => {
  it('handshakes (initialize) then lists tools, with bearer auth on every call', async () => {
    const methods: string[] = []
    const auths: (string | undefined)[] = []
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: { body: string; headers: Record<string, string> }) => {
      const body = JSON.parse(init.body)
      methods.push(body.method)
      auths.push(init.headers.authorization)
      if (body.method === 'tools/list') return rpcOk({ tools: [{ name: 'get_sales', description: 'Monthly sales' }] })
      return rpcOk({ protocolVersion: '2024-11-05' })
    }))

    const tools = await listMcpTools('https://mcp.ohmyhotel.example/rpc', 'secret-token')
    expect(tools).toEqual([{ name: 'get_sales', description: 'Monthly sales' }])
    expect(methods).toEqual(['initialize', 'tools/list'])
    expect(auths.every((a) => a === 'Bearer secret-token')).toBe(true)
  })

  it('still lists tools when the server rejects initialize (best-effort handshake)', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: { body: string }) => {
      const body = JSON.parse(init.body)
      if (body.method === 'initialize') return res('not supported', { ok: false, status: 400 })
      return rpcOk({ tools: [{ name: 'x' }] })
    }))
    expect(await listMcpTools('https://mcp.example/rpc', '')).toHaveLength(1)
  })

  it('calls a tool with arguments and joins its text content', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: { body: string }) => {
      const body = JSON.parse(init.body)
      expect(body.method).toBe('tools/call')
      expect(body.params).toEqual({ name: 'get_sales', arguments: { month: '2026-04' } })
      return rpcOk({ content: [{ type: 'text', text: 'Agoda ¥489M' }, { type: 'text', text: 'Klook ¥120M' }, { type: 'image' }] })
    }))
    const out = await callMcpTool('https://mcp.example/rpc', 't', 'get_sales', { month: '2026-04' })
    expect(out).toBe('Agoda ¥489M\nKlook ¥120M') // image block dropped
  })

  it('parses a one-shot SSE (text/event-stream) response frame', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: { body: string }) => {
      const body = JSON.parse(init.body)
      const result = body.method === 'tools/list' ? { tools: [{ name: 'sse-tool' }] } : {}
      const payload = JSON.stringify({ jsonrpc: '2.0', id: 1, result })
      return res(`event: message\ndata: ${payload}\n\n`, { contentType: 'text/event-stream' })
    }))
    const tools = await listMcpTools('https://mcp.example/rpc', '')
    expect(tools[0].name).toBe('sse-tool')
  })

  it('throws on a JSON-RPC error result', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => res(JSON.stringify({ jsonrpc: '2.0', id: 1, error: { code: -32601, message: 'Method not found' } }))))
    await expect(callMcpTool('https://mcp.example/rpc', '', 'nope')).rejects.toThrow(/Method not found/)
  })

  it('throws on a transport (HTTP) error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => res('upstream down', { ok: false, status: 502 })))
    await expect(callMcpTool('https://mcp.example/rpc', '', 'x')).rejects.toThrow(/MCP 502/)
  })

  it('captures the Mcp-Session-Id from initialize and echoes it on later calls', async () => {
    const sessionHeaders: (string | undefined)[] = []
    const endpoint = 'https://mcp.session.example/rpc'
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: { body: string; headers: Record<string, string> }) => {
      const body = JSON.parse(init.body)
      sessionHeaders.push(init.headers['mcp-session-id'])
      if (body.method === 'initialize') return res(JSON.stringify({ jsonrpc: '2.0', id: 1, result: {} }), { headers: { 'mcp-session-id': 'sess-xyz' } })
      return rpcOk({ tools: [{ name: 't' }] })
    }))
    await listMcpTools(endpoint, 'tok')
    // initialize had no session id yet; tools/list (after capture) echoes it
    expect(sessionHeaders[0]).toBeUndefined()
    expect(sessionHeaders[1]).toBe('sess-xyz')
  })

  it('refuses to call without an endpoint', async () => {
    await expect(callMcpTool('', '', 'x')).rejects.toThrow(/no-endpoint/)
  })

  it('omits the authorization header when no token is set', async () => {
    let auth: string | undefined | null = 'unset'
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: { body: string; headers: Record<string, string> }) => {
      auth = init.headers.authorization ?? null
      const body = JSON.parse(init.body)
      return rpcOk(body.method === 'tools/list' ? { tools: [] } : {})
    }))
    await listMcpTools('https://mcp.example/rpc', '')
    expect(auth).toBeNull()
  })
})
