// app/api/trades/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getTrades, createTrade } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const filters = {
    pair:     searchParams.get('pair')     ?? undefined,
    result:   searchParams.get('result')   ?? undefined,
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo:   searchParams.get('dateTo')   ?? undefined,
  } as Parameters<typeof getTrades>[0]

  try {
    const trades = await getTrades(filters)
    return NextResponse.json(trades)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const trade = await createTrade(body)
    return NextResponse.json(trade, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
