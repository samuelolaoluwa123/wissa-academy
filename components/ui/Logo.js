'use client'

/* Apps & Scripts mark — abstracted </> bracket-slash motif
   Renders as a rounded square with a gradient bg and a clean code-bracket glyph */
export default function Logo({ size = 34, radius = 10 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: `${radius}px`, flexShrink: 0,
      background: 'linear-gradient(135deg,#4a9eff 0%,#1e3a5f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 20 20" fill="none">
        {/* Left bracket < */}
        <path d="M8 4L3 10L8 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
        {/* Slash / */}
        <path d="M12.5 3.5L7.5 16.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity="0.55"/>
        {/* Right bracket > */}
        <path d="M12 4L17 10L12 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
      </svg>
    </div>
  )
}