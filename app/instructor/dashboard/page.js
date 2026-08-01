'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'
import QuizScheduleManager from '../../../components/instructor/QuizScheduleManager'
import LessonVideoManager from '../../../components/instructor/LessonVideoManager'
import AIQuizGenerator from '../../../components/instructor/AIQuizGenerator'
import LiveClassManager from '../../../components/instructor/LiveClassManager'

const BARS = [
  { month:'Jan', val:0 }, { month:'Feb', val:0 }, { month:'Mar', val:0 },
  { month:'Apr', val:0 }, { month:'May', val:0 }, { month:'Jun', val:0 },
]

function Card({ children, style }) {
  return <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', ...style }}>{children}</div>
}

function SectionHeader({ title, subtitle, action, actionHref }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'16px' }}>
      <div>
        <div style={{ fontWeight:700, fontSize:'16px', color:'#1a1a2e' }}>{title}</div>
        {subtitle && <div style={{ fontSize:'12.5px', color:'#8a94a6', marginTop:'2px' }}>{subtitle}</div>}
      </div>
      {action && (
        <Link href={actionHref || '#'} style={{ textDecoration:'none' }}>
          <button style={{ padding:'6px 14px', background:'none', border:'1.5px solid #e2e6ed', borderRadius:'8px', fontSize:'12.5px', fontWeight:600, color:'#1a1a2e', cursor:'pointer' }}>{action}</button>
        </Link>
      )}
    </div>
  )
}

function StatCard({ label, value, pill, pillColor, dark }) {
  const pillBg   = { blue:'rgba(74,158,255,0.15)', green:'rgba(62,232,122,0.15)', amber:'rgba(245,166,35,0.15)', purple:'rgba(140,100,255,0.15)' }
  const pillText = { blue:'#4a9eff', green:'#3ee87a', amber:'#f5a623', purple:'#8c64ff' }
  return (
    <div style={{ background: dark ? '#1a2d45' : '#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', padding:'20px 22px' }}>
      <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color: dark ? 'rgba(255,255,255,0.4)' : '#8a94a6', marginBottom:'8px' }}>{label}</div>
      <div style={{ fontSize:'36px', fontWeight:900, color: dark ? '#fff' : '#1a1a2e', lineHeight:1, marginBottom:'10px' }}>{value}</div>
      <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background: pillBg[pillColor] || pillBg.blue, color: pillText[pillColor] || pillText.blue }}>{pill}</span>
    </div>
  )
}

export default function InstructorDashboard() {
  const router = useRouter()
  const [width, setWidth]         = useState(1200)
  const [profile, setProfile]     = useState(null)
  const [courses, setCourses]     = useState([])
  const [totalStudents, setTotalStudents] = useState(0)
  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [quizzes, setQuizzes]     = useState([])
  const [videoLessons, setVideoLessons] = useState([])
  const [userId, setUserId]       = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }

      const userId = session.user.id
      setUserId(userId)

      // Fetch instructor profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(prof)

      // Fetch this tutor's courses
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('tutor_id', userId)
      setCourses(courseData || [])

      // Count total students across all tutor's courses
      if (courseData && courseData.length > 0) {
        const courseIds = courseData.map(c => c.id)
        const { count } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .in('course_id', courseIds)
        setTotalStudents(count || 0)

        // Recent enrollments
        const { data: recentData } = await supabase
          .from('enrollments')
          .select('*, student:profiles(full_name, avatar_url), course:courses(title)')
          .in('course_id', courseIds)
          .order('enrolled_at', { ascending: false })
          .limit(5)
        setRecentEnrollments(recentData || [])

        // Fetch modules (with course title) belonging to this tutor's courses
        const { data: moduleData } = await supabase
          .from('modules')
          .select('id, title, course:courses(title)')
          .in('course_id', courseIds)
        const moduleIds = (moduleData || []).map(m => m.id)
        const moduleById = {}
        ;(moduleData || []).forEach(m => { moduleById[m.id] = m })

        if (moduleIds.length > 0) {
          const { data: lessonData } = await supabase
            .from('lessons')
            .select('id, title, type, video_url, module_id')
            .in('module_id', moduleIds)
          const lessonIds = (lessonData || []).map(l => l.id)

          // Lessons for the video manager — everything that isn't a quiz slot
          setVideoLessons(
            (lessonData || [])
              .filter(l => l.type !== 'quiz')
              .map(l => ({
                id: l.id,
                title: l.title,
                type: l.type,
                video_url: l.video_url,
                moduleTitle: moduleById[l.module_id]?.title || '',
                courseTitle: moduleById[l.module_id]?.course?.title || '',
              }))
          )

          if (lessonIds.length > 0) {
            const { data: quizData } = await supabase
              .from('quizzes')
              .select('*, lesson:lessons(title)')
              .in('lesson_id', lessonIds)

            setQuizzes(
              (quizData || []).map(q => ({
                ...q,
                title: q.title || q.lesson?.title || 'Untitled Quiz',
                courseTitle: courseData.find(c => c.id === q.course_id)?.title || '',
              }))
            )
          }
        }
      }
    } catch (err) {
      console.error('Instructor dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024
  const pad       = isMobile ? '16px' : isTablet ? '20px' : '32px'
  const twoCol    = isMobile || isTablet ? '1fr' : '1fr 360px'
  const statsGrid = isMobile ? '1fr 1fr' : 'repeat(4,1fr)'
  const gap       = isMobile ? '12px' : '16px'
  const cardPad   = isMobile ? '16px' : '22px'

  function handleQuizUpdated(quizId, updates) {
    setQuizzes(prev => prev.map(q => (q.id === quizId ? { ...q, ...updates } : q)))
  }

  function handleVideoUpdated(lessonId, videoUrl) {
    setVideoLessons(prev => prev.map(l => (l.id === lessonId ? { ...l, video_url: videoUrl } : l)))
  }

  const displayName   = profile?.full_name || 'Instructor'
  const publishedCount = courses.filter(c => c.is_published).length

  if (loading) {
    return (
      <DashboardShell role="instructor">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>⏳</div>
            <div style={{ fontSize:'14px', color:'#8a94a6' }}>Loading your dashboard...</div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="instructor">
      <div style={{ paddingTop:pad, paddingLeft:pad, paddingRight:pad, paddingBottom:'40px' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap:'12px', marginBottom: isMobile ? '16px' : '24px' }}>
          <div>
            <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'1.5px', color:'#8a94a6', textTransform:'uppercase', marginBottom:'4px' }}>INSTRUCTOR PORTAL</div>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight:800, color:'#1a1a2e', margin:'0 0 4px', letterSpacing:'-0.5px' }}>
              Hello, <span style={{ fontWeight:900 }}>{displayName}</span> 👋
            </h1>
            <div style={{ fontSize:'13px', color:'#8a94a6' }}>Apps & Scripts Summer Bootcamp · {courses.length} course{courses.length !== 1 ? 's' : ''}</div>
          </div>
          {!isMobile && (
            <div style={{ display:'flex', gap:'10px', flexShrink:0 }}>
              <Link href="/instructor/settings" style={{ textDecoration:'none' }}>
                <button style={{ padding:'9px 18px', background:'#fff', border:'1.5px solid #e2e6ed', borderRadius:'10px', fontSize:'13px', fontWeight:600, color:'#1a1a2e', cursor:'pointer' }}>Settings</button>
              </Link>
              <Link href="/instructor/create-course" style={{ textDecoration:'none' }}>
                <button style={{ padding:'9px 18px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 14px rgba(74,158,255,0.35)' }}>+ Create course</button>
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:statsGrid, gap, marginBottom:gap }}>
          <StatCard label="Total Students"    value={totalStudents.toLocaleString()} pill={totalStudents > 0 ? 'Enrolled' : 'None yet'}   pillColor="blue"   dark />
          <StatCard label="Your Courses"      value={courses.length}                  pill={`${publishedCount} published`}                   pillColor="green"  />
          <StatCard label="Gross Revenue"     value="₦0"                             pill="Courses are free"                                pillColor="amber"  />
          <StatCard label="Your Share (40%)"  value="₦0"                             pill="Paystack in Phase D"                             pillColor="purple" />
        </div>

        {/* Body */}
        <div style={{ display:'grid', gridTemplateColumns:twoCol, gap }}>

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap }}>

            {/* Enrollment chart placeholder */}
            <Card style={{ padding:cardPad }}>
              <SectionHeader title="Monthly enrollments" subtitle="Students joined per month" />
              <div style={{ display:'flex', alignItems:'flex-end', gap: isMobile ? '8px' : '16px', height:'110px' }}>
                {BARS.map((b, i) => (
                  <div key={b.month} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', height:'100%', justifyContent:'flex-end' }}>
                    <div style={{ width:'100%', maxWidth:36, height:'12px', background:'rgba(74,158,255,0.15)', borderRadius:'5px 5px 0 0' }} />
                    <div style={{ fontSize:'10.5px', color:'#8a94a6' }}>{b.month}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign:'center', marginTop:'10px', fontSize:'12.5px', color:'#b0b8c8' }}>Real enrollment data will appear here as students join</div>
            </Card>

            {/* My Courses */}
            <Card style={{ padding:cardPad }}>
              <SectionHeader title="My courses" subtitle="Your published and draft courses" action="Create new" actionHref="/instructor/create-course" />
              {courses.length === 0 ? (
                <div style={{ textAlign:'center', padding:'28px 0' }}>
                  <div style={{ fontSize:'36px', marginBottom:'10px' }}>📚</div>
                  <div style={{ fontWeight:600, fontSize:'14px', color:'#1a1a2e', marginBottom:'6px' }}>No courses yet</div>
                  <div style={{ fontSize:'13px', color:'#8a94a6', marginBottom:'16px' }}>Create your first course to get started</div>
                  <Link href="/instructor/create-course" style={{ textDecoration:'none' }}>
                    <button style={{ padding:'9px 20px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>+ Create Course</button>
                  </Link>
                </div>
              ) : (
                courses.map((c, i) => (
                  <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'12px', paddingBottom: i < courses.length-1 ? '14px' : '0', marginBottom: i < courses.length-1 ? '14px' : '0', borderBottom: i < courses.length-1 ? '1px solid #f5f5f5' : 'none' }}>
                    <div style={{ width:38, height:38, borderRadius:'10px', flexShrink:0, background: c.gradient || 'linear-gradient(135deg,#4a9eff,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>
                      {c.icon || '📚'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:'13.5px', color:'#1a1a2e', marginBottom:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.title}</div>
                      <div style={{ fontSize:'11.5px', color:'#8a94a6' }}>{c.category} · {c.level}</div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'20px', background: c.is_published ? 'rgba(62,232,122,0.12)' : 'rgba(245,166,35,0.12)', color: c.is_published ? '#3ee87a' : '#f5a623' }}>
                        {c.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </Card>

            {/* Revenue split info */}
            <Card style={{ padding:cardPad }}>
              <SectionHeader title="Revenue split" subtitle="Per registration when pricing is enabled" />
              {[
                { label:'Your earnings (Tutor)',      pct:'40%', color:'#4a9eff' },
                { label:'Apps & Scripts (Platform)',  pct:'50%', color:'#8c64ff' },
                { label:'LMS Developer',              pct:'10%', color:'#3ee87a' },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #f5f5f5' }}>
                  <span style={{ fontSize:'13.5px', color:'#444' }}>{item.label}</span>
                  <span style={{ fontSize:'15px', fontWeight:700, color:item.color }}>{item.pct}</span>
                </div>
              ))}
              <div style={{ marginTop:'12px', padding:'10px 14px', background:'rgba(74,158,255,0.06)', borderRadius:'10px', fontSize:'12.5px', color:'#8a94a6', lineHeight:1.5 }}>
                Paystack payment integration will be enabled in Phase D. All courses are currently free.
              </div>
            </Card>

            {/* Quiz Scheduling — Phase D, Feature 1 */}
            <Card style={{ padding:cardPad }}>
              <QuizScheduleManager quizzes={quizzes} onUpdated={handleQuizUpdated} />
            </Card>

            {/* Lesson Videos — Phase D, Feature 2 */}
            <Card style={{ padding:cardPad }}>
              <LessonVideoManager lessons={videoLessons} onUpdated={handleVideoUpdated} />
            </Card>

            {/* AI Quiz Generator — Phase D, Feature 3 */}
            <Card style={{ padding:cardPad }}>
              <AIQuizGenerator quizzes={quizzes} />
            </Card>

            {/* Live Classes */}
            {courses.length > 0 && (
              <Card style={{ padding:cardPad }}>
                <LiveClassManager courseId={courses[0].id} courseTitle={courses[0].title} userId={userId} />
              </Card>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ display:'flex', flexDirection:'column', gap }}>

            {/* Recent enrollments */}
            <Card style={{ padding:cardPad }}>
              <SectionHeader title="Recent enrollments" subtitle="Students who joined your course" />
              {recentEnrollments.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px 0' }}>
                  <div style={{ fontSize:'32px', marginBottom:'8px' }}>👥</div>
                  <div style={{ fontSize:'13px', color:'#8a94a6' }}>No enrollments yet. Share your course link to get students!</div>
                </div>
              ) : (
                recentEnrollments.map((enr, i) => (
                  <div key={enr.id} style={{ display:'flex', alignItems:'center', gap:'12px', paddingBottom: i < recentEnrollments.length-1 ? '12px' : '0', marginBottom: i < recentEnrollments.length-1 ? '12px' : '0', borderBottom: i < recentEnrollments.length-1 ? '1px solid #f5f5f5' : 'none' }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, background:'#1e3a5f', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#4a9eff' }}>
                      {enr.student?.full_name?.charAt(0) || '?'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:'13px', color:'#1a1a2e', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{enr.student?.full_name}</div>
                      <div style={{ fontSize:'11.5px', color:'#8a94a6' }}>{enr.course?.title}</div>
                    </div>
                    <div style={{ fontSize:'11px', color:'#b0b8c8', flexShrink:0 }}>
                      {new Date(enr.enrolled_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
                    </div>
                  </div>
                ))
              )}
            </Card>

            {/* Quick actions */}
            <Card style={{ padding:cardPad }}>
              <SectionHeader title="Quick actions" />
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  { label:'Create a new course',     href:'/instructor/create-course', icon:'➕', color:'#4a9eff', bg:'rgba(74,158,255,0.08)' },
                  { label:'View course listing',     href:'/courses',                  icon:'📚', color:'#3ee87a', bg:'rgba(62,232,122,0.08)' },
                  { label:'Payout settings',         href:'/instructor/settings',      icon:'💰', color:'#f5a623', bg:'rgba(245,166,35,0.08)' },
                  { label:'Update your profile',     href:'/instructor/settings',      icon:'👤', color:'#8c64ff', bg:'rgba(140,100,255,0.08)' },
                ].map(a => (
                  <Link key={a.label} href={a.href} style={{ textDecoration:'none' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', background:a.bg, borderRadius:'10px', cursor:'pointer' }}>
                      <span style={{ fontSize:'18px' }}>{a.icon}</span>
                      <span style={{ fontSize:'13.5px', fontWeight:600, color:a.color }}>{a.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {isMobile && (
              <div style={{ display:'flex', gap:'10px' }}>
                <Link href="/instructor/settings" style={{ textDecoration:'none', flex:1 }}>
                  <button style={{ width:'100%', padding:'11px', background:'#fff', border:'1.5px solid #e2e6ed', borderRadius:'10px', fontSize:'13px', fontWeight:600, color:'#1a1a2e', cursor:'pointer' }}>Settings</button>
                </Link>
                <Link href="/instructor/create-course" style={{ textDecoration:'none', flex:1 }}>
                  <button style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, color:'#fff', cursor:'pointer' }}>+ Create</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}