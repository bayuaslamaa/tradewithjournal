// src/db/schema.ts
// Drizzle ORM schema — single source of truth for the DB structure.
// Run `pnpm db:push` to sync this to your Neon database.

import {
  pgTable,
  uuid,
  serial,
  date,
  text,
  numeric,
  smallint,
  timestamp,
} from 'drizzle-orm/pg-core'

export const trades = pgTable('trades', {
  id:          uuid('id').primaryKey().defaultRandom(),
  tradeNumber: serial('trade_number'),

  // Core trade info
  date:      date('date').notNull(),
  pair:      text('pair').notNull(),
  direction: text('direction', { enum: ['LONG', 'SHORT'] }),

  // Price planning (all optional — used to auto-compute pnlPct)
  entryPricePlan: numeric('entry_price_plan', { precision: 20, scale: 8 }),
  slPlan:         numeric('sl_plan',          { precision: 20, scale: 8 }),
  tpPlan:         numeric('tp_plan',          { precision: 20, scale: 8 }),
  executedPrice:  numeric('executed_price',   { precision: 20, scale: 8 }),

  // Spot risk planning
  portfolioValue:       numeric('portfolio_value',        { precision: 14, scale: 2 }),
  riskPercent:          numeric('risk_percent',           { precision: 6,  scale: 3 }),
  maxLossAmount:        numeric('max_loss_amount',        { precision: 14, scale: 2 }),
  recommendedBuyAmount: numeric('recommended_buy_amount', { precision: 14, scale: 2 }),
  estimatedQuantity:    numeric('estimated_quantity',     { precision: 20, scale: 8 }),
  plannedRewardAmount:  numeric('planned_reward_amount',  { precision: 14, scale: 2 }),
  plannedRR:            numeric('planned_rr',             { precision: 8,  scale: 2 }),

  // Pre-trade journaling
  reason:        text('reason'),
  emotionBefore: text('emotion_before'),

  // Post-trade journaling
  emotionAfter: text('emotion_after'),
  result: text('result', {
    enum: ['WIN', 'LOSS', 'BREAKEVEN', 'PENDING'],
  }).default('PENDING'),
  pnlPct: numeric('pnl_pct', { precision: 8, scale: 2 }),
  grade:  smallint('grade'),
  lesson: text('lesson'),
  chartUrl: text('chart_url'),

  // AI analysis
  aiOutlook: text('ai_outlook'),

  // Metadata
  tags:  text('tags').array(),
  notes: text('notes'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// ─── Inferred types ─────────────────────────────────────────
// These replace the hand-written interfaces in types/trade.ts
export type Trade    = typeof trades.$inferSelect
export type NewTrade = typeof trades.$inferInsert
