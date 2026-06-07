'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Listing {
  _id: string
  name: string
  url: string
  slug: string
  category: string
  description: string
  pricing: string
  type: string
  tags: string[]
}

interface Props {
  listings: Listing[]
  categories: string[]
}

export default function HomeClient({ listings, categories }: Props) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activePricing, setActivePricing] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<string | null>(null)

  const filtered = useMemo(() => {
    // Split query into individual words, filter out short stop words
    const stopWords = new Set(['a', 'an', 'the', 'to', 'for', 'and', 'or', 'of', 'in', 'on', 'at', 'is', 'it'])
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w))
    return listings.filter((l) => {
      if (activeCategory && l.category !== activeCategory) return false
      if (activePricing && l.pricing !== activePricing) return false
      if (activeType && l.type !== activeType) return false
      if (words.length > 0) {
        const hay = [l.name, l.description, l.category, l.best_for || '', ...(l.tags || [])].join(' ').toLowerCase()
        // Match if ANY meaningful word appears in the entry
        if (!words.some(w => hay.includes(w))) return false
      }
      return true
    })
  }, [listings, query, activeCategory, activePricing, activeType])

  function togglePricing(val: string) {
    setActivePricing((p) => (p === val ? null : val))
  }
  function toggleType(val: string) {
    setActiveType((t) => (t === val ? null : val))
  }

  const pillBase = {
    padding: '6px 12px',
    borderRadius: '20px',
    border: '0.5px solid var(--border-2)',
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    transition: 'all 0.15s',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  }

  return (
    <div>
      {/* Search + filters */}
      <div style={{
        position: 'sticky',
        top: '52px',
        zIndex: 90,
        background: 'var(--surface)',
        borderBottom: '0.5px solid var(--border)',
      }}>
        {/* Search row */}
        <div style={{
          maxWidth: 'var(--max-w)',
          margin: '0 auto',
          padding: '0.75rem 1.5rem 0.5rem',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Search by keyword, category, or tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: '1',
              minWidth: '220px',
              padding: '8px 12px',
              border: '0.5px solid var(--border-2)',
              borderRadius: 'var(--radius)',
              background: 'var(--surface-2)',
              color: 'var(--ink)',
              fontSize: '14px',
            }}
          />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['free', 'freemium', 'paid'] as const).map((p) => (
              <button key={p} onClick={() => togglePricing(p)} style={{
                ...pillBase,
                background: activePricing === p ? 'var(--ink)' : 'transparent',
                color: activePricing === p ? 'var(--surface)' : 'var(--ink-3)',
              }}>
                {p}
              </button>
            ))}
            {(['website', 'software'] as const).map((t) => (
              <button key={t} onClick={() => toggleType(t)} style={{
                ...pillBase,
                background: activeType === t ? 'var(--ink)' : 'transparent',
                color: activeType === t ? 'var(--surface)' : 'var(--ink-3)',
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Category strip — wraps to multiple rows */}
        <div style={{
          maxWidth: 'var(--max-w)',
          margin: '0 auto',
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          padding: '0 1.5rem 0.75rem',
        }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              ...pillBase,
              fontSize: '11px',
              padding: '4px 12px',
              background: !activeCategory ? 'var(--surface-3)' : 'transparent',
              color: !activeCategory ? 'var(--ink)' : 'var(--ink-3)',
            }}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c === activeCategory ? null : c)}
              style={{
                ...pillBase,
                fontSize: '11px',
                padding: '4px 12px',
                background: activeCategory === c ? 'var(--surface-3)' : 'transparent',
                color: activeCategory === c ? 'var(--ink)' : 'var(--ink-3)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Meta bar */}
      <div style={{
        maxWidth: 'var(--max-w)',
        margin: '0 auto',
        padding: '0.5rem 1.5rem',
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        color: 'var(--ink-4)',
        borderBottom: '0.5px solid var(--border)',
      }}>
        Showing {filtered.length} of {listings.length} entries
        {activeCategory ? ` · ${activeCategory}` : ''}
        {activePricing ? ` · ${activePricing} only` : ''}
      </div>

      {/* Grid */}
      <div style={{
        maxWidth: 'var(--max-w)',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1px',
        background: 'var(--border)',
        borderTop: '0.5px solid var(--border)',
      }}>
        {filtered.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '4rem',
            textAlign: 'center',
            color: 'var(--ink-3)',
            background: 'var(--surface)',
          }}>
            No entries match your filters.
          </div>
        ) : (
          filtered.map((l) => <ListingCard key={l._id} listing={l} />)
        )}
      </div>
    </div>
  )
}

function ListingCard({ listing: l }: { listing: Listing }) {
  return (
    <Link href={`/listing/${l.slug}`} style={{ display: 'block' }}>
      <div
        style={{
          background: 'var(--surface)',
          padding: '1.125rem 1.25rem',
          height: '100%',
          transition: 'background 0.1s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontWeight: 500, fontSize: '14px', lineHeight: 1.2 }}>{l.name}</span>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <span className={`badge badge-${l.pricing}`}>{l.pricing}</span>
            <span className={`badge badge-${l.type}`}>{l.type}</span>
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: 1.5, marginBottom: '10px' }}>
          {l.description}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {l.category}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--ink-4)' }}>
            {l.url.replace('https://', '').replace('http://', '').split('/')[0]}
          </span>
        </div>
      </div>
    </Link>
  )
}
