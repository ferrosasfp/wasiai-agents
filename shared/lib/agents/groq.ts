/**
 * Groq LLM wrapper — thin fetch-based client
 */

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GroqOptions {
  messages: GroqMessage[]
  model?: string
  maxTokens?: number
  temperature?: number
}

export interface GroqResult {
  result: string
  model: string
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

export async function callGroq(opts: GroqOptions): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY env var not set')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model:       opts.model ?? 'llama-3.3-70b-versatile',
      messages:    opts.messages,
      max_tokens:  opts.maxTokens ?? 1024,
      temperature: opts.temperature ?? 0,
    }),
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Groq API error ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
    model: string
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
  }

  return {
    result: data.choices[0]?.message?.content ?? '',
    model:  data.model,
    usage:  data.usage,
  }
}
