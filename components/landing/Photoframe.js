'use client'
import { useState } from 'react'

/* Falls back to a branded placeholder if the image file isn't in /public yet,
   so the page never shows a broken-image icon while real photos are being sourced. */
export default function PhotoFrame({ src, alt, style, fallbackIcon = '📷', fallbackLabel }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg,#1a2d45,#0f1b2d)', color: 'rgba(255,255,255,0.5)', ...style }}>
        <span style={{ fontSize: '28px' }}>{fallbackIcon}</span>
        {fallbackLabel && <span style={{ fontSize: '11px', fontWeight: 600, textAlign: 'center', padding: '0 14px', lineHeight: 1.4 }}>{fallbackLabel}</span>}
      </div>
    )
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} style={{ objectFit: 'cover', ...style }} />
}