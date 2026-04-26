-- ============================================================
-- TRADING JOURNAL - Neon (PostgreSQL) Schema
-- No auth — single-user / personal journal
-- ============================================================

-- ============================================================
-- TRADES TABLE
-- ============================================================
create table if not exists public.trades (
  id            uuid primary key default gen_random_uuid(),
  trade_number  serial,

  -- Core trade info
  date          date not null,
  pair          text not null,                          -- e.g. BTC, ETH/USDT
  direction     text check (direction in ('LONG', 'SHORT')),

  -- Pre-trade journaling (fill BEFORE entering)
  reason        text,                                   -- Setup / why you're taking this trade
  emotion_before text,                                  -- How you feel before entry

  -- Post-trade journaling (fill AFTER closing)
  emotion_after  text,                                  -- How you feel after result
  result        text check (result in ('WIN', 'LOSS', 'BREAKEVEN', 'PENDING')) default 'PENDING',
  pnl_pct       numeric(8, 2),                         -- P&L percentage (optional)
  grade         smallint check (grade between 1 and 5), -- 1–5 self-grade
  lesson        text,                                   -- One-sentence takeaway
  chart_url     text,                                   -- Screenshot URL (Cloudinary, S3, etc.)

  -- AI-assisted analysis
  ai_outlook    text,                                   -- AI model's view on the pattern / setup

  -- Metadata
  tags          text[],                                 -- e.g. ['EMA', 'breakout', 'revenge trade']
  notes         text,                                   -- Any extra notes
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trades_updated_at
  before update on public.trades
  for each row execute function public.handle_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_trades_date   on public.trades(date desc);
create index if not exists idx_trades_pair   on public.trades(pair);
create index if not exists idx_trades_result on public.trades(result);

-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- Summary stats per pair
create or replace view public.pair_stats as
select
  pair,
  count(*)                                                   as total_trades,
  count(*) filter (where result = 'WIN')                    as wins,
  count(*) filter (where result = 'LOSS')                   as losses,
  round(
    count(*) filter (where result = 'WIN')::numeric /
    nullif(count(*) filter (where result in ('WIN','LOSS')), 0) * 100,
    1
  )                                                          as win_rate_pct,
  round(avg(pnl_pct) filter (where pnl_pct is not null), 2) as avg_pnl_pct,
  round(avg(grade)   filter (where grade   is not null), 1) as avg_grade
from public.trades
group by pair;
