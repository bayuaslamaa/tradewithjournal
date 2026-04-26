# TWX Trading Journal

AI-assisted personal trading journal built with Next.js 14, TypeScript, Tailwind CSS + Neon (PostgreSQL).

---

## Stack
- **Frontend**: Next.js 14 (App Router) · TypeScript · Tailwind CSS
- **Database**: Neon (serverless PostgreSQL)
- **PWA-ready**: manifest.json + meta tags included

---

## Database columns

| Column          | Type      | When to fill    | Description                              |
|-----------------|-----------|-----------------|------------------------------------------|
| date            | date      | Before          | Trade date                               |
| pair            | text      | Before          | e.g. BTC, ETH/USDT                       |
| direction       | text      | Before          | LONG or SHORT                            |
| reason          | text      | **Before trade**| Setup, confluence, R:R                   |
| ai_outlook      | text      | **Before trade**| What your AI said about the setup 🤖    |
| emotion_before  | text      | **Before trade**| Your emotional state before entry        |
| result          | text      | After           | WIN / LOSS / BREAKEVEN / PENDING         |
| pnl_pct         | numeric   | After           | P&L percentage                           |
| emotion_after   | text      | **After trade** | How you felt after closing               |
| grade           | smallint  | After           | 1–5 self-grade on execution              |
| lesson          | text      | After           | One-sentence takeaway                    |
| chart_url       | text      | After           | URL to chart screenshot                  |
| tags            | text[]    | Optional        | e.g. ['EMA', 'breakout']                 |
| notes           | text      | Optional        | Any extra context                        |

---

## Setup

### 1. Neon database

1. Create a free project at [console.neon.tech](https://console.neon.tech)
2. In the **SQL Editor**, run the contents of `schema.sql`
3. Copy your **Connection String** from **Connection Details**

### 2. Next.js app

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# → Paste your Neon DATABASE_URL

# Run dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
src/
  app/
    page.tsx           # Journal list (home)
    add/page.tsx       # Add new trade form
    edit/[id]/page.tsx # Edit trade (extend this)
    layout.tsx
    globals.css
  components/
    TradeCard.tsx      # Expandable trade row
    StatsBar.tsx       # Win rate, avg grade, net P&L
  lib/
    db.ts              # All DB queries (Neon serverless)
  types/
    trade.ts           # TypeScript types
public/
  manifest.json        # PWA manifest
schema.sql             # PostgreSQL table + indexes + views
```

---

## PWA (future)

To make this a full installable PWA:
1. Add `next-pwa` package: `pnpm add next-pwa`
2. Add 192×192 and 512×512 icons to `/public/`
3. Wrap `next.config.js` with the `next-pwa` config

---

## Auth (optional extension)

Authentication is not included by default (single-user personal journal).
To add multi-user support later:
1. Add [NextAuth.js](https://next-auth.js.org) or [Clerk](https://clerk.com)
2. Add a `user_id` column to the `trades` table
3. Filter all queries by `user_id`
