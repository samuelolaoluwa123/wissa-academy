'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { isValidYouTubeUrl } from '../../lib/videoEmbed'

// Drop into instructor/dashboard/page.js, alongside QuizScheduleManager.
// Props:
//   lessons: array of { id, title, video_url, type, moduleTitle, courseTitle }
//     — scoped to lessons belonging to this tutor's own courses only.
//     Typically fetched via: courses (tutor_id = userId) -> modules -> lessons
//   onUpdated: optional callback(lessonId, videoUrl) to sync parent state

export default function LessonVideoManager({ lessons, onUpdated }) {
  const [width, setWidth] = useState(1200)
  const [drafts, setDrafts] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [savedId, setSavedId] = useState(null)
  const [errorId, setErrorId] = useState(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const initial = {}
    for (const l of lessons) initial[l.id] = l.video_url || ''
    setDrafts(initial)
  }, [lessons])

  const isMobile = width <= 768

  function updateDraft(lessonId, value) {
    setDrafts(prev => ({ ...prev, [lessonId]: value }))
    setSavedId(null)
    setErrorId(null)
  }

  async function handleSave(lessonId) {
    const url = drafts[lessonId]?.trim()

    if (url && !isValidYouTubeUrl(url)) {
      setErrorId(lessonId)
      return
    }

    setSavingId(lessonId)
    setErrorId(null)

    const { error } = await supabase
      .from('lessons')
      .update({ video_url: url || null, video_provider: url ? 'youtube' : null })
      .eq('id', lessonId)

    setSavingId(null)

    if (error) {
      setErrorId(lessonId)
      return
    }

    setSavedId(lessonId)
    if (onUpdated) onUpdated(lessonId, url || null)
  }

  const visibleLessons = lessons.filter(l => {
    if (!filter) return true
    const q = filter.toLowerCase()
    return (
      l.title?.toLowerCase().includes(q) ||
      l.moduleTitle?.toLowerCase().includes(q) ||
      l.courseTitle?.toLowerCase().includes(q)
    )
  })

  const inputStyle = {
    border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 8,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 13,
    color: '#1a1a2e',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
        Lesson Videos
      </h2>

      <input
        type="text"
        placeholder="Search lessons, modules, or courses..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ ...inputStyle, marginBottom: 16, maxWidth: isMobile ? '100%' : 360 }}
      />

      {visibleLessons.length === 0 && (
        <div style={{ color: '#8a94a6', fontSize: 14 }}>No lessons match your search.</div>
      )}

      {visibleLessons.map(lesson => (
        <div
          key={lesson.id}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 12,
            padding: isMobile ? 16 : 18,
            marginBottom: 12,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 14 }}>
              {lesson.title}
              {lesson.type === 'quiz' && (
                <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: '#8c64ff', background: 'rgba(140,100,255,0.1)', padding: '2px 8px', borderRadius: 10 }}>
                  QUIZ — no video needed
                </span>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: '#8a94a6', marginTop: 2 }}>
              {lesson.courseTitle} · {lesson.moduleTitle}
            </div>
          </div>

          {lesson.type !== 'quiz' && (
            <>
              <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' }}>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={drafts[lesson.id] || ''}
                  onChange={e => updateDraft(lesson.id, e.target.value)}
                  style={inputStyle}
                />
                <button
                  onClick={() => handleSave(lesson.id)}
                  disabled={savingId === lesson.id}
                  style={{
                    backgroundColor: '#4a9eff',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    paddingTop: 8,
                    paddingBottom: 8,
                    paddingLeft: 18,
                    paddingRight: 18,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: savingId === lesson.id ? 'default' : 'pointer',
                    opacity: savingId === lesson.id ? 0.7 : 1,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {savingId === lesson.id ? 'Saving...' : 'Save'}
                </button>
              </div>

              {savedId === lesson.id && (
                <div style={{ color: '#3ee87a', fontSize: 12.5, marginTop: 6 }}>Saved.</div>
              )}
              {errorId === lesson.id && (
                <div style={{ color: '#e84040', fontSize: 12.5, marginTop: 6 }}>
                  That does not look like a valid YouTube URL. Leave blank to clear.
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  )
}