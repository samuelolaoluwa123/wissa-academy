'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Drop into instructor/dashboard/page.js as a section.
// Props:
//   quizzes: array of { id, title, scheduled_start, scheduled_end }
//     — fetch these server-side or via useEffect before rendering, scoped
//       to courses this tutor owns.
//   onUpdated: optional callback(quizId, { scheduled_start, scheduled_end })
//     to let the parent refresh its own state after a save.

export default function QuizScheduleManager({ quizzes, onUpdated }) {
  const [width, setWidth] = useState(1200)
  const [drafts, setDrafts] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [savedId, setSavedId] = useState(null)
  const [errorId, setErrorId] = useState(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const initial = {}
    for (const q of quizzes) {
      initial[q.id] = {
        start: toLocalInputValue(q.scheduled_start),
        end: toLocalInputValue(q.scheduled_end),
      }
    }
    setDrafts(initial)
  }, [quizzes])

  const isMobile = width <= 768

  function toLocalInputValue(isoString) {
    if (!isoString) return ''
    const d = new Date(isoString)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`
  }

  function updateDraft(quizId, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [quizId]: { ...prev[quizId], [field]: value },
    }))
    setSavedId(null)
    setErrorId(null)
  }

  async function handleSave(quizId) {
    const draft = drafts[quizId]
    if (!draft?.start || !draft?.end) {
      setErrorId(quizId)
      return
    }
    if (new Date(draft.end) <= new Date(draft.start)) {
      setErrorId(quizId)
      return
    }

    setSavingId(quizId)
    setErrorId(null)

    const scheduled_start = new Date(draft.start).toISOString()
    const scheduled_end = new Date(draft.end).toISOString()

    const { error } = await supabase
      .from('quizzes')
      .update({ scheduled_start, scheduled_end })
      .eq('id', quizId)

    setSavingId(null)

    if (error) {
      setErrorId(quizId)
      return
    }

    setSavedId(quizId)
    if (onUpdated) onUpdated(quizId, { scheduled_start, scheduled_end })
  }

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid rgba(0,0,0,0.07)',
    borderRadius: 12,
    padding: isMobile ? 16 : 20,
    marginBottom: 16,
  }

  const inputStyle = {
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 8,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 14,
    color: '#1a1a2e',
    width: isMobile ? '100%' : 220,
  }

  const labelStyle = {
    fontSize: 12,
    color: '#8a94a6',
    marginBottom: 4,
    display: 'block',
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>
        Quiz Scheduling
      </h2>

      {quizzes.length === 0 && (
        <div style={{ color: '#8a94a6', fontSize: 14 }}>
          No quizzes found for your courses yet.
        </div>
      )}

      {quizzes.map((q) => (
        <div key={q.id} style={cardStyle}>
          <div style={{ fontWeight: 600, color: '#1a1a2e', marginBottom: 12 }}>
            {q.title}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 16,
              marginBottom: 12,
            }}
          >
            <div>
              <span style={labelStyle}>Opens</span>
              <input
                type="datetime-local"
                style={inputStyle}
                value={drafts[q.id]?.start || ''}
                onChange={(e) => updateDraft(q.id, 'start', e.target.value)}
              />
            </div>
            <div>
              <span style={labelStyle}>Closes</span>
              <input
                type="datetime-local"
                style={inputStyle}
                value={drafts[q.id]?.end || ''}
                onChange={(e) => updateDraft(q.id, 'end', e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={() => handleSave(q.id)}
            disabled={savingId === q.id}
            style={{
              backgroundColor: '#4a9eff',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 18,
              paddingRight: 18,
              fontWeight: 600,
              fontSize: 13,
              cursor: savingId === q.id ? 'default' : 'pointer',
              opacity: savingId === q.id ? 0.7 : 1,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {savingId === q.id ? 'Saving...' : 'Save Window'}
          </button>

          {savedId === q.id && (
            <div style={{ color: '#3ee87a', fontSize: 13, marginTop: 8 }}>
              Saved.
            </div>
          )}
          {errorId === q.id && (
            <div style={{ color: '#e84040', fontSize: 13, marginTop: 8 }}>
              Check both dates are set and closes is after opens.
            </div>
          )}
        </div>
      ))}
    </div>
  )
}