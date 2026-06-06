import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'
import HomeClient from './components/HomeClient'

export const revalidate = 3600

async function getData() {
  await connectDB()
  const listings = await Listing.find({}).sort({ name: 1 }).lean()
  const categories = [...new Set(listings.map((l) => l.category))].sort()
  return {
    listings: JSON.parse(JSON.stringify(listings)),
    categories,
  }
}

export default async function HomePage() {
  const { listings, categories } = await getData()

  return (
    <div>
      <section style={{
        padding: '4rem 1.5rem 3rem',
        maxWidth: 'var(--max-w)',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          marginBottom: '1rem',
        }}>
          Every tool.<br />
          <em style={{ color: 'var(--ink-2)', fontStyle: 'italic' }}>Every category.</em>
        </h1>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          color: 'var(--ink-3)',
          letterSpacing: '0.03em',
          marginBottom: '0.5rem',
        }}>
          {listings.length} entries · {categories.length} categories · no pay-to-play
        </p>
      </section>

      <HomeClient listings={listings} categories={categories} />
    </div>
  )
}
