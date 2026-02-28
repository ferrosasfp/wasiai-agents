/**
 * Agent 1 — Chainlink Price Feed Reader
 * POST / → { feed_address?, token_symbol? }
 */
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { readChainlinkFeed } from '../../shared/chainlink.js'

const app = new Hono()

app.post('/', async (c) => {
  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const feedAddress = (body.feed_address as string | undefined)?.trim()
    ?? process.env.CHAINLINK_AVAX_USD_FEED?.trim()

  if (!feedAddress) {
    return c.json(
      { error: 'Missing feed_address. Provide in body or set CHAINLINK_AVAX_USD_FEED env var.' },
      400,
    )
  }

  const tokenSymbol = (body.token_symbol as string | undefined)?.trim() ?? 'UNKNOWN'

  try {
    const result = await readChainlinkFeed(feedAddress, tokenSymbol)
    if (result.error) {
      return c.json({ error: result.error, partial: result }, 502)
    }
    return c.json(result)
  } catch (err) {
    return c.json({ error: `Chainlink agent failed: ${String(err).slice(0, 200)}` }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app)
