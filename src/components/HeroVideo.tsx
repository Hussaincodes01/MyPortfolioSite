import React, { useEffect, useRef, useState } from 'react'

/**
 * 391-byte inline placeholder (28x16, blurred up). Paints on the very first
 * frame with no network round-trip, and keeps the hero looking deliberate if
 * the media files are ever missing rather than showing a flat black box.
 */
const LQIP =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gAQTGF2YzYwLjMxLjEwMgD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAQABwDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAgQGBf/EACAQAAICAgICAwAAAAAAAAAAAAECAAMEEQUhEhQxgdH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABkRAQACAwAAAAAAAAAAAAAAAAABESExQf/aAAwDAQACEQMRAD8AjJoYPH+xj2XuWWtOtqATv7MRqra2xa6x5Mx0BKXF4VU41xZkoLnYHQO1AETrCxXU1Yng5U/Igx7NwLKS7hlYA9gN2P2Iwj//2Q=='

/**
 * Background footage layer.
 *
 * Replaces the previous 4.7 MB WebP sprite sheet (5120x13680, 640x360 frames)
 * that had to fully decode before anything painted, blew past mobile Safari's
 * canvas decode limits, and upscaled 360p to fullscreen.
 *
 * Now: a real <video> encoded with a keyframe every 8 frames so seeking is
 * cheap, scrubbed against scroll position with a lerp for smoothness.
 * Small viewports and reduced-motion users get a plain autoplaying loop
 * instead — seeking is unreliable and battery-expensive on mobile.
 */
export const HeroVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches
    const isSmall = window.matchMedia('(max-width: 900px)').matches

    // Fallback path: just loop it. No scroll coupling.
    if (reduceMotion || isSmall) {
      video.loop = true
      if (!reduceMotion) video.play().catch(() => {})
      return
    }

    let raf = 0
    let target = 0
    let current = 0
    let alive = true

    const duration = () => (Number.isFinite(video.duration) ? video.duration : 10)

    const computeTarget = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      target = progress * (duration() - 0.05)
    }

    const tick = () => {
      if (!alive) return
      // Ease toward the scroll target so fast flicks don't thrash the decoder.
      current += (target - current) * 0.12
      if (Math.abs(target - current) > 0.004 && video.readyState >= 2) {
        try {
          video.currentTime = current
        } catch {
          /* seek can throw mid-load; next frame retries */
        }
      }
      raf = requestAnimationFrame(tick)
    }

    const onScroll = () => computeTarget()

    computeTarget()
    current = target
    raf = requestAnimationFrame(tick)

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[var(--void)]">
      {/* Layer 0: inline blur-up. No request, paints instantly. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${LQIP})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(28px) saturate(115%)',
          transform: 'scale(1.08)',
        }}
      />

      {/* Layer 1: poster. Layer 2: video, fading in once decodable. */}
      <img
        src="/hero-poster.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: ready ? 0 : 1, transition: 'opacity 600ms ease' }}
      />

      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster="/hero-poster.webp"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
        onLoadedData={() => setReady(true)}
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          opacity: ready ? 1 : 0,
          transition: 'opacity 700ms ease',
          // Lift the source slightly so the cyan traces carry through the grade.
          filter: 'brightness(1.14) contrast(1.06) saturate(1.12)',
          // Keep the layer on its own compositor tile.
          willChange: 'opacity',
          transform: 'translateZ(0)',
        }}
      >
        <source src="/hero-854.mp4" type="video/mp4" media="(max-width: 900px)" />
        <source src="/hero-1600.mp4" type="video/mp4" />
      </video>

      {/* Legibility grade — darker at the edges, keeps the face readable. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(4,7,10,0.52) 0%, rgba(4,7,10,0.10) 28%, rgba(4,7,10,0.38) 58%, rgba(4,7,10,0.88) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 85% at 52% 42%, transparent 46%, rgba(4,7,10,0.42) 100%)',
        }}
      />
    </div>
  )
}
