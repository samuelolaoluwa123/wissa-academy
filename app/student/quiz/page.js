'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { getQuizWindowState, drawAttemptQuestions } from '../../../lib/quizSchedule'
import QuizCountdown from '../../../components/quiz/QuizCountdown'
import BadgeCelebrationModal from '../../../components/gamification/BadgeCelebrationModal'
import { checkAndAwardBadge } from '../../../lib/badges'

/* ── Static quiz meta (rules/time-limit text — swap to DB fields later if tutors need to edit these per quiz) ── */
const QUIZ_META = {
  title: 'CSS Box Model Quiz',
  course: 'HTML, CSS & JavaScript Basics',
  module: 'Module 3 — CSS Foundations',
  timeLimitMins: 15,
  passMark: 70,
  topic: 'CSS Box Model',
  rules: [
    'You have 15 minutes to complete all questions',
    'Each question has one correct answer',
    'You can navigate between questions freely',
    'Your timer starts the moment you click Start Quiz',
    'You must answer all questions before submitting',
    'Results and explanations are shown immediately after submission',
    'Your 8 questions are randomly drawn from the question bank — every attempt is different',
  ],
}

/**
 * Maps a quiz_questions row to the shape this page's UI expects.
 * Real columns confirmed via Supabase: question, options (jsonb), correct_index, explanation
 */
function mapDbQuestion(row) {
  return {
    id: row.id,
    q: row.question,
    options: row.options || [],
    answer: row.correct_index,
    explanation: row.explanation || '',
  }
}

/* ── Topbar defined OUTSIDE main component ── */
function QuizTopbar({ isMobile, showTimer, secondsLeft, timerRed }) {
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, height:60, background:'#0f1b2d', display:'flex', alignItems:'center', paddingLeft: isMobile ? '16px' : '32px', paddingRight: isMobile ? '16px' : '32px', gap:'12px', zIndex:100, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
      <Link href="/courses" style={{ textDecoration:'none' }}>
        <button style={{ background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', paddingTop:'6px', paddingBottom:'6px', paddingLeft:'14px', paddingRight:'14px', borderRadius:'8px', color:'rgba(255,255,255,0.75)', fontSize:'13px' }}>← Back</button>
      </Link>
      <div style={{ flex:1, textAlign:'center' }}>
        <div style={{ color:'#fff', fontWeight:700, fontSize: isMobile ? '13px' : '15px' }}>{QUIZ_META.title}</div>
        {!isMobile && <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'11.5px', marginTop:'1px' }}>{QUIZ_META.course} · {QUIZ_META.module}</div>}
      </div>
      {showTimer ? (
        <div style={{ paddingTop:'6px', paddingBottom:'6px', paddingLeft:'14px', paddingRight:'14px', borderRadius:'8px', minWidth:'70px', textAlign:'center', background: timerRed ? 'rgba(232,64,64,0.15)' : 'rgba(255,255,255,0.08)', border: timerRed ? '1px solid rgba(232,64,64,0.4)' : '1px solid transparent' }}>
          <div style={{ color: timerRed ? '#e84040' : '#fff', fontWeight:700, fontSize:'16px' }}>{mins}:{secs}</div>
        </div>
      ) : <div style={{ width:70 }} />}
    </div>
  )
}

/* ── Main component ── */
export default function QuizPage() {
  const router       = useRouter()
  const searchParams  = useSearchParams()
  const quizId        = searchParams.get('quizId')

  const [width, setWidth]           = useState(1200)
  const [screen, setScreen]         = useState('intro')
  const [answers, setAnswers]       = useState({})
  const [current, setCurrent]       = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_META.timeLimitMins * 60)
  const [userId, setUserId]         = useState(null)
  const [saving, setSaving]         = useState(false)

  // Phase D additions — real quiz + scheduling + drawn questions
  const [quiz, setQuiz]             = useState(null)
  const [celebrationBadges, setCelebrationBadges] = useState([])
  const [questions, setQuestions]   = useState([])
  const [quizLoading, setQuizLoading] = useState(true)
  const [starting, setStarting]     = useState(false)
  const [startError, setStartError] = useState(null)

  const timerRef      = useRef(null)
  const startTimeRef  = useRef(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setUserId(session.user.id)
    })
  }, [])

  useEffect(() => {
    if (!quizId) { setQuizLoading(false); return }
    loadQuiz()
  }, [quizId])

  async function loadQuiz() {
    setQuizLoading(true)
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single()
    if (!error) setQuiz(data)
    setQuizLoading(false)
  }

  useEffect(() => {
    if (screen !== 'quiz') return
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(timerRef.current); handleTimeUp(); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [screen])

  const isMobile      = width <= 768
  const timerRed      = secondsLeft < 120
  const answeredCount = Object.keys(answers).length
  const allAnswered   = questions.length > 0 && answeredCount === questions.length
  const windowState   = quiz ? getQuizWindowState(quiz) : { status: 'unscheduled' }

  // Quiz can be started if no schedule has been set yet (back-compat) or the window is live
  const canStart = windowState.status === 'unscheduled' || windowState.status === 'live'

  async function handleStart() {
    if (!quizId || !quiz) {
      setStartError('This quiz link is missing its quiz ID — ask your tutor for the correct link.')
      return
    }
    if (!canStart) return

    setStarting(true)
    setStartError(null)
    try {
      const { selectedQuestions } = await drawAttemptQuestions(supabase, quizId)
      if (!selectedQuestions || selectedQuestions.length === 0) {
        setStartError('No questions found in the bank for this quiz yet.')
        setStarting(false)
        return
      }
      setQuestions(selectedQuestions.map(mapDbQuestion))
      setAnswers({})
      setCurrent(0)
      setSecondsLeft(QUIZ_META.timeLimitMins * 60)
      setScreen('quiz')
    } catch (err) {
      console.error('Quiz start error:', err)
      setStartError('Could not load quiz questions. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  function handleAnswer(optIdx) {
    setAnswers(prev => ({ ...prev, [current]: optIdx }))
  }

  function handleTimeUp() {
    setScreen('results')
    saveAttempt()
  }

  function goToResults() {
    clearInterval(timerRef.current)
    setScreen('results')
    saveAttempt()
  }

  async function saveAttempt() {
    if (!userId || saving || !quizId) return
    setSaving(true)
    try {
      const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
      const scorePct = Math.round((score / questions.length) * 100)
      const passed = scorePct >= QUIZ_META.passMark
      const timeTaken = startTimeRef.current ? Math.round((Date.now() - startTimeRef.current) / 1000) : 0

      // Count prior attempts BEFORE this one, to know if this is the student's first-ever quiz attempt
      const { count: priorAttempts } = await supabase
        .from('quiz_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', userId)

      await supabase.from('quiz_attempts').insert({
        student_id: userId,
        quiz_id: quizId,
        answers: answers,
        selected_question_ids: questions.map(q => q.id),
        score_pct: scorePct,
        passed,
        time_taken_secs: timeTaken,
      }).select()

      if (passed) {
        await supabase.rpc('increment_xp', { user_id: userId, amount: 50 })
      }

      await supabase.rpc('update_streak', { user_id: userId })

      const newlyAwarded = []
      const isFirstEverAttempt = (priorAttempts || 0) === 0

      if (isFirstEverAttempt) {
        const badge = await checkAndAwardBadge(supabase, userId, 'first_quiz')
        if (badge) newlyAwarded.push(badge)
      }
      if (isFirstEverAttempt && passed) {
        const badge = await checkAndAwardBadge(supabase, userId, 'quiz_pass_first')
        if (badge) newlyAwarded.push(badge)
      }
      if (scorePct === 100) {
        const badge = await checkAndAwardBadge(supabase, userId, 'quiz_perfect')
        if (badge) newlyAwarded.push(badge)
      }
      if (newlyAwarded.length > 0) {
        setCelebrationBadges(newlyAwarded)
      }
    } catch (err) {
      // Quiz attempt save is non-critical — don't block UI
      console.error('Quiz save error:', err)
    } finally {
      setSaving(false)
    }
  }

  function handleRetry() {
    setAnswers({})
    setCurrent(0)
    setSecondsLeft(QUIZ_META.timeLimitMins * 60)
    setScreen('intro')
  }

  const score    = questions.reduce((acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0), 0)
  const scorePct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
  const passed   = scorePct >= QUIZ_META.passMark

  /* ── INTRO ── */
  if (screen === 'intro') {
    return (
      <div style={{ minHeight:'100vh', background:'#eef1f6', fontFamily:'Inter,sans-serif' }}>
        <QuizTopbar isMobile={isMobile} showTimer={false} secondsLeft={secondsLeft} timerRed={timerRed} />
        <div style={{ paddingTop: isMobile ? '80px' : '100px', paddingBottom: isMobile ? '40px' : '60px', paddingLeft: isMobile ? '16px' : '24px', paddingRight: isMobile ? '16px' : '24px', display:'flex', alignItems:'flex-start', justifyContent:'center', minHeight:'100vh' }}>
          <div style={{ width:'100%', maxWidth:640 }}>
            {/* Hero */}
            <div style={{ background:'#0f1b2d', borderRadius:'20px', padding: isMobile ? '28px 20px' : '40px 48px', marginBottom:'20px', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(74,158,255,0.12),transparent 70%)', pointerEvents:'none' }} />
              <div style={{ position:'relative' }}>
                <div style={{ width:60, height:60, borderRadius:'16px', background:'rgba(74,158,255,0.15)', border:'1px solid rgba(74,158,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', marginBottom:'20px' }}>✏️</div>
                <div style={{ fontSize:'12px', fontWeight:700, letterSpacing:'1.5px', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:'8px' }}>{QUIZ_META.course}</div>
                <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight:800, color:'#fff', margin:'0 0 8px', letterSpacing:'-0.5px' }}>{QUIZ_META.title}</h1>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', marginBottom:'28px' }}>{QUIZ_META.module}</div>
                <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:'12px' }}>
                  {[
                    { icon:'❓', label:'Questions', val: quiz?.question_bank?.questions_per_attempt ?? 8 },
                    { icon:'⏱', label:'Time limit', val:`${QUIZ_META.timeLimitMins} min` },
                    { icon:'🎯', label:'Pass mark', val:`${QUIZ_META.passMark}%` },
                    { icon:'📊', label:'Topic', val:QUIZ_META.topic },
                  ].map(s => (
                    <div key={s.label} style={{ background:'rgba(255,255,255,0.06)', borderRadius:'12px', padding:'12px 14px' }}>
                      <div style={{ fontSize:'18px', marginBottom:'6px' }}>{s.icon}</div>
                      <div style={{ fontSize:'15px', fontWeight:700, color:'#fff', marginBottom:'2px' }}>{s.val}</div>
                      <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quiz window status / countdown — Phase D */}
            {!quizLoading && quiz && (
              <div style={{ marginBottom: '20px' }}>
                <QuizCountdown quiz={quiz} onStart={handleStart} />
              </div>
            )}
            {!quizLoading && !quiz && quizId && (
              <div style={{ background:'rgba(232,64,64,0.08)', border:'1px solid rgba(232,64,64,0.25)', borderRadius:'12px', padding:'14px 18px', marginBottom:'20px', fontSize:'13px', color:'#e84040' }}>
                Couldn't find this quiz. The link may be out of date.
              </div>
            )}

            {/* Rules */}
            <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid rgba(0,0,0,0.07)', padding: isMobile ? '20px' : '28px', marginBottom:'20px' }}>
              <h2 style={{ fontSize:'15px', fontWeight:700, color:'#1a1a2e', margin:'0 0 16px' }}>📋 Before you start</h2>
              {QUIZ_META.rules.map((rule, i) => (
                <div key={i} style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom: i < QUIZ_META.rules.length-1 ? '12px' : '0' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, background:'rgba(74,158,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'#4a9eff' }}>{i+1}</div>
                  <span style={{ fontSize:'13.5px', color:'#444', lineHeight:1.5, paddingTop:'2px' }}>{rule}</span>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div style={{ background:'rgba(245,166,35,0.08)', border:'1px solid rgba(245,166,35,0.25)', borderRadius:'12px', padding:'14px 18px', display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'24px' }}>
              <span style={{ fontSize:'16px', flexShrink:0 }}>⚠️</span>
              <span style={{ fontSize:'13px', color:'#1a1a2e', lineHeight:1.5 }}>Once you click <strong>Start Quiz</strong>, your timer begins and cannot be paused.</span>
            </div>

            {startError && (
              <div style={{ background:'rgba(232,64,64,0.08)', border:'1px solid rgba(232,64,64,0.25)', borderRadius:'12px', padding:'12px 16px', marginBottom:'16px', fontSize:'13px', color:'#e84040' }}>
                {startError}
              </div>
            )}

            {/* Fallback Start button for quizzes with no schedule set (canStart via 'unscheduled') */}
            {(!quiz || windowState.status === 'unscheduled') && (
              <button
                onClick={handleStart}
                disabled={starting || quizLoading}
                style={{ width:'100%', padding:'15px', background: starting ? '#8fb8e8' : 'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'12px', color:'#fff', fontWeight:700, fontSize:'16px', cursor: starting ? 'default' : 'pointer', boxShadow:'0 6px 20px rgba(74,158,255,0.4)' }}
              >
                {starting ? 'Loading questions...' : 'Start Quiz →'}
              </button>
            )}

            <div style={{ textAlign:'center', marginTop:'14px' }}>
              <Link href="/courses" style={{ fontSize:'13px', color:'#8a94a6', textDecoration:'none' }}>← Return to lesson</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── QUIZ ── */
  if (screen === 'quiz') {
    const q = questions[current]
    const selectedAnswer = answers[current]
    return (
      <div style={{ minHeight:'100vh', background:'#eef1f6', fontFamily:'Inter,sans-serif' }}>
        <QuizTopbar isMobile={isMobile} showTimer secondsLeft={secondsLeft} timerRed={timerRed} />
        <div style={{ position:'fixed', top:60, left:0, right:0, height:3, background:'#e2e6ed', zIndex:99 }}>
          <div style={{ height:'100%', background:'#4a9eff', width:`${((current+1)/questions.length)*100}%`, transition:'width 0.3s ease' }} />
        </div>
        <div style={{ paddingTop: isMobile ? '80px' : '90px', paddingBottom:'120px', paddingLeft: isMobile ? '16px' : '24px', paddingRight: isMobile ? '16px' : '24px', display:'flex', justifyContent:'center' }}>
          <div style={{ width:'100%', maxWidth:680 }}>
            {/* Dots */}
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center', marginBottom:'24px' }}>
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} style={{ width:36, height:36, borderRadius:'50%', cursor:'pointer', fontSize:'13px', fontWeight:700, background: i===current ? '#4a9eff' : answers[i]!==undefined ? 'rgba(74,158,255,0.2)' : '#fff', color: i===current ? '#fff' : answers[i]!==undefined ? '#4a9eff' : '#8a94a6', border: i===current ? 'none' : '1.5px solid #e2e6ed' }}>{i+1}</button>
              ))}
            </div>

            {/* Question */}
            <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid rgba(0,0,0,0.07)', padding: isMobile ? '20px' : '32px', marginBottom:'16px' }}>
              <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'1px', color:'#4a9eff', textTransform:'uppercase', marginBottom:'12px' }}>Question {current+1} of {questions.length}</div>
              <p style={{ fontSize: isMobile ? '15px' : '17px', fontWeight:600, color:'#1a1a2e', lineHeight:1.5, margin:'0 0 24px' }}>{q.q}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {q.options.map((opt, oi) => {
                  const selected = selectedAnswer === oi
                  return (
                    <button key={oi} onClick={() => handleAnswer(oi)} style={{ width:'100%', padding:'14px 18px', background: selected ? 'rgba(74,158,255,0.08)' : '#fafbfc', border:`2px solid ${selected ? '#4a9eff' : '#e2e6ed'}`, borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px', textAlign:'left' }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background: selected ? '#4a9eff' : '#fff', border:`2px solid ${selected ? '#4a9eff' : '#e2e6ed'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color: selected ? '#fff' : '#8a94a6' }}>
                        {selected ? '✓' : String.fromCharCode(65+oi)}
                      </div>
                      <span style={{ fontSize:'14px', fontWeight: selected ? 600 : 400, color: selected ? '#1a1a2e' : '#444' }}>{opt}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ textAlign:'center', fontSize:'12.5px', color:'#8a94a6' }}>
              {answeredCount} of {questions.length} answered
              {!allAnswered && <span style={{ color:'#f5a623' }}> · {questions.length-answeredCount} remaining</span>}
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderTop:'1px solid #e2e6ed', paddingTop: isMobile ? '12px' : '14px', paddingBottom: isMobile ? '12px' : '14px', paddingLeft: isMobile ? '16px' : '32px', paddingRight: isMobile ? '16px' : '32px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', zIndex:100 }}>
          <button onClick={() => setCurrent(c => Math.max(0,c-1))} disabled={current===0} style={{ paddingTop:'10px', paddingBottom:'10px', paddingLeft:'24px', paddingRight:'24px', borderRadius:'10px', border:'1.5px solid #e2e6ed', background:'#fff', cursor: current===0 ? 'not-allowed' : 'pointer', fontSize:'14px', fontWeight:600, color: current===0 ? '#b0b8c8' : '#1a1a2e' }}>← Previous</button>
          {current < questions.length-1 ? (
            <button onClick={() => setCurrent(c => c+1)} disabled={selectedAnswer===undefined} style={{ paddingTop:'10px', paddingBottom:'10px', paddingLeft:'28px', paddingRight:'28px', borderRadius:'10px', border:'none', background: selectedAnswer!==undefined ? 'linear-gradient(135deg,#4a9eff,#2563eb)' : '#e2e6ed', cursor: selectedAnswer!==undefined ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, color: selectedAnswer!==undefined ? '#fff' : '#b0b8c8' }}>Next →</button>
          ) : (
            <button onClick={goToResults} disabled={!allAnswered} style={{ paddingTop:'10px', paddingBottom:'10px', paddingLeft:'28px', paddingRight:'28px', borderRadius:'10px', border:'none', background: allAnswered ? 'linear-gradient(135deg,#3ee87a,#1ab55c)' : '#e2e6ed', cursor: allAnswered ? 'pointer' : 'not-allowed', fontSize:'14px', fontWeight:700, color: allAnswered ? '#fff' : '#b0b8c8' }}>
              {allAnswered ? 'Submit Quiz ✓' : `${questions.length-answeredCount} unanswered`}
            </button>
          )}
        </div>
      </div>
    )
  }

  /* ── RESULTS ── */
  const circumference = 2 * Math.PI * 54
  const dashOffset    = circumference - (scorePct/100) * circumference
  return (
    <div style={{ minHeight:'100vh', background:'#eef1f6', fontFamily:'Inter,sans-serif' }}>
      <QuizTopbar isMobile={isMobile} showTimer={false} secondsLeft={secondsLeft} timerRed={timerRed} />
      <div style={{ paddingTop: isMobile ? '80px' : '90px', paddingBottom:'60px', paddingLeft: isMobile ? '16px' : '40px', paddingRight: isMobile ? '16px' : '40px', maxWidth:800, margin:'0 auto' }}>

        {/* Score hero */}
        <div style={{ background:'#0f1b2d', borderRadius:'20px', padding: isMobile ? '28px 20px' : '40px', marginBottom:'24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, left:'50%', transform:'translateX(-50%)', width:300, height:300, borderRadius:'50%', background:`radial-gradient(circle,${passed?'rgba(62,232,122,0.1)':'rgba(232,64,64,0.08)'},transparent 70%)`, pointerEvents:'none' }} />
          <div style={{ position:'relative', width:130, height:130, margin:'0 auto 20px' }}>
            <svg width="130" height="130" style={{ transform:'rotate(-90deg)' }}>
              <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
              <circle cx="65" cy="65" r="54" fill="none" stroke={passed?'#3ee87a':'#e84040'} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"/>
            </svg>
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontSize:'28px', fontWeight:900, color:'#fff', lineHeight:1 }}>{scorePct}%</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'3px' }}>Score</div>
            </div>
          </div>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 18px', borderRadius:'20px', background: passed?'rgba(62,232,122,0.15)':'rgba(232,64,64,0.15)', border:`1px solid ${passed?'rgba(62,232,122,0.3)':'rgba(232,64,64,0.3)'}`, marginBottom:'12px' }}>
            <span style={{ fontSize:'16px' }}>{passed?'🎉':'📚'}</span>
            <span style={{ fontSize:'14px', fontWeight:700, color: passed?'#3ee87a':'#e84040' }}>{passed?'Quiz Passed!':'Not Passed'}</span>
          </div>
          <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)' }}>{score} of {questions.length} correct · Pass mark: {QUIZ_META.passMark}%</div>
          {passed && <div style={{ fontSize:'13px', color:'#3ee87a', marginTop:'8px', fontWeight:600 }}>+50 XP earned!</div>}
        </div>

        {/* Buttons */}
        <div style={{ display:'flex', gap:'12px', marginBottom:'28px', flexWrap:'wrap' }}>
          <button onClick={handleRetry} style={{ flex:1, minWidth:140, padding:'12px', background:'#fff', border:'1.5px solid #e2e6ed', borderRadius:'10px', fontSize:'14px', fontWeight:600, color:'#1a1a2e', cursor:'pointer' }}>🔄 Retry Quiz</button>
          {passed && (
            <Link href="/courses" style={{ textDecoration:'none', flex:1, minWidth:140 }}>
              <button style={{ width:'100%', padding:'12px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:700, color:'#fff', cursor:'pointer' }}>▶ Next Lesson</button>
            </Link>
          )}
        </div>

        {/* Review */}
        <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid rgba(0,0,0,0.07)', padding: isMobile ? '20px' : '28px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:700, color:'#1a1a2e', margin:'0 0 20px' }}>Question Review</h2>
          {questions.map((q, i) => {
            const userAns   = answers[i]
            const isCorrect = userAns === q.answer
            return (
              <div key={i} style={{ marginBottom: i<questions.length-1?'20px':'0', paddingBottom: i<questions.length-1?'20px':'0', borderBottom: i<questions.length-1?'1px solid #f0f0f0':'none' }}>
                <div style={{ display:'flex', gap:'10px', marginBottom:'10px' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, background: isCorrect?'rgba(62,232,122,0.15)':'rgba(232,64,64,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', color: isCorrect?'#3ee87a':'#e84040' }}>{isCorrect?'✓':'✗'}</div>
                  <span style={{ fontSize:'13.5px', fontWeight:600, color:'#1a1a2e', lineHeight:1.4 }}>{i+1}. {q.q}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', paddingLeft:'34px' }}>
                  {q.options.map((opt, oi) => {
                    const isCorrectOpt = oi===q.answer
                    const isUserOpt    = oi===userAns
                    return (
                      <div key={oi} style={{ padding:'8px 12px', borderRadius:'8px', fontSize:'13px', background: isCorrectOpt?'rgba(62,232,122,0.1)':isUserOpt&&!isCorrect?'rgba(232,64,64,0.08)':'transparent', border: isCorrectOpt?'1.5px solid rgba(62,232,122,0.4)':isUserOpt&&!isCorrect?'1.5px solid rgba(232,64,64,0.3)':'1.5px solid transparent', color: isCorrectOpt?'#1a9c4e':isUserOpt&&!isCorrect?'#e84040':'#8a94a6', fontWeight: isCorrectOpt||isUserOpt?600:400, display:'flex', gap:'8px', alignItems:'center' }}>
                        <span>{isCorrectOpt?'✓':isUserOpt&&!isCorrect?'✗':'○'}</span>
                        <span style={{ flex:1 }}>{opt}</span>
                        {isCorrectOpt && <span style={{ fontSize:'11px', color:'#3ee87a', flexShrink:0 }}>Correct</span>}
                        {isUserOpt&&!isCorrect && <span style={{ fontSize:'11px', color:'#e84040', flexShrink:0 }}>Your answer</span>}
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop:'10px', marginLeft:'34px', padding:'10px 14px', borderRadius:'8px', background:'rgba(74,158,255,0.06)', border:'1px solid rgba(74,158,255,0.15)' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'#4a9eff' }}>Explanation: </span>
                  <span style={{ fontSize:'12.5px', color:'#444' }}>{q.explanation}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <BadgeCelebrationModal badges={celebrationBadges} onDone={() => setCelebrationBadges([])} />
    </div>
  )
}