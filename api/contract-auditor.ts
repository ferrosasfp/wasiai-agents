/**
 * Agent 3 — Smart Contract Auditor
 * POST / → { token_address, bytecode? }
 */
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { auditContract } from '../shared/auditor.js'

const app = new Hono()

app.post('/*', async (c) => {
  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const tokenAddress = (body.token_address as string | undefined)?.trim()
  if (!tokenAddress) {
    return c.json({ error: 'Missing required field: token_address' }, 400)
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(tokenAddress)) {
    return c.json({ error: 'Invalid token_address — must be a 0x-prefixed 40-char hex address' }, 400)
  }

  const bytecode = (body.bytecode as string | undefined)?.trim()

  try {
    const result = await auditContract(tokenAddress, bytecode)
    if (result.error) {
      return c.json({ error: result.error, partial: result }, 502)
    }
    return c.json(result)
  } catch (err) {
    return c.json({ error: `Contract auditor failed: ${String(err).slice(0, 200)}` }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app)
