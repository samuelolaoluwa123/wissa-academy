'use client'
import { getYouTubeEmbedUrl } from '../../lib/videoEmbed'

// Drop-in replacement for the old simulated video player area.
// Props:
//   videoUrl: string|null  — raw YouTube URL from lessons.video_url
//   title: string          — lesson title, shown in placeholder/fallback states
//   isMobile: boolean

export default function VideoPlayer({ videoUrl, title, isMobile }) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl)

  const containerStyle = {
    background: '#000',
    aspectRatio: '16/9',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '14px 14px 0 0',
  }

  if (embedUrl) {
    return (
      <div style={containerStyle}>
        <iframe
          src={embedUrl}
          title={title || 'Lesson video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    )
  }

  // No video set yet — honest placeholder, not a fake play button
  return (
    <div
      style={{
        ...containerStyle,
        background: 'linear-gradient(135deg,#0f1b2d,#1a2d45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: isMobile ? '28px' : '36px' }}>🎬</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? '12px' : '13.5px', textAlign: 'center' }}>
        Video not yet added for this lesson
      </div>
    </div>
  )
}