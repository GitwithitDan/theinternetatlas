import { connectDB } from '@/lib/mongodb'
import Listing from '@/models/Listing'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const listing = await Listing.findOne({ slug }).lean()
  if (!listing) return { title: 'Not found' }
  return {
    title: `${listing.name} — The Internet Atlas`,
    description: listing.description,
  }
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const listing = await Listing.findOne({ slug }).lean()
  if (!listing) notFound()

  const related = await Listing.find({
    category: listing.category,
    slug: { $ne: listing.slug },
  })
    .limit(6)
    .lean()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-3)', marginBottom: '2rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link href="/" style={{ color: 'var(--ink-3)' }}>Home</Link>
        <span>›</span>
        <Link href={`/category/${listing.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`} style={{ color: 'var(--ink-3)' }}>
          {listing.category}
        </Link>
        <span>›</span>
        <span style={{ color: 'var(--ink)' }}>{listing.name}</span>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', fontWeight: 400, lineHeight: 1.1 }}>
            {listing.name}
          </h1>
          <span className={`badge badge-${listing.pricing}`}>{listing.pricing}</span>
          <span className={`badge badge-${listing.type}`}>{listing.type}</span>
        </div>
        <p style={{ fontSize: '16px', color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: '1rem' }}>
          {listing.description}
        </p>
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: 'var(--ink)',
            color: 'var(--surface)',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Visit {listing.url.replace('https://', '').replace('http://', '').split('/')[0]} →
        </a>
      </div>

      <div style={{
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '2rem',
      }}>
        {listing.best_for && <DetailRow label="Best for" value={listing.best_for} />}
        {listing.learning_curve && <DetailRow label="Learning curve" value={listing.learning_curve} />}
        <DetailRow label="Category" value={listing.category} />
        {listing.subcategory && <DetailRow label="Subcategory" value={listing.subcategory} />}
        {listing.platforms && listing.platforms.length > 0 && (
          <DetailRow label="Platforms" value={listing.platforms.join(', ')} />
        )}
        <DetailRow label="Pricing" value={listing.pricing} />
        <DetailRow label="Type" value={listing.type} />
      </div>

      {listing.tags && listing.tags.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Tags
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {listing.tags.map((tag) => (
              <span key={tag} style={{
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                padding: '4px 10px',
                border: '0.5px solid var(--border-2)',
                borderRadius: '20px',
                color: 'var(--ink-3)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {listing.alternatives && listing.alternatives.length > 0 && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
            Alternatives
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {listing.alternatives.map((alt) => (
              <span key={alt} style={{
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                padding: '4px 10px',
                border: '0.5px solid var(--border-2)',
                borderRadius: 'var(--radius)',
                color: 'var(--ink-2)',
              }}>
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            More in {listing.category}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1px', background: 'var(--border)', border: '0.5px solid var(--border)' }}>
            {related.map((r) => (
              <Link key={r._id.toString()} href={`/listing/${r.slug}`} style={{
                display: 'block',
                background: 'var(--surface)',
                padding: '0.875rem 1rem',
              }}>
                <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>{r.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--ink-3)', lineHeight: 1.4 }}>{r.description.slice(0, 70)}…</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      padding: '0.75rem 1rem',
      borderBottom: '0.5px solid var(--border)',
      gap: '1rem',
    }}>
      <span style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: 'var(--ink-4)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        minWidth: '120px',
        paddingTop: '1px',
      }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{value}</span>
    </div>
  )
}
