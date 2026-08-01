'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Drop into instructor/dashboard/page.js, alongside the other manager components.
// Props:
//   courseId: the tutor's course UUID (needed to create new sessions)
//   courseTitle: for display
//   userId: the logged-in tutor's id (needed as created_by)

function toLocalInputValue(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function LiveClassManager({ courseId, courseTitle, userId }) {
  const [width, setWidth] = useState(1200)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', joinUrl: '', start: '', end: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (courseId) loadClasses()
  }, [courseId])

  async function loadClasses() {
    setLoading(true)
    const { data } = await supabase
      .from('live_classes')
      .select('*')
      .eq('course_id', courseId)
      .order('scheduled_start', { ascending: true })
    setClasses(data || [])
    setLoading(false)
  }

  const isMobile = width <= 768

  function resetForm() {
    setForm({ title: '', description: '', joinUrl: '', start: '', end: '' })
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  function startEdit(liveClass) {
    setForm({
      title: liveClass.title,
      description: liveClass.description || '',
      joinUrl: liveClass.join_url,
      start: toLocalInputValue(liveClass.scheduled_start),
      end: toLocalInputValue(liveClass.scheduled_end),
    })
    setEditingId(liveClass.id)
    setShowForm(true)
  }

  async function handleSave() {
    setError(null)

    if (!form.title.trim() || !form.joinUrl.trim() || !form.start || !form.end) {
      setError('Title, join link, start time, and end time are all required.')
      return
    }
    if (new Date(form.end) <= new Date(form.start)) {
      setError('End time must be after the start time.')
      return
    }
    try {
      new URL(form.joinUrl)
    } catch {
      setError('The join link does not look like a valid URL.')
      return
    }

    setSaving(true)

    const payload = {
      course_id: courseId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      join_url: form.joinUrl.trim(),
      scheduled_start: new Date(form.start).toISOString(),
      scheduled_end: new Date(form.end).toISOString(),
      created_by: userId,
    }

    const { error: saveError } = editingId
      ? await supabase.from('live_classes').update(payload).eq('id', editingId)
      : await supabase.from('live_classes').insert(payload)

    setSaving(false)

    if (saveError) {
      setError('Could not save: ' + saveError.message)
      return
    }

    resetForm()
    loadClasses()
  }

  async function handleDelete(id) {
    if (!confirm('Cancel and remove this live class?')) return
    await supabase.from('live_classes').delete().eq('id', id)
    loadClasses()
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box', border: '1px solid rgba(0,0,0,0.15)',
    borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#1a1a2e', fontFamily: 'Inter, sans-serif',
  }

  const now = Date.now()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Live Classes</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ background: '#4a9eff', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
          >
            + Schedule Class
          </button>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: '#8a94a6', marginBottom: 16 }}>
        Schedule live sessions for {courseTitle}. Paste your Zoom or Google Meet link — students will see the schedule and join link on their side.
      </p>

      {showForm && (
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: 16 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 4 }}>Title</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Week 3 Live Q&A" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 4 }}>Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 4 }}>Join link (Zoom / Google Meet)</label>
            <input type="text" value={form.joinUrl} onChange={e => setForm(f => ({ ...f, joinUrl: e.target.value }))} placeholder="https://zoom.us/j/..." style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row', marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 4 }}>Starts</label>
              <input type="datetime-local" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: 4 }}>Ends</label>
              <input type="datetime-local" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(232,64,64,0.08)', border: '1px solid rgba(232,64,64,0.25)', borderRadius: 8, padding: '9px 13px', fontSize: 12.5, color: '#e84040', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(135deg,#4a9eff,#2563eb)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : editingId ? 'Update Class' : 'Schedule Class'}
            </button>
            <button onClick={resetForm} style={{ background: 'none', border: '1.5px solid #e2e6ed', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, color: '#8a94a6', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#8a94a6', fontSize: 13 }}>Loading...</div>
      ) : classes.length === 0 ? (
        <div style={{ color: '#8a94a6', fontSize: 13 }}>No live classes scheduled yet.</div>
      ) : (
        classes.map(lc => {
          const isPast = new Date(lc.scheduled_end).getTime() < now
          return (
            <div key={lc.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: isMobile ? 14 : 16, marginBottom: 10, opacity: isPast ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1a1a2e' }}>{lc.title}{isPast && <span style={{ marginLeft: 8, fontSize: 10.5, fontWeight: 700, color: '#8a94a6' }}>PAST</span>}</div>
                  <div style={{ fontSize: 11.5, color: '#8a94a6', marginTop: 2 }}>
                    {new Date(lc.scheduled_start).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })} — {new Date(lc.scheduled_end).toLocaleTimeString('en-NG', { timeStyle: 'short' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => startEdit(lc)} style={{ background: 'rgba(74,158,255,0.1)', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11.5, fontWeight: 600, color: '#4a9eff', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(lc.id)} style={{ background: 'rgba(232,64,64,0.08)', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11.5, fontWeight: 600, color: '#e84040', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}