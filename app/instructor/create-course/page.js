'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateCoursePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [width, setWidth] = useState(1200)
  const [pricingMode, setPricingMode] = useState('free')
  const [modules, setModules] = useState([])
  const [thumbUploaded, setThumbUploaded] = useState(false)
  const [published, setPublished] = useState(false)
  const [savedDraft, setSavedDraft] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', category: '', level: '',
    language: 'English', promoVideo: '', duration: '', price: '', oldPrice: '',
    enrollLimit: '', accessPeriod: 'lifetime',
  })

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isMobile  = width <= 768
  const isTablet  = width > 768 && width <= 1024
  const showPreview = !isMobile && !isTablet

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0)

  // Checklist
  const checks = {
    title:      form.title.trim().length >= 5,
    desc:       form.description.trim().length >= 20,
    cat:        !!(form.category && form.level),
    thumb:      thumbUploaded,
    curriculum: totalLessons >= 1,
    price:      pricingMode === 'free' || Number(form.price) > 0,
  }

  function addModule() {
    setModules(prev => [...prev, { id: Date.now(), title: '', lessons: [] }])
  }
  function deleteModule(id) {
    setModules(prev => prev.filter(m => m.id !== id))
  }
  function updateModuleTitle(id, val) {
    setModules(prev => prev.map(m => m.id === id ? { ...m, title: val } : m))
  }
  function addLesson(modId) {
    setModules(prev => prev.map(m => m.id === modId ? { ...m, lessons: [...m.lessons, { id: Date.now(), title: '', type: 'Video', duration: '' }] } : m))
  }
  function deleteLesson(modId, lesId) {
    setModules(prev => prev.map(m => m.id === modId ? { ...m, lessons: m.lessons.filter(l => l.id !== lesId) } : m))
  }
  function updateLesson(modId, lesId, field, val) {
    setModules(prev => prev.map(m => m.id === modId ? { ...m, lessons: m.lessons.map(l => l.id === lesId ? { ...l, [field]: val } : l) } : m))
  }

  const steps = ['Course info', 'Curriculum', 'Pricing', 'Review & Publish']

  const inp = (val, key) => ({
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e2e6ed', borderRadius: '10px',
    fontSize: '13px', fontFamily: 'inherit',
    color: '#1a1a2e', background: '#fff', outline: 'none',
    transition: 'border-color 0.18s',
  })

  const sel = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e2e6ed', borderRadius: '10px',
    fontSize: '13px', fontFamily: 'inherit',
    color: '#1a1a2e', background: '#fff', outline: 'none', cursor: 'pointer',
  }

  const fieldLabel = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' }
  const fieldWrap  = { marginBottom: '18px' }
  const cardPad    = isMobile ? '16px' : '24px'

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#eef1f6', minHeight: '100vh' }}>

      {/* TOPBAR */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '62px', background: '#0f1b2d', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px', zIndex: 200, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => router.push('/instructor/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500, padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          {!isMobile && 'Dashboard'}
        </button>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        {!isMobile && (
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Create new course</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '1px' }}>WiSSA Academy · Instructor</div>
          </div>
        )}
        {isMobile && <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Create course</div>}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => { setSavedDraft(true); setTimeout(() => setSavedDraft(false), 2000) }}
          style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.07)', color: savedDraft ? '#3ee87a' : 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s', whiteSpace: 'nowrap' }}>
          {savedDraft ? '✓ Saved' : 'Save draft'}
        </button>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e3a5f', color: '#4a9eff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(74,158,255,0.3)' }}>AO</div>
      </header>

      <div style={{ marginTop: '62px', minHeight: 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column' }}>

        {/* STEP INDICATOR */}
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: `0 ${cardPad}` }}>
          <div style={{ display: 'flex', maxWidth: '860px' }}>
            {steps.map((s, i) => {
              const num = i + 1
              const isActive = step === num
              const isDone   = step > num
              return (
                <div
                  key={s}
                  onClick={() => isDone && setStep(num)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: `${isMobile ? '12px' : '16px'} ${isMobile ? '8px' : '16px'} ${isMobile ? '12px' : '16px'} 0`, cursor: isDone ? 'pointer' : 'default', flex: 1, minWidth: 0, position: 'relative' }}
                >
                  <div style={{ width: '26px', height: '26px', minWidth: '26px', borderRadius: '50%', border: `2px solid ${isActive ? '#4a9eff' : isDone ? 'rgba(62,232,122,0.4)' : '#e2e6ed'}`, background: isActive ? '#4a9eff' : isDone ? 'rgba(62,232,122,0.13)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: isActive ? '#fff' : isDone ? '#1a8a46' : '#b0b8c8', transition: 'all 0.2s' }}>
                    {isDone ? '✓' : num}
                  </div>
                  {!isMobile && (
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 600 : 500, color: isActive ? '#1a1a2e' : '#8a94a6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, padding: cardPad, maxWidth: showPreview ? '640px' : '100%' }}>

            {/* ── STEP 1: COURSE INFO ── */}
            {step === 1 && (
              <div className="anim-fade-in">
                <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Course information</div>
                <div style={{ fontSize: '13px', color: '#8a94a6', marginBottom: '24px' }}>Tell students what your course is about.</div>

                <div style={fieldWrap}>
                  <label style={fieldLabel}>Course title <span style={{ color: '#e84040' }}>*</span> <span style={{ fontSize: '11px', fontWeight: 400, color: '#b0b8c8' }}>({form.title.length}/80)</span></label>
                  <input type="text" maxLength={80} placeholder="e.g. HTML Fundamentals for Beginners" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inp()} />
                </div>

                <div style={fieldWrap}>
                  <label style={fieldLabel}>Description <span style={{ color: '#e84040' }}>*</span> <span style={{ fontSize: '11px', fontWeight: 400, color: '#b0b8c8' }}>({form.description.length}/500)</span></label>
                  <textarea maxLength={500} rows={4} placeholder="Describe what students will learn, who this course is for…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inp(), resize: 'vertical', lineHeight: 1.6 }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <label style={fieldLabel}>Category <span style={{ color: '#e84040' }}>*</span></label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={sel}>
                      <option value="">Select category</option>
                      <option>HTML</option><option>CSS</option><option>JavaScript</option><option>Projects</option><option>Career</option>
                    </select>
                  </div>
                  <div>
                    <label style={fieldLabel}>Level <span style={{ color: '#e84040' }}>*</span></label>
                    <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} style={sel}>
                      <option value="">Select level</option>
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                    </select>
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={fieldLabel}>Language</label>
                  <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} style={{ ...sel, maxWidth: isMobile ? '100%' : '220px' }}>
                    <option>English</option><option>Yoruba</option><option>Igbo</option><option>Hausa</option>
                  </select>
                </div>

                <div style={fieldWrap}>
                  <label style={fieldLabel}>Course thumbnail <span style={{ color: '#e84040' }}>*</span> <span style={{ fontSize: '11px', fontWeight: 400, color: '#b0b8c8' }}>JPG or PNG, min 1280×720px</span></label>
                  <div
                    onClick={() => { setThumbUploaded(true) }}
                    style={{ border: `2px dashed ${thumbUploaded ? 'rgba(62,232,122,0.4)' : '#e2e6ed'}`, borderRadius: '12px', padding: isMobile ? '20px' : '28px 20px', textAlign: 'center', cursor: 'pointer', background: thumbUploaded ? 'rgba(62,232,122,0.06)' : '#fafbfc', transition: 'all 0.18s' }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '11px', background: 'rgba(74,158,255,0.13)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a9eff" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: thumbUploaded ? '#1a8a46' : '#1a1a2e', marginBottom: '4px' }}>
                      {thumbUploaded ? '✓ thumbnail.jpg uploaded' : 'Upload thumbnail image'}
                    </div>
                    {!thumbUploaded && <div style={{ fontSize: '12px', color: '#8a94a6', marginBottom: '10px' }}>Drag and drop or click to browse</div>}
                    {!thumbUploaded && <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(74,158,255,0.13)', color: '#4a9eff', border: '1px solid rgba(74,158,255,0.25)', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>Choose image</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={fieldLabel}>Promo video URL <span style={{ fontSize: '11px', fontWeight: 400, color: '#b0b8c8' }}>Optional</span></label>
                    <input type="url" placeholder="https://youtube.com/watch?v=..." value={form.promoVideo} onChange={(e) => setForm({ ...form, promoVideo: e.target.value })} style={inp()} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Total duration <span style={{ fontSize: '11px', fontWeight: 400, color: '#b0b8c8' }}>e.g. 4h 30m</span></label>
                    <input type="text" placeholder="4h 30m" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} style={inp()} />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: CURRICULUM ── */}
            {step === 2 && (
              <div className="anim-fade-in">
                <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Build your curriculum</div>
                <div style={{ fontSize: '13px', color: '#8a94a6', marginBottom: '20px' }}>Organise your course into modules and lessons.</div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#8a94a6' }}>{modules.length} module{modules.length !== 1 ? 's' : ''} · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}</span>
                  <button onClick={addModule} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'rgba(74,158,255,0.13)', color: '#4a9eff', border: '1px solid rgba(74,158,255,0.25)', borderRadius: '9px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add module
                  </button>
                </div>

                {modules.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fff', border: '2px dashed #e2e6ed', borderRadius: '12px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>📚</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>No modules yet</div>
                    <div style={{ fontSize: '13px', color: '#8a94a6' }}>Click "Add module" to start building your curriculum</div>
                  </div>
                )}

                {modules.map((mod) => (
                  <div key={mod.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#eef1f6', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0b8c8" strokeWidth="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                      <input value={mod.title} onChange={(e) => updateModuleTitle(mod.id, e.target.value)} placeholder="Module title — e.g. Introduction to HTML" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', color: '#1a1a2e', outline: 'none', padding: '2px 4px', borderRadius: '4px' }} />
                      <button onClick={() => deleteModule(mod.id)} style={{ width: '26px', height: '26px', borderRadius: '7px', border: '1px solid rgba(0,0,0,0.07)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e84040', flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <div style={{ padding: '8px 12px' }}>
                      {mod.lessons.map((les) => (
                        <div key={les.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 8px', background: '#eef1f6', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '8px', marginBottom: '6px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b0b8c8" strokeWidth="2"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/></svg>
                          <select value={les.type} onChange={(e) => updateLesson(mod.id, les.id, 'type', e.target.value)} style={{ padding: '4px 7px', border: '1.5px solid #e2e6ed', borderRadius: '6px', fontSize: '11px', fontFamily: 'inherit', fontWeight: 600, color: '#8a94a6', background: '#fff', outline: 'none', cursor: 'pointer', flexShrink: 0 }}>
                            <option>Video</option><option>Quiz</option><option>Reading</option>
                          </select>
                          <input value={les.title} onChange={(e) => updateLesson(mod.id, les.id, 'title', e.target.value)} placeholder="Lesson title" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '12px', fontFamily: 'inherit', color: '#1a1a2e', outline: 'none', minWidth: 0 }} />
                          <input value={les.duration} onChange={(e) => updateLesson(mod.id, les.id, 'duration', e.target.value)} placeholder="00:00" style={{ width: '52px', padding: '3px 6px', border: '1.5px solid #e2e6ed', borderRadius: '6px', fontSize: '11px', fontFamily: 'inherit', color: '#8a94a6', background: '#fff', outline: 'none', textAlign: 'center', flexShrink: 0 }} />
                          <button onClick={() => deleteLesson(mod.id, les.id)} style={{ width: '22px', height: '22px', borderRadius: '5px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b0b8c8', flexShrink: 0 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addLesson(mod.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 10px', background: 'transparent', border: '1.5px dashed #e2e6ed', borderRadius: '8px', fontSize: '12px', fontWeight: 500, color: '#8a94a6', cursor: 'pointer', fontFamily: 'inherit', width: '100%', margin: '4px 0 2px', transition: 'all 0.15s' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add lesson
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 3: PRICING ── */}
            {step === 3 && (
              <div className="anim-fade-in">
                <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Pricing</div>
                <div style={{ fontSize: '13px', color: '#8a94a6', marginBottom: '24px' }}>Choose how students will access your course.</div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={fieldLabel}>Access type <span style={{ color: '#e84040' }}>*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[{ id:'free', label:'Free', desc:'Open to all students', icon:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> }, { id:'paid', label:'Paid', desc:'Set your own price in ₦', icon:<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> }].map((opt) => (
                      <div key={opt.id} onClick={() => setPricingMode(opt.id)} style={{ padding: '14px', border: `2px solid ${pricingMode === opt.id ? '#4a9eff' : '#e2e6ed'}`, borderRadius: '12px', cursor: 'pointer', background: pricingMode === opt.id ? 'rgba(74,158,255,0.13)' : '#fff', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', minWidth: '34px', borderRadius: '9px', background: pricingMode === opt.id ? '#4a9eff' : '#eef1f6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.18s' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pricingMode === opt.id ? '#fff' : '#8a94a6'} strokeWidth="2">{opt.icon}</svg>
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e' }}>{opt.label}</div>
                          <div style={{ fontSize: '11px', color: '#8a94a6', marginTop: '1px' }}>{opt.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {pricingMode === 'paid' && (
                  <>
                    <div style={fieldWrap}>
                      <label style={fieldLabel}>Course price (₦) <span style={{ color: '#e84040' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', fontWeight: 700, color: '#8a94a6' }}>₦</span>
                        <input type="number" placeholder="e.g. 15000" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ ...inp(), paddingLeft: '32px' }} />
                      </div>
                      <div style={{ fontSize: '12px', color: '#8a94a6', marginTop: '6px' }}>WiSSA Academy takes a 10% platform fee. You receive 90% of each sale.</div>
                    </div>
                    <div style={fieldWrap}>
                      <label style={fieldLabel}>Original price (₦) <span style={{ fontSize: '11px', fontWeight: 400, color: '#b0b8c8' }}>Optional — shows a discount</span></label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', fontWeight: 700, color: '#8a94a6' }}>₦</span>
                        <input type="number" placeholder="e.g. 25000" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} style={{ ...inp(), paddingLeft: '32px' }} />
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                  <div>
                    <label style={fieldLabel}>Enrolment limit <span style={{ fontSize: '11px', fontWeight: 400, color: '#b0b8c8' }}>Optional</span></label>
                    <input type="number" placeholder="e.g. 200 (blank = unlimited)" value={form.enrollLimit} onChange={(e) => setForm({ ...form, enrollLimit: e.target.value })} style={inp()} />
                  </div>
                  <div>
                    <label style={fieldLabel}>Course access period</label>
                    <select value={form.accessPeriod} onChange={(e) => setForm({ ...form, accessPeriod: e.target.value })} style={sel}>
                      <option value="lifetime">Lifetime access</option>
                      <option value="12">12 months</option>
                      <option value="6">6 months</option>
                      <option value="3">3 months</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', background: 'rgba(62,232,122,0.08)', border: '1px solid rgba(62,232,122,0.25)', borderRadius: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a8a46" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                  <span style={{ fontSize: '13px', color: '#1a8a46', fontWeight: 500 }}>Certificate on completion — enabled by default for all courses</span>
                </div>
              </div>
            )}

            {/* ── STEP 4: REVIEW ── */}
            {step === 4 && (
              <div className="anim-fade-in">
                <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: '#1a1a2e', marginBottom: '4px' }}>Review & Publish</div>
                <div style={{ fontSize: '13px', color: '#8a94a6', marginBottom: '20px' }}>Check everything before your course goes live.</div>

                {[
                  { title: 'Course info', step: 1, rows: [['Title', form.title || '—'], ['Category', form.category || '—'], ['Level', form.level || '—'], ['Duration', form.duration || '—'], ['Thumbnail', thumbUploaded ? '✓ Uploaded' : '✗ Not uploaded']] },
                  { title: 'Curriculum', step: 2, rows: [['Modules', String(modules.length)], ['Lessons', String(totalLessons)]] },
                  { title: 'Pricing', step: 3, rows: [['Price', pricingMode === 'free' ? 'Free' : form.price ? `₦${Number(form.price).toLocaleString()}` : '—'], ['Access', form.accessPeriod === 'lifetime' ? 'Lifetime' : `${form.accessPeriod} months`], ['Certificate', '✓ Enabled']] },
                ].map((section) => (
                  <div key={section.title} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#eef1f6', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{section.title}</div>
                      <button onClick={() => setStep(section.step)} style={{ fontSize: '12px', fontWeight: 600, color: '#4a9eff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                      {section.rows.map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', gap: '10px', fontSize: '13px', marginBottom: '6px' }}>
                          <span style={{ color: '#8a94a6', minWidth: '90px', flexShrink: 0 }}>{label}</span>
                          <span style={{ fontWeight: 500, color: value === '✗ Not uploaded' ? '#e84040' : value === '✓ Enabled' ? '#1a8a46' : '#1a1a2e' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '13px 16px', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: '12px', marginBottom: '20px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div style={{ fontSize: '13px', color: '#7a5000', lineHeight: 1.5 }}>Once published, your course will appear immediately in the course listing. Students can enrol and you will begin receiving payments via Paystack within 24 hours of each sale.</div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => { setSavedDraft(true); setTimeout(() => setSavedDraft(false), 2000) }} style={{ flex: 1, padding: '13px', background: '#fff', color: '#1a1a2e', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: '11px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', minWidth: '120px', transition: 'all 0.15s' }}>
                    Save as draft
                  </button>
                  <button onClick={() => setPublished(true)} style={{ flex: 1, padding: '13px', background: published ? '#1a8a46' : '#4a9eff', color: '#fff', border: 'none', borderRadius: '11px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', minWidth: '160px', transition: 'background 0.2s' }}>
                    {published ? '✓ Course published!' : '🚀 Publish course'}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* PREVIEW SIDEBAR — desktop only */}
          {showPreview && (
            <div style={{ width: '280px', flexShrink: 0, padding: '24px 20px', position: 'sticky', top: '62px', background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.07)', minHeight: 'calc(100vh - 62px - 57px)', alignSelf: 'flex-start' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#b0b8c8', marginBottom: '12px' }}>Live preview</div>

              {/* Preview card */}
              <div style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                <div style={{ height: '110px', background: 'linear-gradient(135deg,#1a3a6e,#2a5cb8)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  </div>
                  <span style={{ position: 'absolute', top: '10px', left: '10px', padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, background: 'rgba(74,158,255,0.25)', color: '#4a9eff', border: '1px solid rgba(74,158,255,0.3)' }}>New</span>
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#4a9eff', textTransform: 'uppercase', marginBottom: '5px' }}>{form.category || 'Category'}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.4, marginBottom: '4px', minHeight: '18px' }}>{form.title || 'Your course title will appear here'}</div>
                  <div style={{ fontSize: '11px', color: '#8a94a6', marginBottom: '8px' }}>Amaka Okafor</div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {form.level && <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, background: 'rgba(62,232,122,0.13)', color: '#1a8a46' }}>{form.level}</span>}
                    {form.duration && <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, background: '#eef1f6', color: '#8a94a6' }}>⏱ {form.duration}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: pricingMode === 'free' ? '#1a8a46' : '#1a1a2e' }}>
                      {pricingMode === 'free' ? 'Free' : form.price ? `₦${Number(form.price).toLocaleString()}` : '₦—'}
                    </span>
                    <span style={{ padding: '5px 12px', background: '#4a9eff', color: '#fff', borderRadius: '7px', fontSize: '11px', fontWeight: 700 }}>Enrol now</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#b0b8c8', marginBottom: '10px' }}>Checklist</div>
              {[
                ['chk-title',      'Course title added',        checks.title      ],
                ['chk-desc',       'Description written',       checks.desc       ],
                ['chk-cat',        'Category & level set',      checks.cat        ],
                ['chk-thumb',      'Thumbnail uploaded',        checks.thumb      ],
                ['chk-curriculum', 'At least 1 lesson added',   checks.curriculum ],
                ['chk-price',      'Pricing configured',        checks.price      ],
              ].map(([key, label, done]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', padding: '4px 0', color: done ? '#1a1a2e' : '#8a94a6' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={done ? '#1a8a46' : '#b0b8c8'} strokeWidth="2">
                    {done ? <polyline points="20 6 9 17 4 12"/> : <circle cx="12" cy="12" r="10"/>}
                  </svg>
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STEP FOOTER */}
        <div style={{ background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)', padding: `14px ${cardPad}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', position: 'sticky', bottom: 0, zIndex: 50, flexWrap: 'wrap' }}>
          <div style={{ fontSize: '12px', color: '#8a94a6' }}>
            Step <strong style={{ color: '#1a1a2e' }}>{step}</strong> of <strong style={{ color: '#1a1a2e' }}>{steps.length}</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button disabled={step === 1} onClick={() => setStep(s => s - 1)} style={{ padding: '9px 20px', background: '#eef1f6', color: step === 1 ? '#b0b8c8' : '#8a94a6', border: '1.5px solid rgba(0,0,0,0.07)', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: step === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              ← Previous
            </button>
            {step < steps.length && (
              <button onClick={() => setStep(s => s + 1)} style={{ padding: '9px 24px', background: '#4a9eff', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.15s' }}>
                Continue <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}