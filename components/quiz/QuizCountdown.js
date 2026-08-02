'use client'

import { useState, useEffect } from 'react'
import { getQuizWindowState, formatCountdown } from '../../lib/quizSchedule'

// Displays quiz window status with a live-ticking countdown.
// Drop this into the student quiz sidebar link / quiz intro screen.
// Props:
//   quiz: { scheduled_start, scheduled_end, title }
//   onStart: () => void   — called when student clicks "Start Quiz" while live

export default function QuizCountdown({ quiz, onStart }) {
  const [width, setWidth] = useState(1200)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    setWidth(window.innerWidth)
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tick)
  }, [])

  const isMobile = width <= 768
  const state = getQuizWindowState(quiz)

  const containerStyle = {
    backgroundColor: '#1a2d45',
    borderRadius: 12,
    padding: isMobile ? 16 : 20,
    color: '#ffffff',
  }
  const labelStyle = {
    fontSize: 13,
    color: '#8a94a6',
    marginBottom: 6,
  }

  const valueStyle = {
    fontSize: isMobile ? 18 : 22,
    fontWeight: 700,
  }

  if (state.status === 'unscheduled') {
    return (
      <div className="anim-fade-in" style={containerStyle}>
        <div style={labelStyle}>Quiz Status</div>
        <div style={{ ...valueStyle, color: '#8a94a6' }}>
          Schedule not yet set by tutor
        </div>
      </div>
    )
  }

  if (state.status === 'upcoming') {
    return (
      <div className="anim-fade-in" style={containerStyle}>
        <div style={labelStyle}>Quiz Status</div>
        <div style={{ ...valueStyle, color: '#f5a623' }}>
          Quiz opens in {formatCountdown(state.msUntilStart)}
        </div>
      </div>
    )
  }

  if (state.status === 'live') {
    return (
      <div className="anim-fade-in" style={containerStyle}>
        <div style={{ ...labelStyle, display:'flex', alignItems:'center', gap:'6px' }}>
          <span className="anim-pulse" style={{ width:7, height:7, borderRadius:'50%', background:'#3ee87a', display:'inline-block' }} />
          Quiz Status
        </div>
        <div style={{ ...valueStyle, color: '#3ee87a', marginBottom: 12 }}>
          Quiz is live — closes in {formatCountdown(state.msUntilEnd)}
        </div>
        <button
          onClick={onStart}
          className="press-btn"
          style={{
            backgroundColor: '#4a9eff',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 20,
            paddingRight: 20,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          Start Quiz
        </button>
      </div>
    )
  }

  // closed
  const nextDate = state.endDate
  const nextText = nextDate
    ? nextDate.toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'a future date'

  return (
    <div className="anim-fade-in" style={containerStyle}>
      <div style={labelStyle}>Quiz Status</div>
      <div style={{ ...valueStyle, color: '#e84040' }}>
        Quiz closed. Next attempt opens {nextText}
      </div>
    </div>
  )
}