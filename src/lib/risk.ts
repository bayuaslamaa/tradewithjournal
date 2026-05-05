type NumericInput = string | number | null | undefined

export interface PlannedRR {
  riskPct: string
  rewardPct: string
  rr: string
}

export interface SpotRiskPlan {
  maxLossAmount: string
  recommendedBuyAmount: string
  estimatedQuantity: string
  riskPct: string
  plannedRewardAmount: string | null
  plannedRR: string | null
}

function toPositiveNumber(value: NumericInput): number | null {
  const n = typeof value === 'number' ? value : parseFloat(value ?? '')
  return Number.isFinite(n) && n > 0 ? n : null
}

export function calcPnl(
  entry: NumericInput,
  exec: NumericInput,
  direction: string | null | undefined,
): string | null {
  const e = toPositiveNumber(entry)
  const x = toPositiveNumber(exec)
  if (!e || !x) return null
  const raw = ((x - e) / e) * 100
  const pnl = direction === 'SHORT' ? -raw : raw
  return pnl.toFixed(2)
}

export function calcPlannedRR(
  entry: NumericInput,
  sl: NumericInput,
  tp: NumericInput,
): PlannedRR | null {
  const e = toPositiveNumber(entry)
  const s = toPositiveNumber(sl)
  const t = toPositiveNumber(tp)
  if (!e || !s || !t || s >= e || t <= e) return null
  const risk = ((e - s) / e) * 100
  const reward = ((t - e) / e) * 100
  const rr = reward / risk
  return { riskPct: risk.toFixed(2), rewardPct: reward.toFixed(2), rr: rr.toFixed(2) }
}

export function calcSpotRiskPlan({
  portfolioValue,
  riskPercent,
  entryPrice,
  stopLoss,
  takeProfit,
}: {
  portfolioValue: NumericInput
  riskPercent: NumericInput
  entryPrice: NumericInput
  stopLoss: NumericInput
  takeProfit?: NumericInput
}): SpotRiskPlan | null {
  const portfolio = toPositiveNumber(portfolioValue)
  const risk = toPositiveNumber(riskPercent)
  const entry = toPositiveNumber(entryPrice)
  const stop = toPositiveNumber(stopLoss)

  if (!portfolio || !risk || !entry || !stop || stop >= entry) return null

  const maxLossAmount = portfolio * (risk / 100)
  const stopDistancePct = ((entry - stop) / entry) * 100
  const recommendedBuyAmount = maxLossAmount / (stopDistancePct / 100)
  const estimatedQuantity = recommendedBuyAmount / entry

  const tp = toPositiveNumber(takeProfit)
  const rewardPct = tp && tp > entry ? ((tp - entry) / entry) * 100 : null
  const plannedRR = rewardPct ? rewardPct / stopDistancePct : null
  const plannedRewardAmount = rewardPct ? recommendedBuyAmount * (rewardPct / 100) : null

  return {
    maxLossAmount: maxLossAmount.toFixed(2),
    recommendedBuyAmount: recommendedBuyAmount.toFixed(2),
    estimatedQuantity: estimatedQuantity.toFixed(8),
    riskPct: stopDistancePct.toFixed(2),
    plannedRewardAmount: plannedRewardAmount ? plannedRewardAmount.toFixed(2) : null,
    plannedRR: plannedRR ? plannedRR.toFixed(2) : null,
  }
}
