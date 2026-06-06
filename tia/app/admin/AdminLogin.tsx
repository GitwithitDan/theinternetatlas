'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      setError('Invalid password.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        background: 'var(--surface-2)',
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: '1.5rem',
          fontWeight: 400,
          marginBottom: '0.5rem',
        }}>
          Admin
        </h1>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--ink-3)',
          marginBottom: '1.5rem',
        }}>
          The Internet Atlas
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '0.5px solid var(--border-2)',
              borderRadius: 'var(--radius)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '14px',
              marginBottom: '0.75rem',
            }}
          />
          {error && (
            <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: '#cc3333', marginBottom: '0.75rem' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--ink)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              opacity: loading || !password ? 0.5 : 1,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
