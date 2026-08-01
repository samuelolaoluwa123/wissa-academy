'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { COURSES, getTutor } from '../../../../lib/courses'
import VideoPlayer from '../../../../components/video/VideoPlayer'
import BadgeCelebrationModal from '../../../../components/gamification/BadgeCelebrationModal'
import { checkAndAwardBadge, checkMultipleBadges } from '../../../../lib/badges'

/* ── Tab content — defined outside main component ── */
function OverviewTab({ course, tutor }) {
  return (
    <div className="anim-fade-in">
      <h3 style={{ fontSize:'16px', fontWeight:700, color:'#1a1a2e', margin:'0 0 12px' }}>About this course</h3>
      <p style={{ fontSize:'14px', color:'#444', lineHeight:1.75, margin:'0 0 20px' }}>{course.description}</p>
      <h3 style={{ fontSize:'16px', fontWeight:700, color:'#1a1a2e', margin:'0 0 12px' }}>What you'll learn</h3>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'20px' }}>
        {course.outcomes.map((o, i) => (
          <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start' }}>
            <span style={{ color:'#3ee87a', fontSize:'13px', flexShrink:0, marginTop:'1px' }}>✓</span>
            <span style={{ fontSize:'13px', color:'#444', lineHeight:1.5 }}>{o}</span>
          </div>
        ))}
      </div>
      <div style={{ background:'#f9fafb', borderRadius:'12px', padding:'16px', display:'flex', gap:'14px', alignItems:'center' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#4a9eff,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:700, color:'#fff', flexShrink:0 }}>{tutor?.initials}</div>
        <div>
          <div style={{ fontWeight:700, fontSize:'14px', color:'#1a1a2e' }}>{tutor?.name}</div>
          <div style={{ fontSize:'12.5px', color:'#8a94a6' }}>{tutor?.role}</div>
        </div>
      </div>
    </div>
  )
}

function NotesTab({ notes, noteText, onNoteChange, onSave }) {
  return (
    <div className="anim-fade-in">
      <h3 style={{ fontSize:'16px', fontWeight:700, color:'#1a1a2e', margin:'0 0 12px' }}>My Notes</h3>
      <textarea value={noteText} onChange={e => onNoteChange(e.target.value)} placeholder="Type your notes here..."
        rows={4} style={{ width:'100%', padding:'12px', border:'1.5px solid #e2e6ed', borderRadius:'10px', fontSize:'13.5px', resize:'vertical', outline:'none', fontFamily:'Inter,sans-serif', color:'#1a1a2e', boxSizing:'border-box', marginBottom:'10px' }} />
      <button onClick={onSave} style={{ padding:'9px 20px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'8px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer', marginBottom:'20px' }}>Save Note</button>
      {notes.length > 0 && (
        <div>
          <h4 style={{ fontSize:'14px', fontWeight:600, color:'#1a1a2e', margin:'0 0 10px' }}>Saved notes</h4>
          {notes.map((n, i) => (
            <div key={i} style={{ padding:'12px', background:'#f9fafb', borderRadius:'10px', marginBottom:'8px', fontSize:'13.5px', color:'#444', lineHeight:1.5, borderLeft:'3px solid #4a9eff' }}>{n}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResourcesTab() {
  const resources = [
    { name:'Course Slides PDF',    size:'2.4 MB', icon:'📄' },
    { name:'Code Examples ZIP',    size:'1.1 MB', icon:'💾' },
    { name:'Reference Cheatsheet', size:'340 KB', icon:'📋' },
  ]
  return (
    <div className="anim-fade-in">
      <h3 style={{ fontSize:'16px', fontWeight:700, color:'#1a1a2e', margin:'0 0 14px' }}>Downloadable Resources</h3>
      {resources.map((r, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 14px', background:'#f9fafb', borderRadius:'10px', marginBottom:'8px', border:'1px solid rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize:'20px' }}>{r.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:600, fontSize:'13.5px', color:'#1a1a2e' }}>{r.name}</div>
            <div style={{ fontSize:'11.5px', color:'#8a94a6' }}>{r.size}</div>
          </div>
          <button style={{ padding:'6px 14px', background:'rgba(74,158,255,0.1)', border:'1.5px solid #4a9eff', borderRadius:'8px', color:'#4a9eff', fontSize:'12.5px', fontWeight:600, cursor:'pointer' }}>Download</button>
        </div>
      ))}
    </div>
  )
}

function DiscussionTab({ comments, commentText, onCommentChange, onPost }) {
  return (
    <div className="anim-fade-in">
      <h3 style={{ fontSize:'16px', fontWeight:700, color:'#1a1a2e', margin:'0 0 12px' }}>Discussion</h3>
      <textarea value={commentText} onChange={e => onCommentChange(e.target.value)} placeholder="Ask a question or share a thought..."
        rows={3} style={{ width:'100%', padding:'12px', border:'1.5px solid #e2e6ed', borderRadius:'10px', fontSize:'13.5px', resize:'vertical', outline:'none', fontFamily:'Inter,sans-serif', color:'#1a1a2e', boxSizing:'border-box', marginBottom:'10px' }} />
      <button onClick={onPost} style={{ padding:'9px 20px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'8px', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer', marginBottom:'20px' }}>Post Comment</button>
      {comments.map((c, i) => (
        <div key={i} style={{ display:'flex', gap:'10px', padding:'12px', background:'#f9fafb', borderRadius:'10px', marginBottom:'8px' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'#1e3a5f', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#4a9eff', flexShrink:0 }}>{c.author?.charAt(0) || 'S'}</div>
          <div>
            <div style={{ fontWeight:600, fontSize:'12.5px', color:'#1a1a2e', marginBottom:'3px' }}>{c.author || 'Student'}</div>
            <div style={{ fontSize:'13.5px', color:'#444', lineHeight:1.5 }}>{c.text}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LessonSidebar({ allLessons, current, completed, onSelect, course }) {
  // Group lessons by their module (lesson.group), preserving overall order
  const groups = []
  let lastGroup = null
  for (const lesson of allLessons) {
    if (lesson.group !== lastGroup) {
      groups.push({ title: lesson.group, lessons: [] })
      lastGroup = lesson.group
    }
    groups[groups.length - 1].lessons.push(lesson)
  }

  const doneCount = Object.keys(completed).length
  const pct = allLessons.length > 0 ? Math.round((doneCount / allLessons.length) * 100) : 0

  return (
    <div>
      <div style={{ padding:'18px 18px 16px', borderBottom:'1px solid #eee' }}>
        <div style={{ fontSize:'13.5px', fontWeight:700, color:'#1a1a2e', marginBottom:'8px' }}>{course.title}</div>
        <div style={{ height:6, background:'#eef1f6', borderRadius:3, overflow:'hidden', marginBottom:'6px' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'#4a9eff', borderRadius:3, transition:'width 0.4s' }} />
        </div>
        <div style={{ fontSize:'11.5px', color:'#8a94a6' }}>{doneCount} of {allLessons.length} lessons completed</div>
      </div>

      {groups.map((group, gi) => (
        <div key={gi}>
          <div style={{ padding:'12px 18px 6px', fontSize:'11px', fontWeight:700, color:'#8a94a6', letterSpacing:'0.4px', textTransform:'uppercase', background:'#fafbfc' }}>
            {group.title}
          </div>
          {group.lessons.map((lesson) => {
            const globalIdx = allLessons.findIndex(l => l.id === lesson.id)
            const isActive  = globalIdx === current
            const isDone    = completed[lesson.id]
            const isLocked  = globalIdx > 0 && !completed[allLessons[globalIdx - 1].id]
            return (
              <button
                key={lesson.id}
                onClick={() => !isLocked && onSelect(globalIdx)}
                disabled={isLocked}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:'10px',
                  paddingTop:'10px', paddingBottom:'10px', paddingLeft:'18px', paddingRight:'16px',
                  background: isActive ? 'rgba(74,158,255,0.08)' : 'transparent',
                  border:'none', borderLeft: isActive ? '3px solid #4a9eff' : '3px solid transparent',
                  cursor: isLocked ? 'not-allowed' : 'pointer', textAlign:'left',
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                <div style={{ width:20, height:20, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:700, background: isDone ? 'rgba(62,232,122,0.15)' : isLocked ? '#f0f0f0' : isActive ? 'rgba(74,158,255,0.15)' : '#eef1f6', color: isDone ? '#3ee87a' : isLocked ? '#b0b8c8' : isActive ? '#4a9eff' : '#8a94a6' }}>
                  {isDone ? '✓' : isLocked ? '🔒' : lesson.type === 'quiz' ? '📝' : ''}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'12.5px', fontWeight: isActive ? 600 : 400, color: isLocked ? '#b0b8c8' : isActive ? '#1a1a2e' : '#444', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{lesson.title}</div>
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/* ── Main page ── */
export default function TakeCoursePage() {
  const router   = useRouter()
  const params   = useParams()
  const courseId = params?.id || '1'

  const course = COURSES.find(c => c.id === courseId)
  const tutor  = course ? getTutor(course.tutorKey) : null

  const [width, setWidth]           = useState(1200)
  const [activeTab, setActiveTab]   = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notes, setNotes]           = useState([])
  const [noteText, setNoteText]     = useState('')
  const [comments, setComments]     = useState([])
  const [commentText, setCommentText] = useState('')
  const [celebrationBadges, setCelebrationBadges] = useState([])
  const [allLessons, setAllLessons] = useState([])       // now real DB rows, not static
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState({})
  const [marking, setMarking]       = useState(false)
  const [userId, setUserId]         = useState(null)
  const [notEnrolled, setNotEnrolled] = useState(false)
  const [loading, setLoading]       = useState(true)
  const [quizForLesson, setQuizForLesson] = useState(null) // real quiz row for the current lesson, if type === 'quiz'
  const intervalRef                 = useRef(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    loadProgress()
    return () => clearInterval(intervalRef.current)
  }, [courseId])

  async function loadProgress() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)

    // Update daily streak for this activity, then check the 7-day streak badge
    await supabase.rpc('update_streak', { user_id: session.user.id })
    const { data: profileAfterStreak } = await supabase
      .from('profiles')
      .select('streak_days')
      .eq('id', session.user.id)
      .single()
    if (profileAfterStreak?.streak_days >= 7) {
      const streakBadge = await checkAndAwardBadge(supabase, session.user.id, 'week_streak')
      if (streakBadge) setCelebrationBadges(prev => [...prev, streakBadge])
    }

    // Confirm enrollment — students shouldn't access courses they haven't joined
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', session.user.id)
      .eq('course_id', courseId)
      .single()

    if (!enrollment) {
      setNotEnrolled(true)
      setLoading(false)
      return
    }

    // Fetch groups (for ordering) and modules for this course
    const { data: groupsData } = await supabase
      .from('course_groups')
      .select('id, position')
      .eq('course_id', courseId)

    const groupPositionById = {}
    ;(groupsData || []).forEach(g => { groupPositionById[g.id] = g.position })

    const { data: modulesDataRaw } = await supabase
      .from('modules')
      .select('id, title, position, group_id')
      .eq('course_id', courseId)

    // module.position only resets within its own group (matches courses.js's
    // per-group numbering) — must sort by (group position, then module position)
    // together to get the true course-wide order. Sorting by module.position
    // alone scatters modules across different groups that share the same number.
    const modulesData = [...(modulesDataRaw || [])].sort((a, b) => {
      const ga = a.group_id ? (groupPositionById[a.group_id] ?? -1) : -1
      const gb = b.group_id ? (groupPositionById[b.group_id] ?? -1) : -1
      if (ga !== gb) return ga - gb
      return a.position - b.position
    })

    const moduleIds = (modulesData || []).map(m => m.id)
    const moduleTitleById = {}
    ;(modulesData || []).forEach(m => { moduleTitleById[m.id] = m.title })

    // Fetch real lessons for those modules, in order
    let lessonsData = []
    if (moduleIds.length > 0) {
      const { data } = await supabase
        .from('lessons')
        .select('id, module_id, title, type, position, video_url')
        .in('module_id', moduleIds)
        .order('position', { ascending: true })
      lessonsData = data || []
    }

    // Flatten in module order, then lesson position order
    const flatLessons = []
    for (const mod of (modulesData || [])) {
      const lessonsInModule = lessonsData
        .filter(l => l.module_id === mod.id)
        .sort((a, b) => a.position - b.position)
      for (const l of lessonsInModule) {
        flatLessons.push({
          id: l.id,
          title: l.title,
          type: l.type || 'video',
          group: mod.title,
          moduleId: mod.id,
          video_url: l.video_url,
        })
      }
    }
    setAllLessons(flatLessons)

    const { data: progressData } = await supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('student_id', session.user.id)
      .eq('course_id', courseId)
      .eq('completed', true)

    if (progressData) {
      const map = {}
      progressData.forEach(lp => { map[lp.lesson_id] = true })
      setCompletedLessons(map)

      // Resume from the first incomplete lesson, not always lesson 0
      const firstIncomplete = flatLessons.findIndex(l => !map[l.id])
      setCurrentLesson(firstIncomplete === -1 ? Math.max(0, flatLessons.length - 1) : firstIncomplete)
    }
    setLoading(false)
  }

  const lesson = allLessons[currentLesson] || allLessons[0]
  const totalLessons = allLessons.length
  const completedCount = Object.keys(completedLessons).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const isLessonLocked = currentLesson > 0 && !completedLessons[allLessons[currentLesson - 1]?.id]

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024

  // When the current lesson is a quiz-type lesson, look up its real quiz row
  useEffect(() => {
    setQuizForLesson(null)
    if (!lesson || lesson.type !== 'quiz') return
    let cancelled = false
    supabase
      .from('quizzes')
      .select('id, title, pass_mark, time_limit_mins')
      .eq('lesson_id', lesson.id)
      .single()
      .then(({ data }) => { if (!cancelled) setQuizForLesson(data || null) })
    return () => { cancelled = true }
  }, [lesson?.id])

  useEffect(() => {
    if (!lesson?.id) return
    let cancelled = false
    supabase
      .from('discussions')
      .select('*, author:profiles(full_name)')
      .eq('lesson_id', lesson.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setComments((data || []).map(d => ({
          id: d.id,
          author: d.author?.full_name || 'Student',
          text: d.body,
        })))
      })
    return () => { cancelled = true }
  }, [lesson?.id])

  async function handleMarkComplete() {
    if (!userId || marking || completedLessons[lesson.id] || isLessonLocked) return
    setMarking(true)
    try {
      const { error: progressError } = await supabase.from('lesson_progress').upsert({
        student_id: userId,
        lesson_id: lesson.id,
        course_id: courseId,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'student_id,lesson_id' })

      if (progressError) {
        console.error('lesson_progress save failed:', progressError.message)
        setMarking(false)
        return // don't update local state if the DB write actually failed
      }

      await supabase.rpc('increment_xp', { user_id: userId, amount: 10 })

      const newlyAwarded = []

      // First lesson ever completed, across any course
      const { count: completedCount } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', userId)
        .eq('completed', true)
      if (completedCount === 1) {
        const badge = await checkAndAwardBadge(supabase, userId, 'first_lesson')
        if (badge) newlyAwarded.push(badge)
      }

      // Every lesson in this lesson's module now complete?
      const { data: moduleLessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('module_id', lesson.moduleId)
      const moduleLessonIds = (moduleLessons || []).map(l => l.id)
      if (moduleLessonIds.length > 0) {
        const { count: moduleCompletedCount } = await supabase
          .from('lesson_progress')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', userId)
          .eq('completed', true)
          .in('lesson_id', moduleLessonIds)
        if (moduleCompletedCount === moduleLessonIds.length) {
          const badge = await checkAndAwardBadge(supabase, userId, 'module_complete')
          if (badge) newlyAwarded.push(badge)
        }
      }

      const newCompleted = { ...completedLessons, [lesson.id]: true }
      setCompletedLessons(newCompleted)

      const newCompletedCount = Object.keys(newCompleted).length
      const newPct = Math.round((newCompletedCount / totalLessons) * 100)
      await supabase
        .from('enrollments')
        .update({ progress_pct: newPct, status: newPct === 100 ? 'completed' : 'active' })
        .eq('student_id', userId)
        .eq('course_id', courseId)

      if (newPct === 100) {
        await supabase.rpc('increment_xp', { user_id: userId, amount: 500 })
        const badge = await checkAndAwardBadge(supabase, userId, 'course_complete')
        if (badge) newlyAwarded.push(badge)
        // Auto-generate certificate if course awards one
        const courseData = COURSES.find(c => c.id === courseId)
        if (courseData && courseData.features.certificateAvailable !== false) {
          await supabase.from('certificates').upsert({
            student_id: userId,
            course_id: courseId,
            grade: 'Pass',
            score_pct: 100,
          }, { onConflict: 'student_id,course_id' })
        }
      }

      if (newlyAwarded.length > 0) {
        setCelebrationBadges(prev => [...prev, ...newlyAwarded])
      }

      if (currentLesson < totalLessons - 1) {
        setTimeout(() => setCurrent(currentLesson + 1), 600)
      }
    } catch (err) {
      console.error('Mark complete error:', err)
    } finally {
      setMarking(false)
    }
  }

  function setCurrent(idx) {
    if (idx > 0 && !completedLessons[allLessons[idx - 1]?.id]) return // can't skip ahead
    setCurrentLesson(idx)
  }

  function saveNote() {
    if (!noteText.trim()) return
    setNotes(prev => [noteText.trim(), ...prev])
    setNoteText('')
  }

  async function postComment() {
    if (!commentText.trim() || !userId || !lesson?.id) return
    const body = commentText.trim()
    setCommentText('')

    const { data, error } = await supabase
      .from('discussions')
      .insert({ lesson_id: lesson.id, author_id: userId, body })
      .select('*, author:profiles(full_name)')
      .single()

    if (error) {
      console.error('Failed to post comment:', error.message)
      return
    }

    setComments(prev => [{ id: data.id, author: data.author?.full_name || 'You', text: data.body }, ...prev])

    const { count } = await supabase
      .from('discussions')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId)
    if (count === 1) {
      const badge = await checkAndAwardBadge(supabase, userId, 'discussion_post')
      if (badge) setCelebrationBadges(prev => [...prev, badge])
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', background:'#0f1b2d', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center', color:'rgba(255,255,255,0.6)' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>⏳</div>
          <div style={{ fontSize:'14px' }}>Loading course...</div>
        </div>
      </div>
    )
  }

  if (notEnrolled) {
    return (
      <div style={{ minHeight:'100vh', background:'#eef1f6', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
        <div style={{ textAlign:'center', maxWidth:400 }}>
          <div style={{ fontSize:'48px', marginBottom:'16px' }}>🔒</div>
          <h1 style={{ fontSize:'20px', fontWeight:800, color:'#1a1a2e', margin:'0 0 8px' }}>Not enrolled yet</h1>
          <p style={{ fontSize:'14px', color:'#8a94a6', marginBottom:'24px' }}>You need to enrol in this course before you can start learning.</p>
          <Link href={`/courses/${courseId}`} style={{ textDecoration:'none' }}>
            <button style={{ padding:'11px 28px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>View Course</button>
          </Link>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={{ minHeight:'100vh', background:'#eef1f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'18px', fontWeight:700, color:'#1a1a2e' }}>Course not found</div>
          <Link href="/courses" style={{ color:'#4a9eff', fontSize:'13px' }}>← Back to courses</Link>
        </div>
      </div>
    )
  }

  const isDone = completedLessons[lesson?.id]
  const TABS = ['overview', 'notes', 'resources', 'discussion']
  const isQuizLesson = lesson?.type === 'quiz'

  return (
    <div style={{ minHeight:'100vh', background:'#0f1b2d', fontFamily:'Inter, sans-serif' }}>

      {/* Topbar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, height:56, background:'#0f1b2d', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', paddingLeft: isMobile?'12px':'24px', paddingRight: isMobile?'12px':'24px', gap:'12px', zIndex:100 }}>
        <Link href="/student/dashboard" style={{ textDecoration:'none' }}>
          <button style={{ background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', paddingTop:'6px', paddingBottom:'6px', paddingLeft:'12px', paddingRight:'12px', borderRadius:'8px', color:'rgba(255,255,255,0.75)', fontSize:'13px' }}>← Back</button>
        </Link>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:'#fff', fontWeight:700, fontSize: isMobile?'13px':'14.5px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{course.title}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
          <div style={{ width: isMobile?60:100, height:4, background:'rgba(255,255,255,0.15)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progressPct}%`, background:'#4a9eff', borderRadius:2, transition:'width 0.5s' }} />
          </div>
          <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', whiteSpace:'nowrap' }}>{progressPct}%</span>
        </div>
        {isMobile && (
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', paddingTop:'6px', paddingBottom:'6px', paddingLeft:'12px', paddingRight:'12px', borderRadius:'8px', color:'rgba(255,255,255,0.75)', fontSize:'12px' }}>Lessons</button>
        )}
      </div>

      <div style={{ paddingTop:56, background:'#eef1f6', minHeight:'calc(100vh - 56px)' }}>
        <div style={{
          maxWidth: 1180, margin:'0 auto',
          padding: isMobile ? '16px' : '28px 24px',
          display: (isMobile || isTablet) ? 'block' : 'grid',
          gridTemplateColumns: (isMobile || isTablet) ? undefined : '1fr 320px',
          gap: '24px', alignItems:'flex-start',
        }}>

        <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.06)', overflow:'hidden' }}>
          {/* Video player OR Quiz card, depending on lesson type */}
          {isQuizLesson ? (
            <div style={{ background:'linear-gradient(135deg,#0f1b2d,#1a2d45)', borderRadius:'14px 14px 0 0', minHeight: isMobile ? '220px' : '320px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'14px', padding:'20px' }}>
              <div style={{ fontSize: isMobile?'32px':'48px' }}>📝</div>
              <div style={{ color:'#fff', fontWeight:700, fontSize: isMobile?'15px':'18px', textAlign:'center' }}>{lesson.title}</div>
              {quizForLesson && (
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'12.5px', textAlign:'center' }}>
                  {quizForLesson.time_limit_mins} min · Pass mark {quizForLesson.pass_mark}%
                </div>
              )}
              {quizForLesson ? (
                <Link href={`/student/quiz?quizId=${quizForLesson.id}`} style={{ textDecoration:'none' }}>
                  <button disabled={isLessonLocked} style={{ padding:'12px 28px', background: isLessonLocked ? 'rgba(255,255,255,0.15)' : 'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'14px', cursor: isLessonLocked ? 'not-allowed' : 'pointer' }}>
                    {isLessonLocked ? '🔒 Locked' : 'Start Quiz →'}
                  </button>
                </Link>
              ) : (
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'12.5px' }}>Quiz not yet configured for this lesson.</div>
              )}
            </div>
          ) : (
            <VideoPlayer videoUrl={lesson?.video_url} title={lesson?.title} isMobile={isMobile} />
          )}

          {/* Lesson nav */}
          <div style={{ background:'#1a2d45', display:'flex', alignItems:'center', gap:'10px', paddingTop:'10px', paddingBottom:'10px', paddingLeft: isMobile?'12px':'20px', paddingRight: isMobile?'12px':'20px' }}>
            <button onClick={() => setCurrent(Math.max(0, currentLesson - 1))} disabled={currentLesson === 0} style={{ paddingTop:'7px', paddingBottom:'7px', paddingLeft:'14px', paddingRight:'14px', background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'8px', color: currentLesson===0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', cursor: currentLesson===0 ? 'not-allowed' : 'pointer', fontSize:'13px', fontWeight:600 }}>← Prev</button>
            <button onClick={handleMarkComplete} disabled={isDone || marking || isLessonLocked} style={{ flex:1, paddingTop:'7px', paddingBottom:'7px', background: isDone ? 'rgba(62,232,122,0.15)' : isLessonLocked ? 'rgba(255,255,255,0.05)' : 'rgba(74,158,255,0.2)', border: `1.5px solid ${isDone ? '#3ee87a' : isLessonLocked ? 'rgba(255,255,255,0.1)' : '#4a9eff'}`, borderRadius:'8px', color: isDone ? '#3ee87a' : isLessonLocked ? 'rgba(255,255,255,0.3)' : '#4a9eff', cursor: (isDone || isLessonLocked) ? 'default' : 'pointer', fontSize:'13px', fontWeight:700 }}>
              {marking ? 'Saving...' : isDone ? '✓ Completed' : isLessonLocked ? '🔒 Locked' : isQuizLesson ? 'Mark Quiz Lesson Complete' : 'Mark Complete'}
            </button>
            <button onClick={() => setCurrent(Math.min(totalLessons - 1, currentLesson + 1))} disabled={currentLesson === totalLessons - 1 || !isDone} style={{ paddingTop:'7px', paddingBottom:'7px', paddingLeft:'14px', paddingRight:'14px', background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'8px', color: (currentLesson===totalLessons-1 || !isDone) ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', cursor: (currentLesson===totalLessons-1 || !isDone) ? 'not-allowed' : 'pointer', fontSize:'13px', fontWeight:600 }}>Next →</button>
          </div>

          {isLessonLocked && (
            <div style={{ background:'#fff3cd', padding:'10px 20px', fontSize:'12.5px', color:'#856404', display:'flex', alignItems:'center', gap:'8px' }}>
              🔒 Complete the previous lesson before you can access this one.
            </div>
          )}

          {/* Tabs */}
          <div style={{ background:'#fff', borderRadius:'0 0 14px 14px' }}>
            <div style={{ display:'flex', borderBottom:'2px solid #e2e6ed', overflowX:'auto' }}>
              {TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ background:'none', border:'none', cursor:'pointer', paddingTop:'12px', paddingBottom:'12px', paddingLeft:'18px', paddingRight:'18px', fontSize:'13.5px', fontWeight: activeTab===tab?700:500, color: activeTab===tab?'#4a9eff':'#8a94a6', borderBottom: activeTab===tab?'2px solid #4a9eff':'2px solid transparent', marginBottom:'-2px', textTransform:'capitalize', whiteSpace:'nowrap' }}>{tab}</button>
              ))}
            </div>
            <div style={{ padding: isMobile?'16px':'24px' }}>
              {activeTab === 'overview'   && <OverviewTab course={course} tutor={tutor} />}
              {activeTab === 'notes'      && <NotesTab notes={notes} noteText={noteText} onNoteChange={setNoteText} onSave={saveNote} />}
              {activeTab === 'resources'  && <ResourcesTab />}
              {activeTab === 'discussion' && <DiscussionTab comments={comments} commentText={commentText} onCommentChange={setCommentText} onPost={postComment} />}
            </div>
          </div>
        </div>

        {!isMobile && !isTablet && (
          <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid rgba(0,0,0,0.06)', position:'sticky', top:'84px', maxHeight:'calc(100vh - 104px)', overflowY:'auto' }}>
            <LessonSidebar allLessons={allLessons} current={currentLesson} completed={completedLessons} onSelect={setCurrent} course={course} />
          </div>
        )}
        </div>
      </div>

      {isMobile && sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:199 }} />
          <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'#fff', borderRadius:'20px 20px 0 0', zIndex:200, maxHeight:'70vh', overflowY:'auto' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontWeight:700, fontSize:'15px', color:'#1a1a2e' }}>Lessons</span>
              <button onClick={() => setSidebarOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'18px', color:'#8a94a6' }}>✕</button>
            </div>
            <LessonSidebar allLessons={allLessons} current={currentLesson} completed={completedLessons} onSelect={idx => { setCurrent(idx); setSidebarOpen(false) }} course={course} />
          </div>
        </>
      )}

      <BadgeCelebrationModal badges={celebrationBadges} onDone={() => setCelebrationBadges([])} />
    </div>
  )
}