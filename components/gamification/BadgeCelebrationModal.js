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
      className="celebration-backdrop"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,27,45,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, padding: '20px',
      }}
      onClick={handleNext}
    >
      <div
        key={badge.id || index}
        onClick={e => e.stopPropagation()}
        className="celebration-card"
        style={{
          background: '#fff', borderRadius: '20px', padding: '36px 32px',
          maxWidth: 360, width: '100%', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#8c64ff', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
          🎉 New Badge Earned
        </div>

        <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 18px' }}>
          <span className="celebration-ring r1" />
          <span className="celebration-ring r2" />
          <div className="celebration-icon" style={{
            position: 'relative', width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(140,100,255,0.15), rgba(74,158,255,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px',
          }}>
            {badge.icon || '🏅'}
          </div>
        </div>

        <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#1a1a2e', margin: '0 0 8px' }}>
          {badge.name}
        </h2>
        <p style={{ fontSize: '13.5px', color: '#8a94a6', margin: '0 0 16px', lineHeight: 1.5 }}>
          {badge.description}
        </p>

        {badge.xp_reward > 0 && (
          <div className="celebration-xp" style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
            background: 'rgba(74,158,255,0.1)', color: '#4a9eff', fontSize: '13px', fontWeight: 700, marginBottom: '22px',
          }}>
            +{badge.xp_reward} XP
          </div>
        )}

        {badges.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '18px' }}>
            {badges.map((_, i) => (
              <span key={i} style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 3, background: i === index ? '#4a9eff' : '#e2e6ed', transition: 'width 0.25s ease, background 0.25s ease' }} />
            ))}
          </div>
        )}

        <button
          onClick={handleNext}
          className="press-btn"
          style={{
            width: '100%', padding: '13px', background: 'linear-gradient(135deg,#4a9eff,#2563eb)',
            border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
          }}
        >
          {isLast ? 'Awesome!' : `Next (${index + 2} of ${badges.length}) →`}
        </button>
      </div>

      <style jsx>{`
        .celebration-backdrop {
          animation: celebrationFadeIn 0.25s ease both;
        }
        .celebration-card {
          animation: celebrationPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .celebration-icon {
          animation: celebrationIconIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
        }
        .celebration-xp {
          animation: celebrationFadeIn 0.35s ease 0.3s both;
        }
        .celebration-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid rgba(140,100,255,0.4);
          animation: celebrationRing 1.4s ease-out 0.2s infinite;
        }
        .celebration-ring.r2 {
          animation-delay: 0.6s;
        }

        @keyframes celebrationFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes celebrationPopIn {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes celebrationIconIn {
          from { opacity: 0; transform: scale(0.4) rotate(-15deg); }
          to   { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes celebrationRing {
          from { opacity: 0.6; transform: scale(1); }
          to   { opacity: 0; transform: scale(1.6); }
        }

        @media (prefers-reduced-motion: reduce) {
          .celebration-backdrop, .celebration-card, .celebration-icon, .celebration-xp, .celebration-ring {
            animation: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}