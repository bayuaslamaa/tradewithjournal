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
