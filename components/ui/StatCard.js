'use client'

import { useState } from 'react'

export default function StatCard({ label, value, pill, pillColor = 'blue', dark = false }) {
  const [hovered, setHovered] = useState(false)

  const pillColors = {
    green:  { bg: 'rgba(62,232,122,0.15)',  color: '#1a8a46' },
    blue:   { bg: 'rgba(74,158,255,0.13)',  color: '#1a5fa8' },
    amber:  { bg: 'rgba(245,166,35,0.13)',  color: '#9a6010' },
    purple: { bg: 'rgba(140,100,255,0.13)', color: '#5a28c8' },
    white:  { bg: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' },
  }

  const isNavy = dark || hovered
  const pc = (isNavy && pillColor !== 'white') ? pillColors.white : pillColors[pillColor]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isNavy ? '#1a2d45' : '#ffffff',
        border: isNavy ? 'transparent' : '1px solid rgba(0,0,0,0.07)',
        borderRadius: '14px',
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'background 0.2s, transform 0.18s, border-color 0.2s',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
    >
      <div style={{
        fontSize: '11px', fontWeight: 600,
        letterSpacing: '0.6px', textTransform: 'uppercase',
        color: isNavy ? 'rgba(255,255,255,0.45)' : '#8a94a6',
        marginBottom: '8px',
        transition: 'color 0.2s',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '28px', fontWeight: 300,
        letterSpacing: '-1px', lineHeight: 1,
        color: isNavy ? '#ffffff' : '#1a1a2e',
        transition: 'color 0.2s',
      }}>
        {value}
      </div>
      {pill && (
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          marginTop: '8px', padding: '3px 9px',
          borderRadius: '20px', fontSize: '11px', fontWeight: 600,
          background: pc.bg, color: pc.color,
          transition: 'all 0.2s',
        }}>
          {pill}
        </div>
      )}
    </div>
  )
}