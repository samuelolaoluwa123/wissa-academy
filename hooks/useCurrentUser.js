'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/* ── Shared hook: every page/component that needs the logged-in
   user's name, role, avatar, XP etc calls this single hook so
   there is only ONE source of truth — no more hardcoded names. ── */
export function useCurrentUser() {
  const [authUser, setAuthUser] = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (!session) {
        setAuthUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setAuthUser(session.user)

      let { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      // Auto-create profile row if the signup trigger missed it
      if (!prof) {
        const { data: created } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || 'Student',
            email: session.user.email,
            role: session.user.user_metadata?.role || 'student',
            status: 'active',
          })
          .select()
          .single()
        prof = created
      }

      if (mounted) {
        setProfile(prof)
        setLoading(false)
      }
    }

    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) load()
      else { setAuthUser(null); setProfile(null); setLoading(false) }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  async function refreshProfile() {
    if (!authUser) return
    const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
    if (data) setProfile(data)
  }

  const fullName    = profile?.full_name || authUser?.user_metadata?.full_name || 'Student'
  const nameParts   = fullName.trim().split(' ')
  const initials    = nameParts.length > 1
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : (nameParts[0]?.[0] || 'S').toUpperCase()
  const role        = profile?.role || authUser?.user_metadata?.role || 'student'
  const avatarUrl   = profile?.avatar_url || null

  return { authUser, profile, loading, refreshProfile, fullName, initials, role, avatarUrl }
}