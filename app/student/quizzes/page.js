'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'
import { getQuizWindowState, formatCountdown } from '../../../lib/quizSchedule'

function StatusBadge({ quiz, attempted }) {
  const state = getQuizWindowState(quiz)

  if (attempted) {
    return <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11.5px', fontWeight:700, background:'rgba(62,232,122,0.15)', color:'#3ee87a' }}>✓ Completed</span>
  }
  if (state.status === 'unscheduled') {
    return <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11.5px', fontWeight:700, background:'rgba(74,158,255,0.12)', color:'#4a9eff' }}>Available anytime</span>
  }
  if (state.status === 'upcoming') {
    return <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11.5px', fontWeight:700, background:'rgba(245,166,35,0.15)', color:'#f5a623' }}>Opens in {formatCountdown(state.msUntilStart)}</span>
  }
  if (state.status === 'live') {
    return <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11.5px', fontWeight:700, background:'rgba(62,232,122,0.15)', color:'#3ee87a' }}>● Live now</span>
  }
  return <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'11.5px', fontWeight:700, background:'rgba(232,64,64,0.12)', color:'#e84040' }}>Closed</span>
}

export default function QuizzesHubPage() {
  const router = useRouter()
  const [width, setWidth] = useState(1200)
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState([])
  const [attemptedIds, setAttemptedIds] = useState({})

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    loadQuizzes()
  }, [])

  async function loadQuizzes() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }

    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', session.user.id)

    const courseIds = (enrollments || []).map(e => e.course_id)
    if (courseIds.length === 0) { setLoading(false); return }

    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*, lesson:lessons(title, module:modules(title)), course:courses(title)')
      .in('course_id', courseIds)
      .order('scheduled_start', { ascending: true })

    const { data: attempts } = await supabase
      .from('quiz_attempts')
      .select('quiz_id')
      .eq('student_id', session.user.id)

    const attemptedMap = {}
    ;(attempts || []).forEach(a => { attemptedMap[a.quiz_id] = true })

    setQuizzes(quizData || [])
    setAttemptedIds(attemptedMap)
    setLoading(false)
  }

  const isMobile = width <= 768

  if (loading) {
    return (
      <DashboardShell role="student">
        <div style={{ padding:'60px', textAlign:'center' }}>
          <div className="anim-pulse" style={{ fontSize:'28px', marginBottom:'10px' }}>📝</div>
          <div style={{ color:'#8a94a6', fontSize:'14px' }}>Loading quizzes...</div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell role="student">
    <div style={{ padding: isMobile ? '20px 16px' : '32px 40px' }}>
      <div className="anim-slide-up">
        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight:800, color:'#1a1a2e', margin:'0 0 4px' }}>Quizzes</h1>
        <p style={{ fontSize:'13.5px', color:'#8a94a6', margin:'0 0 24px' }}>
          All quizzes across your enrolled courses, in one place.
        </p>
      </div>

      {quizzes.length === 0 && (
        <div className="anim-fade-in" style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', padding:'40px 24px', textAlign:'center' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>📝</div>
          <div style={{ fontSize:'14px', color:'#8a94a6' }}>
            No quizzes yet. Enrol in a course and progress through lessons to unlock quizzes here.
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
        {quizzes.map((quiz, i) => {
          const attempted = !!attemptedIds[quiz.id]
          const state = getQuizWindowState(quiz)
          const canTake = state.status === 'unscheduled' || state.status === 'live'

          const cardInner = (
            <div className="hover-lift" style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.07)', padding: isMobile ? '16px' : '18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'0.5px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'4px' }}>
                  {quiz.course?.title || 'Course'}{quiz.lesson?.module?.title ? ` · ${quiz.lesson.module.title}` : ''}
                </div>
                <div style={{ fontSize:'14.5px', fontWeight:700, color:'#1a1a2e', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {quiz.title}
                </div>
                <div style={{ fontSize:'12px', color:'#8a94a6', marginTop:'2px' }}>
                  {quiz.time_limit_mins} min · Pass mark {quiz.pass_mark}%
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
                <StatusBadge quiz={quiz} attempted={attempted} />
                {canTake && (
                  <span style={{ fontSize:'12.5px', fontWeight:700, color:'#4a9eff' }}>
                    {attempted ? 'Retake →' : 'Start →'}
                  </span>
                )}
              </div>
            </div>
          )

          return (
            <div key={quiz.id} className={`anim-slide-up d${Math.min(i+1,6)}`}>
              {canTake ? (
                <Link href={`/student/quiz?quizId=${quiz.id}`} style={{ textDecoration:'none' }}>
                  {cardInner}
                </Link>
              ) : (
                <div style={{ opacity:0.75 }}>{cardInner}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
    </DashboardShell>
  )
}