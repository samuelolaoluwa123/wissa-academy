'use client'
import { useState, useEffect } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

export default function DashboardShell({ children, role = 'student' }) {
  const [width, setWidth] = useState(1200)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024
  const sidebarWidth = isTablet ? 72 : 220

  return (
    <div style={{ minHeight:'100vh', background:'#eef1f6', fontFamily:'Inter, sans-serif' }}>
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:199 }} />
      )}

      <Sidebar role={role} isMobile={isMobile} isTablet={isTablet} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Topbar role={role} isMobile={isMobile} isTablet={isTablet} onHamburger={() => setMobileOpen(o => !o)} sidebarWidth={sidebarWidth} />

      <main style={{ marginLeft: isMobile ? 0 : sidebarWidth, paddingTop:64, minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  )
}