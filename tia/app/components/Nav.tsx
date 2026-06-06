'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const path = usePathname()
  const isAdmin = path.startsWith('/admin')

  return (
    <nav style={{
      borderBottom: '0.5px solid var(--border)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '52px',
      position: 'sticky',
      top: 0,
      background: 'var(--surface)',
      zIndex: 100,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 400 }}>
          The Internet
        </span>
        <span style={{
          fontFamily: 'var(--serif)',
          fontSize: '18px',
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'var(--ink-2)',
        }}>
          Atlas
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/" style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: path === '/' ? 'var(--ink)' : 'var(--ink-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          Browse
        </Link>
        {!isAdmin && (
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: '10px',
            color: 'var(--ink-4)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            No pay-to-play
          </span>
        )}
      </div>
    </nav>
  )
}
