import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { listMcpTools, callMcpTool } from './mcpClient'

// Real-HTTP integration: spin up a tiny in-process MCP server that speaks
// JSON-RPC 2.0 over Streamable HTTP, then drive the actual client against it
// (real fetch, no mocks). Proves the handshake → session-id → tools/list →
// tools/call round-trip works against a live endpoint.
describe('MCP client · live HTTP round-trip', () => {
  let server: http.Server
  let base = ''

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', () => {
        let msg: { id: number; method: string; params?: { name?: string } }
        try { msg = JSON.parse(body) } catch { res.writeHead(400).end('bad json'); return }
        const headers: Record<string, string> = { 'content-type': 'application/json' }
        let result: unknown = {}
        if (msg.method === 'initialize') {
          headers['mcp-session-id'] = 'live-session-123'
          result = { protocolVersion: '2024-11-05', serverInfo: { name: 'ohmyhotel-mock' } }
        } else if (msg.method === 'tools/list') {
          // echo whether the client sent the session id back (proves propagation)
          result = { tools: [{ name: 'get_revenue', description: req.headers['mcp-session-id'] === 'live-session-123' ? 'session-ok' : 'no-session' }] }
        } else if (msg.method === 'tools/call') {
          result = { content: [{ type: 'text', text: `revenue for ${msg.params?.name}: ¥489,174,608` }] }
        }
        res.writeHead(200, headers)
        res.end(JSON.stringify({ jsonrpc: '2.0', id: msg.id, result }))
      })
    })
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/rpc`
  })

  afterAll(() => new Promise<void>((r) => server.close(() => r())))

  it('handshakes, propagates the session id, lists and calls a tool', async () => {
    const tools = await listMcpTools(base, '')
    expect(tools.map((t) => t.name)).toEqual(['get_revenue'])
    expect(tools[0].description).toBe('session-ok') // session id echoed on tools/list

    const out = await callMcpTool(base, '', 'get_revenue', { month: '2026-04' })
    expect(out).toBe('revenue for get_revenue: ¥489,174,608')
  })
})
