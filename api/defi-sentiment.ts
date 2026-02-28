/**
 * Agent 4 — DeFi Sentiment Analyzer
 * POST / → { token_symbol, description? }
 */
import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { analyzeSentiment } from '../../shared/sentiment.js'

const app = new Hono()

app.post('/', async (c) => {
  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const tokenSymbol = (body.token_symbol as string | undefined)?.trim()
  if (!tokenSymbol) {
    return c.json({ error: 'Missing required field: token_symbol' }, 400)
  }

  // token_name defaults to token_symbol if not provided
  const tokenName = (body.token_name as string | undefined)?.trim() ?? tokenSymbol
  const description = (body.description as string | undefined)?.trim()

  try {
    const result = await analyzeSentiment(tokenName, tokenSymbol, description)
    if (result.error) {
      return c.json({ error: result.error, partial: result }, 502)
    }
    return c.json(result)
  } catch (err) {
    return c.json({ error: `Sentiment analyzer failed: ${String(err).slice(0, 200)}` }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app)
