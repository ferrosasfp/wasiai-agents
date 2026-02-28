/**
 * Agent 5 — Risk Scorer
 * Documented formula for aggregating 4 agent outputs into a 0-100 risk score.
 *
 * ══════════════════════════════════════════════════════════════
 * RISK SCORING FORMULA v1.0 (HU-7.6)
 * ══════════════════════════════════════════════════════════════
 *
 * FINAL SCORE = Σ (component_score × weight) + flag_penalties (capped at 100)
 *
 * Components and weights:
 * ┌─────────────────────┬────────┬──────────────────────────────────────┐
 * │ Component           │ Weight │ Source                               │
 * ├─────────────────────┼────────┼──────────────────────────────────────┤
 * │ Audit               │  35%   │ Agent 3 — contract security findings │
 * │ Concentration       │  25%   │ Agent 2 — top-10 holder concentration│
 * │ Volatility          │  25%   │ Agent 1 — 7d price volatility        │
 * │ Sentiment           │  15%   │ Agent 4 — name/description red flags │
 * └─────────────────────┴────────┴──────────────────────────────────────┘
 *
 * AUDIT SCORE:         CRITICAL→100, HIGH→75, MEDIUM→45, LOW→20, INFO→5, none→0
 * CONCENTRATION SCORE: ≥90%→100, 75-89%→80, 60-74%→60, 40-59%→35, <40%→10, N/A→50
 * VOLATILITY SCORE:    ≥80%→100, 50-79%→75, 25-49%→50, 10-24%→25, <10%→5, N/A→50
 * SENTIMENT SCORE:     Direct from Agent 4 (0-100), N/A→50
 *
 * FLAG PENALTIES:      age<7d→+10, mint_active→+5, is_proxy→+5
 *
 * RATINGS:             0-30→SAFE, 31-65→CAUTION, 66-100→AVOID
 * ══════════════════════════════════════════════════════════════
 */
import type {
  ChainlinkResult,
  OnChainResult,
  AuditResult,
  SentimentResult,
  RiskScore,
} from './types.js'

function auditComponentScore(audit: AuditResult | null): number {
  if (!audit || audit.findings.length === 0) return 0
  const worst = audit.findings.reduce<AuditResult['findings'][0] | null>((prev, curr) => {
    const order: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 }
    if (!prev) return curr
    return (order[curr.severity] ?? 0) > (order[prev.severity] ?? 0) ? curr : prev
  }, null)
  if (!worst) return 0
  const map: Record<string, number> = { CRITICAL: 100, HIGH: 75, MEDIUM: 45, LOW: 20, INFO: 5 }
  return map[worst.severity] ?? 0
}

function concentrationComponentScore(onchain: OnChainResult | null): number {
  const pct = onchain?.top10_concentration_pct
  if (pct === null || pct === undefined) return 50
  if (pct >= 90) return 100
  if (pct >= 75) return 80
  if (pct >= 60) return 60
  if (pct >= 40) return 35
  return 10
}

function volatilityComponentScore(chainlink: ChainlinkResult | null): number {
  if (!chainlink || chainlink.error) return 50
  const v = chainlink.volatility_7d_pct
  if (v >= 80) return 100
  if (v >= 50) return 75
  if (v >= 25) return 50
  if (v >= 10) return 25
  return 5
}

function sentimentComponentScore(sentiment: SentimentResult | null): number {
  if (!sentiment || sentiment.error) return 50
  return sentiment.sentiment_score
}

export function computeRiskScore(
  chainlink:   ChainlinkResult | null,
  onchain:     OnChainResult | null,
  audit:       AuditResult | null,
  sentiment:   SentimentResult | null,
): RiskScore {
  const WEIGHTS = { volatility: 0.25, concentration: 0.25, audit: 0.35, sentiment: 0.15 }

  const scores = {
    volatility:    volatilityComponentScore(chainlink),
    concentration: concentrationComponentScore(onchain),
    audit:         auditComponentScore(audit),
    sentiment:     sentimentComponentScore(sentiment),
  }

  const breakdown = {
    volatility:    { score: scores.volatility,    weight: WEIGHTS.volatility,    contribution: scores.volatility    * WEIGHTS.volatility    },
    concentration: { score: scores.concentration, weight: WEIGHTS.concentration, contribution: scores.concentration * WEIGHTS.concentration },
    audit:         { score: scores.audit,         weight: WEIGHTS.audit,         contribution: scores.audit         * WEIGHTS.audit         },
    sentiment:     { score: scores.sentiment,     weight: WEIGHTS.sentiment,     contribution: scores.sentiment     * WEIGHTS.sentiment     },
  }

  let total = Object.values(breakdown).reduce((sum, c) => sum + c.contribution, 0)

  // Flag penalties
  if (onchain) {
    if (onchain.contract_age_days >= 0 && onchain.contract_age_days < 7)  total += 10
    if (onchain.flags.has_mint_function)                                    total += 5
    if (onchain.flags.is_proxy)                                             total += 5
  }

  const finalScore = Math.min(100, Math.round(total))
  const rating: RiskScore['rating'] = finalScore <= 30 ? 'SAFE' : finalScore <= 65 ? 'CAUTION' : 'AVOID'

  return { total: finalScore, rating, breakdown }
}

export function generateSummary(
  tokenAddress: string,
  score: RiskScore,
  chainlink: ChainlinkResult | null,
  onchain: OnChainResult | null,
  audit: AuditResult | null,
  sentiment: SentimentResult | null,
): string {
  const ratingEmoji: Record<string, string> = { SAFE: '✅', CAUTION: '⚠️', AVOID: '🚫' }
  const name = onchain?.name ?? tokenAddress.slice(0, 10) + '...'
  const symbol = onchain?.symbol ?? '???'
  const price = chainlink?.price_usd ? `$${chainlink.price_usd.toFixed(4)}` : 'N/A'

  const criticalFindings = audit?.findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH') ?? []
  const criticalText = criticalFindings.length > 0
    ? ` Critical issues: ${criticalFindings.map(f => f.title).join(', ')}.`
    : ''

  return `${ratingEmoji[score.rating] ?? ''} ${name} (${symbol}) — Risk Score: ${score.total}/100 [${score.rating}]. ` +
    `Current price: ${price}. ` +
    `Holder concentration (top-10): ${onchain?.top10_concentration_pct != null ? onchain.top10_concentration_pct + '%' : 'unknown'}. ` +
    `7d volatility: ${chainlink?.volatility_7d_pct != null ? chainlink.volatility_7d_pct.toFixed(1) + '%' : 'unknown'}.` +
    criticalText +
    ` Sentiment: ${sentiment?.analysis ?? 'not analyzed'}`
}
