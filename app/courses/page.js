'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../components/layout/DashboardShell'
import { COURSES, getTutor, getLessonCount } from '../../lib/courses'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'AI & Content', 'No-Code']

function Stars({ rating }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#f5a623' : '#e2e6ed', fontSize:'12px' }}>★</span>
      ))}
    </span>
  )
}

function LabelBadge({ label }) {
  if (!label) return null
  const map = { free:['#3ee87a','rgba(62,232,122,0.15)'], popular:['#f5a623','rgba(245,166,35,0.15)'], new:['#4a9eff','rgba(74,158,255,0.15)'] }
  const [color, bg] = map[label] || ['#8a94a6','rgba(138,148,166,0.15)']
  return <span style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', color, background:bg, padding:'2px 8px', borderRadius:'20px', letterSpacing:'0.5px' }}>{label}</span>
}

export default function CoursesPage() {
  const router = useRouter()
  const [width, setWidth]         = useState(1200)
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All')
  const [enrolled, setEnrolled]   = useState({})
  const [enrolling, setEnrolling] = useState({})
  const [userId, setUserId]       = useState(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { loadUserAndEnrollments() }, [])

  async function loadUserAndEnrollments() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)

    const { data } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', session.user.id)

    if (data) {
      const map = {}
      data.forEach(e => { map[e.course_id] = true })
      setEnrolled(map)
    }
  }

  async function handleEnroll(courseId) {
    if (!userId) { router.push('/auth'); return }
    if (enrolled[courseId] || enrolling[courseId]) return

    setEnrolling(prev => ({ ...prev, [courseId]: true }))
    try {
      const { error } = await supabase.from('enrollments').insert({
        student_id: userId,
        course_id: courseId,
        status: 'active',
        progress_pct: 0,
      })

      if (error) throw error

      // Award XP for enrolling
      await supabase.rpc('increment_xp', { user_id: userId, amount: 15 })

      // Mark as enrolled locally then navigate directly into the course
      setEnrolled(prev => ({ ...prev, [courseId]: true }))

      // Go to course detail page so student sees what they enrolled in
      router.push(`/courses/${courseId}`)
    } catch (err) {
      console.error('Enroll error:', err)
      alert('Enrollment failed: ' + err.message)
    } finally {
      setEnrolling(prev => ({ ...prev, [courseId]: false }))
    }
  }

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024
  const pad  = isMobile ? '16px' : isTablet ? '24px' : '32px'
  const cols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)'

  const filtered = COURSES.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    if (category !== 'All' && c.category !== category) return false
    return true
  })

  return (
    <DashboardShell role="student">
      <div style={{ minHeight:'100vh' }}>

        {/* Hero */}
        {!isMobile && (
          <div style={{ background:'#0f1b2d', padding: isTablet ? '28px 32px' : '36px 40px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(74,158,255,0.1),transparent 70%)', pointerEvents:'none' }} />
            <div style={{ position:'relative' }}>
              <span style={{ fontSize:'11px', fontWeight:700, letterSpacing:'1.5px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>Apps & Scripts Summer Bootcamp</span>
              <h1 style={{ fontSize: isTablet ? '26px' : '32px', fontWeight:800, color:'#fff', margin:'8px 0 6px', letterSpacing:'-0.5px' }}>Browse all courses</h1>
              <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', margin:'0 0 20px' }}>4 beginner-friendly courses · Taught by our expert tutor team · 100% free</p>
              <div style={{ display:'flex', gap:'16px' }}>
                {[{ val:'4', label:'Courses' },{ val:'4', label:'Expert Tutors' },{ val:'100%', label:'Free' }].map(s => (
                  <div key={s.label} style={{ background:'rgba(255,255,255,0.07)', padding:'10px 20px', borderRadius:'10px', textAlign:'center' }}>
                    <div style={{ fontSize:'20px', fontWeight:800, color:'#4a9eff' }}>{s.val}</div>
                    <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ padding:pad }}>
          {/* Search */}
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'20px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
              style={{ flex:1, minWidth:'160px', padding:'10px 14px', border:'1.5px solid #e2e6ed', borderRadius:'10px', fontSize:'14px', outline:'none', background:'#fff', color:'#1a1a2e', fontFamily:'Inter,sans-serif' }} />
          </div>

          {/* Category tabs */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)} style={{ padding:'7px 16px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'13px', fontWeight: category===cat ? 700 : 500, background: category===cat ? '#4a9eff' : '#fff', color: category===cat ? '#fff' : '#8a94a6', boxShadow: category===cat ? '0 2px 8px rgba(74,158,255,0.3)' : 'none', whiteSpace:'nowrap' }}>{cat}</button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <div style={{ fontSize:'48px', marginBottom:'12px' }}>🔍</div>
              <div style={{ fontSize:'18px', fontWeight:700, color:'#1a1a2e', marginBottom:'6px' }}>No courses found</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:cols, gap: isMobile ? '14px' : '18px' }}>
              {filtered.map(course => {
                const tutor       = getTutor(course.tutorKey)
                const lessonCount = getLessonCount(course)
                const isEnrolled  = enrolled[course.id]
                const isEnrolling = enrolling[course.id]

                return (
                  <div key={course.id} style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                    {/* Thumbnail — clicking goes to course detail */}
                    <Link href={`/courses/${course.id}`} style={{ textDecoration:'none' }}>
                      <div style={{ height:'130px', background:course.gradient, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer' }}>
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:'32px', marginBottom:'4px' }}>{course.icon}</div>
                          <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.85)', letterSpacing:'0.5px' }}>{course.category}</div>
                        </div>
                        {course.label && (
                          <div style={{ position:'absolute', top:'10px', left:'10px' }}><LabelBadge label={course.label} /></div>
                        )}
                      </div>
                    </Link>

                    <div style={{ padding:'16px', flex:1, display:'flex', flexDirection:'column' }}>
                      <Link href={`/courses/${course.id}`} style={{ textDecoration:'none' }}>
                        <div style={{ fontWeight:700, fontSize:'14px', color:'#1a1a2e', marginBottom:'4px', lineHeight:1.4, cursor:'pointer' }}>{course.title}</div>
                      </Link>
                      <div style={{ fontSize:'12px', color:'#8a94a6', marginBottom:'8px' }}>by {tutor?.name}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
                        <span style={{ fontSize:'13px', fontWeight:700, color:'#f5a623' }}>{course.rating}</span>
                        <Stars rating={course.rating} />
                      </div>
                      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'12px' }}>
                        <span style={{ fontSize:'11.5px', color:'#8a94a6', background:'#f5f5f5', padding:'3px 8px', borderRadius:'6px' }}>{course.level}</span>
                        <span style={{ fontSize:'11.5px', color:'#8a94a6', background:'#f5f5f5', padding:'3px 8px', borderRadius:'6px' }}>{lessonCount} lessons</span>
                      </div>

                      <div style={{ marginTop:'auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontWeight:800, fontSize:'16px', color:'#3ee87a' }}>Free</div>

                        {/* Only show Continue if enrolled, only show Enrol if not enrolled */}
                        {isEnrolled ? (
                          <Link href={`/student/course/${course.id}`} style={{ textDecoration:'none' }}>
                            <button style={{ padding:'7px 16px', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:700, background:'rgba(62,232,122,0.15)', color:'#3ee87a' }}>
                              ▶ Continue
                            </button>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            disabled={isEnrolling}
                            style={{ padding:'7px 16px', border:'none', borderRadius:'8px', cursor: isEnrolling ? 'not-allowed' : 'pointer', fontSize:'13px', fontWeight:700, background: isEnrolling ? '#e2e6ed' : 'linear-gradient(135deg,#4a9eff,#2563eb)', color: isEnrolling ? '#b0b8c8' : '#fff', boxShadow: isEnrolling ? 'none' : '0 2px 8px rgba(74,158,255,0.3)' }}
                          >
                            {isEnrolling ? 'Enrolling...' : 'Enrol Free'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}