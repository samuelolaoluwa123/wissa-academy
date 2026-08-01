'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()
  const [width, setWidth] = useState(1200)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    checkSessionAndRedirect()
  }, [])

  async function checkSessionAndRedirect() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setChecking(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role === 'instructor') {
      router.push('/instructor/dashboard')
    } else {
      router.push('/student/dashboard')
    }
  }

  const isMobile = width <= 768

  // Avoid flashing the landing page for a split second while we check
  // whether there's already a logged-in session to redirect.
  if (checking) {
    return (
      <div style={{ minHeight:'100vh', background:'#eef1f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color:'#8a94a6', fontSize:'14px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#eef1f6', fontFamily:'Inter,sans-serif' }}>
      {/* Topbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding: isMobile ? '18px 16px' : '24px 48px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:36, height:36, borderRadius:'10px', background:'linear-gradient(135deg,#0f1b2d,#4a9eff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:'15px' }}>{'</>'}</div>
          <span style={{ fontWeight:800, fontSize: isMobile ? '14px' : '16px', color:'#1a1a2e' }}>Apps & Scripts Bootcamp</span>
        </div>
        <Link href="/auth" style={{ textDecoration:'none' }}>
          <button style={{ padding: isMobile ? '9px 16px' : '10px 22px', background:'#0f1b2d', border:'none', borderRadius:'8px', color:'#fff', fontWeight:600, fontSize: isMobile ? '13px' : '14px', cursor:'pointer' }}>Sign In</button>
        </Link>
      </div>

      {/* Hero */}
      <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center', padding: isMobile ? '40px 20px 60px' : '80px 40px 100px' }}>
        <div style={{ display:'inline-block', background:'rgba(74,158,255,0.1)', color:'#4a9eff', fontSize:'12px', fontWeight:700, padding:'6px 16px', borderRadius:'20px', marginBottom:'20px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
          Free Summer Bootcamp
        </div>
        <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight:800, color:'#1a1a2e', lineHeight:1.2, margin:'0 0 20px', letterSpacing:'-1px' }}>
          Learn to build with code —<br />no experience needed
        </h1>
        <p style={{ fontSize: isMobile ? '15px' : '18px', color:'#8a94a6', lineHeight:1.6, maxWidth:600, margin:'0 auto 32px' }}>
          Hands-on courses in web development, data science, AI content creation, and no-code design — taught live by real tutors, completely free.
        </p>
        <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/auth" style={{ textDecoration:'none' }}>
            <button style={{ padding: isMobile ? '13px 26px' : '15px 34px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize: isMobile ? '14px' : '16px', cursor:'pointer', boxShadow:'0 6px 20px rgba(74,158,255,0.35)' }}>
              Get Started Free →
            </button>
          </Link>
        </div>
      </div>

      {/* Course teaser cards */}
      <div style={{ maxWidth:1000, margin:'0 auto', padding: isMobile ? '0 16px 60px' : '0 40px 100px' }}>
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap:'16px' }}>
          {[
            { icon:'💻', title:'HTML, CSS & JavaScript', tutor:'Samuel' },
            { icon:'📊', title:'Data Science', tutor:'Stephen' },
            { icon:'🎨', title:'AI Content Creation', tutor:'Opeyemi' },
            { icon:'🌐', title:'No-Code Web Design', tutor:'Odunayo' },
          ].map(c => (
            <div key={c.title} style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'14px', padding:'22px', textAlign:'center' }}>
              <div style={{ fontSize:'30px', marginBottom:'12px' }}>{c.icon}</div>
              <div style={{ fontWeight:700, fontSize:'14px', color:'#1a1a2e', marginBottom:'4px' }}>{c.title}</div>
              <div style={{ fontSize:'12px', color:'#8a94a6' }}>with {c.tutor}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}