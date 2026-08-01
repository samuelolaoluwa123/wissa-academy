// lib/quizSchedule.js
// Pure helper functions for Phase D, Feature 1 — Quiz Scheduling System.
// No 'use client' needed here — no hooks, safe to import from server or client.

/**
 * Determine where "now" sits relative to a quiz's scheduled window.
 * @param {{ scheduled_start: string|null, scheduled_end: string|null }} quiz
 * @returns {{
 *   status: 'unscheduled' | 'upcoming' | 'live' | 'closed',
 *   msUntilStart: number|null,
 *   msUntilEnd: number|null,
 *   startDate: Date|null,
 *   endDate: Date|null
 * }}
 */
export function getQuizWindowState(quiz) {
  if (!quiz?.scheduled_start || !quiz?.scheduled_end) {
    return {
      status: 'unscheduled',
      msUntilStart: null,
      msUntilEnd: null,
      startDate: null,
      endDate: null,
    }
  }

  const now = Date.now()
  const startDate = new Date(quiz.scheduled_start)
  const endDate = new Date(quiz.scheduled_end)
  const start = startDate.getTime()
  const end = endDate.getTime()

  if (now < start) {
    return {
      status: 'upcoming',
      msUntilStart: start - now,
      msUntilEnd: end - now,
      startDate,
      endDate,
    }
  }

  if (now >= start && now <= end) {
    return {
      status: 'live',
      msUntilStart: 0,
      msUntilEnd: end - now,
      startDate,
      endDate,
    }
  }

  return {
    status: 'closed',
    msUntilStart: null,
    msUntilEnd: null,
    startDate,
    endDate,
  }
}

/**
 * Format a millisecond duration as "2 days, 4 hours, 12 min" style text.
 * Drops leading zero units (e.g. under an hour shows "12 min, 5 sec").
 */
export function formatCountdown(ms) {
  if (ms == null || ms <= 0) return '0 sec'

  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`)
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`)
  if (minutes > 0 && days === 0) parts.push(`${minutes} min`)
  if (seconds > 0 && days === 0 && hours === 0) parts.push(`${seconds} sec`)

  return parts.length > 0 ? parts.join(', ') : '0 sec'
}

/**
 * Fisher-Yates shuffle + slice. Never mutates the input array.
 * @param {Array} questions - full question bank for a quiz (from quiz_questions)
 * @param {number} count - how many to draw (default 8)
 */
export function drawRandomQuestions(questions, count = 8) {
  const pool = [...questions]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}

/**
 * Fetch a quiz's full question bank, draw a random subset for this attempt,
 * and return both — caller is responsible for persisting selected_question_ids
 * onto the quiz_attempts row once the attempt is created.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} quizId
 */
export async function drawAttemptQuestions(supabase, quizId) {
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single()

  if (quizError) throw quizError

  const { data: allQuestions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)

  if (questionsError) throw questionsError

  const drawCount = quiz?.question_bank?.questions_per_attempt ?? 8
  const selected = drawRandomQuestions(allQuestions ?? [], drawCount)

  return {
    quiz,
    selectedQuestions: selected,
    selectedQuestionIds: selected.map((q) => q.id),
  }
}