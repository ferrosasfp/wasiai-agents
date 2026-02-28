# WasiAI Agents

Independent AI-powered DeFi risk intelligence agents, built with Hono.js and deployable on Vercel serverless.

## Agents

| Agent | Endpoint | Description |
|-------|----------|-------------|
| Chainlink Price | `POST /api/chainlink-price` | Reads on-chain Chainlink price feeds + 7d volatility |
| On-Chain Analyzer | `POST /api/onchain-analyzer` | ERC-20 metadata, flags, holder concentration |
| Contract Auditor | `POST /api/contract-auditor` | AI-powered security audit via Groq llama-3.3-70b |
| DeFi Sentiment | `POST /api/defi-sentiment` | Token name/description red-flag detection |
| Risk Report | `POST /api/risk-report` | Orchestrates all 4 agents → 0-100 risk score |

## Quick Start

```bash
npm install

# Set env vars
cp .env.example .env
# Edit .env with your keys

npm run typecheck
```

## Deploy to Vercel

```bash
vercel deploy
```

Set environment variables in Vercel dashboard:
- `GROQ_API_KEY`
- `RPC_URL`
- `CHAINLINK_AVAX_USD_FEED`
- `SNOWTRACE_BASE_URL` (optional)
- `SNOWTRACE_API_KEY` (optional)

## Architecture

```
agents/
  chainlink-price/   → shared/chainlink.ts
  onchain-analyzer/  → shared/onchain.ts
  contract-auditor/  → shared/auditor.ts
  defi-sentiment/    → shared/sentiment.ts
  risk-report/       → all shared + riskScorer.ts (orchestrator)

shared/
  lib/web3/client.ts     ← viem public client
  lib/agents/groq.ts     ← Groq LLM wrapper
  types.ts               ← shared TypeScript interfaces
  chainlink.ts, onchain.ts, auditor.ts, sentiment.ts, riskScorer.ts
```

## Risk Score Formula

```
FINAL SCORE = Σ (component × weight) + flag_penalties  [capped at 100]

Audit        35% | Concentration  25% | Volatility 25% | Sentiment 15%

0-30  → ✅ SAFE
31-65 → ⚠️ CAUTION
66+   → 🚫 AVOID
```
