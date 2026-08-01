'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'

function formatCountdown(ms) {
  if (ms <= 0) return 'starting now'
  const totalMin = Math.floor(ms / 60000)
  const days = Math.floor(totalMin / 1440)
  const hours = Math.floor((totalMin % 1440) / 60)
  const mins = totalMin % 60
  if (days > 0) return `in ${days}d ${hours}h`
  if (hours > 0) return `in ${hours}h ${mins}m`
  return `in ${mins}m`
}

export default function LiveClassesPage() {
  const router = useRouter()
  const [width, setWidth] = useState(1200)
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(tick)
  }, [])

  useEffect(() => {
    loadClasses()
  }, [])

  async function loadClasses() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', session.user.id)

    const courseIds = (enrollments || []).map(e => e.course_id)
    if (courseIds.length === 0) { setLoading(false); return }

    const { data } = await supabase
      .from('live_classes')
      .select('*, course:courses(title, icon)')
      .in('course_id', courseIds)
      .order('scheduled_start', { ascending: true })

    setClasses(data || [])
    setLoading(false)
  }

  const isMobile = width <= 768
  const upcoming = classes.filter(c => new Date(c.scheduled_end).getTime() >= now)
  const past = classes.filter(c => new Date(c.scheduled_end).getTime() < now)

  function renderClass(lc) {
    const start = new Date(lc.scheduled_start).getTime()
    const end = new Date(lc.scheduled_end).getTime()
    const isLive = now >= start && now <= end
    const isPast = now > end

    return (
      <div key={lc.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)', padding: isMobile ? '16px' : '20px', marginBottom: '12px', opacity: isPast ? 0.6 : 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#4a9eff', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>
              {lc.course?.icon} {lc.course?.title}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>{lc.title}</div>
            {lc.description && <div style={{ fontSize: '12.5px', color: '#8a94a6', marginBottom: '6px' }}>{lc.description}</div>}
            <div style={{ fontSize: '12px', color: '#8a94a6' }}>
              {new Date(lc.scheduled_start).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
              {isLive && <span style={{ marginLeft: 8, color: '#3ee87a', fontWeight: 700 }}>● LIVE NOW</span>}
              {!isLive && !isPast && <span style={{ marginLeft: 8, color: '#f5a623', fontWeight: 600 }}>{formatCountdown(start - now)}</span>}
            </div>
          </div>
          {!isPast && (
            <a href={lc.join_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <button style={{ padding: '10px 20px', background: isLive ? 'linear-gradient(135deg,#3ee87a,#1ab55c)' : 'linear-gradient(135deg,#4a9eff,#2563eb)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {isLive ? 'Join Now →' : 'Join Link →'}
              </button>
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <DashboardShell role="student">
      <div style={{ padding: isMobile ? '20px 16px' : '32px 40px' }}>
        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>Live Classes</h1>
        <p style={{ fontSize: '13.5px', color: '#8a94a6', margin: '0 0 24px' }}>
          Scheduled live sessions across your enrolled courses.
        </p>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8a94a6', fontSize: '14px' }}>Loading...</div>
        ) : classes.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
            <div style={{ fontSize: '14px', color: '#8a94a6' }}>No live classes scheduled yet. Check back soon!</div>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>Upcoming</h2>
                {upcoming.map(renderClass)}
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>Past</h2>
                {past.map(renderClass)}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}