// src/lib/db.ts
// All trade queries — built with Drizzle ORM.
// Import `db` from '@/db' and the schema from '@/db/schema'.

import { db }     from '@/db'
import { trades } from '@/db/schema'
import { and, eq, gte, lte, desc, sql } from 'drizzle-orm'

export type { Trade, NewTrade } from '@/db/schema'

// ─── Filter types ────────────────────────────────────────────
export interface TradeFilters {
  pair?:     string
  result?:   'WIN' | 'LOSS' | 'BREAKEVEN' | 'PENDING'
  dateFrom?: string
  dateTo?:   string
}

// ─── TRADE QUERIES ───────────────────────────────────────────

export async function getTrades(filters?: TradeFilters) {
  const conditions = []

  if (filters?.pair)     conditions.push(eq(trades.pair,   filters.pair))
  if (filters?.result)   conditions.push(eq(trades.result, filters.result))
  if (filters?.dateFrom) conditions.push(gte(trades.date,  filters.dateFrom))
  if (filters?.dateTo)   conditions.push(lte(trades.date,  filters.dateTo))

  return db
    .select()
    .from(trades)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(trades.date), desc(trades.createdAt))
}

export async function getTradeById(id: string) {
  const rows = await db
    .select()
    .from(trades)
    .where(eq(trades.id, id))
    .limit(1)

  return rows[0] ?? null
}

export async function createTrade(trade: typeof trades.$inferInsert) {
  const rows = await db
    .insert(trades)
    .values(trade)
    .returning()

  return rows[0]
}

export async function updateTrade(id: string, trade: Partial<typeof trades.$inferInsert>) {
  const rows = await db
    .update(trades)
    .set({ ...trade, updatedAt: new Date() })
    .where(eq(trades.id, id))
    .returning()

  return rows[0]
}

export async function deleteTrade(id: string) {
  await db.delete(trades).where(eq(trades.id, id))
}

// ─── STATS (pair_stats view) ─────────────────────────────────
export async function getStats() {
  return db.execute(sql`SELECT * FROM pair_stats ORDER BY total_trades DESC`)
}
