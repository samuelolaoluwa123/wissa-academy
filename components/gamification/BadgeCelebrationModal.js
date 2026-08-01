'use client'
import { useEffect, useState } from 'react'

// Shows a queue of newly-earned badges one at a time.
// Props:
//   badges: array of badge rows to celebrate (can be empty/null)
//   onDone: called once all badges in the queue have been dismissed

export default function BadgeCelebrationModal({ badges, onDone }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [badges])

  if (!badges || badges.length === 0) return null

  const badge = badges[index]
  const isLast = index === badges.length - 1

  function handleNext() {
    if (isLast) {
      onDone?.()
    } else {
      setIndex(i => i + 1)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,27,45,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, padding: '20px',
      }}
      onClick={handleNext}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px', padding: '36px 32px',
          maxWidth: 360, width: '100%', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'badgePopIn 0.35s ease',
        }}
      >
        <style>{`
          @keyframes badgePopIn {
            0% { transform: scale(0.85); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        <div style={{ fontSize: '12px', fontWeight: 700, color: '#8c64ff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
          🎉 New Badge Earned
        </div>

        <div style={{
          width: 88, height: 88, borderRadius: '50%', margin: '0 auto 18px',
          background: 'linear-gradient(135deg, rgba(140,100,255,0.15), rgba(74,158,255,0.15))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px',
        }}>
          {badge.icon || '🏅'}
        </div>

        <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
          {badge.name}
        </h2>
        <p style={{ fontSize: '13.5px', color: '#8a94a6', margin: '0 0 16px', lineHeight: 1.5 }}>
          {badge.description}
        </p>

        {badge.xp_reward > 0 && (
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
            background: 'rgba(74,158,255,0.1)', color: '#4a9eff', fontSize: '13px', fontWeight: 700, marginBottom: '22px',
          }}>
            +{badge.xp_reward} XP
          </div>
        )}

        <button
          onClick={handleNext}
          style={{
            width: '100%', padding: '13px', background: 'linear-gradient(135deg,#4a9eff,#2563eb)',
            border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
          }}
        >
          {isLast ? 'Awesome!' : `Next (${index + 2} of ${badges.length}) →`}
        </button>
      </div>
    </div>
  )
}