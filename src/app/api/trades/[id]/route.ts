// app/api/trades/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { deleteTrade, updateTrade } from '@/lib/db'

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
    const trade = await updateTrade(params.id, body)
    return NextResponse.json(trade)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
