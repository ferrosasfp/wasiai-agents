# Agent 2 — On-Chain Token Analyzer

Reads ERC-20 metadata, detects risk flags (mint, proxy, paused), and fetches holder concentration from Snowtrace.

## Endpoint

```
POST /api/onchain-analyzer
```

## Input

```json
{
  "token_address": "0x..."   // required — ERC-20 contract address
}
```

## Output

```json
{
  "token_address": "0x...",
  "name": "MyToken",
  "symbol": "MTK",
  "total_supply": "1000000000000000000000000",
  "decimals": 18,
  "contract_age_days": 42,
  "holder_count": 87,
  "top10_concentration_pct": 73,
  "flags": {
    "has_mint_function": true,
    "owner_renounced": false,
    "is_paused": false,
    "is_proxy": false,
    "bytecode_size_bytes": 4096
  }
}
```

## Env vars

- `RPC_URL` — Avalanche RPC endpoint
- `SNOWTRACE_BASE_URL` — Snowtrace API base (default: Fuji testnet)
- `SNOWTRACE_API_KEY` — optional API key
