'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'

function StatCard({ icon, label, value, color, isMobile, className = '' }) {
  return (
    <div className={`hover-lift ${className}`} style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', padding: isMobile ? '16px' : '20px', flex:1, minWidth: isMobile ? '45%' : '140px' }}>
      <div style={{ width:36, height:36, borderRadius:'10px', background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', marginBottom:'10px' }}>{icon}</div>
      <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight:800, color:'#1a1a2e', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:'12px', color:'#8a94a6', marginTop:'4px' }}>{label}</div>
    </div>
  )
}

export default function ProgressPage() {
  const router = useRouter()
  const [width, setWidth] = useState(1200)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [attempts, setAttempts] = useState([])
  const [badges, setBadges] = useState([])
  const [certificates, setCertificates] = useState([])

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    loadProgress()
  }, [])

  async function loadProgress() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    const userId = session.user.id

    const [{ data: profileData }, { data: enrollData }, { data: attemptData }, { data: badgeData }, { data: certData }] = await Promise.all([
      supabase.from('profiles').select('xp_points, streak_days').eq('id', userId).single(),
      supabase.from('enrollments').select('*, course:courses(title, icon)').eq('student_id', userId).order('enrolled_at', { ascending: false }),
      supabase.from('quiz_attempts').select('*, quiz:quizzes(title, course:courses(title))').eq('student_id', userId).order('attempted_at', { ascending: false }),
      supabase.from('student_badges').select('*, badge:badges(name, description, icon)').eq('student_id', userId).order('earned_at', { ascending: false }),
      supabase.from('certificates').select('*, course:courses(title)').eq('student_id', userId).order('issued_at', { ascending: false }),
    ])

    setProfile(profileData || { xp_points: 0, streak_days: 0 })
    setEnrollments(enrollData || [])
    setAttempts(attemptData || [])
    setBadges(badgeData || [])
    setCertificates(certData || [])
    setLoading(false)
  }

  const isMobile = width <= 768
  const quizzesPassed = attempts.filter(a => a.passed).length
  const coursesInProgress = enrollments.filter(e => e.status !== 'completed').length
  const coursesCompleted = enrollments.filter(e => e.status === 'completed').length

  if (loading) {
    return (
      <DashboardShell role="student">
        <div style={{ padding:'60px', textAlign:'center' }}>
          <div className="anim-pulse" style={{ fontSize:'28px', marginBottom:'10px' }}>📊</div>
          <div style={{ color:'#8a94a6', fontSize:'14px' }}>Loading your progress...</div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="student">
      <div style={{ padding: isMobile ? '20px 16px' : '32px 40px' }}>
        <h1 className="anim-slide-up" style={{ fontSize: isMobile ? '20px' : '24px', fontWeight:800, color:'#1a1a2e', margin:'0 0 4px' }}>Progress Report</h1>
        <p className="anim-slide-up" style={{ fontSize:'13.5px', color:'#8a94a6', margin:'0 0 24px' }}>
          Your learning activity across all enrolled courses.
        </p>

        {/* Stat cards */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', marginBottom:'28px' }}>
          <StatCard className="anim-scale-in d1" icon="⚡" label="Total XP" value={profile.xp_points ?? 0} color="#4a9eff" isMobile={isMobile} />
          <StatCard className="anim-scale-in d2" icon="🔥" label="Day Streak" value={profile.streak_days ?? 0} color="#f5a623" isMobile={isMobile} />
          <StatCard className="anim-scale-in d3" icon="✅" label="Quizzes Passed" value={quizzesPassed} color="#3ee87a" isMobile={isMobile} />
          <StatCard className="anim-scale-in d4" icon="🎓" label="Courses Completed" value={coursesCompleted} color="#8c64ff" isMobile={isMobile} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap:'20px' }}>

          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Course progress */}
            <div className="anim-slide-up d1" style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', padding: isMobile ? '18px' : '22px' }}>
              <h2 style={{ fontSize:'15px', fontWeight:700, color:'#1a1a2e', margin:'0 0 16px' }}>Course Progress</h2>
              {enrollments.length === 0 && <div style={{ fontSize:'13px', color:'#8a94a6' }}>Not enrolled in any courses yet.</div>}
              {enrollments.map((e, i) => (
                <div key={e.id} className={`anim-fade-in d${Math.min(i+1,6)}`} style={{ marginBottom:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                    <span style={{ fontSize:'13.5px', fontWeight:600, color:'#1a1a2e' }}>{e.course?.icon} {e.course?.title || 'Course'}</span>
                    <span style={{ fontSize:'12px', color:'#8a94a6' }}>{e.progress_pct ?? 0}%</span>
                  </div>
                  <div style={{ height:8, background:'#eef1f6', borderRadius:4, overflow:'hidden' }}>
                    <div className="progress-bar-anim" style={{ height:'100%', width:`${e.progress_pct ?? 0}%`, background: e.status === 'completed' ? '#3ee87a' : '#4a9eff', borderRadius:4, transition:'width 0.4s var(--ease-out)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quiz history */}
            <div className="anim-slide-up d2" style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', padding: isMobile ? '18px' : '22px' }}>
              <h2 style={{ fontSize:'15px', fontWeight:700, color:'#1a1a2e', margin:'0 0 16px' }}>Quiz History</h2>
              {attempts.length === 0 && <div style={{ fontSize:'13px', color:'#8a94a6' }}>No quiz attempts yet.</div>}
              {attempts.map(a => (
                <div key={a.id} className="row-hover" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'10px', paddingBottom:'10px', borderBottom:'1px solid #f0f0f0' }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:'13px', fontWeight:600, color:'#1a1a2e', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{a.quiz?.title || 'Quiz'}</div>
                    <div style={{ fontSize:'11.5px', color:'#8a94a6' }}>{a.quiz?.course?.title} · {a.attempted_at ? new Date(a.attempted_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : ''}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
                    <span style={{ fontSize:'13px', fontWeight:700, color: a.passed ? '#3ee87a' : '#e84040' }}>{a.score_pct}%</span>
                    <span style={{ fontSize:'11px', fontWeight:700, padding:'3px 10px', borderRadius:'12px', background: a.passed ? 'rgba(62,232,122,0.12)' : 'rgba(232,64,64,0.1)', color: a.passed ? '#3ee87a' : '#e84040' }}>
                      {a.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Badges */}
            <div className="anim-slide-up d1" style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', padding: isMobile ? '18px' : '22px' }}>
              <h2 style={{ fontSize:'15px', fontWeight:700, color:'#1a1a2e', margin:'0 0 16px' }}>Badges Earned</h2>
              {badges.length === 0 && <div style={{ fontSize:'13px', color:'#8a94a6' }}>No badges earned yet — keep learning!</div>}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(80px, 1fr))', gap:'12px' }}>
                {badges.map((b, i) => (
                  <div key={b.id} title={b.badge?.description} className={`hover-lift anim-scale-in d${Math.min(i+1,6)}`} style={{ textAlign:'center' }}>
                    <div style={{ width:52, height:52, borderRadius:'14px', background:'rgba(140,100,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', margin:'0 auto 6px' }}>
                      {b.badge?.icon || '🏅'}
                    </div>
                    <div style={{ fontSize:'11px', fontWeight:600, color:'#1a1a2e' }}>{b.badge?.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div className="anim-slide-up d2" style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', padding: isMobile ? '18px' : '22px' }}>
              <h2 style={{ fontSize:'15px', fontWeight:700, color:'#1a1a2e', margin:'0 0 16px' }}>Certificates</h2>
              {certificates.length === 0 && <div style={{ fontSize:'13px', color:'#8a94a6' }}>No certificates earned yet.</div>}
              {certificates.map(c => (
                <Link key={c.id} href={`/student/certificates/${c.id}`} style={{ textDecoration:'none' }}>
                  <div className="row-hover" style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #f0f0f0' }}>
                    <div style={{ width:36, height:36, borderRadius:'10px', background:'rgba(140,100,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>🎓</div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:'13px', fontWeight:600, color:'#1a1a2e', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.course?.title || 'Course'}</div>
                      <div style={{ fontSize:'11.5px', color:'#8a94a6' }}>Grade: {c.grade} · {c.issued_at ? new Date(c.issued_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) : ''}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}