'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function TutorInvitePage() {
  return (
    <Suspense fallback={<InviteLoadingFallback />}>
      <TutorInviteContent />
    </Suspense>
  )
}

function InviteLoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', background: '#eef1f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ color: '#8a94a6', fontSize: '14px' }}>Loading...</div>
    </div>
  )
}

function TutorInviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [width, setWidth] = useState(1200)
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState(null)
  const [invalidReason, setInvalidReason] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    validateToken()
  }, [token])

  async function validateToken() {
    if (!token) {
      setInvalidReason('This invite link is missing its token. Please use the exact link you were sent.')
      setLoading(false)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('tutor_invites')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError || !data) {
      setInvalidReason('This invite link is not valid. Please check the link or ask for a new one.')
      setLoading(false)
      return
    }

    if (data.status === 'accepted') {
      setInvalidReason('This invite has already been used. Please sign in instead.')
      setLoading(false)
      return
    }

    if (new Date(data.expires_at) < new Date()) {
      setInvalidReason('This invite link has expired. Please ask for a new one.')
      setLoading(false)
      return
    }

    setInvite(data)
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    const { error: signUpError } = await supabase.auth.signUp({
      email: invite.email,
      password,
      options: {
        data: {
          full_name: invite.full_name,
          role: 'instructor',
          invite_token: token,
        },
      },
    })

    setSubmitting(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    router.push('/instructor/dashboard')
  }

  const isMobile = width <= 768

  const pageStyle = {
    minHeight: '100vh',
    background: '#eef1f6',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? '20px' : '40px',
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid rgba(0,0,0,0.07)',
    padding: isMobile ? '28px 22px' : '40px',
    maxWidth: 440,
    width: '100%',
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ color: '#8a94a6', fontSize: '14px' }}>Checking your invite...</div>
      </div>
    )
  }

  if (invalidReason) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: '32px', marginBottom: '12px', textAlign: 'center' }}>⚠️</div>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1a2e', textAlign: 'center', margin: '0 0 10px' }}>
            Invite Not Available
          </h1>
          <p style={{ fontSize: '13.5px', color: '#8a94a6', textAlign: 'center', lineHeight: 1.6, margin: '0 0 20px' }}>
            {invalidReason}
          </p>
          <a href="/auth" style={{ display: 'block', textAlign: 'center', fontSize: '13.5px', color: '#4a9eff', fontWeight: 600, textDecoration: 'none' }}>
            Go to Sign In →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg,#0f1b2d,#4a9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '18px', margin: '0 auto 18px' }}>
          {'</>'}
        </div>
        <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#1a1a2e', textAlign: 'center', margin: '0 0 4px' }}>
          You're invited to teach
        </h1>
        <p style={{ fontSize: '13.5px', color: '#8a94a6', textAlign: 'center', margin: '0 0 28px' }}>
          Set a password to activate your instructor account.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11.5px', color: '#8a94a6', marginBottom: '2px' }}>Name</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{invite.full_name}</div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11.5px', color: '#8a94a6', marginBottom: '2px' }}>Email</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{invite.email}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: '1.5px solid #e2e6ed', borderRadius: '10px', fontSize: '13.5px', outline: 'none' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1a2e', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px', border: '1.5px solid #e2e6ed', borderRadius: '10px', fontSize: '13.5px', outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(232,64,64,0.08)', border: '1px solid rgba(232,64,64,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '12.5px', color: '#e84040' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '13px', background: submitting ? '#8fb8e8' : 'linear-gradient(135deg,#4a9eff,#2563eb)',
              border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: submitting ? 'default' : 'pointer',
            }}
          >
            {submitting ? 'Activating account...' : 'Activate Instructor Account →'}
          </button>
        </form>
      </div>
    </div>
  )
}