'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import DashboardShell from '../../../../components/layout/DashboardShell'
import { supabase } from '../../../../lib/supabase'

export default function CertificatePage() {
  const params   = useParams()
  const router   = useRouter()
  const certId   = params?.id

  const [width, setWidth]   = useState(1200)
  const [cert, setCert]     = useState(null)
  const [allCerts, setAllCerts] = useState([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => { loadCertificates() }, [certId])

  async function loadCertificates() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }

    const { data } = await supabase
      .from('certificates')
      .select('*, course:courses(title, category, gradient, icon), student:profiles(full_name)')
      .eq('student_id', session.user.id)
      .order('issued_at', { ascending: false })

    if (data) {
      setAllCerts(data)
      const current = certId && certId !== 'cert-1'
        ? data.find(c => c.id === certId)
        : data[0]
      setCert(current || null)
    }
    setLoading(false)
  }

  const isMobile = width <= 768
  const isTablet = width > 768 && width <= 1024

  function handleCopy() {
    if (!cert) return
    navigator.clipboard.writeText(`https://appsandscripts.bootcamp/verify/${cert.credential_id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <DashboardShell role="student">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80vh' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>⏳</div>
            <div style={{ fontSize:'14px', color:'#8a94a6' }}>Loading certificates...</div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!cert) {
    return (
      <DashboardShell role="student">
        <div style={{ padding: isMobile ? '20px 16px' : '40px', maxWidth:600, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:'64px', marginBottom:'16px' }}>🏆</div>
          <h1 style={{ fontSize:'22px', fontWeight:800, color:'#1a1a2e', margin:'0 0 10px' }}>No certificates yet</h1>
          <p style={{ fontSize:'14px', color:'#8a94a6', marginBottom:'24px', lineHeight:1.6 }}>
            Complete a course that offers certificates to earn your first one. Keep learning!
          </p>
          <Link href="/courses" style={{ textDecoration:'none' }}>
            <button style={{ padding:'11px 28px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>Browse Courses</button>
          </Link>
        </div>
      </DashboardShell>
    )
  }

  const gradeColor = cert.grade === 'Distinction' ? '#8c64ff' : cert.grade === 'Merit' ? '#4a9eff' : '#3ee87a'
  const issueDate  = new Date(cert.issued_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })

  return (
    <DashboardShell role="student">
      <div style={{ paddingTop: isMobile ? '20px' : '32px', paddingLeft: isMobile ? '16px' : '40px', paddingRight: isMobile ? '16px' : '40px', paddingBottom:'40px', maxWidth:900, margin:'0 auto' }}>

        <div style={{ marginBottom:'24px' }}>
          <Link href="/student/dashboard" style={{ color:'#8a94a6', fontSize:'13px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'6px', marginBottom:'12px' }}>← Back to Dashboard</Link>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight:800, color:'#1a1a2e', margin:'0 0 4px' }}>Certificate of Completion</h1>
          <p style={{ fontSize:'14px', color:'#8a94a6', margin:0 }}>Share your achievement</p>
        </div>

        {/* Certificate */}
        <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,0.07)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 16px 48px rgba(0,0,0,0.1)', marginBottom:'28px', position:'relative' }}>
          <div style={{ height:'8px', background:'linear-gradient(90deg,#4a9eff,#8c64ff,#3ee87a)' }} />
          <div style={{ paddingTop: isMobile ? '32px' : '52px', paddingBottom: isMobile ? '36px' : '56px', paddingLeft: isMobile ? '24px' : '64px', paddingRight: isMobile ? '24px' : '64px', position:'relative', overflow:'hidden' }}>
            {/* Watermark */}
            <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize: isMobile ? '80px' : '140px', fontWeight:900, color:'rgba(74,158,255,0.04)', userSelect:'none', whiteSpace:'nowrap', letterSpacing:'-4px' }}>A&amp;S</div>

            {/* Corner decorations */}
            {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
              <div key={`${v}${h}`} style={{ position:'absolute', [v]:20, [h]:20, width:36, height:36, borderTop: v==='top' ? '2.5px solid rgba(140,100,255,0.2)' : 'none', borderBottom: v==='bottom' ? '2.5px solid rgba(140,100,255,0.2)' : 'none', borderLeft: h==='left' ? '2.5px solid rgba(140,100,255,0.2)' : 'none', borderRight: h==='right' ? '2.5px solid rgba(140,100,255,0.2)' : 'none' }} />
            ))}

            <div style={{ position:'relative', textAlign:'center' }}>
              {/* Logo */}
              <div style={{ width:56, height:56, borderRadius:'16px', background:'linear-gradient(135deg,#4a9eff,#1e3a5f)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
                  <path d="M8 4L3 10L8 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
                  <path d="M12.5 3.5L7.5 16.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.55"/>
                  <path d="M12 4L17 10L12 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
                </svg>
              </div>
              <div style={{ fontWeight:800, fontSize:'18px', color:'#0f1b2d', letterSpacing:'-0.3px' }}>Apps & Scripts Summer Bootcamp</div>
              <div style={{ fontSize:'11px', color:'#8a94a6', marginTop:'3px', letterSpacing:'1px', textTransform:'uppercase' }}>Practical Tech Skills Bootcamp</div>

              <div style={{ marginTop: isMobile ? '24px' : '36px', marginBottom: isMobile ? '24px' : '36px' }}>
                <div style={{ fontSize:'11px', letterSpacing:'3px', textTransform:'uppercase', color:'#8a94a6', fontWeight:700, marginBottom:'10px' }}>This certifies that</div>
                <div style={{ fontSize: isMobile ? '26px' : '38px', fontWeight:900, color:'#0f1b2d', letterSpacing:'-1px', lineHeight:1.1, marginBottom:'16px', fontStyle:'italic' }}>
                  {cert.student?.full_name}
                </div>
                <div style={{ fontSize:'11px', letterSpacing:'3px', textTransform:'uppercase', color:'#8a94a6', fontWeight:700, marginBottom:'10px' }}>has successfully completed</div>
                <div style={{ fontSize: isMobile ? '17px' : '22px', fontWeight:800, color:'#0f1b2d', marginBottom:'10px', maxWidth:480, margin:'0 auto 10px' }}>
                  {cert.course?.title}
                </div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginTop:'8px' }}>
                  <span style={{ background:`${gradeColor}20`, color:gradeColor, fontWeight:700, fontSize:'13px', padding:'4px 14px', borderRadius:'20px' }}>{cert.grade}</span>
                  {cert.score_pct && <span style={{ color:'#8a94a6', fontSize:'13px' }}>Score: {cert.score_pct}%</span>}
                </div>
              </div>

              <div style={{ width:'100%', height:'1px', background:'linear-gradient(90deg,transparent,rgba(140,100,255,0.2),transparent)', margin:'0 0 28px' }} />

              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? '20px' : '0' }}>
                {[
                  { label:'Credential ID', val:cert.credential_id },
                  { label:'Date Issued',   val:issueDate },
                  { label:'Category',      val:cert.course?.category },
                ].map(item => (
                  <div key={item.label} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'14px', fontWeight:700, color:'#1a1a2e', marginBottom:'4px' }}>{item.val}</div>
                    <div style={{ width:'80px', height:'1.5px', background:'#e2e6ed', margin:'8px auto' }} />
                    <div style={{ fontSize:'11px', color:'#8a94a6', textTransform:'uppercase', letterSpacing:'0.5px' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ height:'4px', background:'linear-gradient(90deg,#3ee87a,#4a9eff,#8c64ff)' }} />
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', marginBottom:'32px' }}>
          <button onClick={() => window.print()} style={{ paddingTop:'11px', paddingBottom:'11px', paddingLeft:'24px', paddingRight:'24px', background:'linear-gradient(135deg,#4a9eff,#2563eb)', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', boxShadow:'0 4px 14px rgba(74,158,255,0.35)' }}>
            ⬇ Download PDF
          </button>
          <button onClick={handleCopy} style={{ paddingTop:'11px', paddingBottom:'11px', paddingLeft:'24px', paddingRight:'24px', background: copied ? 'rgba(62,232,122,0.13)' : '#fff', border:`1.5px solid ${copied ? '#3ee87a' : '#e2e6ed'}`, borderRadius:'10px', color: copied ? '#3ee87a' : '#1a1a2e', fontWeight:600, fontSize:'14px', cursor:'pointer' }}>
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
        </div>

        {/* All certificates */}
        {allCerts.length > 1 && (
          <div>
            <h2 style={{ fontSize:'17px', fontWeight:700, color:'#1a1a2e', margin:'0 0 16px' }}>All Certificates</h2>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap:'14px' }}>
              {allCerts.map(c => (
                <Link key={c.id} href={`/student/certificates/${c.id}`} style={{ textDecoration:'none' }}>
                  <div style={{ background:'#fff', border:`1.5px solid ${c.id === cert.id ? '#8c64ff' : 'rgba(0,0,0,0.07)'}`, borderRadius:'12px', padding:'16px', display:'flex', gap:'14px', alignItems:'center', cursor:'pointer' }}>
                    <div style={{ width:44, height:44, borderRadius:'12px', flexShrink:0, background: c.id === cert.id ? 'rgba(140,100,255,0.12)' : 'rgba(74,158,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>🏆</div>
                    <div style={{ flex:1, overflow:'hidden' }}>
                      <div style={{ fontWeight:600, fontSize:'14px', color:'#1a1a2e', marginBottom:'3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.course?.title}</div>
                      <div style={{ fontSize:'12px', color:'#8a94a6' }}>{new Date(c.issued_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })} · {c.grade}</div>
                    </div>
                    {c.id === cert.id && (
                      <span style={{ fontSize:'11px', fontWeight:700, color:'#8c64ff', background:'rgba(140,100,255,0.12)', padding:'3px 10px', borderRadius:'20px', flexShrink:0 }}>Viewing</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}