import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Listing, { makeSlug } from '@/models/Listing'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const pricing = searchParams.get('pricing') || ''
    const type = searchParams.get('type') || ''

    const filter: Record<string, unknown> = {}

    if (q) {
      filter.$text = { $search: q }
    }
    if (category) filter.category = category
    if (pricing) filter.pricing = pricing
    if (type) filter.type = type

    const listings = await Listing.find(filter)
      .sort(q ? { score: { $meta: 'textScore' } } : { name: 1 })
      .lean()

    return NextResponse.json({ listings, total: listings.length })
  } catch (err) {
    console.error('[GET /api/listings]', err)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSecret = req.cookies.get('tia_admin')?.value
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await req.json()

    if (!body.slug) {
      body.slug = makeSlug(body.name)
    }

    const existing = await Listing.findOne({ slug: body.slug })
    if (existing) {
      body.slug = `${body.slug}-2`
    }

    const listing = await Listing.create(body)
    return NextResponse.json({ listing }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/listings]', err)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
