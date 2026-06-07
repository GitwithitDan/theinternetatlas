import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get('tia_admin')?.value === process.env.ADMIN_SECRET
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()
    const listing = await Listing.findById(id).lean()
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ listing })
  } catch (err) {
    console.error('[GET /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    await connectDB()
    const body = await req.json()
    const listing = await Listing.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean()
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ listing })
  } catch (err) {
    console.error('[PUT /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    await connectDB()
    await Listing.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/listings/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
