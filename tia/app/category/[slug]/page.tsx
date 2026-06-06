import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

function slugToCategory(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: Props) {
  const cat = slugToCategory(params.slug)
  return {
    title: `${cat} — The Internet Atlas`,
    description: `Browse ${cat} tools and resources on The Internet Atlas.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  await connectDB()
  const allCategories = await Listing.distinct('category')

  const matchedCategory = allCategories.find(
    (c) => c.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') === params.slug
  )

  if (!matchedCategory) notFound()

  const listings = await Listing.find({ category: matchedCategory }).sort({ name: 1 }).lean()

  return (
    <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-3)', marginBottom: '1.5rem', display: 'flex', gap: '8px' }}>
        <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
        <span>›</span>
        <span style={{ color: 'var(--ink)' }}>{matchedCategory}</span>
      </div>

      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', fontWeight: 400, marginBottom: '0.5rem' }}>
        {matchedCategory}
      </h1>
      <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-3)', marginBottom: '2rem' }}>
        {listings.length} {listings.length === 1 ? 'entry' : 'entries'}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1px',
        background: 'var(--border)',
        border: '0.5px solid var(--border)',
      }}>
        {listings.map((l) => (
          <Link key={l._id.toString()} href={`/listing/${l.slug}`} style={{ display: 'block' }}>
            <div style={{
              background: 'var(--surface)',
              padding: '1.125rem 1.25rem',
              height: '100%',
              transition: 'background 0.1s',
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 500, fontSize: '14px' }}>{l.name}</span>
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <span className={`badge badge-${l.pricing}`}>{l.pricing}</span>
                  <span className={`badge badge-${l.type}`}>{l.type}</span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5 }}>{l.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
