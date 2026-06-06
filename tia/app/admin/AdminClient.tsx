'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
  best_for?: string
  learning_curve?: string
  platforms?: string[]
}

const EMPTY_FORM = {
  name: '',
  url: '',
  category: '',
  subcategory: '',
  description: '',
  best_for: '',
  pricing: 'freemium',
  type: 'website',
  platforms: '',
  learning_curve: 'beginner',
  alternatives: '',
  tags: '',
}

export default function AdminClient({ listings: initial }: { listings: Listing[] }) {
  const [listings, setListings] = useState(initial)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const router = useRouter()

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase()
    return !q || l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
  })

  function flash(text: string) {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  function startEdit(l: Listing) {
    setEditId(l._id)
    setForm({
      name: l.name,
      url: l.url,
      category: l.category,
      subcategory: '',
      description: l.description,
      best_for: l.best_for || '',
      pricing: l.pricing,
      type: l.type,
      platforms: (l.platforms || []).join(', '),
      learning_curve: l.learning_curve || 'beginner',
      alternatives: '',
      tags: (l.tags || []).join(', '),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      url: form.url.trim(),
      category: form.category.trim(),
      subcategory: form.subcategory.trim() || undefined,
      description: form.description.trim(),
      best_for: form.best_for.trim() || undefined,
      pricing: form.pricing,
      type: form.type,
      platforms: form.platforms.split(',').map((s) => s.trim()).filter(Boolean),
      learning_curve: form.learning_curve,
      alternatives: form.alternatives.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = buildPayload()

    if (editId) {
      const res = await fetch(`/api/listings/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const { listing } = await res.json()
        setListings((prev) => prev.map((l) => (l._id === editId ? listing : l)))
        cancelEdit()
        flash('Updated.')
        router.refresh()
      } else {
        flash('Error updating.')
      }
    } else {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const { listing } = await res.json()
        setListings((prev) => [...prev, listing].sort((a, b) => a.name.localeCompare(b.name)))
        setForm(EMPTY_FORM)
        flash('Added.')
        router.refresh()
      } else {
        flash('Error adding.')
      }
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setListings((prev) => prev.filter((l) => l._id !== id))
      setConfirmDelete(null)
      flash('Deleted.')
      router.refresh()
    }
  }

  async function handleLogout() {
    await fetch('/api/admin-auth', { method: 'DELETE' })
    router.refresh()
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '0.5px solid var(--border-2)',
    borderRadius: 'var(--radius)',
    background: 'var(--surface)',
    color: 'var(--ink)',
    fontSize: '13px',
    fontFamily: 'var(--sans)',
  }

  const labelStyle = {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    color: 'var(--ink-4)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    display: 'block',
    marginBottom: '4px',
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', fontWeight: 400 }}>Admin</h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-3)', marginTop: '4px' }}>
            {listings.length} total entries
          </p>
        </div>
        <button onClick={handleLogout} style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: 'var(--ink-3)',
          background: 'none',
          border: '0.5px solid var(--border-2)',
          borderRadius: 'var(--radius)',
          padding: '6px 12px',
          cursor: 'pointer',
        }}>
          Log out
        </button>
      </div>

      {msg && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--surface-2)',
          border: '0.5px solid var(--border-2)',
          borderRadius: 'var(--radius)',
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          color: 'var(--ink-2)',
          marginBottom: '1.5rem',
        }}>
          {msg}
        </div>
      )}

      {/* Add / Edit form */}
      <div style={{
        border: '0.5px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '2.5rem',
        background: 'var(--surface-2)',
      }}>
        <h2 style={{ fontFamily: 'var(--mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>
          {editId ? '✎ Editing entry' : '+ Add new entry'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {[
              ['name', 'Name *', 'text'],
              ['url', 'URL *', 'url'],
              ['category', 'Category *', 'text'],
              ['subcategory', 'Subcategory', 'text'],
            ].map(([field, label]) => (
              <div key={field}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="text"
                  value={(form as Record<string, string>)[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={label.endsWith('*')}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              required
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Best for</label>
            <input
              type="text"
              value={form.best_for}
              onChange={(e) => setForm((f) => ({ ...f, best_for: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Pricing</label>
              <select value={form.pricing} onChange={(e) => setForm((f) => ({ ...f, pricing: e.target.value }))} style={inputStyle}>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={inputStyle}>
                <option value="website">Website</option>
                <option value="software">Software</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Learning curve</label>
              <select value={form.learning_curve} onChange={(e) => setForm((f) => ({ ...f, learning_curve: e.target.value }))} style={inputStyle}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} style={inputStyle} placeholder="ai, free, design" />
            </div>
            <div>
              <label style={labelStyle}>Platforms (comma-separated)</label>
              <input type="text" value={form.platforms} onChange={(e) => setForm((f) => ({ ...f, platforms: e.target.value }))} style={inputStyle} placeholder="web, mobile, windows" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{
              padding: '9px 20px',
              background: 'var(--ink)',
              color: 'var(--surface)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}>
              {editId ? 'Save changes' : 'Add entry'}
            </button>
            {editId && (
              <button type="button" onClick={cancelEdit} style={{
                padding: '9px 20px',
                background: 'transparent',
                color: 'var(--ink-3)',
                border: '0.5px solid var(--border-2)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--mono)',
                fontSize: '11px',
                cursor: 'pointer',
              }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listings table */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Filter by name or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '300px' }}
        />
        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--ink-4)' }}>
          {filtered.length} shown
        </span>
      </div>

      <div style={{ border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '0.5px solid var(--border-2)' }}>
              {['Name', 'Category', 'Pricing', 'Type', 'Actions'].map((h) => (
                <th key={h} style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontFamily: 'var(--mono)',
                  fontSize: '10px',
                  color: 'var(--ink-4)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 500,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l._id} style={{
                borderBottom: '0.5px solid var(--border)',
                background: editId === l._id ? 'var(--surface-2)' : 'var(--surface)',
              }}>
                <td style={{ padding: '8px 12px', fontWeight: 500 }}>{l.name}</td>
                <td style={{ padding: '8px 12px', color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '11px' }}>{l.category}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span className={`badge badge-${l.pricing}`}>{l.pricing}</span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span className={`badge badge-${l.type}`}>{l.type}</span>
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => startEdit(l)} style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '10px',
                      padding: '4px 8px',
                      border: '0.5px solid var(--border-2)',
                      borderRadius: 'var(--radius)',
                      background: 'transparent',
                      color: 'var(--ink-2)',
                      cursor: 'pointer',
                    }}>
                      Edit
                    </button>
                    {confirmDelete === l._id ? (
                      <>
                        <button onClick={() => handleDelete(l._id)} style={{
                          fontFamily: 'var(--mono)',
                          fontSize: '10px',
                          padding: '4px 8px',
                          border: '0.5px solid #cc3333',
                          borderRadius: 'var(--radius)',
                          background: '#cc3333',
                          color: '#fff',
                          cursor: 'pointer',
                        }}>
                          Confirm
                        </button>
                        <button onClick={() => setConfirmDelete(null)} style={{
                          fontFamily: 'var(--mono)',
                          fontSize: '10px',
                          padding: '4px 8px',
                          border: '0.5px solid var(--border-2)',
                          borderRadius: 'var(--radius)',
                          background: 'transparent',
                          color: 'var(--ink-3)',
                          cursor: 'pointer',
                        }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(l._id)} style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '10px',
                        padding: '4px 8px',
                        border: '0.5px solid var(--border-2)',
                        borderRadius: 'var(--radius)',
                        background: 'transparent',
                        color: '#cc3333',
                        cursor: 'pointer',
                      }}>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
