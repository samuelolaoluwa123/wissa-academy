'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { supabase } from '../../lib/supabase'

function DashIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/></svg>)
}
function CoursesIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>)
}
function ExploreIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>)
}
function QuizIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1a3 3 0 0 1 1 5.83V9H7V6.83A3 3 0 0 1 8 1z" fill="currentColor" opacity=".7"/><circle cx="8" cy="12" r="1.2" fill="currentColor"/></svg>)
}
function MsgIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5l-3 2V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/></svg>)
}
function CertIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="7" r="4" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M5.5 11l-1 4 3.5-1.5L11.5 15l-1-4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/></svg>)
}
function ProgressIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)
}
function TrophyIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 2h8v3a4 4 0 0 1-8 0V2z" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M4 3H2v1a3 3 0 0 0 2 2.8M12 3h2v1a3 3 0 0 1-2 2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 9v3M6 14h4M6.5 12h3l.5 2h-4l.5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>)
}
function CalendarIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>)
}
function SettingsIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="none"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>)
}

const studentNav = [
  { section:'MAIN', items:[
    { label:'Dashboard',       href:'/student/dashboard',           icon:'dash' },
    { label:'My Courses',      href:'/student/my-courses',          icon:'courses' },
    { label:'Explore Courses', href:'/courses',                     icon:'explore' },
    { label:'Quizzes',         href:'/student/quizzes',             icon:'quiz' },
    { label:'Live Classes',    href:'/student/live-classes',        icon:'calendar' },
  ]},
  { section:'ACHIEVEMENTS', items:[
    { label:'Certificates',    href:'/student/certificates/cert-1', icon:'cert' },
    { label:'Progress Report', href:'/student/progress',            icon:'progress' },
    { label:'Leaderboard',     href:'/student/leaderboard',         icon:'trophy' },
  ]},
  { section:'ACCOUNT', items:[
    { label:'Settings',        href:'/student/settings',            icon:'settings' },
  ]},
]

const instructorNav = [
  { section:'MAIN', items:[
    { label:'Dashboard',      href:'/instructor/dashboard',       icon:'dash' },
    { label:'My Courses',     href:'/courses',                    icon:'courses' },
    { label:'Create Course',  href:'/instructor/create-course',   icon:'explore' },
  ]},
  { section:'EARNINGS', items:[
    { label:'Transactions',   href:'/instructor/dashboard',       icon:'cert' },
    { label:'Analytics',      href:'/instructor/dashboard',       icon:'progress' },
  ]},
  { section:'ACCOUNT', items:[
    { label:'Settings',       href:'/instructor/settings',        icon:'settings' },
  ]},
]

function NavIcon({ name }) {
  if (name==='dash')     return <DashIcon />
  if (name==='courses')  return <CoursesIcon />
  if (name==='explore')  return <ExploreIcon />
  if (name==='quiz')     return <QuizIcon />
  if (name==='msg')      return <MsgIcon />
  if (name==='cert')     return <CertIcon />
  if (name==='progress') return <ProgressIcon />
  if (name==='trophy')   return <TrophyIcon />
  if (name==='calendar') return <CalendarIcon />
  if (name==='settings') return <SettingsIcon />
  return null
}

export default function Sidebar({ role: roleProp, isMobile, isTablet, mobileOpen, onClose }) {
  const pathname   = usePathname()
  const router     = useRouter()
  const { fullName, initials, role: userRole, avatarUrl, loading } = useCurrentUser()
  const role       = roleProp || userRole || 'student'
  const showLabels = !isTablet
  const sidebarWidth = isTablet ? '72px' : '220px'
  const nav        = role === 'instructor' ? instructorNav : studentNav
  const roleLabel  = role === 'instructor' ? 'Instructor' : 'Student'
  const dashHref   = role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'
  const displayName = loading ? '...' : fullName
  const displayInitials = loading ? '··' : initials

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const transform = isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)'

  return (
    <aside style={{ position:'fixed', top:0, left:0, height:'100vh', width:sidebarWidth, background:'#0f1b2d', display:'flex', flexDirection:'column', transform, transition:'transform 0.28s ease', zIndex:200, overflowY:'auto', overflowX:'hidden' }}>

      <div style={{ height:64, flexShrink:0, display:'flex', alignItems:'center', padding: isTablet ? '0' : '0 12px 0 16px', justifyContent: isTablet ? 'center' : 'space-between', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <Link href={dashHref} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'10px', minWidth:0 }}>
          <div style={{ width:34, height:34, borderRadius:'10px', flexShrink:0, background:'linear-gradient(135deg,#4a9eff,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M8 4L3 10L8 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
              <path d="M12.5 3.5L7.5 16.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.55"/>
              <path d="M12 4L17 10L12 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
            </svg>
          </div>
          {showLabels && <span style={{ color:'#fff', fontWeight:700, fontSize:'14.5px', letterSpacing:'-0.2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Apps & Scripts</span>}
        </Link>
        {isMobile && (
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', cursor:'pointer', width:30, height:30, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.75)', fontSize:'16px', lineHeight:1, flexShrink:0 }} aria-label="Close menu">✕</button>
        )}
      </div>

      <nav style={{ flex:1, padding:'8px 0', overflowY:'auto' }}>
        {nav.map((section) => (
          <div key={section.section} style={{ marginBottom:'8px' }}>
            {showLabels && <div style={{ fontSize:'10.5px', fontWeight:700, color:'rgba(255,255,255,0.28)', letterSpacing:'1px', padding:'10px 20px 4px' }}>{section.section}</div>}
            {section.items.map((item) => {
              const active = pathname === item.href
              return (
                <Link key={item.label} href={item.href} onClick={isMobile ? onClose : undefined} className={`nav-item${active ? ' active' : ''}`} style={{ display:'flex', alignItems:'center', gap:'10px', padding: isTablet ? '11px 0' : '10px 20px', justifyContent: isTablet ? 'center' : 'flex-start', background: active ? 'rgba(74,158,255,0.13)' : 'transparent', borderLeft: active && !isTablet ? '3px solid #4a9eff' : '3px solid transparent', textDecoration:'none', position:'relative', transition:'background 0.18s ease, border-color 0.18s ease' }} title={isTablet ? item.label : undefined}>
                  <span style={{ color: active ? '#4a9eff' : 'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', flexShrink:0, transition:'color 0.18s ease' }}><NavIcon name={item.icon} /></span>
                  {showLabels && <span style={{ fontSize:'13.5px', fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.65)', whiteSpace:'nowrap', flex:1, transition:'color 0.18s ease' }}>{item.label}</span>}
                  {item.dot && showLabels && <span style={{ width:7, height:7, borderRadius:'50%', background:'#e84040', flexShrink:0 }} />}
                  {item.dot && isTablet && <span style={{ position:'absolute', top:8, right:10, width:7, height:7, borderRadius:'50%', background:'#e84040' }} />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding: isTablet ? '12px 0' : '12px 16px', flexShrink:0 }}>
        <button
          onClick={handleLogout}
          title={isTablet ? 'Logout' : undefined}
          className="logout-btn"
          style={{
            width:'100%', display:'flex', alignItems:'center', gap:'10px',
            justifyContent: isTablet ? 'center' : 'flex-start',
            padding: isTablet ? '10px 0' : '9px 10px',
            background:'none', border:'none', cursor:'pointer',
            borderRadius:'8px', marginBottom:'10px',
            transition:'background 0.18s ease',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, color:'rgba(255,255,255,0.5)' }}>
            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 11l3-3-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {showLabels && <span style={{ fontSize:'13.5px', fontWeight:500, color:'rgba(255,255,255,0.6)' }}>Logout</span>}
        </button>

        {showLabels && (
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px', background:'rgba(255,255,255,0.05)', borderRadius:'10px' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'#1e3a5f', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#4a9eff', overflow:'hidden' }}>
              {avatarUrl ? <img src={avatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : displayInitials}
            </div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{displayName}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)' }}>{roleLabel}</div>
            </div>
          </div>
        )}
        {isTablet && (
          <div style={{ display:'flex', justifyContent:'center' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'#1e3a5f', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:700, color:'#4a9eff', overflow:'hidden' }}>
              {avatarUrl ? <img src={avatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : displayInitials}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        :global(.nav-item:not(.active):hover) {
          background: rgba(255, 255, 255, 0.06) !important;
        }
        :global(.logout-btn:hover) {
          background: rgba(232, 64, 64, 0.1) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.nav-item), :global(.logout-btn) { transition: none !important; }
        }
      `}</style>
    </aside>
  )
}