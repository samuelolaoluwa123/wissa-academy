export default function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.07)',
      borderRadius: '14px',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div style={{
      padding: '16px 20px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '10px',
      borderBottom: '1px solid rgba(0,0,0,0.07)',
    }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: '12px', color: '#8a94a6', marginTop: '2px' }}>{subtitle}</div>
        )}
      </div>
      {action && (
        <button style={{
          fontSize: '12px', fontWeight: 600,
          color: '#4a9eff', cursor: 'pointer',
          padding: '5px 12px',
          border: '1px solid rgba(74,158,255,0.2)',
          borderRadius: '8px',
          background: 'rgba(74,158,255,0.13)',
          whiteSpace: 'nowrap', flexShrink: 0,
          fontFamily: 'inherit',
        }}>
          {action}
        </button>
      )}
    </div>
  )
}