import { supabase } from './supabase'
import { awardXP, awardBadgeIfEarned } from './enrollments'

/* ── Get quiz with questions for a lesson ── */
export async function getQuizByLesson(lessonId) {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions:quiz_questions(*)
    `)
    .eq('lesson_id', lessonId)
    .single()
  if (error) throw error
  return data
}

/* ── Submit a quiz attempt ── */
export async function submitQuizAttempt({ studentId, quizId, answers, timeTakenSecs, passMark }) {
  // Get quiz questions to calculate score
  const { data: questions, error: qError } = await supabase
    .from('quiz_questions')
    .select('id, correct_index')
    .eq('quiz_id', quizId)
  if (qError) throw qError

  // Calculate score
  let correct = 0
  questions.forEach(q => {
    if (answers[q.id] === q.correct_index) correct++
  })
  const scorePct = Math.round((correct / questions.length) * 100)
  const passed = scorePct >= passMark

  // Save attempt
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      student_id: studentId,
      quiz_id: quizId,
      answers,
      score_pct: scorePct,
      passed,
      time_taken_secs: timeTakenSecs,
    })
    .select()
    .single()
  if (error) throw error

  // Award XP
  if (passed) {
    await awardXP(studentId, 50)
    await awardBadgeIfEarned(studentId, 'first_quiz')
  }

  // Perfect score badge
  if (scorePct === 100) {
    await awardBadgeIfEarned(studentId, 'quiz_perfect')
  }

  // First try pass badge
  const { count: prevAttempts } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('quiz_id', quizId)
  if (prevAttempts === 1 && passed) {
    await awardBadgeIfEarned(studentId, 'quiz_pass_first')
  }

  return { ...data, scorePct, passed, correct, total: questions.length }
}

/* ── Get a student's quiz attempts for a quiz ── */
export async function getQuizAttempts(studentId, quizId) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('student_id', studentId)
    .eq('quiz_id', quizId)
    .order('attempted_at', { ascending: false })
  if (error) throw error
  return data || []
}