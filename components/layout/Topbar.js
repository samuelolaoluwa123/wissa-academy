'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function Topbar({ role: roleProp, isMobile, isTablet, onHamburger, sidebarWidth }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const { initials, role: userRole, avatarUrl, fullName, loading } = useCurrentUser()
  const role = roleProp || userRole || 'student'
  const settingsHref = role === 'instructor' ? '/instructor/settings' : '/student/settings'
  const dashHref     = role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard'
  const displayInitials = loading ? '··' : initials

  return (
    <header style={{ position:'fixed', top:0, left: isMobile ? 0 : sidebarWidth, right:0, height:64, background:'#0f1b2d', display:'flex', alignItems:'center', padding: isMobile ? '0 16px' : '0 32px', gap:'14px', zIndex:100, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>

      {isMobile && (
        <button onClick={onHamburger} style={{ background:'none', border:'none', cursor:'pointer', color:'#fff', padding:'4px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }} aria-label="Toggle menu">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h16M3 16h16" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      )}

      {isMobile && (
        <Link href={dashHref} style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{ width:30, height:30, borderRadius:'8px', background:'linear-gradient(135deg,#4a9eff,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M8 4L3 10L8 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
              <path d="M12.5 3.5L7.5 16.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.55"/>
              <path d="M12 4L17 10L12 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
            </svg>
          </div>
          <span style={{ color:'#fff', fontWeight:700, fontSize:'14px', whiteSpace:'nowrap' }}>Apps & Scripts</span>
        </Link>
      )}

      <div style={{ flex:1 }} />

      <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
        <div style={{ position:'relative' }}>
          <button onClick={() => setNotifOpen(o => !o)} style={{ background:'none', border:'none', cursor:'pointer', width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.75)', position:'relative' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
              <path d="M8 15.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span style={{ position:'absolute', top:'7px', right:'7px', width:8, height:8, borderRadius:'50%', background:'#e84040', border:'2px solid #0f1b2d' }} />
          </button>

          {notifOpen && (
            <div style={{ position:'absolute', top:'46px', right:0, background:'#fff', borderRadius:'14px', width:'290px', boxShadow:'0 8px 32px rgba(0,0,0,0.15)', border:'1px solid rgba(0,0,0,0.07)', zIndex:999, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px 10px', fontWeight:700, fontSize:'13.5px', color:'#1a1a2e', borderBottom:'1px solid #f0f0f0' }}>Notifications</div>
              {[
                { text:'New lesson added to your course', time:'2 min ago', dot:'#4a9eff' },
                { text:'Your quiz result is ready', time:'1 hr ago', dot:'#3ee87a' },
                { text:'Live class starting soon', time:'3 hrs ago', dot:'#8c64ff' },
              ].map((n,i) => (
                <div key={i} style={{ padding:'11px 18px', display:'flex', gap:'10px', alignItems:'flex-start', borderBottom:'1px solid #f8f8f8' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:n.dot, marginTop:5, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:'13px', color:'#1a1a2e', lineHeight:1.4 }}>{n.text}</div>
                    <div style={{ fontSize:'11.5px', color:'#8a94a6', marginTop:3 }}>{n.time}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding:'10px 18px', textAlign:'center' }}><span style={{ fontSize:'12.5px', color:'#4a9eff', cursor:'pointer', fontWeight:600 }}>View all</span></div>
            </div>
          )}
        </div>

        {/* Messages icon removed — messaging feature coming in Phase D */}

        <Link href={settingsHref} style={{ textDecoration:'none' }}>
          <div title={fullName} style={{ width:36, height:36, borderRadius:'50%', background:'#1e3a5f', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, color:'#4a9eff', cursor:'pointer', border:'2px solid rgba(74,158,255,0.25)', marginLeft:'2px', overflow:'hidden' }}>
            {avatarUrl ? <img src={avatarUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : displayInitials}
          </div>
        </Link>
      </div>
    </header>
  )
}