'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'

/* ── Static fallback data shown while real data loads ── */
const BARS = [
  { day:'Mon', h:2.5 }, { day:'Tue', h:4 }, { day:'Wed', h:1.5 },
  { day:'Thu', h:3.5 }, { day:'Fri', h:5 }, { day:'Sat', h:2 }, { day:'Sun', h:0.5 },
]

/* ── Small reusable components defined OUTSIDE main component ── */
function Card({ children, style, className = '' }) {
  return (
    <div className={`hover-lift ${className}`} style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', ...style }}>
      {children}
    </div>
  )
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
          <button className="press-btn" style={{ padding:'6px 14px', background:'none', border:'1.5px solid #e2e6ed', borderRadius:'8px', fontSize:'12.5px', fontWeight:600, color:'#1a1a2e', cursor:'pointer' }}>
            {action}
          </button>
        </Link>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, pill, pillColor, dark, className = '' }) {
  const pillBg   = { blue:'rgba(74,158,255,0.15)', green:'rgba(62,232,122,0.15)', amber:'rgba(245,166,35,0.15)', purple:'rgba(140,100,255,0.15)' }
  const pillText = { blue:'#4a9eff', green:'#3ee87a', amber:'#f5a623', purple:'#8c64ff' }
  const iconBg   = { blue:'rgba(74,158,255,0.12)', green:'rgba(62,232,122,0.12)', amber:'rgba(245,166,35,0.12)', purple:'rgba(140,100,255,0.12)' }
  return (
    <div className={`hover-lift ${className}`} style={{ background: dark ? '#1a2d45' : '#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', padding:'20px 22px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color: dark ? 'rgba(255,255,255,0.4)' : '#8a94a6' }}>{label}</div>
        {icon && (
          <div style={{ width:30, height:30, borderRadius:'9px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', background: dark ? 'rgba(255,255,255,0.08)' : (iconBg[pillColor] || iconBg.blue) }}>{icon}</div>
        )}
      </div>
      <div style={{ fontSize:'36px', fontWeight:900, color: dark ? '#fff' : '#1a1a2e', lineHeight:1, marginBottom:'10px' }}>{value}</div>
      <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700, background: pillBg[pillColor] || pillBg.blue, color: pillText[pillColor] || pillText.blue }}>{pill}</span>
    </div>
  )
}

/* ── Main page ── */
export default function StudentDashboard() {
  const router = useRouter()
  const [width, setWidth]           = useState(1200)
  const [profile, setProfile]       = useState(null)
  const [authUser, setAuthUser]     = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [badges, setBadges]         = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }

      const userId = session.user.id
      setAuthUser(session.user)

      // Update streak on login
      await supabase.rpc('update_streak', { user_id: userId })

      // Fetch profile — create one if it doesn't exist yet
      let { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!prof) {
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: session.user.user_metadata?.full_name || 'Student',
            email: session.user.email,
            role: session.user.user_metadata?.role || 'student',
            status: 'active',
          })
          .select()
          .single()
        prof = newProf
      }
      setProfile(prof)

      // Fetch enrollments with course info
      const { data: enrData } = await supabase
        .from('enrollments')
        .select('*, course:courses(id, title, gradient, icon, category)')
        .eq('student_id', userId)
        .order('enrolled_at', { ascending: false })
      setEnrollments(enrData || [])

      // Fetch badges
      const { data: badgeData } = await supabase
        .from('student_badges')
        .select('*, badge:badges(name, icon, description)')
        .eq('student_id', userId)
        .order('earned_at', { ascending: false })
        .limit(6)
      setBadges(badgeData || [])

    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024
  const pad        = isMobile ? '16px' : isTablet ? '20px' : '32px'
  const statsGrid  = isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr' : 'repeat(4,1fr)'
  const twoCol     = isMobile || isTablet ? '1fr' : '1fr 360px'
  const gap        = isMobile ? '12px' : '16px'
  const cardPad    = isMobile ? '16px' : '22px'

  const displayName = profile?.full_name || authUser?.user_metadata?.full_name || 'Student'
  const xp          = profile?.xp_points || 0
  const streak      = profile?.streak_days || 0
  const certCount   = enrollments.filter(e => e.status === 'completed').length
  const hoursLearned = Math.round(enrollments.reduce((a, e) => a + (e.progress_pct / 100) * 5, 0))

  if (loading) {
    return (
      <DashboardShell role="student">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh' }}>
          <div style={{ textAlign:'center' }}>
            <div className="anim-pulse" style={{ fontSize:'32px', marginBottom:'12px' }}>⏳</div>
            <div style={{ fontSize:'14px', color:'#8a94a6' }}>Loading your dashboard...</div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="student">
      <div style={{ paddingTop:pad, paddingLeft:pad, paddingRight:pad, paddingBottom:'40px' }}>

        {/* Header */}
        <div className="anim-slide-up" style={{
          position:'relative', overflow:'hidden',
          background:'linear-gradient(135deg,#0f1b2d 0%,#16273e 55%,#1a2d45 100%)',
          borderRadius:'18px', padding: isMobile ? '22px 20px' : '30px 32px',
          marginBottom: isMobile ? '16px' : '22px',
          display:'flex', justifyContent:'space-between', alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row', gap:'16px',
        }}>
          <div className="anim-pulse" style={{ position:'absolute', top:-90, right:-60, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle,rgba(74,158,255,0.22),transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative' }}>
            <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'1.5px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:'6px' }}>Student Portal</div>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight:800, color:'#fff', margin:'0 0 6px', letterSpacing:'-0.5px' }}>
              Hello, <span style={{ fontWeight:900 }}>{displayName}</span> 👋
            </h1>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
              <span>Apps & Scripts Summer Bootcamp</span>
              {streak > 0 && (
                <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:'rgba(245,166,35,0.18)', color:'#f5a623', fontWeight:700, fontSize:'12px', padding:'2px 10px', borderRadius:'20px' }}>
                  🔥 {streak}-day streak
                </span>
              )}
            </div>
          </div>
          {!isMobile && (
            <div style={{ position:'relative', display:'flex', gap:'10px', flexShrink:0 }}>
              <Link href="/courses" style={{ textDecoration:'none' }}>
                <button className="press-btn" style={{ padding:'9px 18px', background:'rgba(255,255,255,0.08)', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:'10px', fontSize:'13px', fontWeight:600, color:'#fff', cursor:'pointer' }}>Browse courses</button>
              </Link>
              <Link href={enrollments[0] ? `/student/course/${enrollments[0].course?.id}` : '/courses'} style={{ textDecoration:'none' }}>
                <button className="press-btn" style={{ padding:'9px 18px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 14px rgba(74,158,255,0.35)' }}>Continue learning</button>
              </Link>
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:statsGrid, gap, marginBottom:gap }}>
          <StatCard icon="🎯" className="anim-scale-in d1" label="Learning Score (XP)" value={xp.toLocaleString()} pill={xp >= 1000 ? 'Level 2' : `Next: 1000`} pillColor="green" dark />
          <StatCard icon="📚" className="anim-scale-in d2" label="Courses Enrolled"  value={enrollments.length} pill={enrollments.filter(e=>e.status==='active').length > 0 ? `${enrollments.filter(e=>e.status==='active').length} in progress` : 'None yet'} pillColor="blue" />
          <StatCard icon="⏱️" className="anim-scale-in d3" label="Hours Learned"     value={`${hoursLearned}h`} pill={streak > 0 ? `🔥 ${streak} day streak` : 'Start learning'} pillColor="amber" />
          <StatCard icon="🏆" className="anim-scale-in d4" label="Certificates"      value={certCount} pill={certCount > 0 ? 'Earned' : 'Complete a course'} pillColor="purple" />
        </div>

        {/* Body */}
        <div style={{ display:'grid', gridTemplateColumns:twoCol, gap, alignItems:'start' }}>

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap }}>

            {/* My Courses */}
            <Card className="anim-slide-up d1" style={{ padding:cardPad }}>
              <SectionHeader title="My courses" subtitle="Your enrolled courses" action="Browse all" actionHref="/courses" />
              {enrollments.length === 0 ? (
                <div style={{ textAlign:'center', padding:'28px 0' }}>
                  <div style={{ fontSize:'36px', marginBottom:'10px' }}>📚</div>
                  <div style={{ fontWeight:600, fontSize:'14px', color:'#1a1a2e', marginBottom:'6px' }}>No courses yet</div>
                  <div style={{ fontSize:'13px', color:'#8a94a6', marginBottom:'16px' }}>Enrol in a course to start learning</div>
                  <Link href="/courses" style={{ textDecoration:'none' }}>
                    <button style={{ padding:'9px 20px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>Browse Courses</button>
                  </Link>
                </div>
              ) : (
                enrollments.map((enr, i) => (
                  <div key={enr.id} className="row-hover" style={{ display:'flex', alignItems:'center', gap:'12px', paddingBottom: i < enrollments.length-1 ? '14px' : '0', marginBottom: i < enrollments.length-1 ? '14px' : '0', borderBottom: i < enrollments.length-1 ? '1px solid #f5f5f5' : 'none' }}>
                    <div style={{ width:38, height:38, borderRadius:'10px', flexShrink:0, background: enr.course?.gradient || 'linear-gradient(135deg,#4a9eff,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>
                      {enr.course?.icon || '📚'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:'13.5px', color:'#1a1a2e', marginBottom:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{enr.course?.title}</div>
                      <div style={{ fontSize:'11.5px', color:'#8a94a6', marginBottom:'6px' }}>{enr.course?.category}</div>
                      <div style={{ height:4, background:'#eef1f6', borderRadius:3, overflow:'hidden' }}>
                        <div className="progress-bar-anim" style={{ height:'100%', width:`${enr.progress_pct}%`, background:'#4a9eff', borderRadius:3 }} />
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:'13px', fontWeight:700, color:'#4a9eff', marginBottom:'6px' }}>{enr.progress_pct}%</div>
                      <Link href={`/student/course/${enr.course?.id}`} style={{ textDecoration:'none' }}>
                        <button className="press-btn" style={{ padding:'4px 12px', background: enr.status==='completed' ? 'rgba(62,232,122,0.1)' : 'rgba(74,158,255,0.1)', border:`1.5px solid ${enr.status==='completed' ? '#3ee87a' : '#4a9eff'}`, borderRadius:'7px', fontSize:'11.5px', fontWeight:600, color: enr.status==='completed' ? '#3ee87a' : '#4a9eff', cursor:'pointer' }}>
                          {enr.status === 'completed' ? 'Review' : 'Resume'}
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </Card>

            {/* Weekly Activity */}
            <Card className="anim-slide-up d2" style={{ padding:cardPad }}>
              <SectionHeader title="Weekly activity" subtitle="Learning sessions this week" />
              <div style={{ display:'flex', alignItems:'flex-end', gap: isMobile ? '4px' : '10px', height:'100px', borderBottom:'1px solid #f0f2f5', paddingBottom:'2px' }}>
                {BARS.map((b, i) => (
                  <div key={b.day} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', height:'100%', justifyContent:'flex-end' }}>
                    <div style={{ fontSize:'9px', color:'#8a94a6', fontWeight:600 }}>{b.h}h</div>
                    <div className={`bar-rise d${Math.min(i+1,6)}`} style={{ width:'100%', maxWidth:28, height:`${(b.h/5)*68}px`, background: b.day==='Fri' ? 'linear-gradient(180deg,#4a9eff,#2563eb)' : 'rgba(74,158,255,0.16)', borderRadius:'5px 5px 0 0' }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap: isMobile ? '4px' : '10px', marginTop:'6px' }}>
                {BARS.map(b => (
                  <div key={b.day} style={{ flex:1, textAlign:'center', fontSize:'9px', color: b.day==='Fri' ? '#4a9eff' : '#8a94a6', fontWeight: b.day==='Fri' ? 700 : 400 }}>{b.day}</div>
                ))}
              </div>
            </Card>

            {/* Badges */}
            <Card className="anim-slide-up d3" style={{ padding:cardPad }}>
              <SectionHeader title="My badges" subtitle="Achievements earned" />
              {badges.length === 0 ? (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <div style={{ fontSize:'32px', marginBottom:'8px' }}>🏅</div>
                  <div style={{ fontWeight:600, fontSize:'13.5px', color:'#1a1a2e', marginBottom:'4px' }}>No badges yet</div>
                  <div style={{ fontSize:'12.5px', color:'#8a94a6' }}>Complete a lesson to earn your first one</div>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
                  {badges.map((b, i) => (
                    <div key={b.id} className={`hover-lift anim-scale-in d${Math.min(i+1,6)}`} style={{ textAlign:'center', padding:'12px 8px', background:'rgba(74,158,255,0.05)', borderRadius:'10px', border:'1px solid rgba(74,158,255,0.12)' }}>
                      <div style={{ fontSize:'24px', marginBottom:'4px' }}>{b.badge?.icon || '🏅'}</div>
                      <div style={{ fontSize:'11px', fontWeight:600, color:'#1a1a2e', lineHeight:1.3 }}>{b.badge?.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT */}
          <div style={{ display:'flex', flexDirection:'column', gap }}>

            {/* XP Progress */}
            <Card className="anim-slide-up d1" style={{ padding:cardPad }}>
              <SectionHeader title="Learning Score" subtitle="Your XP progress" />
              <div style={{ marginBottom:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                  <span style={{ fontSize:'13px', color:'#8a94a6' }}>Current XP</span>
                  <span style={{ fontSize:'13px', fontWeight:700, color:'#4a9eff' }}>{xp} / 1000</span>
                </div>
                <div style={{ height:8, background:'#eef1f6', borderRadius:4, overflow:'hidden' }}>
                  <div className="progress-bar-anim" style={{ height:'100%', width:`${Math.min((xp/1000)*100,100)}%`, background:'linear-gradient(90deg,#4a9eff,#3ee87a)', borderRadius:4 }} />
                </div>
                <div style={{ fontSize:'11.5px', color:'#8a94a6', marginTop:'6px' }}>
                  {xp >= 1000 ? '🎉 Level 2 unlocked!' : `${1000 - xp} XP to next level`}
                </div>
              </div>
              {/* XP breakdown */}
              <div style={{ borderTop:'1px solid #f5f5f5', paddingTop:'12px' }}>
                <div style={{ fontSize:'12px', fontWeight:600, color:'#8a94a6', marginBottom:'8px' }}>How to earn XP</div>
                {[
                  { action:'Complete a lesson', xp:'+10 XP' },
                  { action:'Pass a quiz', xp:'+50 XP' },
                  { action:'Finish a course', xp:'+500 XP' },
                  { action:'Daily login streak', xp:'+75 XP' },
                ].map(item => (
                  <div key={item.action} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f9f9f9' }}>
                    <span style={{ fontSize:'12.5px', color:'#444' }}>{item.action}</span>
                    <span style={{ fontSize:'12.5px', fontWeight:700, color:'#3ee87a' }}>{item.xp}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick links */}
            <Card className="anim-slide-up d2" style={{ padding:cardPad }}>
              <SectionHeader title="Quick actions" />
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[
                  { label:'Browse all courses',      href:'/courses',                         icon:'📚', color:'#4a9eff', bg:'rgba(74,158,255,0.08)' },
                  { label:'View my certificates',    href:'/student/certificates/cert-1',     icon:'🏆', color:'#8c64ff', bg:'rgba(140,100,255,0.08)' },
                  { label:'Take a quiz',             href:'/student/quizzes',                 icon:'✏️', color:'#f5a623', bg:'rgba(245,166,35,0.08)' },
                  { label:'Account settings',        href:'/student/settings',                icon:'⚙️', color:'#3ee87a', bg:'rgba(62,232,122,0.08)' },
                ].map(a => (
                  <Link key={a.label} href={a.href} style={{ textDecoration:'none' }}>
                    <div className="row-hover" style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', background:a.bg, borderRadius:'10px', cursor:'pointer' }}>
                      <span style={{ fontSize:'18px' }}>{a.icon}</span>
                      <span style={{ fontSize:'13.5px', fontWeight:600, color:a.color }}>{a.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Announcements */}
            <Card className="anim-slide-up d3" style={{ padding:cardPad }}>
              <SectionHeader title="Announcements" />
              {[
                { title:'Welcome to the Bootcamp!', body:'We are thrilled to have you. Explore the courses and start learning today.', time:'Just now', dot:'#4a9eff' },
                { title:'Live classes starting soon', body:'Your tutor will share the live class link via this platform. Stay tuned!', time:'1 day ago', dot:'#3ee87a' },
              ].map((a, i, arr) => (
                <div key={i} style={{ display:'flex', gap:'10px', paddingBottom: i < arr.length-1 ? '14px' : '0', marginBottom: i < arr.length-1 ? '14px' : '0', borderBottom: i < arr.length-1 ? '1px solid #f5f5f5' : 'none' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:a.dot, flexShrink:0, marginTop:6 }} />
                  <div>
                    <div style={{ fontWeight:600, fontSize:'13px', color:'#1a1a2e', marginBottom:'3px' }}>{a.title}</div>
                    <div style={{ fontSize:'12.5px', color:'#8a94a6', lineHeight:1.5 }}>{a.body}</div>
                    <div style={{ fontSize:'11px', color:'#b0b8c8', marginTop:'4px' }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Mobile CTAs */}
            {isMobile && (
              <div style={{ display:'flex', gap:'10px' }}>
                <Link href="/courses" style={{ textDecoration:'none', flex:1 }}>
                  <button className="press-btn" style={{ width:'100%', padding:'11px', background:'#fff', border:'1.5px solid #e2e6ed', borderRadius:'10px', fontSize:'13px', fontWeight:600, color:'#1a1a2e', cursor:'pointer' }}>Browse</button>
                </Link>
                <Link href={enrollments[0] ? `/student/course/${enrollments[0].course?.id}` : '/courses'} style={{ textDecoration:'none', flex:1 }}>
                  <button className="press-btn" style={{ width:'100%', padding:'11px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', fontSize:'13px', fontWeight:700, color:'#fff', cursor:'pointer' }}>Continue</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}