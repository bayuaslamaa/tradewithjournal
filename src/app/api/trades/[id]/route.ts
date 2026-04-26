// app/api/trades/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getTradeById, deleteTrade, updateTrade } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trade = await getTradeById(params.id)
    if (!trade) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(trade)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteTrade(params.id)
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    // Strip read-only fields — JSON serialises timestamps as strings,
    // which causes Drizzle to crash when it calls .toISOString() on them.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, tradeNumber, createdAt, updatedAt, ...payload } = body

    const trade = await updateTrade(params.id, payload)
    return NextResponse.json(trade)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
