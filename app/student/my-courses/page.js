'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'
import { COURSES, getTutor, getLessonCount } from '../../../lib/courses'

export default function MyCoursesPage() {
  const router = useRouter()
  const [width, setWidth]           = useState(1200)
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { loadEnrollments() }, [])

  async function loadEnrollments() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }

    const { data } = await supabase
      .from('enrollments')
      .select('*, course:courses(id, title, gradient, icon, category)')
      .eq('student_id', session.user.id)
      .order('enrolled_at', { ascending: false })

    setEnrollments(data || [])
    setLoading(false)
  }

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024
  const pad  = isMobile ? '16px' : isTablet ? '24px' : '32px'
  const cols = isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)'

  return (
    <DashboardShell role="student">
      <div style={{ paddingTop:pad, paddingLeft:pad, paddingRight:pad, paddingBottom:'40px' }}>

        {/* Header */}
        <div style={{ marginBottom:'28px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight:800, color:'#1a1a2e', margin:'0 0 4px', letterSpacing:'-0.5px' }}>My Courses</h1>
          <p style={{ fontSize:'14px', color:'#8a94a6', margin:0 }}>Courses you are enrolled in</p>
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>⏳</div>
            <div style={{ fontSize:'14px', color:'#8a94a6' }}>Loading your courses...</div>
          </div>
        ) : enrollments.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign:'center', padding:'60px 20px', background:'#fff', borderRadius:'16px', border:'1px solid rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize:'56px', marginBottom:'16px' }}>📚</div>
            <h2 style={{ fontSize:'20px', fontWeight:700, color:'#1a1a2e', margin:'0 0 8px' }}>No courses yet</h2>
            <p style={{ fontSize:'14px', color:'#8a94a6', marginBottom:'24px', maxWidth:360, margin:'0 auto 24px' }}>
              You have not enrolled in any courses yet. Browse our catalogue and start learning today.
            </p>
            <Link href="/courses" style={{ textDecoration:'none' }}>
              <button style={{ padding:'11px 28px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', boxShadow:'0 4px 14px rgba(74,158,255,0.3)' }}>
                Browse Courses
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:cols, gap: isMobile ? '14px' : '18px' }}>
            {enrollments.map(enr => {
              const course = COURSES.find(c => c.id === enr.course_id) || enr.course
              if (!course) return null
              const tutor       = getTutor(course.tutorKey)
              const lessonCount = getLessonCount(course)
              const pct         = enr.progress_pct || 0
              const isComplete  = enr.status === 'completed'
              const gradient    = course.gradient || enr.course?.gradient || 'linear-gradient(135deg,#4a9eff,#1e3a5f)'
              const icon        = course.icon || enr.course?.icon || '📚'
              const title       = course.title || enr.course?.title || 'Course'

              return (
                <div key={enr.id} style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                  {/* Thumbnail */}
                  <Link href={`/courses/${enr.course_id}`} style={{ textDecoration:'none' }}>
                    <div style={{ height:'130px', background:gradient, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer' }}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:'32px', marginBottom:'4px' }}>{icon}</div>
                        <div style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.85)', letterSpacing:'0.5px' }}>{course.category || enr.course?.category}</div>
                      </div>
                      {isComplete && (
                        <div style={{ position:'absolute', top:'10px', right:'10px', background:'rgba(62,232,122,0.9)', borderRadius:'20px', padding:'3px 10px', fontSize:'11px', fontWeight:700, color:'#fff' }}>✓ Completed</div>
                      )}
                    </div>
                  </Link>

                  <div style={{ padding:'16px', flex:1, display:'flex', flexDirection:'column' }}>
                    <Link href={`/courses/${enr.course_id}`} style={{ textDecoration:'none' }}>
                      <div style={{ fontWeight:700, fontSize:'14px', color:'#1a1a2e', marginBottom:'4px', lineHeight:1.4, cursor:'pointer' }}>{title}</div>
                    </Link>
                    {tutor && <div style={{ fontSize:'12px', color:'#8a94a6', marginBottom:'10px' }}>by {tutor.name}</div>}

                    {/* Progress bar */}
                    <div style={{ marginBottom:'6px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                        <span style={{ fontSize:'12px', color:'#8a94a6' }}>Progress</span>
                        <span style={{ fontSize:'12px', fontWeight:700, color: isComplete ? '#3ee87a' : '#4a9eff' }}>{pct}%</span>
                      </div>
                      <div style={{ height:6, background:'#eef1f6', borderRadius:3, overflow:'hidden' }}>
                        <div className="progress-bar-anim" style={{ height:'100%', width:`${pct}%`, background: isComplete ? '#3ee87a' : '#4a9eff', borderRadius:3 }} />
                      </div>
                    </div>

                    <div style={{ fontSize:'11.5px', color:'#8a94a6', marginBottom:'14px' }}>
                      {lessonCount} lessons · {course.level || 'Beginner'}
                    </div>

                    {/* Action buttons */}
                    <div style={{ marginTop:'auto', display:'flex', gap:'8px' }}>
                      <Link href={`/courses/${enr.course_id}`} style={{ textDecoration:'none', flex:1 }}>
                        <button style={{ width:'100%', padding:'8px', background:'none', border:'1.5px solid #e2e6ed', borderRadius:'8px', fontSize:'12.5px', fontWeight:600, color:'#1a1a2e', cursor:'pointer' }}>
                          View Details
                        </button>
                      </Link>
                      <Link href={`/student/course/${enr.course_id}`} style={{ textDecoration:'none', flex:1 }}>
                        <button style={{ width:'100%', padding:'8px', background: isComplete ? 'rgba(62,232,122,0.12)' : 'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'8px', fontSize:'12.5px', fontWeight:700, color: isComplete ? '#3ee87a' : '#fff', cursor:'pointer' }}>
                          {isComplete ? '✓ Review' : pct > 0 ? '▶ Continue' : '▶ Start'}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Browse more */}
        {enrollments.length > 0 && (
          <div style={{ textAlign:'center', marginTop:'32px' }}>
            <Link href="/courses" style={{ textDecoration:'none' }}>
              <button style={{ padding:'10px 24px', background:'#fff', border:'1.5px solid #e2e6ed', borderRadius:'10px', fontSize:'13.5px', fontWeight:600, color:'#1a1a2e', cursor:'pointer' }}>
                Browse more courses
              </button>
            </Link>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}