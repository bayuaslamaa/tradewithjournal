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
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : null
  }

  let clean = String(value).trim()
  const lastComma = clean.lastIndexOf(',')
  const lastDot = clean.lastIndexOf('.')
  if (lastComma > lastDot) {
    // Comma is the decimal separator (e.g., "1.500,00" or "1500,00")
    clean = clean.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > lastComma) {
    // Dot is the decimal separator (e.g., "1,500.00" or "1500.00")
    clean = clean.replace(/,/g, '')
  }

  const n = parseFloat(clean)
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
  direction?: string | null,
): PlannedRR | null {
  const e = toPositiveNumber(entry)
  const s = toPositiveNumber(sl)
  const t = toPositiveNumber(tp)
  if (!e || !s || !t) return null

  // Determine effective direction
  let effDir = direction
  if (!effDir) {
    if (s < e && t > e) {
      effDir = 'LONG'
    } else if (s > e && t < e) {
      effDir = 'SHORT'
    } else {
      return null // ambiguous or invalid configuration
    }
  }

  let risk = 0
  let reward = 0

  if (effDir === 'SHORT') {
    if (s <= e || t >= e) return null
    risk = ((s - e) / e) * 100
    reward = ((e - t) / e) * 100
  } else {
    // LONG
    if (s >= e || t <= e) return null
    risk = ((e - s) / e) * 100
    reward = ((t - e) / e) * 100
  }

  const rr = reward / risk
  return {
    riskPct: risk.toFixed(2),
    rewardPct: reward.toFixed(2),
    rr: rr.toFixed(2)
  }
}

export function calcSpotRiskPlan({
  portfolioValue,
  riskPercent,
  entryPrice,
  stopLoss,
  takeProfit,
  direction,
}: {
  portfolioValue: NumericInput
  riskPercent: NumericInput
  entryPrice: NumericInput
  stopLoss: NumericInput
  takeProfit?: NumericInput
  direction?: string | null
}): SpotRiskPlan | null {
  const portfolio = toPositiveNumber(portfolioValue)
  const risk = toPositiveNumber(riskPercent)
  const entry = toPositiveNumber(entryPrice)
  const stop = toPositiveNumber(stopLoss)

  if (!portfolio || !risk || !entry || !stop) return null

  // Determine effective direction
  let effDir = direction
  if (!effDir) {
    if (stop < entry) {
      effDir = 'LONG'
    } else if (stop > entry) {
      effDir = 'SHORT'
    } else {
      return null
    }
  }

  if (effDir === 'SHORT') {
    if (stop <= entry) return null
  } else {
    if (stop >= entry) return null
  }

  const maxLossAmount = portfolio * (risk / 100)
  const stopDistancePct = effDir === 'SHORT'
    ? ((stop - entry) / entry) * 100
    : ((entry - stop) / entry) * 100

  const recommendedBuyAmount = maxLossAmount / (stopDistancePct / 100)
  const estimatedQuantity = recommendedBuyAmount / entry

  const tp = toPositiveNumber(takeProfit)
  let rewardPct = null
  if (tp) {
    if (effDir === 'SHORT') {
      if (tp < entry) {
        rewardPct = ((entry - tp) / entry) * 100
      }
    } else {
      if (tp > entry) {
        rewardPct = ((tp - entry) / entry) * 100
      }
    }
  }

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
