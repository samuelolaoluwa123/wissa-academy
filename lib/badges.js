// lib/badges.js
// Shared badge-awarding logic for Phase D, Feature 4 — Gamification.
// Badges are treated as one-time-ever achievements per student (not repeatable),
// matching how they're designed in the `badges` table (course_enrolled, first_lesson, etc.)

/**
 * Checks whether a student already has a given badge (by condition slug),
 * and if not, awards it — inserting into student_badges and granting its XP reward.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} studentId
 * @param {string} conditionSlug - matches badges.condition, e.g. 'first_lesson'
 * @returns {Promise<object|null>} the newly-awarded badge row, or null if not awarded
 *   (already owned, or no matching badge exists)
 */
export async function checkAndAwardBadge(supabase, studentId, conditionSlug) {
  try {
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('condition', conditionSlug)
      .single()

    if (badgeError || !badge) return null

    const { data: existing } = await supabase
      .from('student_badges')
      .select('id')
      .eq('student_id', studentId)
      .eq('badge_id', badge.id)
      .maybeSingle()

    if (existing) return null // already earned, one-time achievement

    const { error: insertError } = await supabase
      .from('student_badges')
      .insert({ student_id: studentId, badge_id: badge.id })

    if (insertError) {
      console.error(`Failed to award badge "${conditionSlug}":`, insertError.message)
      return null
    }

    if (badge.xp_reward > 0) {
      await supabase.rpc('increment_xp', { user_id: studentId, amount: badge.xp_reward })
    }

    return badge
  } catch (err) {
    console.error(`Badge check error for "${conditionSlug}":`, err)
    return null
  }
}

/**
 * Convenience helper: runs several badge checks in sequence and returns
 * only the ones actually newly awarded, in order. Useful when one action
 * (like a perfect first quiz attempt) could trigger multiple badges at once.
 */
export async function checkMultipleBadges(supabase, studentId, conditionSlugs) {
  const awarded = []
  for (const slug of conditionSlugs) {
    const badge = await checkAndAwardBadge(supabase, studentId, slug)
    if (badge) awarded.push(badge)
  }
  return awarded
}