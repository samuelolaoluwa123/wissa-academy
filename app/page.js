'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Space_Grotesk } from 'next/font/google'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import PhotoFrame from '../components/landing/PhotoFrame'

const HeroScene = dynamic(() => import('../components/landing/HeroScene'), { ssr: false })

const display = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'] })

/* ── Data (module scope — no JSX stored in literals, just plain data mapped in render) ── */
const COURSES = [
  { icon: '💻', title: 'HTML, CSS & JavaScript', tutor: 'Samuel', color: '#4a9eff', bg: 'rgba(74,158,255,0.08)',
    points: ['Build responsive sites from scratch', 'JavaScript fundamentals & the DOM', 'Ship real projects for your portfolio'] },
  { icon: '📊', title: 'Data Science', tutor: 'Stephen', color: '#3ee87a', bg: 'rgba(62,232,122,0.08)',
    points: ['Python for data analysis', 'Working with and visualizing real datasets', 'Intro to machine learning concepts'] },
  { icon: '🎨', title: 'AI Content Creation', tutor: 'Opeyemi', color: '#f5a623', bg: 'rgba(245,166,35,0.08)',
    points: ['Prompt engineering essentials', 'AI image, video & copy tools', 'Building an AI-powered content workflow'] },
  { icon: '🌐', title: 'No-Code Web Design', tutor: 'Odunayo', color: '#8c64ff', bg: 'rgba(140,100,255,0.08)',
    points: ['WordPress, Wix & Shopify', 'Launch a live site without writing code', 'Client-ready design workflows'] },
]

const TUTORS = [
  { name: 'Samuel', role: 'HTML, CSS & JavaScript', color: '#4a9eff' },
  { name: 'Stephen', role: 'Data Science', color: '#3ee87a' },
  { name: 'Opeyemi', role: 'AI Content Creation', color: '#f5a623' },
  { name: 'Odunayo', role: 'No-Code Web Design', color: '#8c64ff' },
]

const STEPS = [
  { n: '1', title: 'Create your free account', body: 'Sign up in under a minute — no payment details, ever.' },
  { n: '2', title: 'Join your live track', body: 'Pick a course and learn directly from a real tutor, live.' },
  { n: '3', title: 'Build & get certified', body: 'Ship real projects and earn a certificate you can show off.' },
]

/* ── Small reusable pieces, defined OUTSIDE the page component ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, inView]
}

function Reveal({ children, delayClass = '', style }) {
  const [ref, inView] = useInView()
  return (
    <div ref={ref} className={inView ? `anim-slide-up ${delayClass}` : ''} style={{ opacity: inView ? undefined : 0, ...style }}>
      {children}
    </div>
  )
}

function Eyebrow({ children, color = '#4a9eff' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: `${color}18`, color, fontSize: '12px', fontWeight: 700, padding: '6px 16px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {children}
    </div>
  )
}

/* ── Main page ── */
export default function Home() {
  const router = useRouter()
  const [width, setWidth] = useState(1200)
  const [checking, setChecking] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f1b2d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="anim-pulse" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600 }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#eef1f6', fontFamily: 'Inter,sans-serif', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <div className="navbar-shell" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '14px 16px' : '18px 48px',
        background: scrolled ? 'rgba(238,241,246,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.04)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '9px', background: 'linear-gradient(135deg,#0f1b2d,#4a9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '14px' }}>{'</>'}</div>
          <span className={display.className} style={{ fontWeight: 700, fontSize: isMobile ? '14px' : '15.5px', color: '#1a1a2e' }}>Apps & Scripts</span>
        </div>
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <span onClick={() => scrollTo('courses')} className="row-hover" style={{ fontSize: '13.5px', fontWeight: 600, color: '#1a1a2e', cursor: 'pointer' }}>Courses</span>
            <span onClick={() => scrollTo('how')} className="row-hover" style={{ fontSize: '13.5px', fontWeight: 600, color: '#1a1a2e', cursor: 'pointer' }}>How it works</span>
            <span onClick={() => scrollTo('tutors')} className="row-hover" style={{ fontSize: '13.5px', fontWeight: 600, color: '#1a1a2e', cursor: 'pointer' }}>Tutors</span>
          </div>
        )}
        <Link href="/auth" style={{ textDecoration: 'none' }}>
          <button className="press-btn" style={{ padding: isMobile ? '9px 16px' : '10px 22px', background: '#0f1b2d', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, fontSize: isMobile ? '13px' : '14px', cursor: 'pointer' }}>Sign In</button>
        </Link>
      </div>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', paddingTop: isMobile ? '90px' : '110px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: isMobile ? 0.55 : 0.9 }}>
          <HeroScene />
        </div>
        <div style={{
          position: 'relative', maxWidth: 1200, margin: '0 auto',
          display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1.05fr 0.95fr',
          gap: isMobile ? '32px' : '40px', alignItems: 'center',
          padding: isMobile ? '20px 20px 60px' : '20px 48px 90px',
        }}>
          <div>
            <Eyebrow>Free live summer bootcamp</Eyebrow>
            <h1 className={display.className} style={{ fontSize: isMobile ? '32px' : isTablet ? '42px' : '54px', fontWeight: 700, color: '#0f1b2d', lineHeight: 1.12, letterSpacing: '-1.2px', margin: '20px 0 18px' }}>
              Code your future.<br />
              <span className="gradient-text">Taught live,</span> built for Nigeria.
            </h1>
            <p style={{ fontSize: isMobile ? '15px' : '17px', color: '#5b6577', lineHeight: 1.65, maxWidth: 480, margin: '0 0 30px' }}>
              Four hands-on tracks — web development, data science, AI content creation, and no-code design. Taught live by real tutors. No laptop-envy, no tuition, ever.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '30px' }}>
              <Link href="/auth" style={{ textDecoration: 'none' }}>
                <button className="press-btn" style={{ padding: isMobile ? '13px 26px' : '15px 32px', background: 'linear-gradient(135deg,#4a9eff,#2563eb)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: isMobile ? '14px' : '15.5px', cursor: 'pointer', boxShadow: '0 10px 28px rgba(74,158,255,0.4)' }}>
                  Get Started Free →
                </button>
              </Link>
              <button onClick={() => scrollTo('how')} className="press-btn" style={{ padding: isMobile ? '13px 26px' : '15px 32px', background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(15,27,45,0.12)', borderRadius: '10px', color: '#0f1b2d', fontWeight: 700, fontSize: isMobile ? '14px' : '15.5px', cursor: 'pointer' }}>
                See how it works
              </button>
            </div>
            <div style={{ display: 'flex', gap: isMobile ? '16px' : '26px', flexWrap: 'wrap' }}>
              {[['4', 'Live courses'], ['4', 'Expert tutors'], ['100%', 'Free, always']].map(([v, l]) => (
                <div key={l}>
                  <div className={display.className} style={{ fontSize: '20px', fontWeight: 700, color: '#0f1b2d' }}>{v}</div>
                  <div style={{ fontSize: '11.5px', color: '#8a94a6', fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {!isMobile && (
            <div className="hover-lift" style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 24px 60px rgba(15,27,45,0.18)', transform: 'rotate(1.2deg)' }}>
              <PhotoFrame
                src="/images/hero-students.jpg"
                alt="Bootcamp students learning to code together"
                style={{ width: '100%', height: isTablet ? 320 : 420 }}
                fallbackIcon="🧑🏿‍💻"
                fallbackLabel="Add /public/images/hero-students.jpg — a real photo of students in a live session"
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 18px', background: 'linear-gradient(0deg,rgba(15,27,45,0.85),transparent)' }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '13.5px' }}>Live cohort session</div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11.5px' }}>Students building real projects, together</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Courses ── */}
      <div id="courses" style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '10px 20px 70px' : '10px 48px 100px' }}>
        <Reveal style={{ marginBottom: '36px', textAlign: isMobile ? 'left' : 'center' }}>
          <Eyebrow color="#8c64ff">What you'll learn</Eyebrow>
          <h2 className={display.className} style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: 700, color: '#1a1a2e', margin: '14px 0 10px', letterSpacing: '-0.6px' }}>Pick your track</h2>
          <p style={{ fontSize: '14.5px', color: '#8a94a6', maxWidth: 460, margin: isMobile ? 0 : '0 auto' }}>Four courses, four tutors, one goal — real, usable skills.</p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4,1fr)', gap: '18px' }}>
          {COURSES.map((c, i) => (
            <Reveal key={c.title} delayClass={`d${Math.min(i + 1, 6)}`}>
              <div className="hover-lift" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px', padding: '26px 22px', height: '100%', boxSizing: 'border-box' }}>
                <div style={{ width: 46, height: 46, borderRadius: '12px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px' }}>{c.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e', marginBottom: '4px' }}>{c.title}</div>
                <div style={{ fontSize: '12px', color: c.color, fontWeight: 700, marginBottom: '14px' }}>with {c.tutor}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {c.points.map(p => (
                    <div key={p} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: c.color, fontSize: '12px', marginTop: '2px' }}>✓</span>
                      <span style={{ fontSize: '12.5px', color: '#5b6577', lineHeight: 1.5 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Community photo section ── */}
      <div style={{ background: '#fff', padding: isMobile ? '60px 20px' : '90px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '0.85fr 1.15fr', gap: isMobile ? '32px' : '48px', alignItems: 'center' }}>
          <Reveal>
            <Eyebrow color="#3ee87a">The community</Eyebrow>
            <h2 className={display.className} style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: 700, color: '#1a1a2e', margin: '14px 0 14px', letterSpacing: '-0.6px' }}>
              Built for Nigeria's next builders
            </h2>
            <p style={{ fontSize: '14.5px', color: '#5b6577', lineHeight: 1.7, marginBottom: '20px' }}>
              Every session is live, small, and hands-on — you're learning alongside other students, not watching a pre-recorded video alone. Ask questions, get real feedback, build things you're proud of.
            </p>
            <Link href="/auth" style={{ textDecoration: 'none' }}>
              <button className="press-btn" style={{ padding: '12px 26px', background: '#0f1b2d', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Join a live cohort →</button>
            </Link>
          </Reveal>
          <Reveal delayClass="d2">
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1.3fr 1fr', gridTemplateRows: isMobile ? 'auto auto' : '1fr 1fr', gap: '14px', height: isMobile ? 'auto' : 380 }}>
              <div className="hover-lift" style={{ gridRow: isMobile ? 'auto' : '1 / 3', borderRadius: '16px', overflow: 'hidden' }}>
                <PhotoFrame src="/images/community-1.jpg" alt="Students collaborating on a coding project" style={{ width: '100%', height: '100%', minHeight: isMobile ? 160 : undefined }} fallbackIcon="🧑🏾‍🤝‍🧑🏿" fallbackLabel="Add /public/images/community-1.jpg" />
              </div>
              <div className="hover-lift" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <PhotoFrame src="/images/community-2.jpg" alt="Student presenting a project" style={{ width: '100%', height: '100%', minHeight: isMobile ? 130 : undefined }} fallbackIcon="🙋🏿" fallbackLabel="Add /public/images/community-2.jpg" />
              </div>
              <div className="hover-lift" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <PhotoFrame src="/images/community-3.jpg" alt="Tutor helping a student" style={{ width: '100%', height: '100%', minHeight: isMobile ? 130 : undefined }} fallbackIcon="🧑🏿‍🏫" fallbackLabel="Add /public/images/community-3.jpg" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── How it works ── */}
      <div id="how" style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? '60px 20px' : '100px 48px' }}>
        <Reveal style={{ textAlign: 'center', marginBottom: '44px' }}>
          <Eyebrow color="#f5a623">Getting started</Eyebrow>
          <h2 className={display.className} style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: 700, color: '#1a1a2e', margin: '14px 0 0', letterSpacing: '-0.6px' }}>Three steps to your first project</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '20px' }}>
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delayClass={`d${i + 1}`}>
              <div className="hover-lift" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '16px', padding: '28px 24px', height: '100%', boxSizing: 'border-box' }}>
                <div className={display.className} style={{ fontSize: '13px', fontWeight: 700, color: '#4a9eff', marginBottom: '14px' }}>STEP {s.n}</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#1a1a2e', marginBottom: '8px' }}>{s.title}</div>
                <div style={{ fontSize: '13px', color: '#8a94a6', lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Tutors ── */}
      <div id="tutors" style={{ background: '#fff', padding: isMobile ? '60px 20px' : '90px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '36px' }}>
            <Eyebrow color="#4a9eff">Who you'll learn from</Eyebrow>
            <h2 className={display.className} style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: 700, color: '#1a1a2e', margin: '14px 0 0', letterSpacing: '-0.6px' }}>Meet your tutors</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: '16px' }}>
            {TUTORS.map((t, i) => (
              <Reveal key={t.name} delayClass={`d${i + 1}`}>
                <div className="hover-lift" style={{ textAlign: 'center', background: '#fafbfc', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '26px 16px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px', background: `linear-gradient(135deg,${t.color},#0f1b2d)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '20px' }}>
                    {t.name[0]}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#1a1a2e', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '11.5px', color: t.color, fontWeight: 600 }}>{t.role}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ position: 'relative', background: '#0f1b2d', overflow: 'hidden', padding: isMobile ? '60px 20px' : '100px 48px' }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(74,158,255,0.18),transparent 70%)' }} className="anim-pulse" />
        <Reveal style={{ position: 'relative', maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
          <h2 className={display.className} style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: 700, color: '#fff', margin: '0 0 14px', letterSpacing: '-0.6px' }}>Ready to start building?</h2>
          <p style={{ fontSize: '14.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '28px' }}>Join the next live cohort — it costs nothing, and you keep everything you build.</p>
          <Link href="/auth" style={{ textDecoration: 'none' }}>
            <button className="press-btn" style={{ padding: '15px 36px', background: 'linear-gradient(135deg,#4a9eff,#2563eb)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '15.5px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(74,158,255,0.4)' }}>
              Get Started Free →
            </button>
          </Link>
        </Reveal>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: '#0a141f', padding: isMobile ? '32px 20px' : '36px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : 0, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg,#0f1b2d,#4a9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '12px' }}>{'</>'}</div>
            <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)' }}>© 2026 Apps & Scripts Summer Bootcamp</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span onClick={() => scrollTo('courses')} style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Courses</span>
            <span onClick={() => scrollTo('tutors')} style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Tutors</span>
            <Link href="/auth" style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}