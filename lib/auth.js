import { supabase } from './supabase'

/* ── Sign Up (students only — tutors are invited) ── */
export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'student',
      },
    },
  })
  if (error) throw error
  return data
}

/* ── Sign In ── */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

/* ── Sign Out ── */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/* ── Get current session ── */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

/* ── Get current user profile from profiles table ── */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

/* ── Update profile ── */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

/* ── Listen to auth state changes ── */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}

/* ── Register tutor via invite token ── */
export async function registerTutorWithToken({ token, email, password, fullName }) {
  // Verify the invite token is valid
  const { data: invite, error: inviteError } = await supabase
    .from('tutor_invites')
    .select('*')
    .eq('token', token)
    .eq('email', email)
    .eq('status', 'pending')
    .single()

  if (inviteError || !invite) {
    throw new Error('Invalid or expired invite link. Please contact an administrator.')
  }

  if (new Date(invite.expires_at) < new Date()) {
    throw new Error('This invite link has expired. Please request a new one.')
  }

  // Create the auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'instructor',
        tutor_key: invite.tutor_key,
      },
    },
  })
  if (error) throw error

  // Mark invite as accepted
  await supabase
    .from('tutor_invites')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  return data
}

/* ── Admin: send tutor invite ── */
export async function inviteTutor({ email, fullName, tutorKey, invitedBy }) {
  const { data, error } = await supabase
    .from('tutor_invites')
    .insert({
      email,
      full_name: fullName,
      tutor_key: tutorKey,
      invited_by: invitedBy,
    })
    .select()
    .single()
  if (error) throw error
  return data
}