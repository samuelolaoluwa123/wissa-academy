'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'
import { COURSES, getTutor, getModuleCount, getLessonCount } from '../../../lib/courses'

/* ── defined outside main component ── */
function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display:'inline-flex', gap:'2px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i<=Math.round(rating)?'#f5a623':'#e2e6ed', fontSize:size }}>★</span>
      ))}
    </span>
  )
}

function FeatureRow({ icon, text }) {
  return (
    <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'10px' }}>
      <span style={{ fontSize:'15px' }}>{icon}</span>
      <span style={{ fontSize:'13px', color:'#444' }}>{text}</span>
    </div>
  )
}

function EnrolCard({ course, hasCertificate, enrolled, enrolling, onEnrol, wishlist, onWishlist }) {
  return (
    <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid rgba(0,0,0,0.08)', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.08)' }}>
      <div style={{ height:'160px', background:course.gradient, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'40px', marginBottom:'6px' }}>{course.icon}</div>
          <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', fontWeight:600 }}>{course.title}</div>
        </div>
      </div>
      <div style={{ padding:'20px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:'10px', marginBottom:'16px' }}>
          <span style={{ fontSize:'26px', fontWeight:800, color:'#3ee87a' }}>Free</span>
          {!hasCertificate && (
            <span style={{ fontSize:'11px', fontWeight:700, color:'#8a94a6', background:'#f5f5f5', padding:'3px 9px', borderRadius:'20px' }}>No certificate</span>
          )}
        </div>

        {enrolled ? (
          <Link href={`/student/course/${course.id}`} style={{ textDecoration:'none' }}>
            <button style={{ width:'100%', padding:'13px', background:'#3ee87a', border:'none', borderRadius:'10px', color:'#0f1b2d', fontWeight:700, fontSize:'15px', cursor:'pointer', marginBottom:'10px' }}>
              ▶ Continue Learning
            </button>
          </Link>
        ) : (
          <button onClick={onEnrol} disabled={enrolling} style={{ width:'100%', padding:'13px', background: enrolling?'#b0b8c8':'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'15px', cursor: enrolling?'not-allowed':'pointer', marginBottom:'10px', boxShadow: enrolling?'none':'0 4px 16px rgba(74,158,255,0.35)' }}>
            {enrolling ? 'Enrolling...' : 'Enrol for Free'}
          </button>
        )}

        <button onClick={onWishlist} style={{ width:'100%', padding:'10px', background:'none', border:`1.5px solid ${wishlist?'#8c64ff':'#e2e6ed'}`, borderRadius:'10px', color: wishlist?'#8c64ff':'#8a94a6', fontSize:'13.5px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
          {wishlist ? '♥ Saved' : '♡ Add to Wishlist'}
        </button>

        <p style={{ fontSize:'11.5px', color:'#b0b8c8', textAlign:'center', margin:'12px 0 0', lineHeight:1.5 }}>
          {hasCertificate ? 'Certificate available on completion' : 'No certificate for this course'}
        </p>
      </div>
    </div>
  )
}

export default function CourseDetailPage() {
  const params   = useParams()
  const router   = useRouter()
  const courseId = params?.id || '1'

  const course = COURSES.find(c => c.id === courseId) || COURSES[0]
  const tutor  = getTutor(course.tutorKey)

  const [width, setWidth]       = useState(1200)
  const [activeTab, setActiveTab] = useState('overview')
  const [enrolled, setEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [wishlist, setWishlist] = useState(false)
  const [openGroups, setOpenGroups]   = useState({ 0:true })
  const [userId, setUserId]     = useState(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { checkEnrollment() }, [courseId])

  async function checkEnrollment() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setUserId(session.user.id)

    const { data } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', session.user.id)
      .eq('course_id', courseId)
      .single()
    setEnrolled(!!data)
  }

  async function handleEnrol() {
    if (!userId) { router.push('/auth'); return }
    if (enrolled || enrolling) return
    setEnrolling(true)
    try {
      const { error } = await supabase.from('enrollments').insert({
        student_id: userId,
        course_id: courseId,
        status: 'active',
        progress_pct: 0,
      })
      if (error) throw error
      await supabase.rpc('increment_xp', { user_id: userId, amount: 15 })
      setEnrolled(true)
      // Navigate directly into the course after enrolling
      router.push(`/student/course/${courseId}`)
    } catch (err) {
      console.error('Enrol error:', err)
      alert('Enrollment failed: ' + err.message)
    } finally {
      setEnrolling(false)
    }
  }

  const isMobile      = width <= 768
  const isTablet      = width > 768 && width <= 1024
  const isNarrow      = isMobile || isTablet
  const moduleCount   = getModuleCount(course)
  const lessonCount   = getLessonCount(course)
  const hasCertificate = course.features.certificateAvailable !== false
  const TABS = ['overview', 'curriculum', 'instructor']

  return (
    <DashboardShell role="student">
      <div style={{ minHeight:'100vh' }}>

        {/* Hero */}
        <div style={{ background:'#0f1b2d', padding: isMobile?'20px 16px 24px':'36px 40px 32px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:300, height:300, borderRadius:'50%', background:course.gradient, opacity:0.08, pointerEvents:'none' }} />

          <Link href="/courses" style={{ display:'inline-flex', alignItems:'center', gap:'6px', color:'rgba(255,255,255,0.55)', fontSize:'13px', textDecoration:'none', marginBottom:'16px' }}>← Back to Courses</Link>

          <div style={{ display:'grid', gridTemplateColumns: isNarrow?'1fr':'1fr 340px', gap: isMobile?'20px':'40px', alignItems:'start' }}>
            <div>
              <div style={{ display:'flex', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
                <span style={{ background:'rgba(74,158,255,0.2)', color:'#4a9eff', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', textTransform:'uppercase' }}>{course.category}</span>
                <span style={{ background:'rgba(62,232,122,0.15)', color:'#3ee87a', fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px' }}>FREE</span>
              </div>

              <h1 style={{ color:'#fff', fontWeight:800, fontSize: isMobile?'22px':'30px', lineHeight:1.25, margin:'0 0 12px', letterSpacing:'-0.5px' }}>{course.title}</h1>
              <p style={{ color:'rgba(255,255,255,0.65)', fontSize: isMobile?'14px':'15px', lineHeight:1.6, margin:'0 0 16px', maxWidth:580 }}>{course.description.slice(0,150)}…</p>

              <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'14px' }}>
                <span style={{ color:'#f5a623', fontWeight:700, fontSize:'15px' }}>{course.rating}</span>
                <Stars rating={course.rating} size={14} />
                <span style={{ color:'rgba(255,255,255,0.3)' }}>·</span>
                <span style={{ color:'rgba(255,255,255,0.55)', fontSize:'13px' }}>{course.level}</span>
              </div>

              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'14px' }}>
                {[
                  { icon:'📊', text:course.level },
                  { icon:'📚', text:`${moduleCount} modules` },
                  { icon:'🎬', text:`${lessonCount} lessons` },
                  { icon:'🌐', text:'English' },
                ].map(b => (
                  <span key={b.text} style={{ background:'rgba(255,255,255,0.09)', color:'rgba(255,255,255,0.7)', fontSize:'12px', padding:'4px 10px', borderRadius:'20px', display:'flex', alignItems:'center', gap:'5px' }}>
                    <span>{b.icon}</span>{b.text}
                  </span>
                ))}
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#4a9eff,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#fff', flexShrink:0 }}>{tutor?.initials}</div>
                <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px' }}>
                  Created by <span style={{ color:'#4a9eff', fontWeight:600 }}>{tutor?.name}</span>
                </span>
              </div>
            </div>

            {!isNarrow && (
              <EnrolCard course={course} hasCertificate={hasCertificate} enrolled={enrolled} enrolling={enrolling} onEnrol={handleEnrol} wishlist={wishlist} onWishlist={() => setWishlist(w=>!w)} />
            )}
          </div>
        </div>

        {isNarrow && (
          <div style={{ padding: isMobile?'16px':'20px 32px' }}>
            <EnrolCard course={course} hasCertificate={hasCertificate} enrolled={enrolled} enrolling={enrolling} onEnrol={handleEnrol} wishlist={wishlist} onWishlist={() => setWishlist(w=>!w)} />
          </div>
        )}

        {/* Content */}
        <div style={{ display:'grid', gridTemplateColumns: isNarrow?'1fr':'1fr 340px', alignItems:'start' }}>
          <div style={{ padding: isMobile?'0 16px 40px':'32px 40px 60px' }}>

            {/* Tabs */}
            <div style={{ display:'flex', borderBottom:'2px solid #e2e6ed', marginBottom:'28px', overflowX:'auto' }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ background:'none', border:'none', cursor:'pointer', padding:'12px 20px', fontSize:'14px', fontWeight: activeTab===tab?700:500, color: activeTab===tab?'#4a9eff':'#8a94a6', borderBottom: activeTab===tab?'2px solid #4a9eff':'2px solid transparent', marginBottom:'-2px', textTransform:'capitalize', whiteSpace:'nowrap' }}>{tab}</button>
              ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="anim-fade-in">
                <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'14px', padding:'24px', marginBottom:'24px' }}>
                  <h2 style={{ fontSize:'18px', fontWeight:700, color:'#1a1a2e', margin:'0 0 16px' }}>What you'll learn</h2>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:'10px' }}>
                    {course.outcomes.map((o,i) => (
                      <div key={i} style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                        <span style={{ color:'#3ee87a', fontSize:'14px', flexShrink:0, marginTop:'1px' }}>✓</span>
                        <span style={{ fontSize:'13.5px', color:'#1a1a2e', lineHeight:1.5 }}>{o}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom:'24px' }}>
                  <h2 style={{ fontSize:'18px', fontWeight:700, color:'#1a1a2e', margin:'0 0 12px' }}>About this course</h2>
                  <p style={{ fontSize:'14px', color:'#444', lineHeight:1.7, margin:0 }}>{course.description}</p>
                </div>

                <div>
                  <h2 style={{ fontSize:'18px', fontWeight:700, color:'#1a1a2e', margin:'0 0 12px' }}>Course format</h2>
                  <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr 1fr':'repeat(4,1fr)', gap:'10px' }}>
                    {[
                      { label:'Live Classes', val: course.features.liveClassesCompulsory?'Compulsory':course.features.liveClasses?'Included':'Not included', on:course.features.liveClasses },
                      { label:'Assignments',  val: course.features.assignments?'Included':'Not included', on:course.features.assignments },
                      { label:'Quizzes',      val: course.features.quizzes?'Included':'Not included',     on:course.features.quizzes },
                      { label:course.features.projectType||'Project', val: course.features.projects?'Included':'Not included', on:course.features.projects },
                    ].map(f => (
                      <div key={f.label} style={{ background: f.on?'rgba(74,158,255,0.06)':'#f7f7f9', border:`1px solid ${f.on?'rgba(74,158,255,0.2)':'rgba(0,0,0,0.06)'}`, borderRadius:'10px', padding:'12px' }}>
                        <div style={{ fontSize:'12px', fontWeight:700, color: f.on?'#4a9eff':'#8a94a6', marginBottom:'4px' }}>{f.label}</div>
                        <div style={{ fontSize:'12.5px', color:'#1a1a2e' }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CURRICULUM */}
            {activeTab === 'curriculum' && (
              <div className="anim-fade-in">
                <div style={{ fontSize:'13.5px', color:'#8a94a6', marginBottom:'16px' }}>{moduleCount} modules · {lessonCount} lessons</div>

                {course.curriculumType === 'grouped' ? (
                  course.groups.map((group, gi) => (
                    <div key={gi} style={{ marginBottom:'16px' }}>
                      <button onClick={() => setOpenGroups(prev=>({...prev,[gi]:!prev[gi]}))} style={{ width:'100%', background:'#0f1b2d', border:'none', padding:'14px 18px', borderRadius:'10px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', textAlign:'left', marginBottom: openGroups[gi]?'8px':'0' }}>
                        <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', transform: openGroups[gi]?'rotate(90deg)':'rotate(0)', transition:'transform 0.2s', display:'inline-block' }}>▶</span>
                        <span style={{ flex:1, color:'#fff', fontWeight:700, fontSize:'14px' }}>{group.groupTitle}</span>
                        <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px' }}>{group.modules.length} modules</span>
                      </button>
                      {openGroups[gi] && group.modules.map((mod, mi) => (
                        <div key={mi} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 18px', background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'10px', marginBottom:'6px' }}>
                          <span style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, background:'rgba(74,158,255,0.1)', color:'#4a9eff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700 }}>{mi+1}</span>
                          <span style={{ flex:1, fontSize:'13.5px', color:'#1a1a2e' }}>{mod.title}</span>
                          <span style={{ fontSize:'12px', color:'#8a94a6', whiteSpace:'nowrap' }}>{mod.lessonsCount} lessons</span>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  course.modules.map((mod, mi) => (
                    <div key={mi} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'10px', marginBottom:'8px' }}>
                      <span style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, background:'rgba(74,158,255,0.1)', color:'#4a9eff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700 }}>{mi+1}</span>
                      <span style={{ flex:1, fontSize:'14px', color:'#1a1a2e', fontWeight:500 }}>{mod.title}</span>
                      <span style={{ fontSize:'12px', color:'#8a94a6', whiteSpace:'nowrap' }}>{mod.lessonsCount} lessons</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* INSTRUCTOR */}
            {activeTab === 'instructor' && (
              <div className="anim-fade-in">
                <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'14px', padding:'28px' }}>
                  <div style={{ display:'flex', gap:'16px', alignItems:'flex-start', marginBottom:'20px' }}>
                    <div style={{ width:64, height:64, borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,#4a9eff,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:700, color:'#fff' }}>{tutor?.initials}</div>
                    <div>
                      <h3 style={{ margin:'0 0 4px', fontSize:'18px', fontWeight:700, color:'#1a1a2e' }}>{tutor?.name}</h3>
                      <p style={{ margin:'0', fontSize:'13px', color:'#4a9eff', fontWeight:600 }}>{tutor?.role}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:'14px', color:'#444', lineHeight:1.75, margin:0 }}>{tutor?.bio}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right sticky — desktop only */}
          {!isNarrow && (
            <div style={{ padding:'32px 40px 32px 0', position:'sticky', top:'80px', alignSelf:'start' }}>
              <EnrolCard course={course} hasCertificate={hasCertificate} enrolled={enrolled} enrolling={enrolling} onEnrol={handleEnrol} wishlist={wishlist} onWishlist={() => setWishlist(w=>!w)} />

              <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'14px', padding:'20px', marginTop:'16px' }}>
                <h3 style={{ margin:'0 0 14px', fontSize:'14px', fontWeight:700, color:'#1a1a2e' }}>This course includes</h3>
                {[
                  course.features.liveClasses && { icon:'🎥', text: course.features.liveClassesCompulsory?'Live classes (compulsory)':'Live classes included' },
                  { icon:'🎬', text:`${lessonCount} on-demand lessons` },
                  course.features.assignments && { icon:'📝', text:'Assignments' },
                  course.features.quizzes     && { icon:'✏️', text:'Quizzes & tests' },
                  course.features.projects    && { icon:'🛠', text:course.features.projectType||'Project' },
                  hasCertificate && { icon:'🏆', text: course.features.certificateAvailable==='conditional'?'Certificate (if provided by Institute)':'Certificate of completion' },
                ].filter(Boolean).map((item,i) => <FeatureRow key={i} icon={item.icon} text={item.text} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}