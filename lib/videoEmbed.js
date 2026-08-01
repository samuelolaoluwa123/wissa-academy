// lib/videoEmbed.js
// Helpers for Phase D, Feature 2 — Real Video Embedding (YouTube Unlisted)

/**
 * Extracts a YouTube video ID from common URL formats:
 *   https://www.youtube.com/watch?v=VIDEOID
 *   https://youtu.be/VIDEOID
 *   https://www.youtube.com/embed/VIDEOID
 *   Any of the above with extra query params (&t=, ?si=, etc.)
 * Returns null if the URL doesn't look like a valid YouTube link.
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null

  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.replace('www.', '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return id || null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v')
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/embed/')[1] || null
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/shorts/')[1] || null
      }
    }

    return null
  } catch {
    // Not a valid URL at all
    return null
  }
}

/**
 * Builds a playable embed URL from a raw YouTube link.
 * Returns null if the input isn't a recognizable YouTube URL.
 */
export function getYouTubeEmbedUrl(url) {
  const id = extractYouTubeId(url)
  if (!id) return null
  return `https://www.youtube.com/embed/${id}`
}

/**
 * Quick validity check, useful for showing inline feedback in an input
 * field before saving (e.g. in the instructor video manager).
 */
export function isValidYouTubeUrl(url) {
  return extractYouTubeId(url) !== null
}