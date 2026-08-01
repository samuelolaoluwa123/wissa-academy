'use client'
import { useState, useEffect } from 'react'
// router replaced by window.location
import Logo from '../../components/ui/Logo'
import { supabase } from '../../lib/supabase'

export default function AuthPage() {
  // const router = useRouter()
  const [width, setWidth]       = useState(1200)
  const [mode, setMode]         = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [errors, setErrors]     = useState({})
  const [message, setMessage]   = useState('')

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Intentionally NOT auto-redirecting logged-in users
  // Users must actively sign in each visit for security

  function redirectToDashboard(user) {
    const role = user?.user_metadata?.role
    if (role === 'instructor') window.location.href = '/instructor/dashboard'
    else window.location.href = '/student/dashboard'
  }

  const isMobile = width <= 768

  function pwStrength(pw) {
    if (!pw) return 0
    if (pw.length < 6) return 1
    if (pw.length < 10) return 2
    if (/[A-Z]/.test(pw) && /\d/.test(pw)) return 4
    return 3
  }
  const strength = pwStrength(password)
  const strengthLabel = ['', 'Too short', 'Weak', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#e84040', '#f5a623', '#4a9eff', '#3ee87a'][strength]

  function validate() {
    const errs = {}
    if (!email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Minimum 6 characters'
    if (mode === 'register' && !name.trim()) errs.name = 'Full name is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        redirectToDashboard(data.user)
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name.trim(), role: 'student' } },
        })
        if (error) throw error
        setMessage('Account created successfully! You can now sign in.')
        setMode('signin')
        setEmail(''); setPassword(''); setName('')
      }
    } catch (err) {
      setErrors({ submit: err.message || 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/student/dashboard` },
    })
  }

  const inp = (hasErr) => ({
    width: '100%', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box',
    border: `1.5px solid ${hasErr ? '#e84040' : '#e2e6ed'}`, borderRadius: '10px',
    outline: 'none', background: '#fafbfc', color: '#1a1a2e', fontFamily: 'Inter,sans-serif',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  })
  const lbl = { display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#1a1a2e', marginBottom: '6px' }
  const errTxt = { fontSize: '11.5px', color: '#e84040', marginTop: '4px' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {!isMobile && (
        <div style={{ flex: '0 0 42%', background: '#0f1b2d', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
          <div className="blob-pulse" style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(74,158,255,0.12),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <Logo size={42} radius={12} />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '19px' }}>Apps & Scripts</span>
            </div>
            <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 800, lineHeight: 1.25, margin: '0 0 16px', letterSpacing: '-0.5px' }}>Learn practical tech skills this summer.</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', lineHeight: 1.7, margin: '0 0 40px', maxWidth: 380 }}>
              Apps & Scripts Summer Bootcamp brings expert tutors to teach web development, data science, AI content creation, and no-code design — beginner-friendly and free.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
              {[{ val: '4', label: 'Courses' }, { val: '4', label: 'Expert Tutors' }, { val: '100%', label: 'Free' }].map((s, i) => (
                <div key={s.label} className="stat-card" style={{ background: 'rgba(255,255,255,0.07)', padding: '14px 22px', borderRadius: '12px', textAlign: 'center', animationDelay: `${i * 0.08}s` }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#4a9eff' }}>{s.val}</div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 18px', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#4a9eff', marginBottom: '4px' }}>Are you a tutor?</div>
              <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>Tutor accounts are created by invitation only. Contact your administrator if you haven't received your invite link.</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '32px 20px' : '40px', background: '#eef1f6' }}>
        <div className="auth-wrap" style={{ width: '100%', maxWidth: 420 }}>
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', justifyContent: 'center' }}>
              <Logo size={36} radius={10} />
              <span style={{ color: '#0f1b2d', fontWeight: 800, fontSize: '17px' }}>Apps & Scripts</span>
            </div>
          )}

          <div className="auth-card" style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.07)', padding: isMobile ? '24px 20px' : '36px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', background: '#f5f6f8', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
              {['signin', 'register'].map(m => (
                <button key={m} className="tab-btn" onClick={() => { setMode(m); setErrors({}); setMessage('') }} style={{
                  flex: 1, padding: '9px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '13.5px', fontWeight: 700, transition: 'background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#1a1a2e' : '#8a94a6',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                }}>{m === 'signin' ? 'Sign In' : 'Create Account'}</button>
              ))}
            </div>

            <div key={mode} className="mode-fade">
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 6px' }}>{mode === 'signin' ? 'Welcome back' : 'Join the bootcamp'}</h2>
              <p style={{ fontSize: '13px', color: '#8a94a6', margin: '0 0 20px' }}>{mode === 'signin' ? 'Sign in to continue learning' : 'Create your free student account'}</p>
            </div>

            {message && (
              <div style={{ padding: '12px 16px', background: 'rgba(62,232,122,0.1)', border: '1px solid rgba(62,232,122,0.3)', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: '#1a9c4e', lineHeight: 1.5 }}>{message}</div>
            )}
            {errors.submit && (
              <div style={{ padding: '12px 16px', background: 'rgba(232,64,64,0.08)', border: '1px solid rgba(232,64,64,0.25)', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', color: '#e84040' }}>{errors.submit}</div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={lbl}>Full Name</label>
                  <input className="focus-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inp(errors.name)} />
                  {errors.name && <div style={errTxt}>{errors.name}</div>}
                </div>
              )}
              <div style={{ marginBottom: '14px' }}>
                <label style={lbl}>Email Address</label>
                <input className="focus-input" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@email.com" style={inp(errors.email)} />
                {errors.email && <div style={errTxt}>{errors.email}</div>}
              </div>
              <div style={{ marginBottom: mode === 'register' ? '8px' : '18px' }}>
                <label style={lbl}>Password</label>
                <input className="focus-input" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={inp(errors.password)} />
                {errors.password && <div style={errTxt}>{errors.password}</div>}
              </div>
              {mode === 'register' && password.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? strengthColor : '#e2e6ed' }} />)}
                  </div>
                  <div style={{ fontSize: '11.5px', color: strengthColor }}>{strengthLabel}</div>
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary" style={{
                width: '100%', padding: '13px', border: 'none', borderRadius: '10px', color: '#fff',
                fontWeight: 700, fontSize: '14.5px', marginBottom: '14px', transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease',
                background: loading ? '#b0b8c8' : 'linear-gradient(135deg,#4a9eff,#2563eb)',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(74,158,255,0.35)',
              }}>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e2e6ed' }} />
                <span style={{ fontSize: '11.5px', color: '#b0b8c8' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: '#e2e6ed' }} />
              </div>
              <button type="button" onClick={handleGoogle} className="btn-google" style={{
                width: '100%', padding: '12px', background: '#fff', border: '1.5px solid #e2e6ed',
                borderRadius: '10px', color: '#1a1a2e', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'border-color 0.2s ease, background 0.2s ease, transform 0.15s ease',
              }}>
                <span>🔍</span> Continue with Google
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12.5px', color: '#8a94a6', marginTop: '20px' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <span className="switch-link" onClick={() => { setMode(mode === 'signin' ? 'register' : 'signin'); setErrors({}); setMessage('') }}
              style={{ color: '#4a9eff', fontWeight: 600, cursor: 'pointer' }}>
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes blobPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.06); }
        }

        .auth-wrap {
          animation: fadeInUp 0.5s ease both;
        }
        .auth-card {
          animation: fadeInUp 0.45s ease both;
        }
        .mode-fade {
          animation: fadeIn 0.25s ease both;
        }
        .blob-pulse {
          animation: blobPulse 6s ease-in-out infinite;
        }
        .stat-card {
          animation: fadeInUp 0.5s ease both;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          background: rgba(255,255,255,0.11);
        }
        .tab-btn:hover {
          color: #1a1a2e;
        }
        .focus-input:hover {
          border-color: #c5cbd6 !important;
        }
        .focus-input:focus {
          border-color: #4a9eff !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(74,158,255,0.12);
        }
        .btn-primary:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(74,158,255,0.45);
        }
        .btn-primary:not(:disabled):active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(74,158,255,0.35);
        }
        .btn-google:hover {
          border-color: #b0b8c8 !important;
          background: #fafbfc !important;
          transform: translateY(-1px);
        }
        .btn-google:active {
          transform: translateY(0);
        }
        .switch-link {
          position: relative;
        }
        .switch-link:hover {
          color: #2563eb !important;
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-wrap, .auth-card, .mode-fade, .blob-pulse, .stat-card {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}