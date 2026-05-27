'use client'
import React from 'react'

interface SuggestFieldProps {
  label: string
  required?: boolean
  accent?: boolean
  placeholder?: string
  rows?: number
  value: string
  onChange: (v: string) => void
  suggestions: string[]
}

export function SuggestField({
  label,
  required,
  accent,
  placeholder,
  rows = 3,
  value,
  onChange,
  suggestions,
}: SuggestFieldProps) {
  
  const handleToggle = (suggestion: string) => {
    const isActive = value.toLowerCase().includes(suggestion.toLowerCase())
    if (isActive) {
      // Find the index of the suggestion (case-insensitive)
      const lowerVal = value.toLowerCase()
      const lowerSug = suggestion.toLowerCase()
      const index = lowerVal.indexOf(lowerSug)
      
      if (index !== -1) {
        const before = value.substring(0, index)
        const after = value.substring(index + suggestion.length)
        let newValue = before + after
        
        // Clean up double commas, leading/trailing spaces and commas
        newValue = newValue
          .replace(/,\s*,/g, ',')
          .replace(/^\s*,\s*/, '')
          .replace(/\s*,\s*$/, '')
          .replace(/\s+/g, ' ')
          .trim()
          
        onChange(newValue)
      }
    } else {
      const trimmed = value.trim()
      if (!trimmed) {
        onChange(suggestion)
      } else {
        // If it ends with punctuation, just append with space; otherwise comma-separate
        const endsWithPunct = /[.,!?]$/.test(trimmed)
        onChange(`${trimmed}${endsWithPunct ? ' ' : ', '}${suggestion}`)
      }
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2 ml-1">
        <label className="block mono"
          style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: accent ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}>
          {label}{required && <span className="text-[var(--loss)]">*</span>}
        </label>
        
        {/* Suggestion Chips Container */}
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map(sug => {
            const isActive = value.toLowerCase().includes(sug.toLowerCase())
            return (
              <button
                key={sug}
                type="button"
                onClick={() => handleToggle(sug)}
                className="px-2 py-0.5 rounded-md text-[0.6rem] mono transition-all border outline-none active:scale-95"
                style={{
                  color: isActive ? '#000' : 'var(--muted)',
                  background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.02)',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  boxShadow: isActive ? '0 2px 8px var(--accent-glow)' : 'none',
                  fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {sug}
              </button>
            )
          })}
        </div>
      </div>

      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="glass-input w-full rounded-xl px-4 py-3.5 text-[var(--text)] outline-none resize-none"
      />
    </div>
  )
}
