'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardShell from '../../../components/layout/DashboardShell'
import { supabase } from '../../../lib/supabase'

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const router = useRouter()
  const [width, setWidth] = useState(1200)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    loadLeaderboard()
  }, [])

  async function loadLeaderboard() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    setUserId(session.user.id)

    const { data } = await supabase.rpc('get_leaderboard', { limit_count: 50 })
    setRows(data || [])
    setLoading(false)
  }

  const isMobile = width <= 768

  return (
    <DashboardShell role="student">
      <div style={{ padding: isMobile ? '20px 16px' : '32px 40px' }}>
        <h1 className="anim-slide-up" style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>Leaderboard</h1>
        <p className="anim-slide-up" style={{ fontSize: '13.5px', color: '#8a94a6', margin: '0 0 24px' }}>
          Top learners ranked by XP earned across the bootcamp.
        </p>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="anim-pulse" style={{ fontSize: '28px', marginBottom: '10px' }}>🏆</div>
            <div style={{ color: '#8a94a6', fontSize: '14px' }}>Loading leaderboard...</div>
          </div>
        ) : rows.length === 0 ? (
          <div className="anim-fade-in" style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
            <div style={{ fontSize: '14px', color: '#8a94a6' }}>No XP earned yet — be the first on the board!</div>
          </div>
        ) : (
          <>
            {/* Podium for top 3 */}
            {rows.length > 0 && !isMobile && (
              <div className="anim-slide-up" style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:'16px', marginBottom:'28px', padding:'0 20px' }}>
                {[rows[1], rows[0], rows[2]].map((row, idx) => {
                  if (!row) return <div key={idx} style={{ width:150 }} />
                  const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3
                  const height = rank === 1 ? 150 : rank === 2 ? 118 : 96
                  const bg = rank === 1 ? 'linear-gradient(135deg,#f5a623,#e8901a)' : rank === 2 ? 'linear-gradient(135deg,#b8c2d0,#8a94a6)' : 'linear-gradient(135deg,#d98a5a,#b5643a)'
                  const isMe = row.id === userId
                  return (
                    <div key={row.id} className={`anim-scale-in d${rank}`} style={{ width:150, display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ fontSize: rank===1 ? '26px' : '20px', marginBottom:'6px' }}>{MEDALS[rank-1]}</div>
                      <div className="hover-lift" style={{ width: rank===1?56:46, height: rank===1?56:46, borderRadius:'50%', background:'#1e3a5f', marginBottom:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:700, color:'#4a9eff', overflow:'hidden', border: isMe ? '2.5px solid #4a9eff' : '2.5px solid #fff', boxShadow:'0 2px 10px rgba(0,0,0,0.1)' }}>
                        {row.avatar_url ? <img src={row.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (row.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontSize:'12.5px', fontWeight:700, color:'#1a1a2e', textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:130, marginBottom:'2px' }}>
                        {row.full_name}{isMe && <span style={{ color:'#4a9eff' }}> (You)</span>}
                      </div>
                      <div style={{ fontSize:'12px', fontWeight:800, color:'#4a9eff', marginBottom:'10px' }}>{row.xp_points?.toLocaleString() || 0} XP</div>
                      <div style={{ width:'100%', height, background: bg, borderRadius:'10px 10px 0 0', display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'10px' }}>
                        <span style={{ fontSize:'22px', fontWeight:900, color:'rgba(255,255,255,0.85)' }}>{rank}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            {rows.map((row, i) => {
              const isMe = row.id === userId
              return (
                <div
                  key={row.id}
                  className={`row-hover anim-fade-in d${Math.min(i+1,6)}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: isMobile ? '12px 16px' : '14px 22px',
                    borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none',
                    background: isMe ? 'rgba(74,158,255,0.06)' : 'transparent',
                  }}
                >
                  <div style={{ width: 32, textAlign: 'center', fontSize: i < 3 ? '20px' : '14px', fontWeight: 700, color: '#8a94a6', flexShrink: 0 }}>
                    {MEDALS[i] || `#${row.rank}`}
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e3a5f', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#4a9eff', overflow: 'hidden' }}>
                    {row.avatar_url
                      ? <img src={row.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (row.full_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: isMe ? 700 : 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.full_name}{isMe && <span style={{ color: '#4a9eff' }}> (You)</span>}
                    </div>
                    {row.streak_days > 0 && (
                      <div style={{ fontSize: '11.5px', color: '#f5a623' }}>🔥 {row.streak_days} day streak</div>
                    )}
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#4a9eff', flexShrink: 0 }}>
                    {row.xp_points?.toLocaleString() || 0} <span style={{ fontSize: '11px', fontWeight: 600, color: '#8a94a6' }}>XP</span>
                  </div>
                </div>
              )
            })}
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}