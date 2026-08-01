import { supabase } from './supabase'

/* ── Enrol student in a course ── */
export async function enrollInCourse(studentId, courseId) {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({ student_id: studentId, course_id: courseId })
    .select()
    .single()
  if (error) throw error

  // Award XP + badge for first enrollment
  await awardXP(studentId, 15)
  await awardBadgeIfEarned(studentId, 'course_enrolled')

  return data
}

/* ── Check if student is enrolled ── */
export async function isEnrolled(studentId, courseId) {
  const { data } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .single()
  return !!data
}

/* ── Get all enrollments for a student ── */
export async function getStudentEnrollments(studentId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      course:courses(id, title, short_title, category, gradient, icon, certificate_available)
    `)
    .eq('student_id', studentId)
    .order('enrolled_at', { ascending: false })
  if (error) throw error
  return data || []
}

/* ── Mark a lesson as complete ── */
export async function markLessonComplete(studentId, lessonId, courseId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      student_id: studentId,
      lesson_id: lessonId,
      course_id: courseId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'student_id,lesson_id' })
    .select()
    .single()
  if (error) throw error

  // Award XP for lesson completion
  await awardXP(studentId, 10)

  // Check if this is their first ever lesson
  const { count } = await supabase
    .from('lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('completed', true)

  if (count === 1) {
    await awardBadgeIfEarned(studentId, 'first_lesson')
  }

  // Recalculate course progress %
  await recalculateCourseProgress(studentId, courseId)

  return data
}

/* ── Get lesson progress for a student in a course ── */
export async function getLessonProgress(studentId, courseId) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed, completed_at')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
  if (error) throw error
  return data || []
}

/* ── Recalculate and update course progress % ── */
async function recalculateCourseProgress(studentId, courseId) {
  // Count total lessons in course
  const { count: totalLessons } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)

  // Count completed lessons
  const { count: completedLessons } = await supabase
    .from('lesson_progress')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('completed', true)

  if (!totalLessons) return

  const pct = Math.round((completedLessons / totalLessons) * 100)

  await supabase
    .from('enrollments')
    .update({
      progress_pct: pct,
      status: pct === 100 ? 'completed' : 'active',
      completed_at: pct === 100 ? new Date().toISOString() : null,
    })
    .eq('student_id', studentId)
    .eq('course_id', courseId)

  // If course is complete, award XP and badge
  if (pct === 100) {
    await awardXP(studentId, 500)
    await awardBadgeIfEarned(studentId, 'course_complete')
  }
}

/* ── Award XP to a student ── */
export async function awardXP(studentId, amount) {
  const { error } = await supabase.rpc('increment_xp', {
    user_id: studentId,
    amount,
  })
  if (error) console.error('XP award error:', error)
}

/* ── Award badge if not already earned ── */
export async function awardBadgeIfEarned(studentId, badgeSlug) {
  // Get badge id
  const { data: badge } = await supabase
    .from('badges')
    .select('id, xp_reward')
    .eq('slug', badgeSlug)
    .single()
  if (!badge) return

  // Check if already earned
  const { data: existing } = await supabase
    .from('student_badges')
    .select('id')
    .eq('student_id', studentId)
    .eq('badge_id', badge.id)
    .single()
  if (existing) return

  // Award it
  await supabase
    .from('student_badges')
    .insert({ student_id: studentId, badge_id: badge.id })

  // Award bonus XP
  if (badge.xp_reward > 0) {
    await awardXP(studentId, badge.xp_reward)
  }
}

/* ── Get student badges ── */
export async function getStudentBadges(studentId) {
  const { data, error } = await supabase
    .from('student_badges')
    .select('*, badge:badges(*)')
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false })
  if (error) throw error
  return data || []
}