'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '../components/ui/Logo'

export default function NotFound() {
  const [width, setWidth] = useState(1200)
  const [dots, setDots] = useState('')

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Animate dots
  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)
    return () => clearInterval(id)
  }, [])

  const isMobile = width <= 768

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1b2d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '32px 20px' : '40px',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-80px', left: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(74,158,255,0.08),transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', right: '-60px',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(140,100,255,0.07),transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ textAlign: 'center', maxWidth: '520px', position: 'relative' }}>
        {/* Apps & Scripts logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <Logo size={56} radius={16} />
        </div>

        {/* 404 */}
        <div style={{
          fontSize: isMobile ? '96px' : '140px',
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg,#4a9eff,#8c64ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '12px',
          letterSpacing: '-6px',
        }}>404</div>

        {/* Message */}
        <h1 style={{
          color: '#fff', fontSize: isMobile ? '22px' : '26px',
          fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.5px',
        }}>
          Page not found{dots}
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '15px',
          lineHeight: 1.6, margin: '0 0 36px',
        }}>
          The page you are looking for does not exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Quick links */}
        <div style={{
          display: 'flex', gap: '12px', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '40px',
        }}>
          <Link href="/student/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg,#4a9eff,#2563eb)',
              border: 'none', borderRadius: '12px',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(74,158,255,0.3)',
            }}>
              🏠 Go to Dashboard
            </button>
          </Link>
          <Link href="/courses" style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.07)',
              border: '1.5px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              color: '#fff', fontWeight: 600, fontSize: '14px',
              cursor: 'pointer',
            }}>
              📚 Browse Courses
            </button>
          </Link>
        </div>

        {/* Helpful links */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '20px 24px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Quick links
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '8px',
          }}>
            {[
              { href: '/student/dashboard', label: 'Student Dashboard', icon: '⊞' },
              { href: '/instructor/dashboard', label: 'Instructor Dashboard', icon: '📊' },
              { href: '/courses', label: 'Browse Courses', icon: '📚' },
              { href: '/auth', label: 'Sign In', icon: '🔑' },
              { href: '/student/settings', label: 'Account Settings', icon: '⚙️' },
              { href: '/student/certificates/cert-1', label: 'My Certificates', icon: '🏆' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>
                  <span style={{ fontSize: '15px' }}>{link.icon}</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{link.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}