# Agent 3 — Smart Contract Auditor

Uses Groq llama-3.3-70b to audit a token contract for security vulnerabilities and rug-pull patterns.

## Endpoint

```
POST /api/contract-auditor
```

## Input

```json
{
  "token_address": "0x...",   // required
  "bytecode": "0x608060..."   // optional — contract source/ABI/bytecode for deeper analysis
}
```

## Output

```json
{
  "token_address": "0x...",
  "findings": [
    {
      "severity": "HIGH",
      "title": "Unrestricted mint function",
      "description": "Owner can mint unlimited tokens at any time..."
    }
  ],
  "summary": "Contract presents high centralization risk...",
  "powered_by": "groq-llama"
}
```

Severity levels: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` | `INFO`

## Env vars

- `GROQ_API_KEY` — required for LLM-powered audit
