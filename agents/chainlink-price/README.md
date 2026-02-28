# Agent 1 — Chainlink Price Feed Reader

Reads a Chainlink AggregatorV3 feed on-chain and returns the current price plus 7-day volatility.

## Endpoint

```
POST /api/chainlink-price
```

## Input

```json
{
  "feed_address": "0x...",   // optional if CHAINLINK_AVAX_USD_FEED env set
  "token_symbol": "AVAX"    // optional label (default: UNKNOWN)
}
```

## Output

```json
{
  "feed_address": "0x...",
  "token_symbol": "AVAX",
  "price_usd": 38.42,
  "timestamp": 1709123456,
  "round_id": "110680464442257309792",
  "history": [{ "round_id": "...", "price_usd": 37.1, "timestamp": 1709037056 }],
  "volatility_7d_pct": 4.85
}
```

## Env vars

- `RPC_URL` — Avalanche RPC endpoint (default: Fuji testnet)
- `CHAINLINK_AVAX_USD_FEED` — Default Chainlink feed address
