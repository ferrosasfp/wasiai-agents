/**
 * Agent 2 — On-Chain Token Analyzer
 * POST / → { token_address }
 */
import { Hono } from 'hono'
import { analyzeOnChain } from '../../shared/onchain.js'

const app = new Hono()

app.post('/', async (c) => {
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

  try {
    const result = await analyzeOnChain(tokenAddress)
    return c.json(result)
  } catch (err) {
    return c.json({ error: `On-chain analyzer failed: ${String(err).slice(0, 200)}` }, 500)
  }
})

export default app
