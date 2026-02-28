# Agent 4 — DeFi Sentiment Analyzer

Uses Groq llama-3.3-70b to analyze a token's name, symbol, and description for red flags like FOMO naming, impersonation, and unrealistic promises.

## Endpoint

```
POST /api/defi-sentiment
```

## Input

```json
{
  "token_symbol": "SAFEMOON2",           // required
  "token_name": "SafeMoon 2.0",          // optional (defaults to token_symbol)
  "description": "100x guaranteed..."   // optional — project description
}
```

## Output

```json
{
  "token_name": "SafeMoon 2.0",
  "token_symbol": "SAFEMOON2",
  "sentiment_score": 85,
  "flags": ["FOMO naming", "Impersonation of SafeMoon", "Unrealistic promises"],
  "analysis": "This token shows multiple red flags typical of scam projects..."
}
```

`sentiment_score`: 0 (clean) → 100 (very suspicious)

## Env vars

- `GROQ_API_KEY` — required for LLM-powered analysis
