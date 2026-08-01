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
        <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>Leaderboard</h1>
        <p style={{ fontSize: '13.5px', color: '#8a94a6', margin: '0 0 24px' }}>
          Top learners ranked by XP earned across the bootcamp.
        </p>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8a94a6', fontSize: '14px' }}>Loading leaderboard...</div>
        ) : rows.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)', padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏆</div>
            <div style={{ fontSize: '14px', color: '#8a94a6' }}>No XP earned yet — be the first on the board!</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            {rows.map((row, i) => {
              const isMe = row.id === userId
              return (
                <div
                  key={row.id}
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
        )}
      </div>
    </DashboardShell>
  )
}