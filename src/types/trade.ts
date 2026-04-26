// types/trade.ts
// Types are now inferred directly from the Drizzle schema.
// Import from here as before — this file just re-exports.

export type { Trade, NewTrade } from '@/db/schema'

// Convenience union types used in the UI
export type Direction  = 'LONG' | 'SHORT'
export type TradeResult = 'WIN' | 'LOSS' | 'BREAKEVEN' | 'PENDING'

export interface TradeFilters {
  pair?:     string
  result?:   TradeResult
  dateFrom?: string
  dateTo?:   string
}
