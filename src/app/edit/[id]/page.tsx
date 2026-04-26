'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Direction, TradeResult } from '@/types/trade'
import type { Trade } from '@/db/schema'

type FormData = Partial<Omit<Trade, 'id' | 'tradeNumber' | 'createdAt' | 'updatedAt'>>

const PAIRS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'AVAX', 'MATIC', 'OTHER']
const TAGS_PRESET = [
  'EMA', 'support', 'resistance', 'breakout', 'pullback',
  'pin bar', 'engulfing', 'FOMO', 'revenge', 'trend', 'scalp', 'swing',
]

export default function EditTradePage({ params }: { params: { id: string } }) {
  const router  = useRouter()
  const { id }  = params

  const [form, setForm]         = useState<FormData | null>(null)
  const [customPair, setCustomPair] = useState('')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // ── Fetch existing trade ──
  useEffect(() => {
    fetch(`/api/trades/${id}`)
      .then(async r => {
        if (!r.ok) throw new Error(`Trade not found (${r.status})`)
        const t: Trade = await r.json()
        // if pair isn't a standard preset, mark as OTHER
        const knownPairs = PAIRS.filter(p => p !== 'OTHER')
        if (t.pair && !knownPairs.includes(t.pair)) {
          setCustomPair(t.pair)
          setForm({ ...t, pair: 'OTHER' })
        } else {
          setForm(t)
        }
      })
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  const set = (k: keyof FormData, v: unknown) =>
    setForm(prev => prev ? ({ ...prev, [k]: v }) : prev)

  const toggleTag = (tag: string) => {
    const tags = form?.tags ?? []
    set('tags', tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])
  }

  const handleSubmit = async () => {
    if (!form?.date || !form?.pair) {
      setError('Date and pair are required.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(true)
    setError(null)
    try {
      const pair = form.pair === 'OTHER' ? customPair : form.pair
      const res = await fetch(`/api/trades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, pair }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? res.statusText)
      }
      router.push('/')
    } catch (e) {
      setError((e as Error).message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border2)] border-t-[var(--accent)] animate-spin" />
        <p className="mono text-xs text-[var(--muted)] tracking-widest">LOADING TRADE…</p>
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="text-center py-32">
        <p className="mono text-xs text-[var(--loss)] mb-6 tracking-widest">{error}</p>
        <a href="/" className="mono text-xs text-[var(--accent)] underline">← Back to journal</a>
      </div>
    )
  }

  if (!form) return null

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <a href="/"
          className="w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-[var(--surface-hover)] group"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <span className="mono text-[var(--muted)] group-hover:text-[var(--text)] transition-colors text-lg mt-[-2px]">←</span>
        </a>
        <div>
          <h1 className="display-font font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--muted)]"
            style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
            Edit Trade
          </h1>
          <p className="mono text-[var(--accent)] mt-1" style={{ fontSize: '0.65rem', letterSpacing: '0.15em', fontWeight: 600 }}>
            UPDATE · REFLECT · IMPROVE
          </p>
        </div>
      </div>

      {error && (
        <div className="mono text-xs p-4 rounded-xl mb-6 glass-panel slide-in"
          style={{ color: 'var(--loss)', borderColor: 'rgba(255,77,109,0.3)', background: 'rgba(255,77,109,0.05)' }}>
          ⚠ {error}
        </div>
      )}

      <div className="grid gap-6">

        {/* ── Section 1: Trade basics ── */}
        <Section label="01 — TRADE INFO">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="DATE">
              <input type="date" value={form.date ?? ''}
                onChange={e => set('date', e.target.value)}
                className="glass-input form-input" />
            </Field>
            <Field label="PAIR">
              <select value={form.pair ?? ''} onChange={e => set('pair', e.target.value)}
                className="glass-input form-input">
                <option value="">— select pair —</option>
                {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {form.pair === 'OTHER' && (
                <div className="mt-3 slide-in">
                  <input type="text" placeholder="Type pair e.g. TSLA…" value={customPair}
                    onChange={e => setCustomPair(e.target.value.toUpperCase())}
                    className="glass-input form-input" />
                </div>
              )}
            </Field>
          </div>

          <Field label="DIRECTION">
            <div className="grid grid-cols-2 gap-3">
              {(['LONG', 'SHORT'] as Direction[]).map(d => (
                <button key={d} onClick={() => set('direction', form.direction === d ? null : d)}
                  className="mono py-3.5 rounded-xl font-bold transition-all"
                  style={{
                    fontSize: '0.85rem', letterSpacing: '0.08em',
                    background: form.direction === d
                      ? (d === 'LONG' ? 'rgba(0,230,160,0.15)' : 'rgba(255,77,109,0.15)')
                      : 'var(--surface2)',
                    color: form.direction === d
                      ? (d === 'LONG' ? 'var(--win)' : 'var(--loss)')
                      : 'var(--muted)',
                    border: `1px solid ${form.direction === d
                      ? (d === 'LONG' ? 'rgba(0,230,160,0.4)' : 'rgba(255,77,109,0.4)')
                      : 'var(--border2)'}`,
                    boxShadow: form.direction === d
                      ? (d === 'LONG' ? '0 0 16px rgba(0,230,160,0.1)' : '0 0 16px rgba(255,77,109,0.1)')
                      : 'none'
                  }}>
                  {d === 'LONG' ? '▲ LONG' : '▼ SHORT'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="TAGS">
            <div className="flex flex-wrap gap-2">
              {TAGS_PRESET.map(tag => {
                const isActive = (form.tags ?? []).includes(tag)
                return (
                  <button key={tag} onClick={() => toggleTag(tag)} className="tag-pill"
                    style={{
                      color: isActive ? '#000' : 'var(--muted)',
                      background: isActive ? 'var(--accent)' : 'var(--surface2)',
                      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border2)'}`,
                      fontWeight: isActive ? 700 : 400,
                      boxShadow: isActive ? '0 4px 12px var(--accent-glow)' : 'none',
                      cursor: 'pointer',
                    }}>
                    {tag}
                  </button>
                )
              })}
            </div>
          </Field>
        </Section>

        {/* ── Section 2: Before trade ── */}
        <Section label="02 — BEFORE THE TRADE">
          <Field label="REASON / SETUP" required>
            <textarea rows={3} placeholder="Why did you take this trade?"
              value={form.reason ?? ''} onChange={e => set('reason', e.target.value)}
              className="glass-input form-input resize-none" />
          </Field>

          <Field label="AI OUTLOOK" accent>
            <div className="relative">
              <span className="absolute top-3.5 right-4 text-lg pointer-events-none opacity-50" style={{ color: 'var(--accent)' }}>✨</span>
              <textarea rows={3} placeholder="What did your AI say about this setup?"
                value={form.aiOutlook ?? ''} onChange={e => set('aiOutlook', e.target.value)}
                className="glass-input form-input resize-none pr-10"
                style={{ borderColor: 'rgba(0,255,178,0.2)' }} />
            </div>
          </Field>

          <Field label="EMOTION BEFORE">
            <textarea rows={2} placeholder="How were you feeling before entering?"
              value={form.emotionBefore ?? ''} onChange={e => set('emotionBefore', e.target.value)}
              className="glass-input form-input resize-none" />
          </Field>
        </Section>

        {/* ── Section 3: After trade ── */}
        <Section label="03 — AFTER THE TRADE">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="RESULT">
              <select value={form.result ?? 'PENDING'} onChange={e => set('result', e.target.value as TradeResult)}
                className="glass-input form-input">
                <option value="PENDING">PENDING</option>
                <option value="WIN">WIN</option>
                <option value="LOSS">LOSS</option>
                <option value="BREAKEVEN">BREAKEVEN</option>
              </select>
            </Field>
            <Field label="P&L (%)">
              <div className="relative">
                <input type="number" step="0.01" placeholder="0.00"
                  value={form.pnlPct ?? ''}
                  onChange={e => set('pnlPct', e.target.value ? e.target.value : null)}
                  className="glass-input form-input pr-8 text-right font-mono" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-mono pointer-events-none">%</span>
              </div>
            </Field>
          </div>

          <Field label="EMOTION AFTER">
            <textarea rows={2} placeholder="How did you feel after it closed?"
              value={form.emotionAfter ?? ''} onChange={e => set('emotionAfter', e.target.value)}
              className="glass-input form-input resize-none" />
          </Field>

          <Field label="GRADE (1–5)">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => set('grade', form.grade === n ? null : n)}
                  className="mono py-3 sm:py-4 rounded-xl font-bold transition-all"
                  style={{
                    fontSize: '1rem',
                    background: form.grade != null && n <= form.grade
                      ? 'rgba(0,230,160,0.15)' : 'var(--surface2)',
                    color: form.grade != null && n <= form.grade
                      ? 'var(--accent)' : 'var(--muted)',
                    border: `1px solid ${form.grade != null && n <= form.grade
                      ? 'rgba(0,230,160,0.4)' : 'var(--border2)'}`,
                    boxShadow: form.grade === n ? '0 0 16px rgba(0,230,160,0.2)' : 'none',
                  }}>
                  {n}
                </button>
              ))}
            </div>
            <p className="mono mt-2.5 text-center" style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>
              1 = BROKE RULES &nbsp;—&nbsp; 5 = FLAWLESS
            </p>
          </Field>

          <Field label="LESSON">
            <textarea rows={2} placeholder="What did you learn from this trade?"
              value={form.lesson ?? ''} onChange={e => set('lesson', e.target.value)}
              className="glass-input form-input resize-none" />
          </Field>

          <Field label="CHART URL">
            <input type="url" placeholder="https://…"
              value={form.chartUrl ?? ''} onChange={e => set('chartUrl', e.target.value)}
              className="glass-input form-input" />
          </Field>
        </Section>

        {/* Buttons */}
        <div className="pt-2 grid gap-3">
          <button onClick={handleSubmit} disabled={saving}
            className="w-full mono font-bold py-5 rounded-xl transition-all relative overflow-hidden group"
            style={{
              background: saving ? 'var(--surface2)' : 'linear-gradient(135deg, var(--accent) 0%, #00b377 100%)',
              color: saving ? 'var(--muted)' : '#000',
              fontSize: '0.9rem', letterSpacing: '0.1em',
              boxShadow: saving ? 'none' : '0 8px 32px var(--accent-glow)',
              border: saving ? '1px solid var(--border)' : '1px solid transparent',
            }}>
            <span className="relative z-10">{saving ? 'SAVING…' : 'SAVE CHANGES →'}</span>
          </button>

          <a href="/"
            className="w-full mono font-bold py-4 rounded-xl transition-all text-center block"
            style={{
              background: 'transparent',
              color: 'var(--muted)',
              fontSize: '0.8rem', letterSpacing: '0.08em',
              border: '1px solid var(--border)',
            }}>
            CANCEL
          </a>
        </div>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          border-radius: 12px;
          padding: 14px 16px;
          color: var(--text);
        }
        .form-input option {
          background: #0f1218;
          color: var(--text);
        }
      `}</style>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden glass-panel">
      <div className="px-5 py-3 mono border-b border-[var(--border)]"
        style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--muted)', background: 'rgba(0,0,0,0.2)' }}>
        {label}
      </div>
      <div className="p-5 sm:p-6 grid gap-5 sm:gap-6">
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, accent, children }: {
  label: string; required?: boolean; accent?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block mono mb-2.5 ml-1"
        style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: accent ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}>
        {label}{required && <span className="text-[var(--loss)]"> *</span>}
      </label>
      {children}
    </div>
  )
}
